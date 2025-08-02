use super::*;
use crate::image::Image;

#[test]
fn test_manhattan_distance_flood_fill_with_multiple_targets() {
    let mut test_image = Image::standard_white(Some((5, 5)));
    
    test_image.set_pixel(1, 1, [0, 0, 0, 255]);
    test_image.set_pixel(3, 3, [0, 0, 0, 255]);
    
    // Create heatmap from the test image
    let heatmap = Heatmap::new(test_image, [0, 0, 0, 255]);
    // Heatmap:
    // 2 1 2 3 4
    // 1 0 1 2 3
    // 2 1 2 1 2
    // 3 2 1 0 1
    // 4 3 2 1 2

    // Verify target pixels have distance 0
    assert_eq!(heatmap.matrix[1][1], 0, "Target pixel (1,1) should have distance 0");
    assert_eq!(heatmap.matrix[3][3], 0, "Target pixel (3,3) should have distance 0");
    
    // Verify some key distances (Manhattan distance = |x1-x2| + |y1-y2|)
    // Pixel (0,0): distance to (1,1) = |0-1| + |0-1| = 2
    assert_eq!(heatmap.matrix[0][0], 2, "Pixel (0,0) should have distance 2 to nearest target");
    
    // Pixel (0,1): distance to (1,1) = |0-1| + |1-1| = 1
    assert_eq!(heatmap.matrix[0][1], 1, "Pixel (0,1) should have distance 1 to nearest target");
    
    // Pixel (1,0): distance to (1,1) = |1-1| + |0-1| = 1
    assert_eq!(heatmap.matrix[1][0], 1, "Pixel (1,0) should have distance 1 to nearest target");
    
    // Pixel (2,2): distance to (1,1) = |2-1| + |2-1| = 2, distance to (3,3) = |2-3| + |2-3| = 2
    // So minimum distance is 2
    assert_eq!(heatmap.matrix[2][2], 2, "Pixel (2,2) should have distance 2 to nearest target");

    // Pixel (2,4): distance to (1,1) = |2-1| + |4-1| = 4, distance to (3,3) = |2-3| + |4-3| = 2
    // So minimum distance is 2
    // Important to test to see if it updates the value if it's already > 0 and a shorter path is found.
    assert_eq!(heatmap.matrix[2][4], 2, "Pixel (2,4) should have distance 2 to nearest target");
    
    // Pixel (4,4): distance to (3,3) = |4-3| + |4-3| = 2
    assert_eq!(heatmap.matrix[4][4], 2, "Pixel (4,4) should have distance 2 to nearest target");
    
    // Verify no pixels have -1 (all should be filled)
    for y in 0..5 {
        for x in 0..5 {
            assert_ne!(heatmap.matrix[y][x], -1, "Pixel ({},{}) should not have distance -1", x, y);
        }
    }
    
    // Verify zero points are correctly tracked
    assert_eq!(heatmap.zero_points_coordinates.len(), 2, "Should have 2 target points");
    assert!(heatmap.zero_points_coordinates.contains(&(1, 1)), "Should contain target (1,1)");
    assert!(heatmap.zero_points_coordinates.contains(&(3, 3)), "Should contain target (3,3)");
    
    // Verify dimensions are correct
    assert_eq!(heatmap.dimensions, (5, 5), "Heatmap should have correct dimensions");
}

#[test]
fn test_single_target_flood_fill() {
    // Create a 3x3 test image with one target pixel at center
    let mut test_image = Image::standard_white(Some((3, 3)));
    test_image.set_pixel(1, 1, [255, 0, 0, 255]); // Red target at center (1,1)
    
    let heatmap = Heatmap::new(test_image, [255, 0, 0, 255]);
    
    // Expected distances from center (1,1):
    // (0,0)=2, (0,1)=1, (0,2)=2
    // (1,0)=1, (1,1)=0, (1,2)=1  
    // (2,0)=2, (2,1)=1, (2,2)=2
    
    assert_eq!(heatmap.matrix[1][1], 0, "Center target should be distance 0");
    assert_eq!(heatmap.matrix[0][1], 1, "Adjacent pixels should be distance 1");
    assert_eq!(heatmap.matrix[1][0], 1, "Adjacent pixels should be distance 1");
    assert_eq!(heatmap.matrix[1][2], 1, "Adjacent pixels should be distance 1");
    assert_eq!(heatmap.matrix[2][1], 1, "Adjacent pixels should be distance 1");
    assert_eq!(heatmap.matrix[0][0], 2, "Corner pixels should be distance 2");
    assert_eq!(heatmap.matrix[0][2], 2, "Corner pixels should be distance 2");
    assert_eq!(heatmap.matrix[2][0], 2, "Corner pixels should be distance 2");
    assert_eq!(heatmap.matrix[2][2], 2, "Corner pixels should be distance 2");
}

#[test]
fn test_edge_target_flood_fill() {
    // Create a 4x4 test image with target at edge
    let mut test_image = Image::standard_white(Some((4, 4)));
    test_image.set_pixel(0, 0, [0, 255, 0, 255]); // Green target at corner (0,0)
    
    let heatmap = Heatmap::new(test_image, [0, 255, 0, 255]);
    // Heatmap:
    // 0 1 2 3
    // 1 2 3 4
    // 2 3 4 5
    // 3 4 5 6
    
    // Verify target at corner
    assert_eq!(heatmap.matrix[0][0], 0, "Corner target should be distance 0");
    
    // Verify distances increase correctly
    assert_eq!(heatmap.matrix[0][1], 1, "Should be distance 1");
    assert_eq!(heatmap.matrix[1][0], 1, "Should be distance 1");
    assert_eq!(heatmap.matrix[1][1], 2, "Should be distance 2");
    assert_eq!(heatmap.matrix[3][3], 6, "Opposite corner should be distance 6");
    
    // Verify only one target point
    assert_eq!(heatmap.zero_points_coordinates.len(), 1, "Should have 1 target point");
    assert!(heatmap.zero_points_coordinates.contains(&(0, 0)), "Should contain target (0,0)");
}