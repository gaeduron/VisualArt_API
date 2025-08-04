use super::*;


#[test]
fn test_observation_creation() {
    let obs = Observation::new(Image::standard_white(None));
    std::thread::sleep(std::time::Duration::from_millis(6));
    assert!(obs.get_duration() > 5);
}

#[test]
fn test_finish_observation() {
    let mut obs = Observation::new(Image::standard_white(None));
    std::thread::sleep(std::time::Duration::from_millis(10));
    obs.finish_observation();
    assert!(obs.get_duration() > 9);
}

#[test]
fn test_total_non_white_pixels_calculation() {
    let obs1 = Observation::new(Image::standard_white(None));
    assert_eq!(obs1.get_total_non_white_pixels(), 0);

    let mut image2 = Image::standard_white(None);
    image2.set_pixel(0, 0, [0, 0, 0, 255]);
    image2.set_pixel(0, 1, [255, 0, 0, 255]);
    image2.set_pixel(0, 2, [0, 255, 0, 255]);
    image2.set_pixel(0, 3, [0, 0, 255, 255]);
    let obs2 = Observation::new(image2);
    assert_eq!(obs2.get_total_non_white_pixels(), 4);
}

#[test]
fn test_drawing_speed_calculation() {
    let mut image = Image::standard_white(None);
    // draw a diagonal line from top left to bottom right
    for i in 0..500 {
        image.set_pixel(i, i, [0, 0, 0, 255]);
    }
    let mut obs = Observation::new(image);
    
    std::thread::sleep(std::time::Duration::from_millis(100));
    obs.finish_observation();
    
    let speed = obs.get_drawing_speed();
    assert!(speed > 0.0);
    assert!(speed < 10000.0); // Should be reasonable pixels per second for 500x500 image
}

#[test]
fn test_reference_and_drawing_evaluation() {
    let reference = Image::load_from_file("examples/line_drawing_fixture_complex_500.png")
    .expect("Failed to load image fixture, reference");
    let drawing = Image::load_from_file("examples/line_drawing_fixture_complex_500_obs.png")
    .expect("Failed to load image fixture, drawing");

    let mut obs = Observation::new(reference);
    // sleep for 100ms
    std::thread::sleep(std::time::Duration::from_millis(100));
    obs.set_drawing(drawing).unwrap();
    obs.finish_observation();

    let report = obs.get_evaluation().unwrap();
    assert!(report.statistics.pixels_per_second.is_some());
    assert!(report.statistics.pixels_per_second.unwrap() > 0.0);
    assert!(report.statistics.total_duration.is_some());
    assert!(report.statistics.total_duration.unwrap() > 100);
    assert!(report.statistics.top5_error_by_color.len() > 0);
    assert!(report.statistics.top5_error_by_color.contains_key(&[0, 0, 0, 255]));
    assert!(report.statistics.top5_error_by_color.get(&[0, 0, 0, 255]).unwrap() > &0.0);
    assert!(report.statistics.top5_error_by_color.get(&[0, 0, 0, 255]).unwrap() < &50000.0);
}