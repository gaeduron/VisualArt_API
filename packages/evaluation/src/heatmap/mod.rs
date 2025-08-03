use crate::types::{HeatmapMatrix, ImageDimensions, RGBA};
use crate::image::Image;
use crate::heatmap::jump_flood::{SeedMap, JfaOptions};

#[cfg(test)]
mod tests;

pub mod jump_flood;
pub mod flood_fill;

pub struct Heatmap {
    pub matrix: HeatmapMatrix,
    pub zero_points_coordinates: Vec<(usize, usize)>,
    pub seed_map: SeedMap,
    pub dimensions: ImageDimensions,
}

impl Heatmap {

    /// Create a new heatmap from an Image by choosing a pixel color.
    pub fn new(image: Image, pixel_color: RGBA, algorithm: &str) -> Self {
        // Making a matrix of the same size as the image with default value -1
        let mut matrix = vec![vec![-1; image.dimensions.0]; image.dimensions.1];
        let mut zero_points_coordinates = Vec::new();
        
        // Only create seed map if using JFA algorithm
        let mut seed_map = if algorithm.starts_with("jump_flood") {
            vec![vec![None; image.dimensions.0]; image.dimensions.1]
        } else {
            vec![] // Empty for flood fill
        };
        
        // For each pixel, if it is the chosen color, set the value to 0
        for y in 0..image.dimensions.1 {
            for x in 0..image.dimensions.0 {
                if image.pixels[y][x] == pixel_color {
                    matrix[y][x] = 0;
                    zero_points_coordinates.push((x, y));
                    
                    if algorithm.starts_with("jump_flood") {
                        seed_map[y][x] = Some((x, y));
                    }
                }
            };
        };

        match algorithm {
            "flood_fill" => {
                flood_fill::flood_fill(&mut matrix, &zero_points_coordinates);
            },
            "jump_flood_parallel" => {
                matrix = jump_flood::jump_flooding_algorithm(
                    image.dimensions.0,
                    image.dimensions.1,
                    &[], // Empty target points since we have seed map
                    JfaOptions::with_seed_map(seed_map),
                );
            },
            _ => panic!("Invalid algorithm: {}. Supported algorithms: 'flood_fill', 'jump_flood_parallel'", algorithm),
        }

        Self {
            matrix,
            dimensions: image.dimensions,
            zero_points_coordinates,
            seed_map: if algorithm.starts_with("jump_flood") {
                vec![vec![None; image.dimensions.0]; image.dimensions.1] // Empty seed map since it was consumed
            } else {
                vec![] // Empty for flood fill
            },
        }
    }
}