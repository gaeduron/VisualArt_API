use image_evaluator::{ImageEvaluator, EvaluationResult, EvaluationError};
use serde_json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: {} <image_path> [--transparent]", args[0]);
        eprintln!("  image_path: Path to the image file to evaluate");
        eprintln!("  --transparent: Use transparent background (default: white background)");
        std::process::exit(1);
    }
    
    let image_path = &args[1];
    let bg_transparent = args.len() > 2 && args[2] == "--transparent";
    
    let evaluator = ImageEvaluator::new(bg_transparent);
    
    match evaluator.evaluate_image(image_path) {
        Ok(result) => {
            println!("{}", result.evaluation_text);
            
            // Optionally output JSON for programmatic use
            if let Ok(json) = serde_json::to_string_pretty(&result.metrics) {
                println!("\nDetailed metrics (JSON):");
                println!("{}", json);
            }
        }
        Err(e) => {
            eprintln!("Error evaluating image: {}", e);
            std::process::exit(1);
        }
    }
    
    Ok(())
} 