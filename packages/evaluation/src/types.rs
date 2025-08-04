//! Type definitions for the evaluation system

use std::collections::HashMap;

/// Type alias for RGBA color values
pub type RGBA = [u8; 4]; // [R, G, B, A]

/// Type alias for image dimensions
pub type ImageDimensions = (usize, usize); // (width, height)

/// Type alias for pixel coordinates
/// (x: usize, y: usize)
pub type PixelCoord = (usize, usize); // (x, y)

/// Type alias for 2D image array (height x width x RGBA channels)
/// 
/// This represents an image as a 2D vector of RGBA pixels:
/// - First dimension: height (rows)
/// - Second dimension: width (columns) 
/// - Each pixel is an RGBA tuple [R, G, B, A]
pub type Image2DArray = Vec<Vec<RGBA>>;

/// Type alias for heatmap matrix
/// 
/// This represents a heatmap as a 2D vector of i16 values:
/// - First dimension: height (rows)
/// - Second dimension: width (columns) 
/// - Each value is an i16 value representing the distance from the nearest position of value 0. 
pub type HeatmapMatrix = Vec<Vec<i16>>;

/// Error grid is a 10x10 grid of i16 values
pub type ErrorGrid = [i16; 100];

/// Statistics for the evaluation
/// 
/// total_duration: in milliseconds
/// 
/// pixels_per_color_count: string is the #hex color, number is the count, pixels_per_color_count["all-non-white"] is the total number of non-white pixels
/// 
/// pixels_per_color_per_second:  pixels_per_color_count["all-non-white"]/total_duration
/// 
/// top5_error_by_color: string is the #hex color, number is the error rate, top5_error_by_color["all-non-white"] is the top 5 largest error in the error grid
pub struct EvaluationStatistics {
    pub pixels_per_color_count: HashMap<RGBA, u32>,
    pub top5_error_by_color: HashMap<RGBA, f32>,
    pub error_grid_per_color: HashMap<RGBA, ErrorGrid>,
    pub total_duration: Option<u64>,
    pub pixels_per_second: Option<f32>,
}

/// Evaluation report
pub struct EvaluationReport {
    pub statistics: EvaluationStatistics,
}
