use image_evaluator::Image;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load the input image
    let input_path = "examples/cat_with_blue_500.png";
    println!("Loading image from: {}", input_path);
    
    let image = Image::load_from_file(input_path)?;
    println!("Image loaded: {}x{}", image.dimensions.0, image.dimensions.1);
    
    // Define different threshold values to test
    let thresholds = vec![0.00001, 0.0001, 0.001, 0.005, 0.01 , 0.05, 0.1, 0.2, 0.5, 0.9];
    const MAIN_COLORS: [[u8; 4]; 2] = [
        // [0, 0, 0, 255], // black
        [0, 0, 255, 255], // blue
        [255, 0, 0, 255], // red
        // [255, 255, 255, 255], // white
        ];
    
    // Create output directory if it doesn't exist
    let output_dir = "examples/color_contrast_output";
    std::fs::create_dir_all(output_dir)?;
    
    // Process with different thresholds
    for &threshold in &thresholds {
        println!("Processing with threshold: {:.3}", threshold);
        
        // Clone the original image for this iteration
        let mut test_image = image.clone();
        
        // Apply color contrast
        test_image.recompute_color_contrast(Some(MAIN_COLORS.to_vec()), Some(threshold));
        
        // Save the result
        let output_path = format!("{}/contrast_threshold_{:.6}.png", output_dir, threshold);
        save_image_as_png(&test_image, &output_path)?;
        
        println!("Saved: {}", output_path);
    }
    
    println!("All images processed! Check the '{}' directory for results.", output_dir);
    Ok(())
}

fn save_image_as_png(image: &Image, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let (width, height) = image.dimensions;
    
    // Create a new image buffer
    let mut img_buffer = image::RgbaImage::new(width as u32, height as u32);
    
    // Copy pixels from our Image to the image buffer
    for y in 0..height {
        for x in 0..width {
            let pixel = image.pixels[y][x];
            img_buffer.put_pixel(
                x as u32, 
                y as u32, 
                image::Rgba([pixel[0], pixel[1], pixel[2], pixel[3]])
            );
        }
    }
    
    // Save the image
    img_buffer.save(path)?;
    Ok(())
} 