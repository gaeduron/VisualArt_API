use image_evaluator::{Observation, Image};
use std::thread;
use std::time::Duration;

fn main() {
    println!("Creating new observation...");
    let mut obs = Observation::new(Image::standard_white(None));
    
    println!("Observation created at: {}", obs.get_start_time());
    println!("Duration so far: {}ms", obs.get_duration());
    
    println!("Waiting 2 seconds...");
    thread::sleep(Duration::from_secs(2));
    
    println!("Finishing observation...");
    obs.finish_observation();
    
    println!("Final duration: {}ms", obs.get_duration());
    println!("Observation completed!");
} 