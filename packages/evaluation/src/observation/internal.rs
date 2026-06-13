use crate::utils::current_time_ms;
use crate::image::Image;
use crate::heatmap::Heatmap;
use crate::types::{EvaluationReport, EvaluationStatistics, RGBA, ErrorGrid};

use std::collections::{HashMap};
use rayon::prelude::*;

/// Internal implementation - can change without breaking the public API
pub struct ObservationImpl {
    pub start_time: u64,
    end_time: Option<u64>,
    reference_image: Image,
    reference_heatmaps: HashMap<RGBA, Heatmap>,
    drawing_image: Option<Image>,
    drawing_heatmaps: Option<HashMap<RGBA, Heatmap>>,
}

impl ObservationImpl {
    pub fn new(reference_image: Image) -> Self {
        let reference_heatmap = Heatmap::new(reference_image.clone(), [0, 0, 0, 255], "flood_fill");
        let mut reference_heatmaps = HashMap::new();
        reference_heatmaps.insert([0, 0, 0, 255], reference_heatmap);

        Self {
            start_time: current_time_ms(),
            end_time: None,
            reference_image: reference_image,
            reference_heatmaps: reference_heatmaps,
            drawing_image: None,
            drawing_heatmaps: None,
        }
    }

    pub fn set_drawing(&mut self, drawing: Image) -> Result<(), String> {
        if drawing.dimensions != self.reference_image.dimensions {
            return Err(format!(
                "Set drawing: Drawing image dimensions do not match reference image dimensions: {:?} != {:?}",
                drawing.dimensions,
                self.reference_image.dimensions
            ));
        }

        let mut drawing_heatmaps = HashMap::new();
        drawing_heatmaps.insert([0, 0, 0, 255], Heatmap::new(drawing.clone(), [0, 0, 0, 255], "flood_fill"));

        self.drawing_heatmaps = Some(drawing_heatmaps);
        self.drawing_image = Some(drawing);

        Ok(())
    }

    pub fn get_duration(&self) -> u64 {
        let end_time = self.end_time.unwrap_or_else(current_time_ms);
        end_time - self.start_time
    }

    pub fn finish_observation(&mut self) {
        if self.end_time.is_none() {
            self.end_time = Some(current_time_ms());
        }
    }

    pub fn get_start_time(&self) -> u64 {
        self.start_time
    }

    pub fn get_end_time(&self) -> Option<u64> {
        self.end_time
    }

    pub fn get_total_non_white_pixels(&self) -> u32 {
        let white_pixel = [255, 255, 255, 255];
        let total_white_pixels = self.reference_image.number_of_pixel_per_color[&white_pixel];
        let total_pixels = self.reference_image.dimensions.0 * self.reference_image.dimensions.1;
        total_pixels as u32 - total_white_pixels as u32
    }

    pub fn get_drawing_speed(&self) -> f32 {
        self.get_total_non_white_pixels() as f32 / self.get_duration() as f32
    }

    /// Get the evaluation report
    /// 
    /// REQUIRES: drawing_image is set
    pub fn get_evaluation(&self) -> Result<EvaluationReport, String> {
        if self.drawing_image.is_none() {
            return Err("Drawing image or reference image is not set".to_string());
        }

        let statistics = self.get_statistics();
        Ok(EvaluationReport {
            statistics: statistics,
        })
    }

    // Private methods ------------------------------------------------------------

    /// Returns the statistics of the observation.
    /// 
    /// REQUIRES: drawing_image AND reference_image are set
    fn get_statistics(&self) -> EvaluationStatistics {
        let total_duration = Some(self.get_duration());
        let pixels_per_second = Some(self.get_drawing_speed());
        let pixels_per_color_count = self.drawing_image.as_ref().unwrap().number_of_pixel_per_color.clone();
        let colors_to_evaluate = self.reference_heatmaps.keys().cloned().collect();
        let error_grid_per_color = self.get_error_grids(&colors_to_evaluate);
        let top5_error_by_color = self.get_top5_error_by_color(&error_grid_per_color);

        EvaluationStatistics {
            total_duration: total_duration,
            pixels_per_second: pixels_per_second,
            pixels_per_color_count: pixels_per_color_count,
            top5_error_by_color: top5_error_by_color,
            error_grid_per_color: error_grid_per_color,
        }
    }

    fn get_error_grids(&self, colors_to_evaluate: &Vec<RGBA>) -> HashMap<RGBA, ErrorGrid> {
        // For each color, calculate the top5 error
        colors_to_evaluate
            .par_iter()
            .map(|&color| {
                let error_grid = self.get_error_grid(color);
                (color, error_grid)
            }).collect::<HashMap<RGBA, ErrorGrid>>()
    }

    fn get_top5_error_by_color(&self, error_grid_per_color: &HashMap<RGBA, ErrorGrid>) -> HashMap<RGBA, f32> {
        error_grid_per_color.iter().map(|(color, error_grid)| {
            let top5_error = self.get_top5_error(error_grid);
            (*color, top5_error as f32)
        }).collect::<HashMap<RGBA, f32>>()
    }

    /// Get the top 5 error for an error grid
    /// 
    /// Pure function
    /// 
    /// top5 error is the mean of the 5 largest errors in the error grid
    fn get_top5_error(&self, error_grid: &ErrorGrid) -> i16 {
        // Find the 5 largest errors efficiently using a single pass
        let mut top5_errors = Vec::with_capacity(5);
        
        for &error in error_grid.data.iter() {
            if top5_errors.len() < 5 {
                top5_errors.push(error);
            } else if error > top5_errors[0] {
                // Replace smallest with current error
                top5_errors[0] = error;
                // Re-sort the small array (only 5 elements, so O(1))
                top5_errors.sort_unstable();
            }
        }
        
        // Calculate mean of top 5 errors
        if top5_errors.len() > 0 {
            top5_errors.iter().sum::<i16>() / top5_errors.len() as i16
        } else {
            0
        }
    }

    /// Error grid is a 10x10 grid of i16 values
    /// 
    /// Each element in the grid is the largest error found in that part of the image
    /// it's also the largest error found in the reference and in the drawing when you compare them
    /// 
    /// We use the heatmap to calculate the error grid
    /// 
    /// This function is parallelized and should be optimized for performance
    fn get_error_grid(&self, color: RGBA) -> ErrorGrid {
        let mut error_grid = ErrorGrid::new();

        let reference_heatmap = self.reference_heatmaps.get(&color).unwrap();
        // test is drawing heatmap has color
        if !self.drawing_heatmaps.as_ref().unwrap().contains_key(&color) {
            // if the color has no heatmap, we return an error grid with all values set to max(dimention)/10
            // this penalise missing colors
            let max_dimension = std::cmp::max(self.reference_image.dimensions.0, self.reference_image.dimensions.1) as i16;
            let error_grid = ErrorGrid::from_array([max_dimension / 10; 100]);
            return error_grid;
        }

        let drawing_heatmap = self.drawing_heatmaps.as_ref().unwrap().get(&color).unwrap();

        let reference_pixels_of_color = &reference_heatmap.zero_points_coordinates;
        let drawing_pixels_of_color = &drawing_heatmap.zero_points_coordinates;

        let reference_pixels_with_error = self.calculate_error_for_pixels(
            reference_pixels_of_color,
            drawing_heatmap
        );
        let drawing_pixels_with_error = self.calculate_error_for_pixels(
            drawing_pixels_of_color,
            reference_heatmap
        );

        self.update_error_grid(&mut error_grid, &reference_pixels_with_error);
        self.update_error_grid(&mut error_grid, &drawing_pixels_with_error);

        error_grid
    }

    /// Update the error grid with the error values for the pixels
    /// 
    /// Mutates the error grid
    /// 
    /// Maps image coordinates to 10x10 grid coordinates
    fn update_error_grid(&self, error_grid: &mut ErrorGrid, pixels_with_error: &Vec<(usize, usize, i16)>) {
        for (x, y, error) in pixels_with_error {
            // Map image coordinates to 10x10 grid coordinates
            let grid_x = (*x * 10) / self.reference_image.dimensions.0;
            let grid_y = (*y * 10) / self.reference_image.dimensions.1;
            
            // Ensure we're within bounds
            if grid_x < 10 && grid_y < 10 {
                let index = grid_y * 10 + grid_x;
                if *error > error_grid.data[index] {
                    error_grid.data[index] = *error;
                }
            }
        }
    }

    /// Calculate error values for a set of pixel coordinates using a heatmap
    /// 
    /// Pure function, no side effects, parallelized
    /// 
    /// REQUIRES: pixels_coordinates and heatmap are valid and compatible dimensions
    fn calculate_error_for_pixels(
        &self,
        pixel_coordinates: &Vec<(usize, usize)>,
        heatmap: &Heatmap
    ) -> Vec<(usize, usize, i16)> {
        pixel_coordinates
            .par_iter()
            .map(|(x, y)| {
                let error = heatmap.get_error(*x, *y);
                (*x, *y, error)
            })
            .collect()
    }
} 