//! WASM adapter for Observation
//! 
//! This module handles the conversion between JavaScript and Rust types
//! for the Observation functionality.

use wasm_bindgen::prelude::*;
use serde_wasm_bindgen;
use crate::types::{Image2DArray, EvaluationReport};
use super::Observation;
use super::Image;

/// WASM-compatible wrapper for Observation
/// 
/// This struct is exposed to JavaScript as "Observation" but internally
/// uses the Rust Observation struct.
/// 
/// @example
/// ```typescript
/// const observation = new Observation(referenceImage);
/// observation.set_drawing(drawingImage);
/// const evaluation = observation.get_evaluation();
/// ```
#[wasm_bindgen]
pub struct WasmObservation {
    inner: Observation,
}

#[wasm_bindgen]
impl WasmObservation {
    /// Creates a new observation from JavaScript image data
    /// 
    /// @param reference_image_data - 2D array of RGBA pixels [[[R,G,B,A], ...], ...]
    /// @returns Promise<Observation> - A new observation instance
    /// 
    /// @example
    /// ```typescript
    /// const referenceImage: Image2DArray = [
    ///   [[255, 255, 255, 255], [0, 0, 0, 255]],     // White, Black
    ///   [[0, 0, 0, 255], [255, 255, 255, 255]]      // Black, White
    /// ];
    /// const observation = new Observation(referenceImage);
    /// ```
    #[wasm_bindgen(constructor)]
    pub fn new(reference_image_data: &JsValue) -> Result<WasmObservation, JsValue> {
        let reference_image: Image2DArray = serde_wasm_bindgen::from_value(reference_image_data.clone())
            .map_err(|e| JsValue::from_str(&format!("Failed to deserialize reference image: {}", e)))?;
        
        let reference_image = Image::new(reference_image, None);
        let inner = Observation::new(reference_image);
        
        Ok(WasmObservation { inner })
    }

    /// Sets the drawing image from JavaScript data
    /// 
    /// @param drawing_image_data - 2D array of RGBA pixels [[[R,G,B,A], ...], ...]
    /// @returns Promise<void>
    /// 
    /// @example
    /// ```typescript
    /// const drawingImage: Image2DArray = [
    ///   [[255, 255, 255, 255], [0, 0, 0, 255]],     // White, Black
    ///   [[0, 0, 0, 255], [255, 255, 255, 255]]      // Black, White
    /// ];
    /// observation.set_drawing(drawingImage);
    /// ```
    pub fn set_drawing(&mut self, drawing_image_data: &JsValue) -> Result<(), JsValue> {
        let drawing_image: Image2DArray = serde_wasm_bindgen::from_value(drawing_image_data.clone())
            .map_err(|e| JsValue::from_str(&format!("Failed to deserialize drawing image: {}", e)))?;
        
        let drawing_image = Image::new(drawing_image, None);
        
        self.inner.set_drawing(drawing_image)
            .map_err(|e| JsValue::from_str(&e))
    }

    /// Returns the evaluation report as a JavaScript object
    /// 
    /// @returns Promise<EvaluationReport> - Object with statistics including:
    /// - pixels_per_color_count: Record<string, number>
    /// - top5_error_by_color: Record<string, number>
    /// - error_grid_per_color: Record<string, number[]>
    /// - total_duration?: number
    /// - pixels_per_second?: number
    /// 
    /// @example
    /// ```typescript
    /// const evaluation: EvaluationReport = observation.get_evaluation();
    /// console.log('Error rate:', evaluation.statistics.top5_error_by_color);
    /// ```
    pub fn get_evaluation(&self) -> Result<JsValue, JsValue> {
        let evaluation: EvaluationReport = self.inner.get_evaluation()
            .map_err(|e| JsValue::from_str(&e))?;
        
        serde_wasm_bindgen::to_value(&evaluation)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize evaluation: {}", e)))
    }

    /// Returns the total observation duration in milliseconds
    /// 
    /// @returns number - Duration in milliseconds
    pub fn get_duration(&self) -> u64 {
        self.inner.get_duration()
    }

    /// Finishes the observation and records the end time
    /// 
    /// @returns void
    pub fn finish_observation(&mut self) {
        self.inner.finish_observation();
    }

    /// Returns the observation start time in milliseconds
    /// 
    /// @returns number - Start time in milliseconds
    pub fn get_start_time(&self) -> u64 {
        self.inner.get_start_time()
    }

    /// Returns the observation end time in milliseconds
    /// 
    /// @returns number | undefined - End time in milliseconds (if finished)
    pub fn get_end_time(&self) -> Option<u64> {
        self.inner.get_end_time()
    }

    /// Returns the total number of non-white pixels in the reference image
    /// 
    /// @returns number - Count of non-white pixels
    pub fn get_total_non_white_pixels(&self) -> u32 {
        self.inner.get_total_non_white_pixels()
    }

    /// Returns the drawing speed in pixels per second
    /// 
    /// @returns number - Speed in pixels per second
    pub fn get_drawing_speed(&self) -> f32 {
        self.inner.get_drawing_speed()
    }
} 