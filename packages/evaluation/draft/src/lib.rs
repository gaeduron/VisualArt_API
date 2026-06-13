/*! 
# Image Evaluator Library

This library provides functionality to evaluate drawing accuracy by comparing 
reference images to user-drawn observations.

## Core Algorithm

The evaluation works by:
1. Loading an image containing both reference (ground truth) and observation (user drawing)
2. Extracting non-background pixels from both sections
3. Creating distance heatmaps using flood-fill algorithm
4. Computing error metrics based on spatial distances

## Business Context

**INTENTION**: Quantify drawing accuracy for educational/assessment purposes
**DOMAIN MODEL**: Reference-observation comparison with spatial error analysis
**VALUE PROPOSITION**: Objective measurement of artistic reproduction accuracy

## Usage

```rust
use image_evaluator::{ImageEvaluator, EvaluationResult};

let evaluator = ImageEvaluator::new(false); // false = white background
match evaluator.evaluate_image("path/to/image.png") {
    Ok(result) => println!("{}", result.evaluation_text),
    Err(e) => eprintln!("Error: {}", e),
}
```

## Risk Assessment

**HIGH RISK**: Error calculation algorithm - affects assessment validity
**MEDIUM RISK**: Image loading and processing - affects usability  
**LOW RISK**: Output formatting - cosmetic issues only
*/

use image::{ImageBuffer, Luma, Rgba, RgbaImage};
use ndarray::{Array2, Array1, s};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::path::Path;
use thiserror::Error;

pub mod streaming_evaluator;
pub use streaming_evaluator::{StreamingEvaluator, StreamingEvaluatorState, SerializableHeatmap};

#[derive(Error, Debug)]
pub enum EvaluationError {
    #[error("Image loading error: {0}")]
    ImageLoad(#[from] image::ImageError),
    #[error("Invalid image dimensions: expected at least 500x500, got {width}x{height}")]
    InvalidDimensions { width: u32, height: u32 },
    #[error("Processing error: {0}")]
    Processing(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ErrorMetrics {
    pub top_5_error: f64,
    pub mean_error: f64,
    pub pixel_count: usize,
    pub grid: Array2<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EvaluationResult {
    pub metrics: ErrorMetrics,
    pub evaluation_text: String,
}

pub struct ImageEvaluator {
    bg_transparent: bool,
}

impl ImageEvaluator {
    /**
     * INTENTION: Create a new image evaluator with background transparency setting
     * REQUIRES: None
     * MODIFIES: None
     * EFFECTS: Creates evaluator instance
     * RETURNS: New ImageEvaluator instance
     * 
     * ASSUMPTIONS: Background setting is binary (transparent or white)
     * INVARIANTS: bg_transparent setting remains constant for instance lifetime
     * GHOST STATE: Evaluator maintains consistent background handling across operations
     */
    pub fn new(bg_transparent: bool) -> Self {
        Self { bg_transparent }
    }

    /**
     * INTENTION: Evaluate drawing accuracy by comparing reference to observation
     * REQUIRES: Valid image path, image dimensions >= 500x500
     * MODIFIES: None (pure computation)
     * EFFECTS: Loads image, computes error metrics, generates evaluation
     * RETURNS: Result containing evaluation metrics or error
     * 
     * ASSUMPTIONS: Image format is supported by image crate, contains both reference and observation
     * INVARIANTS: Original image data unchanged, error calculation is deterministic
     * GHOST STATE: Error metrics represent spatial accuracy of drawing reproduction
     */
    pub fn evaluate_image<P: AsRef<Path>>(&self, image_path: P) -> Result<EvaluationResult, EvaluationError> {
        let image_data = self.load_observation(image_path)?;
        let (reference, observation) = self.get_reference_and_observation(&image_data)?;
        
        let white_pixel = if self.bg_transparent { 0 } else { 255 };
        
        let reference_pixels = self.extract_non_background_pixels(&reference, white_pixel);
        let observation_pixels = self.extract_non_background_pixels(&observation, white_pixel);
        
        let mut empty_heatmap = Array2::from_elem((500, 500), -1i32);
        
        let reference_heatmap = self.fill_heatmap(&reference_pixels, empty_heatmap.clone())?;
        let observation_heatmap = self.fill_heatmap(&observation_pixels, empty_heatmap)?;
        
        let metrics = self.calculate_error_percentage(
            &reference_heatmap,
            &observation_heatmap,
            &reference_pixels,
            &observation_pixels,
        )?;
        
        let evaluation_text = format!(
            "Top 5 error: {:.1}%\nMean error: {:.1}%\nPixel count: {}",
            metrics.top_5_error, metrics.mean_error, metrics.pixel_count
        );
        
        Ok(EvaluationResult {
            metrics,
            evaluation_text,
        })
    }

    /**
     * INTENTION: Batch process multiple images for comprehensive analysis
     * REQUIRES: Vector of valid image paths
     * MODIFIES: None
     * EFFECTS: Evaluates each image, collects results
     * RETURNS: Vector of evaluation results
     * 
     * ASSUMPTIONS: All images follow same format conventions
     * INVARIANTS: Results order matches input order
     * GHOST STATE: Batch processing enables comparative analysis across drawings
     */
    pub fn evaluate_batch<P: AsRef<Path>>(&self, image_paths: &[P]) -> Vec<Result<EvaluationResult, EvaluationError>> {
        image_paths.iter()
            .map(|path| self.evaluate_image(path))
            .collect()
    }

    fn load_observation<P: AsRef<Path>>(&self, image_path: P) -> Result<Array2<u8>, EvaluationError> {
        let img = image::open(image_path)?;
        let (width, height) = img.dimensions();
        
        if width < 1010 || height < 500 {
            return Err(EvaluationError::InvalidDimensions { width, height });
        }
        
        let mut image_data = Array2::zeros((height as usize, width as usize));
        
        if self.bg_transparent {
            let rgba_img = img.to_rgba8();
            for (y, row) in rgba_img.rows().enumerate() {
                for (x, pixel) in row.enumerate() {
                    image_data[[y, x]] = pixel[3]; // Alpha channel
                }
            }
        } else {
            let rgb_img = img.to_rgb8();
            for (y, row) in rgb_img.rows().enumerate() {
                for (x, pixel) in row.enumerate() {
                    image_data[[y, x]] = pixel[0]; // Red channel
                }
            }
        }
        
        Ok(image_data)
    }

    fn get_reference_and_observation(&self, image_data: &Array2<u8>) -> Result<(Array2<u8>, Array2<u8>), EvaluationError> {
        let reference = image_data.slice(s![0..500, 0..500]).to_owned();
        let observation = image_data.slice(s![0..500, 510..1010]).to_owned();
        
        Ok((reference, observation))
    }

    fn extract_non_background_pixels(&self, image: &Array2<u8>, background_value: u8) -> Vec<(usize, usize)> {
        let mut pixels = Vec::new();
        
        for ((y, x), &value) in image.indexed_iter() {
            if value != background_value {
                pixels.push((y, x));
            }
        }
        
        pixels
    }

    fn fill_heatmap(&self, pixels: &[(usize, usize)], mut heatmap: Array2<i32>) -> Result<Array2<i32>, EvaluationError> {
        let mut queue = VecDeque::new();
        
        // Initialize with zero distance for all drawing pixels
        for &(y, x) in pixels {
            if y < 500 && x < 500 {
                heatmap[[y, x]] = 0;
                queue.push_back(((y, x), 0));
            }
        }
        
        let directions = [(0, 1), (0, -1), (1, 0), (-1, 0)];
        
        while let Some(((y, x), distance)) = queue.pop_front() {
            for &(dy, dx) in &directions {
                let ny = y as i32 + dy;
                let nx = x as i32 + dx;
                
                if ny >= 0 && ny < 500 && nx >= 0 && nx < 500 {
                    let ny = ny as usize;
                    let nx = nx as usize;
                    
                    if heatmap[[ny, nx]] == -1 {
                        heatmap[[ny, nx]] = distance + 1;
                        queue.push_back(((ny, nx), distance + 1));
                    }
                }
            }
        }
        
        Ok(heatmap)
    }

    fn calculate_error_percentage(
        &self,
        reference_heatmap: &Array2<i32>,
        observation_heatmap: &Array2<i32>,
        reference_pixels: &[(usize, usize)],
        observation_pixels: &[(usize, usize)],
    ) -> Result<ErrorMetrics, EvaluationError> {
        // Validate that both reference and observation have content
        if reference_pixels.is_empty() {
            return Err(EvaluationError::Processing("Reference image contains no drawing content".to_string()));
        }
        if observation_pixels.is_empty() {
            return Err(EvaluationError::Processing("Observation drawing is empty - no content to evaluate".to_string()));
        }

        let mut errors = Vec::new();
        const GRID_SIZE: usize = 10;
        const CHUNK_SIZE: usize = 50; // 500 / 10
        let mut grid_ranges = Array2::zeros((GRID_SIZE, GRID_SIZE));
        
        // Calculate errors for observation pixels against reference
        for &(y, x) in observation_pixels {
            if y < 500 && x < 500 {
                let error = reference_heatmap[[y, x]];
                errors.push(error);
                
                let grid_y = y / CHUNK_SIZE;
                let grid_x = x / CHUNK_SIZE;
                if grid_y < GRID_SIZE && grid_x < GRID_SIZE {
                    grid_ranges[[grid_y, grid_x]] = grid_ranges[[grid_y, grid_x]].max(error);
                }
            }
        }
        
        // Calculate errors for reference pixels against observation
        for &(y, x) in reference_pixels {
            if y < 500 && x < 500 {
                let error = observation_heatmap[[y, x]];
                errors.push(error);
                
                let grid_y = y / CHUNK_SIZE;
                let grid_x = x / CHUNK_SIZE;
                if grid_y < GRID_SIZE && grid_x < GRID_SIZE {
                    grid_ranges[[grid_y, grid_x]] = grid_ranges[[grid_y, grid_x]].max(error);
                }
            }
        }
        
        errors.sort_unstable();
        
        // Calculate top 5 error from grid - this is the primary metric for observational drawing evaluation
        let mut grid_flat: Vec<i32> = grid_ranges.iter().cloned().collect();
        grid_flat.sort_unstable();
        let top_5_values: Vec<i32> = grid_flat.into_iter().rev().take(5).collect();
        let top_5_error = if !top_5_values.is_empty() {
            top_5_values.iter().sum::<i32>() as f64 / (5.0 * 5.0)
        } else {
            0.0
        };
        
        // Calculate mean error (secondary metric)
        let mean_error = if !errors.is_empty() {
            errors.iter().sum::<i32>() as f64 / (errors.len() as f64 * 5.0) * 100.0
        } else {
            0.0
        };
        
        Ok(ErrorMetrics {
            top_5_error,
            mean_error,
            pixel_count: reference_pixels.len(),
            grid: grid_ranges,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array2;

    #[test]
    fn test_extract_non_background_pixels() {
        let evaluator = ImageEvaluator::new(false);
        let mut image = Array2::from_elem((3, 3), 255u8);
        image[[1, 1]] = 0;
        image[[2, 2]] = 100;
        
        let pixels = evaluator.extract_non_background_pixels(&image, 255);
        assert_eq!(pixels.len(), 2);
        assert!(pixels.contains(&(1, 1)));
        assert!(pixels.contains(&(2, 2)));
    }

    #[test]
    fn test_fill_heatmap() {
        let evaluator = ImageEvaluator::new(false);
        let pixels = vec![(1, 1)];
        let heatmap = Array2::from_elem((3, 3), -1i32);
        
        let result = evaluator.fill_heatmap(&pixels, heatmap).unwrap();
        
        assert_eq!(result[[1, 1]], 0); // Source pixel
        assert_eq!(result[[0, 1]], 1); // Adjacent pixel
        assert_eq!(result[[1, 0]], 1); // Adjacent pixel
        assert_eq!(result[[0, 0]], 2); // Diagonal pixel
    }

    #[test]
    fn test_new_evaluator() {
        let evaluator = ImageEvaluator::new(true);
        assert!(evaluator.bg_transparent);
        
        let evaluator = ImageEvaluator::new(false);
        assert!(!evaluator.bg_transparent);
    }

    #[test]
    fn test_empty_drawing_validation() {
        let evaluator = ImageEvaluator::new(false);
        let reference_pixels = vec![(100, 100), (101, 101)];
        let observation_pixels = vec![]; // Empty observation
        
        let reference_heatmap = Array2::zeros((500, 500));
        let observation_heatmap = Array2::zeros((500, 500));
        
        let result = evaluator.calculate_error_percentage(
            &reference_heatmap,
            &observation_heatmap, 
            &reference_pixels,
            &observation_pixels,
        );
        
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("empty"));
    }

    #[test]  
    fn test_empty_reference_validation() {
        let evaluator = ImageEvaluator::new(false);
        let reference_pixels = vec![]; // Empty reference
        let observation_pixels = vec![(100, 100)];
        
        let reference_heatmap = Array2::zeros((500, 500));
        let observation_heatmap = Array2::zeros((500, 500));
        
        let result = evaluator.calculate_error_percentage(
            &reference_heatmap,
            &observation_heatmap,
            &reference_pixels, 
            &observation_pixels,
        );
        
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("no drawing content"));
    }
} 