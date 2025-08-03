//! Benchmark for Jump Flooding Algorithm performance
//! 
//! This benchmark loads a 500x500 image fixture and measures the time
//! it takes to generate a heatmap using the JFA implementation.

use image_evaluator::{Image, Heatmap};
use std::time::Instant;

const BLACK_PIXEL: [u8; 4] = [0, 0, 0, 255]; // Black target pixels

fn main() {
    println!("🚀 JFA Benchmark - 500x500 Image");
    println!("================================");
    
    // Load the 500x500 test image
    println!("📁 Loading image fixture...");
    let load_start = Instant::now();
    
    let image = Image::load_from_file("examples/line_drawing_fixture_complex_500.png")
        .expect("Failed to load image fixture");
    
    let load_time = load_start.elapsed();
    println!("✅ Image loaded in {:?}", load_time);
    println!("📏 Image dimensions: {:?}", image.dimensions);
    
    // Count black pixels (our targets)
    let black_pixel_count = count_target_pixels(&image, BLACK_PIXEL);
    println!("🎯 Target pixels (black): {}", black_pixel_count);
    
    // Benchmark the heatmap generation
    println!("\n🔥 Running heatmap generation benchmark...");
    

    // Main benchmark runs with the two core algorithms
    run_benchmark_for_algorithm(&image, "flood_fill");
    run_benchmark_for_algorithm(&image, "jump_flood_parallel");
}

fn run_benchmark_for_algorithm(image: &Image, algorithm: &str) {
   // Warm-up run (to account for any cold-start effects)
   println!("🌡️  Warm-up run...");
   let _ = generate_heatmap_timed(&image, algorithm);
   
   // Main benchmark runs with jump flood algorithm
   const BENCHMARK_RUNS: usize = 5;
   let mut total_time = std::time::Duration::ZERO;
   let mut min_time = std::time::Duration::MAX;
   let mut max_time = std::time::Duration::ZERO;
   
   for run in 1..=BENCHMARK_RUNS {
       let run_time = generate_heatmap_timed(&image, algorithm);
       println!("🏃 Run {}: {:?}", run, run_time);
       
       total_time += run_time;
       min_time = min_time.min(run_time);
       max_time = max_time.max(run_time);
   }
   
   let avg_time = total_time / BENCHMARK_RUNS as u32;
   
   // Results summary
   println!("\n📊 Benchmark Results Summary for {}", algorithm);
   println!("================================================");
   println!("🔢 Runs: {}", BENCHMARK_RUNS);
   println!("⚡ Average: {:?}", avg_time);
   println!("🏆 Best:    {:?}", min_time);
   println!("🐌 Worst:   {:?}", max_time);
   println!("📈 Range:   {:?}", max_time - min_time);
   
   // Performance metrics
   let pixels_per_second = (500 * 500) as f64 / avg_time.as_secs_f64();
   println!("🚀 Throughput: {:.0} pixels/second", pixels_per_second);
   println!("💾 Per-pixel time: {:.2} ns", avg_time.as_nanos() as f64 / (500.0 * 500.0));   
}

/// Generate heatmap and return the time taken
fn generate_heatmap_timed(image: &Image, algorithm: &str) -> std::time::Duration {
    let start = Instant::now();
    
    let _heatmap = Heatmap::new(image.clone(), BLACK_PIXEL, algorithm);
    
    start.elapsed()
}

/// Count pixels that match the target color
fn count_target_pixels(image: &Image, target_color: [u8; 4]) -> usize {
    let mut count = 0;
    for row in &image.pixels {
        for &pixel in row {
            if pixel == target_color {
                count += 1;
            }
        }
    }
    count
}