//! Image handling utilities for the evaluation system

use crate::types::{Image2DArray, ImageDimensions, RGBA};
use std::collections::HashMap;
use rayon::prelude::*;
use palette::{Oklab, Srgb as SrgbColor, IntoColor};
use serde::{Serialize, Deserialize};

#[cfg(test)]
mod tests;

const DEFAULT_MAIN_COLORS: [RGBA; 6] = [
    [0, 0, 0, 255], // black
    [0, 0, 255, 255], // blue
    [255, 0, 0, 255], // red
    [0, 255, 0, 255], // green
    [255, 255, 0, 255], // yellow
    [255, 255, 255, 255], // white
];
/// Simple image wrapper with utility methods
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Image {
    pub pixels: Image2DArray,
    pub dimensions: ImageDimensions,
    pub number_of_pixel_per_color: HashMap<RGBA, u32>,
}

impl Image {
    /// Creates a new image from existing pixel data
    pub fn new(
        pixels: Image2DArray,
        main_colors: Option<Vec<RGBA>>
    ) -> Self {
        let dimensions = (pixels[0].len(), pixels.len());
        let mut contrasted_pixels = pixels.clone();
        let main_colors = main_colors.unwrap_or(
            DEFAULT_MAIN_COLORS.to_vec()
        );
            
        Self::mutate_color_contrast(
            &mut contrasted_pixels,
            &main_colors,
            None
        );
        let number_of_pixel_per_color = Self::get_number_of_pixel_per_color(&contrasted_pixels);

        Self {
            dimensions,
            pixels: contrasted_pixels,
            number_of_pixel_per_color,
        }
    }

    /// Load an image from a file path
    /// 
    /// Supports common image formats (PNG, JPEG, etc.) via the image crate.
    /// Converts the image to RGBA format for consistent processing.
    pub fn load_from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        use image::io::Reader as ImageReader;

        let img = ImageReader::open(path)?.decode()?;
        let rgba_img = img.to_rgba8();
        let (width, height) = rgba_img.dimensions();
        let mut pixels = vec![vec![[0u8; 4]; width as usize]; height as usize];
        
        for y in 0..height {
            for x in 0..width {
                let pixel = rgba_img.get_pixel(x, y);
                pixels[y as usize][x as usize] = [pixel[0], pixel[1], pixel[2], pixel[3]];
            }
        }
        
        Ok(Self::new(pixels, None))
    }

    /// Factory method for creating a standard white image
    /// 
    /// default size is 500x500
    pub fn standard_white(dimensions: Option<ImageDimensions>) -> Self {
        let (x_size, y_size) = dimensions.unwrap_or((500, 500));
        let white_pixel = [255, 255, 255, 255];
        let pixels = vec![vec![white_pixel; y_size as usize]; x_size as usize];
        Self::new(pixels, None)
    }

    /// Set a pixel in the image
    /// 
    /// # Panics
    /// 
    /// Panics if the pixel coordinates are out of bounds
    /// 
    /// You can use the `dimensions` field to check if the coordinates are valid
    pub fn set_pixel(&mut self, x: usize, y: usize, pixel_color: [u8; 4]) {
        if x >= self.dimensions.0 || y >= self.dimensions.1 {
            panic!("Pixel coordinates out of bounds: ({}, {})", x, y);
        }

        let old_pixel_color = self.pixels[x][y];
        self.pixels[x][y] = pixel_color;

        // update number of pixel per color
        self.number_of_pixel_per_color
            .entry(old_pixel_color)
            .and_modify(|count| *count -= 1)
            .or_insert(0);
        self.number_of_pixel_per_color
            .entry(pixel_color)
            .and_modify(|count| *count += 1)
            .or_insert(1);
    }

    fn get_number_of_pixel_per_color(pixels: &Image2DArray) -> HashMap<RGBA, u32> {
        let number_of_pixel_per_color = HashMap::new();
        pixels.iter()
            .flat_map(|row| row.iter())
            .fold(number_of_pixel_per_color, |mut counts, &pixel| {
                *counts.entry(pixel).or_insert(0) += 1;
                counts
            })
    }

    pub fn recompute_color_contrast(
        &mut self,
        main_colors: Option<Vec<RGBA>>,
        min_color_similarity: Option<f32>
    ) {
        let main_colors = main_colors.unwrap_or(DEFAULT_MAIN_COLORS.to_vec());

        Self::mutate_color_contrast(
            &mut self.pixels,
            &main_colors,
            min_color_similarity
        );

        let number_of_pixel_per_color = Self::get_number_of_pixel_per_color(&self.pixels);
        self.number_of_pixel_per_color = number_of_pixel_per_color;
    }

    /// Mutate image pixels to have high contrast using only main solid colors
    /// 
    /// Mutation is done in place using BHS color space for better color theory
    /// 
    /// # Arguments
    /// 
    /// * `pixels` - The image pixels to mutate (will be modified in place)
    /// * `main_colors` - The main colors to map to
    /// * `min_color_similarity` - The maximum distance threshold (pixels beyond this become white)
    pub fn mutate_color_contrast(
        pixels: &mut Image2DArray,
        main_colors: &Vec<RGBA>,
        min_color_similarity: Option<f32>,
    ) {
        /// Euclidean distance in OKLab
        #[inline]
        fn oklab_dist(a: &Oklab, b: &Oklab) -> f32 {
            let dl = a.l - b.l;
            let da = a.a - b.a;
            let db = a.b - b.b;
            (dl * dl + da * da + db * db).sqrt()
        }

        // --- 1. Prepare the target palette in OKLab
        let palette_ok: Vec<Oklab> = main_colors
        .iter()
        .map(|&rgb| {
            SrgbColor::<u8>::from((rgb[0], rgb[1], rgb[2]))
                .into_format::<f32>()
                .into_linear()
                .into_color()
        })
        .collect();

        // Threshold distance: 50 % black-white
        let threshold: f32 = min_color_similarity.unwrap_or(0.5);
        // Fallback color = white
        const WHITE_RGBA: [u8; 4] = [255, 255, 255, 255];

        // --- 2. Parallel traversal of lines
        pixels.par_iter_mut().for_each(|row| {
            row.iter_mut().for_each(|px| {
                // If white or transparent, keep white
                if (px[0] == 255 && px[1] == 255 && px[2] == 255) || px[3] == 0 {
                    return;
                }

                // Ignore l'alpha pour la distance, mais on le garde en sortie
                let lab: Oklab = SrgbColor::<u8>::from([px[0], px[1], px[2]])
                .into_format::<f32>()
                .into_linear()
                .into_color();
            
                // if chroma is too low, set to black
                // We dont want grey from black to become colors because they are closer due to lightness
                const MAX_CHROMA: f32 = 0.35;
                let chroma = (lab.a * lab.a + lab.b * lab.b).sqrt();
                if chroma < MAX_CHROMA*0.2 && lab.l <= 0.75 {
                    px[0] = 0;
                    px[1] = 0;
                    px[2] = 0;
                    return;
                }

                // if too light with low chroma, set to white
                if lab.l > 0.75 && chroma < MAX_CHROMA*0.2 {
                    px.copy_from_slice(&WHITE_RGBA);
                    return;
                }

                // --- 3. Find the closest color in the palette
                let mut best_d = f32::MAX;
                let mut best_idx: Option<usize> = None;

                for (i, &palette_color) in palette_ok.iter().enumerate() {
                    let d = oklab_dist(&lab, &palette_color);
                    if d < best_d {
                        best_d = d;
                        best_idx = Some(i);
                    }
                }

                if let Some(i) = best_idx {
                    if best_d <= threshold {
                        let rgb = main_colors[i];
                        px[0] = rgb[0];
                        px[1] = rgb[1];
                        px[2] = rgb[2];
                    } else {
                        px.copy_from_slice(&WHITE_RGBA);
                    }
                } else {
                    px.copy_from_slice(&WHITE_RGBA);
                }
            });
        });
    }
}