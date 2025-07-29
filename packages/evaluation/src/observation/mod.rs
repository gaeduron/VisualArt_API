//! Public interface for observation time tracking.
//! 
//! This module provides a stable API contract that hides implementation details.
//! The internal implementation can change without breaking external code.

mod internal;

/// Tracks drawing observation time
/// 
pub struct Observation {
    // Private implementation - external code cannot access this
    inner: crate::observation::internal::ObservationImpl,
}

impl Observation {
    /// Creates a new observation starting now.
    pub fn new() -> Self {
        Self {
            inner: crate::observation::internal::ObservationImpl::new(),
        }
    }

    /// Returns the total observation duration in milliseconds.
    /// 
    /// If the observation is still active, returns the current duration.
    /// If finished, returns the final duration.
    pub fn get_observation_duration(&self) -> u64 {
        self.inner.get_observation_duration()
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
} 