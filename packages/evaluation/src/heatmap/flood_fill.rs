//! Flood fill algorithm to fill the matrix with Manhattan distances.
//! O(n^2) time complexity.
//! 
//! Start with a matrix with only 0 and -1 values.
//! -1 need to be replaced by the distance to the nearest 0.

use crate::types::{HeatmapMatrix, PixelCoord};
use std::collections::VecDeque;

/// Flood fill algorithm to fill the matrix with Manhattan distances.
/// 
/// Start with a matrix with only 0 and -1 values.
/// -1 need to be replaced by the distance to the nearest 0.
pub fn flood_fill(matrix: &mut HeatmapMatrix, zero_points: &[PixelCoord]) {
    let (width, height) = (matrix[0].len(), matrix.len());
    let mut queue = VecDeque::new();
    
    // Pre-allocate queue capacity for better performance
    let estimated_capacity = width * height / 4 + zero_points.len();
    queue.reserve(estimated_capacity);
    
    // Step 1: Initialize queue with all zero points
    for &(x, y) in zero_points {
        queue.push_back((x, y));
    }
    
    // Step 2: Process queue until all distances are calculated
    while let Some((x, y)) = queue.pop_front() {
        let current_distance = matrix[y][x];
        
        // Check all 4 neighbors (Manhattan distance)
        Self::process_neighbor(matrix, &mut queue, x, y, 0, -1, current_distance, width, height); // Up
        Self::process_neighbor(matrix, &mut queue, x, y, 0, 1, current_distance, width, height);  // Down
        Self::process_neighbor(matrix, &mut queue, x, y, -1, 0, current_distance, width, height); // Left
        Self::process_neighbor(matrix, &mut queue, x, y, 1, 0, current_distance, width, height);  // Right
    }
}

/// Process a single neighbor for the flood fill algorithm.
/// 
/// # Arguments
/// * `matrix` - The heatmap matrix to update
/// * `queue` - The queue of positions to process
/// * `x, y` - Current position coordinates
/// * `dx, dy` - Direction offsets for the neighbor
/// * `current_distance` - Distance at current position
/// * `width, height` - Matrix dimensions
fn process_neighbor(
    matrix: &mut HeatmapMatrix,
    queue: &mut VecDeque<(usize, usize)>,
    x: usize,
    y: usize,
    dx: i32,
    dy: i32,
    current_distance: i16,
    width: usize,
    height: usize,
) {
    let nx = x as i32 + dx;
    let ny = y as i32 + dy;
    
    if Self::is_valid_position(nx, ny, width, height) {
        let nx = nx as usize;
        let ny = ny as usize;
        
        if matrix[ny][nx] == -1 || matrix[ny][nx] > current_distance + 1 {
            matrix[ny][nx] = current_distance + 1;
            queue.push_back((nx, ny));
        }
    }
}

/// Check if position is within matrix bounds.
/// 
/// # Arguments
/// * `x, y` - Position coordinates (can be negative)
/// * `width, height` - Matrix dimensions
/// 
/// # Returns
/// * `true` if position is within bounds, `false` otherwise
fn is_valid_position(x: i32, y: i32, width: usize, height: usize) -> bool {
    x >= 0 && x < width as i32 && y >= 0 && y < height as i32
}