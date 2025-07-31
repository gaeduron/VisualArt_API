//! Type definitions for the evaluation system

/// Type alias for RGBA color values
pub type RGBA = [u8; 4]; // [R, G, B, A]

/// Type alias for image dimensions
pub type ImageDimensions = (usize, usize); // (width, height)

/// Type alias for pixel coordinates
pub type PixelCoord = (usize, usize); // (x, y)

/// Type alias for 2D image array (height x width x RGBA channels)
/// 
/// This represents an image as a 2D vector of RGBA pixels:
/// - First dimension: height (rows)
/// - Second dimension: width (columns) 
/// - Each pixel is an RGBA tuple [R, G, B, A]
pub type Image2DArray = Vec<Vec<RGBA>>; 