mod utils;
mod observation;

// Re-export the public interface
pub use crate::observation::Observation;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_observation_creation() {
        let obs = Observation::new();
        std::thread::sleep(std::time::Duration::from_millis(6));
        assert!(obs.get_observation_duration() > 5);
    }

    #[test]
    fn test_finish_observation() {
        let mut obs = Observation::new();
        std::thread::sleep(std::time::Duration::from_millis(10));
        obs.finish_observation();
        assert!(obs.get_observation_duration() > 9);
    }
}
