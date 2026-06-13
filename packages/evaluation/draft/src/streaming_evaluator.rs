/*! 
# Streaming Image Evaluator

High-performance real-time evaluation optimized for live drawing assessment.

## Performance Strategy

1. **Precompute Reference**: Generate reference heatmap once, reuse for all evaluations
2. **Incremental Updates**: Update only new pixels in observation heatmap  
3. **Efficient Data Structures**: Use faster algorithms for live evaluation
4. **Serializable State**: Export/import heatmaps for TS integration

## Usage

```rust
let mut streaming = StreamingEvaluator::from_reference_image("reference.png")?;

// Real-time updates as user draws
for new_pixels in stroke_pixels {
    streaming.add_observation_pixels(&new_pixels);
    let current_score = streaming.get_current_top5_error();
    println!("Live score: {:.1}%", current_score);
}
```
*/

use ndarray::{Array2, Array1};
use serde::{Deserialize, Serialize};
use std::collections::{VecDeque, HashSet};
use crate::{EvaluationError, ErrorMetrics, EvaluationResult};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SerializableHeatmap {
    pub data: Vec<i32>,
    pub shape: (usize, usize),
}

impl From<&Array2<i32>> for SerializableHeatmap {
    fn from(array: &Array2<i32>) -> Self {
        Self {
            data: array.iter().cloned().collect(),
            shape: (array.nrows(), array.ncols()),
        }
    }
}

impl From<SerializableHeatmap> for Array2<i32> {
    fn from(ser: SerializableHeatmap) -> Self {
        Array2::from_shape_vec(ser.shape, ser.data)
            .expect("Invalid serialized heatmap data")
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamingEvaluatorState {
    pub reference_heatmap: SerializableHeatmap,
    pub reference_pixels: Vec<(usize, usize)>,
    pub bg_transparent: bool,
}

pub struct StreamingEvaluator {
    /// Pre-computed reference heatmap (never changes)
    reference_heatmap: Array2<i32>,
    reference_pixels: Vec<(usize, usize)>,
    
    /// Live observation state (updated incrementally)  
    observation_heatmap: Array2<i32>,
    observation_pixels: HashSet<(usize, usize)>,
    
    /// Cached grid for fast top-5 calculation
    current_grid: Array2<i32>,
    
    bg_transparent: bool,
}

impl StreamingEvaluator {
    /**
     * INTENTION: Create streaming evaluator from reference image with precomputed heatmap
     * REQUIRES: Valid reference image with drawing content
     * MODIFIES: None 
     * EFFECTS: Loads reference, computes heatmap once for reuse
     * RETURNS: StreamingEvaluator ready for real-time updates
     * 
     * ASSUMPTIONS: Reference image doesn't change during evaluation session
     * INVARIANTS: Reference heatmap remains constant throughout evaluation
     * GHOST STATE: Precomputed reference enables O(new_pixels) incremental updates
     */
    pub fn from_reference_arrays(
        reference_array: Array2<u8>, 
        bg_transparent: bool
    ) -> Result<Self, EvaluationError> {
        let white_pixel = if bg_transparent { 0 } else { 255 };
        let reference_pixels = Self::extract_pixels(&reference_array, white_pixel);
        
        if reference_pixels.is_empty() {
            return Err(EvaluationError::Processing("Reference contains no drawing content".to_string()));
        }
        
        // Pre-compute reference heatmap (expensive, done once)
        let reference_heatmap = Self::compute_heatmap_fast(&reference_pixels)?;
        
        // Initialize empty observation state
        let observation_heatmap = Array2::from_elem((500, 500), -1i32);
        let observation_pixels = HashSet::new();
        let current_grid = Array2::zeros((10, 10));
        
        Ok(Self {
            reference_heatmap,
            reference_pixels,
            observation_heatmap,
            observation_pixels,
            current_grid,
            bg_transparent,
        })
    }

    /**
     * INTENTION: Create evaluator from pre-serialized state for fast initialization
     * REQUIRES: Valid serialized state from previous session
     * MODIFIES: None
     * EFFECTS: Reconstructs evaluator without expensive reference computation
     * RETURNS: StreamingEvaluator ready for continued evaluation
     * 
     * ASSUMPTIONS: Serialized state is valid and uncorrupted
     * INVARIANTS: Deserialized state matches original computation
     * GHOST STATE: Enables TS app to cache reference computation across sessions
     */
    pub fn from_serialized_state(state: StreamingEvaluatorState) -> Self {
        let reference_heatmap = Array2::from(state.reference_heatmap);
        let observation_heatmap = Array2::from_elem((500, 500), -1i32);
        let observation_pixels = HashSet::new();
        let current_grid = Array2::zeros((10, 10));
        
        Self {
            reference_heatmap,
            reference_pixels: state.reference_pixels,
            observation_heatmap,
            observation_pixels,  
            current_grid,
            bg_transparent: state.bg_transparent,
        }
    }

    /**
     * INTENTION: Export current state for serialization to TS app
     * REQUIRES: None
     * MODIFIES: None
     * EFFECTS: Creates serializable representation of evaluator state
     * RETURNS: StreamingEvaluatorState for JSON serialization
     * 
     * ASSUMPTIONS: TS app can handle JSON serialization of large arrays
     * INVARIANTS: Serialized state can recreate identical evaluator
     * GHOST STATE: Enables caching expensive reference computation
     */
    pub fn export_state(&self) -> StreamingEvaluatorState {
        StreamingEvaluatorState {
            reference_heatmap: SerializableHeatmap::from(&self.reference_heatmap),
            reference_pixels: self.reference_pixels.clone(),
            bg_transparent: self.bg_transparent,
        }
    }

    /**
     * INTENTION: Add new observation pixels and update evaluation incrementally
     * REQUIRES: Vector of new pixel coordinates from latest stroke
     * MODIFIES: observation_heatmap, observation_pixels, current_grid
     * EFFECTS: Updates heatmap only for new pixels, recalculates top-5 error
     * RETURNS: Current top-5 error percentage
     * 
     * ASSUMPTIONS: New pixels represent addition to existing drawing
     * INVARIANTS: Only new pixels require heatmap computation
     * GHOST STATE: Incremental updates provide O(new_pixels) performance
     */
    pub fn add_observation_pixels(&mut self, new_pixels: &[(usize, usize)]) -> Result<f64, EvaluationError> {
        // Filter only truly new pixels
        let actually_new: Vec<(usize, usize)> = new_pixels.iter()
            .filter(|&&pixel| !self.observation_pixels.contains(&pixel))
            .cloned()
            .collect();

        if actually_new.is_empty() {
            return Ok(self.get_current_top5_error());
        }

        // Add to observation set
        for &pixel in &actually_new {
            self.observation_pixels.insert(pixel);
        }

        // Incrementally update observation heatmap (OPTIMIZED)
        self.update_observation_heatmap_incremental(&actually_new)?;

        // Recalculate grid and return top-5 error
        self.update_current_grid()?;
        Ok(self.get_current_top5_error())
    }

    /**
     * INTENTION: Reset observation to empty state for new drawing
     * REQUIRES: None
     * MODIFIES: observation_heatmap, observation_pixels, current_grid
     * EFFECTS: Clears all observation data, keeps reference unchanged
     * RETURNS: None
     * 
     * ASSUMPTIONS: User wants to start fresh drawing evaluation
     * INVARIANTS: Reference heatmap remains unchanged
     * GHOST STATE: Maintains precomputed reference for next evaluation
     */
    pub fn reset_observation(&mut self) {
        self.observation_heatmap.fill(-1);
        self.observation_pixels.clear();
        self.current_grid.fill(0);
    }

    /**
     * INTENTION: Get current top-5 error without recalculation
     * REQUIRES: current_grid is up to date
     * MODIFIES: None
     * EFFECTS: Computes top-5 from cached grid
     * RETURNS: Current top-5 error percentage
     * 
     * ASSUMPTIONS: current_grid reflects latest observation state
     * INVARIANTS: Grid calculation is deterministic
     * GHOST STATE: Cached grid enables O(1) score retrieval
     */
    pub fn get_current_top5_error(&self) -> f64 {
        let mut grid_flat: Vec<i32> = self.current_grid.iter().cloned().collect();
        grid_flat.sort_unstable();
        let top_5_values: Vec<i32> = grid_flat.into_iter().rev().take(5).collect();
        
        if !top_5_values.is_empty() {
            top_5_values.iter().sum::<i32>() as f64 / (5.0 * 5.0)
        } else {
            0.0
        }
    }

    /**
     * INTENTION: Generate full evaluation result compatible with original API
     * REQUIRES: None
     * MODIFIES: None
     * EFFECTS: Creates complete evaluation result with all metrics
     * RETURNS: EvaluationResult matching original evaluator format
     * 
     * ASSUMPTIONS: Client needs full compatibility with existing API
     * INVARIANTS: Result format matches non-streaming evaluator
     * GHOST STATE: Maintains API compatibility while providing streaming performance
     */
    pub fn get_full_evaluation(&self) -> Result<EvaluationResult, EvaluationError> {
        if self.observation_pixels.is_empty() {
            return Err(EvaluationError::Processing("No observation pixels to evaluate".to_string()));
        }

        let observation_vec: Vec<(usize, usize)> = self.observation_pixels.iter().cloned().collect();
        
        // Calculate mean error
        let mut errors = Vec::new();
        
        // Observation pixels against reference
        for &(y, x) in &observation_vec {
            if y < 500 && x < 500 {
                errors.push(self.reference_heatmap[[y, x]]);
            }
        }
        
        // Reference pixels against observation  
        for &(y, x) in &self.reference_pixels {
            if y < 500 && x < 500 {
                errors.push(self.observation_heatmap[[y, x]]);
            }
        }

        let mean_error = if !errors.is_empty() {
            errors.iter().sum::<i32>() as f64 / (errors.len() as f64 * 5.0) * 100.0
        } else {
            0.0
        };

        let top_5_error = self.get_current_top5_error();
        
        let metrics = ErrorMetrics {
            top_5_error,
            mean_error,
            pixel_count: self.reference_pixels.len(),
            grid: self.current_grid.clone(),
        };

        let evaluation_text = format!(
            "Top 5 error: {:.1}%\nMean error: {:.1}%\nPixel count: {}",
            metrics.top_5_error, metrics.mean_error, metrics.pixel_count
        );

        Ok(EvaluationResult {
            metrics,
            evaluation_text,
        })
    }

    // ============================================================================
    // PRIVATE OPTIMIZED METHODS
    // ============================================================================

    /// Fast pixel extraction using iterator
    fn extract_pixels(image: &Array2<u8>, background_value: u8) -> Vec<(usize, usize)> {
        image.indexed_iter()
            .filter_map(|((y, x), &value)| {
                if value != background_value { Some((y, x)) } else { None }
            })
            .collect()
    }

    /// Optimized heatmap computation using better data structures
    fn compute_heatmap_fast(pixels: &[(usize, usize)]) -> Result<Array2<i32>, EvaluationError> {
        let mut heatmap = Array2::from_elem((500, 500), -1i32);
        let mut queue = VecDeque::with_capacity(pixels.len() * 4); // Pre-allocate
        
        // Initialize source pixels
        for &(y, x) in pixels {
            if y < 500 && x < 500 {
                heatmap[[y, x]] = 0;
                queue.push_back(((y, x), 0));
            }
        }
        
        // BFS flood-fill with optimized bounds checking
        const DIRECTIONS: [(i32, i32); 4] = [(0, 1), (0, -1), (1, 0), (-1, 0)];
        
        while let Some(((y, x), distance)) = queue.pop_front() {
            for &(dy, dx) in &DIRECTIONS {
                let ny = y as i32 + dy;
                let nx = x as i32 + dx;
                
                // Optimized bounds check
                if (0..500).contains(&ny) && (0..500).contains(&nx) {
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

    /// CRITICAL OPTIMIZATION: Incremental heatmap update
    /// Only recomputes distances for pixels affected by new additions
    fn update_observation_heatmap_incremental(&mut self, new_pixels: &[(usize, usize)]) -> Result<(), EvaluationError> {
        // For new pixels, we need to:
        // 1. Set them to distance 0 
        // 2. Propagate distance updates outward
        // 3. But only update pixels that would get SHORTER distances
        
        let mut queue = VecDeque::new();
        
        // Add new pixels as sources
        for &(y, x) in new_pixels {
            if y < 500 && x < 500 {
                self.observation_heatmap[[y, x]] = 0;
                queue.push_back(((y, x), 0));
            }
        }
        
        // Incremental BFS - only update pixels that get shorter distances
        const DIRECTIONS: [(i32, i32); 4] = [(0, 1), (0, -1), (1, 0), (-1, 0)];
        
        while let Some(((y, x), distance)) = queue.pop_front() {
            for &(dy, dx) in &DIRECTIONS {
                let ny = y as i32 + dy;
                let nx = x as i32 + dx;
                
                if (0..500).contains(&ny) && (0..500).contains(&nx) {
                    let ny = ny as usize;
                    let nx = nx as usize;
                    
                    let new_distance = distance + 1;
                    let current_distance = self.observation_heatmap[[ny, nx]];
                    
                    // Only update if we found a shorter path or unvisited pixel
                    if current_distance == -1 || new_distance < current_distance {
                        self.observation_heatmap[[ny, nx]] = new_distance;
                        queue.push_back(((ny, nx), new_distance));
                    }
                }
            }
        }
        
        Ok(())
    }

    /// Fast grid update using optimized iteration
    fn update_current_grid(&mut self) -> Result<(), EvaluationError> {
        self.current_grid.fill(0);
        
        const GRID_SIZE: usize = 10;
        const CHUNK_SIZE: usize = 50; // 500 / 10
        
        // Update grid from observation pixels
        for &(y, x) in &self.observation_pixels {
            if y < 500 && x < 500 {
                let error = self.reference_heatmap[[y, x]];
                let grid_y = y / CHUNK_SIZE;
                let grid_x = x / CHUNK_SIZE;
                
                if grid_y < GRID_SIZE && grid_x < GRID_SIZE {
                    self.current_grid[[grid_y, grid_x]] = self.current_grid[[grid_y, grid_x]].max(error);
                }
            }
        }
        
        // Update grid from reference pixels  
        for &(y, x) in &self.reference_pixels {
            if y < 500 && x < 500 {
                let error = self.observation_heatmap[[y, x]];
                let grid_y = y / CHUNK_SIZE;
                let grid_x = x / CHUNK_SIZE;
                
                if grid_y < GRID_SIZE && grid_x < GRID_SIZE {
                    self.current_grid[[grid_y, grid_x]] = self.current_grid[[grid_y, grid_x]].max(error);
                }
            }
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_streaming_evaluator_creation() {
        let mut reference = Array2::from_elem((500, 500), 255u8);
        reference[[100, 100]] = 0;
        reference[[101, 101]] = 0;
        
        let evaluator = StreamingEvaluator::from_reference_arrays(reference, false);
        assert!(evaluator.is_ok());
    }

    #[test]
    fn test_incremental_pixel_addition() {
        let mut reference = Array2::from_elem((500, 500), 255u8);
        reference[[100, 100]] = 0;
        
        let mut evaluator = StreamingEvaluator::from_reference_arrays(reference, false).unwrap();
        
        // Add some observation pixels
        let new_pixels = vec![(95, 95), (96, 96)];
        let error = evaluator.add_observation_pixels(&new_pixels).unwrap();
        
        assert!(error > 0.0);
        assert_eq!(evaluator.observation_pixels.len(), 2);
    }

    #[test]
    fn test_serialization_roundtrip() {
        let mut reference = Array2::from_elem((500, 500), 255u8);
        reference[[100, 100]] = 0;
        
        let evaluator1 = StreamingEvaluator::from_reference_arrays(reference, false).unwrap();
        let state = evaluator1.export_state();
        let evaluator2 = StreamingEvaluator::from_serialized_state(state);
        
        assert_eq!(evaluator1.reference_pixels.len(), evaluator2.reference_pixels.len());
    }
} 