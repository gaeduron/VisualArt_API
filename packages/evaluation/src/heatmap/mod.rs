use crate::types::{HeatmapMatrix, ImageDimensions, RGBA};
use crate::image::Image;

#[cfg(test)]
mod tests;

pub mod jump_flood;

pub struct Heatmap {
    pub matrix: HeatmapMatrix,
    pub zero_points_coordinates: Vec<(usize, usize)>,
    pub dimensions: ImageDimensions,
}

impl Heatmap {

    /// Create a new heatmap from an Image by choosing a pixel color.
    pub fn new(image: Image, pixel_color: RGBA) -> Self {
        // Making a matrix of the same size as the image with default value -1
        let mut matrix = vec![vec![-1; image.dimensions.0]; image.dimensions.1];
        let mut zero_points_coordinates = Vec::new();
        
        // For each pixel, if it is the chosen color, set the value to 0
        for y in 0..image.dimensions.1 {
            for x in 0..image.dimensions.0 {
                if image.pixels[y][x] == pixel_color {
                    matrix[y][x] = 0;
                    zero_points_coordinates.push((x, y));
                }
            };
        };

        matrix = jump_flood::jump_flooding_algorithm(
            image.dimensions.0,
            image.dimensions.1,
            &zero_points_coordinates
        );

        Self {
            matrix,
            dimensions: image.dimensions,
            zero_points_coordinates,
        }
    }
}