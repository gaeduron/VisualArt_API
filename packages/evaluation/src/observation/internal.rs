use crate::utils::current_time_ms;

/// Internal implementation - can change without breaking the public API
pub struct ObservationImpl {
    pub start_time: u64,
    end_time: Option<u64>,
}

impl ObservationImpl {
    pub fn new() -> Self {
        Self {
            start_time: current_time_ms(),
            end_time: None,
        }
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
} 