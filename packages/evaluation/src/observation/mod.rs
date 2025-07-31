//! Public interface for observation time tracking.
//! 
//! This module provides a stable API contract that hides implementation details.
//! The internal implementation can change without breaking external code.

mod internal;

#[cfg(test)]
mod tests;

// Re-export types for convenience
pub use crate::image::Image;

/// Tracks drawing observation
/// 
pub struct Observation {
    // Private implementation - external code cannot access this
    inner: crate::observation::internal::ObservationImpl,
}

impl Observation {
    /// Creates a new observation starting now.
    pub fn new(reference_image: Image) -> Self {
        Self {
            inner: crate::observation::internal::ObservationImpl::new(reference_image),
        }
    }

    /// Returns the total observation duration in milliseconds.
    /// 
    /// If the observation is still active, returns the current duration.
    /// If finished, returns the final duration.
    pub fn get_duration(&self) -> u64 {
        self.inner.get_duration()
    }

    /// Finishes the observation and records the end time.
    /// 
    /// Has no effect if the observation is already finished.
    pub fn finish_observation(&mut self) {
        self.inner.finish_observation();
    }

    /// Returns the observation start time in milliseconds.
    pub fn get_start_time(&self) -> u64 {
        self.inner.get_start_time()
    }

    /// Returns the observation end time in milliseconds.
    pub fn get_end_time(&self) -> Option<u64> {
        self.inner.get_end_time()
    }

    /// Returns the total number of pixels in the reference image.
    pub fn get_total_non_white_pixels(&self) -> u32 {
        self.inner.get_total_non_white_pixels()
    }

    /// Returns the drawing speed in pixels per second.
    /// 
    /// Returns 0 if the observation hasn't finished yet.
    pub fn get_drawing_speed(&self) -> f32 {
        self.inner.get_drawing_speed()
    }
} 