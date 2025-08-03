//! Image handling utilities for the evaluation system

use crate::types::{Image2DArray, ImageDimensions, RGBA};
use std::collections::HashMap;

/// Simple image wrapper with utility methods
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Image {
    pub pixels: Image2DArray,
    pub dimensions: ImageDimensions,
    pub number_of_pixel_per_color: HashMap<RGBA, u32>,
}

impl Image {
    /// Creates a new image from existing pixel data
    pub fn new(pixels: Image2DArray) -> Self {
        let dimensions = (pixels[0].len(), pixels.len());
        let number_of_pixel_per_color = Self::get_number_of_pixel_per_color(&pixels);
        Self {
            dimensions,
            pixels,
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
        
        Ok(Self::new(pixels))
    }

    /// Factory method for creating a standard white image
    /// 
    /// default size is 500x500
    pub fn standard_white(dimensions: Option<ImageDimensions>) -> Self {
        let (x_size, y_size) = dimensions.unwrap_or((500, 500));
        let white_pixel = [255, 255, 255, 255];
        let pixels = vec![vec![white_pixel; y_size as usize]; x_size as usize];
        Self::new(pixels)
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
}