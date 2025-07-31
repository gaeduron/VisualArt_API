use crate::utils::current_time_ms;
use crate::image::Image;

/// Internal implementation - can change without breaking the public API
pub struct ObservationImpl {
    pub start_time: u64,
    end_time: Option<u64>,
    reference_image: Image,
}

impl ObservationImpl {
    pub fn new(reference_image: Image) -> Self {
        Self {
            start_time: current_time_ms(),
            end_time: None,
            reference_image: reference_image,
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

    pub fn get_total_non_white_pixels(&self) -> u32 {
        let white_pixel = [255, 255, 255, 255];
        let total_white_pixels = self.reference_image.number_of_pixel_per_color[&white_pixel];
        let total_pixels = self.reference_image.dimensions.0 * self.reference_image.dimensions.1;
        total_pixels as u32 - total_white_pixels as u32
    }

    pub fn get_drawing_speed(&self) -> f32 {
        self.get_total_non_white_pixels() as f32 / self.get_duration() as f32
    }
} 