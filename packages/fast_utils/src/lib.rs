use wasm_bindgen::prelude::*;

/// Compute drawing speed in pixels per second
/// 
/// INTENTION: Calculate the rate at which pixels are being drawn
/// REQUIRES: pixel_count > 0, end_time >= start_time
/// MODIFIES: None (pure function)
/// EFFECTS: Returns drawing speed as pixels per second
/// RETURNS: Drawing speed in pixels per second (f64)
/// 
/// ASSUMPTIONS: Timestamps are in milliseconds, pixel_count is valid
/// INVARIANTS: Speed is always non-negative
#[wasm_bindgen]
pub fn compute_drawing_speed(
    pixel_count: u16,
    start_time: i64,
    end_time: i64,
) -> f64 {
    if pixel_count == 0 {
        return 0.0;
    }
    
    let actual_end_time = if end_time == 0 {
        js_sys::Date::now() as i64
    } else {
        end_time
    };
    
    if actual_end_time <= start_time {
        return 0.0;
    }
    
    let time_diff_seconds = (actual_end_time - start_time) as f64 / 1000.0;
    pixel_count as f64 / time_diff_seconds
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_drawing_speed() {
        // Test normal case
        let speed = compute_drawing_speed(1000, 1000, 2000);
        assert_eq!(speed, 1000.0); // 1000 pixels in 1 second
        
        // Test zero pixels
        let speed = compute_drawing_speed(0, 1000, 2000);
        assert_eq!(speed, 0.0);
        
        // Test invalid time range
        let speed = compute_drawing_speed(1000, 2000, 1000);
        assert_eq!(speed, 0.0);
    }
} 