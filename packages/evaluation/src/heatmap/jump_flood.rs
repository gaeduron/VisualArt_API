//! Jump Flooding Algorithm (JFA) implementation for distance transforms
//! Thanks to Rong Guodong for the original implementation.
//! 
//! O(n log n) time complexity.
//! This implementation uses JFA+1 variant for improved accuracy.
//! Reference: https://www.comp.nus.edu.sg/~tants/jfa.html (2006)

use crate::types::{HeatmapMatrix, PixelCoord};

/// Seed map: each pixel stores coordinates of its nearest target (or None if unknown)
/// example:
/// [
///     [None, None, None],
///     [None, (1, 1), None],
///     [None, None, (2, 2)],
/// ]
type SeedMap = Vec<Vec<Option<PixelCoord>>>;

/// Main entry point for Jump Flooding Algorithm with JFA+1 variant
/// 
/// PSEUDO-CODE:
/// 2. For step sizes [N/2, N/4, N/8, ..., 1, 1]:  // JFA+1 has extra pass with step=1
///    a. For each pixel (x,y):
///       b. Check 8 neighbors at step_size distance
///       c. Update to nearest target if closer found
/// 3. Convert seed coordinates to Manhattan distances
pub fn jump_flooding_algorithm(
    width: usize,
    height: usize,
    target_points: &[PixelCoord],
) -> HeatmapMatrix {
    let mut seed_map = initialize_seed_map(width, height, target_points);
    
    let step_sizes = calculate_step_sizes(width, height);
    for step_size in step_sizes {
        jump_flooding_pass(&mut seed_map, step_size, width, height);
    }
    
    // Step 3: Convert seeds to distances
    convert_seeds_to_distances(&seed_map, width, height)
}

/// Initialize seed map with target pixel coordinates.
fn initialize_seed_map(
    width: usize,
    height: usize,
    target_points: &[PixelCoord],
) -> SeedMap {
    let mut seed_map = vec![vec![None; width]; height];

    for &(target_x, target_y) in target_points {
        if target_x < width && target_y < height {
            seed_map[target_y][target_x] = Some((target_x, target_y));
        }
    }
    
    seed_map
}

/// Calculate step sizes for JFA+1: N/2, N/4, ..., 1, 1
/// 
/// Returns a sequence of step sizes for the Jump Flooding Algorithm.
/// For a 500×500 image, returns [256, 128, 64, 32, 16, 8, 4, 2, 1, 1].
/// 
/// # Panics
/// Panics if width or height is 0.
fn calculate_step_sizes(width: usize, height: usize) -> Vec<usize> {
    assert!(width > 0 && height > 0, "Width and height must be greater than 0");
    
    // Fast path for common 500×500 image size
    if width == 500 && height == 500 {
        return vec![256, 128, 64, 32, 16, 8, 4, 2, 1, 1];
    }
    
    let max_dimension = width.max(height);
    let next_power_of_2 = find_next_power_of_2(max_dimension);
    let estimated_capacity = calculate_capacity_needed(next_power_of_2);
    
    generate_step_sequence(next_power_of_2, estimated_capacity)
}

/// Find the smallest power of 2 that is >= the given value
fn find_next_power_of_2(value: usize) -> usize {
    let mut power = 1;
    while power < value {
        power *= 2;
    }
    power
}

/// Calculate how many step sizes we'll need (including JFA+1 extra pass)
fn calculate_capacity_needed(next_power_of_2: usize) -> usize {
    if next_power_of_2 <= 1 {
        2 // Minimum: [1, 1] for JFA+1
    } else {
        (next_power_of_2.trailing_zeros() + 1) as usize // log2 + 1 for JFA+1
    }
}

/// Generate the actual sequence: [N/2, N/4, N/8, ..., 1, 1]
fn generate_step_sequence(next_power_of_2: usize, capacity: usize) -> Vec<usize> {
    let mut step_sizes = Vec::with_capacity(capacity);
    let mut current_step = next_power_of_2 / 2;
    
    // Generate decreasing powers of 2: [N/2, N/4, N/8, ..., 1]
    while current_step >= 1 {
        step_sizes.push(current_step);
        current_step /= 2;
    }
    
    // JFA+1: Add extra pass with step size 1 for improved accuracy
    if step_sizes.last() == Some(&1) {
        step_sizes.push(1);
    }
    
    step_sizes
}

/// Check if position is within image bounds
/// 
/// PSEUDO-CODE:
/// return x >= 0 && x < width && y >= 0 && y < height
fn is_within_bounds(x: isize, y: isize, width: usize, height: usize) -> bool {
    x >= 0 && y >= 0 && (x as usize) < width && (y as usize) < height
}

/// Perform one pass of jump flooding with given step size
fn jump_flooding_pass(
    seed_map: &mut SeedMap,
    step_size: usize,
    width: usize,
    height: usize,
) {
    let original_seed_map = seed_map.clone();
    
    for current_pixel_y in 0..height {
        for current_pixel_x in 0..width {
            let current_pixel_position = (current_pixel_x, current_pixel_y);
            let mut best_seed_found = original_seed_map[current_pixel_y][current_pixel_x];
            let mut shortest_distance_found = match best_seed_found {
                Some(seed_coordinates) => manhattan_distance(current_pixel_position, seed_coordinates),
                None => usize::MAX,
            };
            
            // Directions: up, down, left, right, and 4 diagonals
            let eight_direction_offsets = [
                (-1, -1), (-1, 0), (-1, 1),  // top row
                ( 0, -1),          ( 0, 1),  // middle row (skip center)
                ( 1, -1), ( 1, 0), ( 1, 1),  // bottom row
            ];
            
            for (direction_x, direction_y) in eight_direction_offsets {
                let neighbor_x = current_pixel_x as isize + (direction_x * step_size as isize);
                let neighbor_y = current_pixel_y as isize + (direction_y * step_size as isize);
                
                if is_within_bounds(neighbor_x, neighbor_y, width, height) {
                    let neighbor_x_usize = neighbor_x as usize;
                    let neighbor_y_usize = neighbor_y as usize;
                    
                    if let Some(neighbor_seed_coordinates) = original_seed_map[neighbor_y_usize][neighbor_x_usize] {
                        let distance_to_neighbor_seed = manhattan_distance(
                            current_pixel_position, 
                            neighbor_seed_coordinates
                        );
                        
                        if distance_to_neighbor_seed < shortest_distance_found {
                            best_seed_found = Some(neighbor_seed_coordinates);
                            shortest_distance_found = distance_to_neighbor_seed;
                        }
                    }
                }
            }
            
            seed_map[current_pixel_y][current_pixel_x] = best_seed_found;
        }
    }
}

/// Calculate Manhattan distance between two points
/// 
/// Manhattan distance is the sum of absolute differences of coordinates.
/// For points (x1,y1) and (x2,y2): |x1-x2| + |y1-y2|
fn manhattan_distance(point1: PixelCoord, point2: PixelCoord) -> usize {
    let (x1, y1) = point1;
    let (x2, y2) = point2;
    
    let dx = if x1 >= x2 { x1 - x2 } else { x2 - x1 };
    let dy = if y1 >= y2 { y1 - y2 } else { y2 - y1 };
    
    dx + dy
}

/// Convert seed map to distance matrix
/// 
/// Transforms the seed map (pixel → nearest target coordinates) into 
/// a distance matrix (pixel → distance to nearest target).
/// 
/// Pixels with no reachable target get distance -1.
fn convert_seeds_to_distances(
    seed_map: &SeedMap,
    width: usize,
    height: usize,
) -> HeatmapMatrix {
    let mut distance_matrix = vec![vec![-1; width]; height];

    for y in 0..height {
        for x in 0..width {
            if let Some(target_coordinates) = seed_map[y][x] {
                let current_position = (x, y);
                let distance = manhattan_distance(current_position, target_coordinates);
                
                distance_matrix[y][x] = distance as i16;
            }
            // If no seed found, distance remains -1 (unreachable)
        }
    }
    
    distance_matrix
}