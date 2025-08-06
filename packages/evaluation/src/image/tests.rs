use super::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_color_contrast() {
        let mut image = Image::standard_white(Some((10, 10)));
        // add black pixels with fading
        image.set_pixel(0, 0, [56, 52, 56, 255]);
        image.set_pixel(0, 1, [5, 7, 4, 255]);
        image.set_pixel(0, 2, [0, 0, 0, 255]);
        image.set_pixel(0, 3, [0, 0, 0, 255]);
        image.set_pixel(0, 4, [6, 3, 7, 255]);
        image.set_pixel(0, 5, [55, 50, 59, 255]);

        // add blue pixels with fading
        image.set_pixel(1, 0, [200, 200, 255, 255]);
        image.set_pixel(1, 1, [100, 100, 255, 255]);
        image.set_pixel(1, 2, [0, 0, 255, 255]);
        image.set_pixel(1, 3, [0, 0, 255, 255]);
        image.set_pixel(1, 4, [100, 100, 255, 255]);
        image.set_pixel(1, 5, [200, 200, 255, 255]);

        // recompute color contrast
        image.recompute_color_contrast(None, Some(0.25));

        // check if black pixels are mutated
        assert_eq!(image.pixels[0][0], [0, 0, 0, 255]);
        assert_eq!(image.pixels[0][1], [0, 0, 0, 255]);
        assert_eq!(image.pixels[0][2], [0, 0, 0, 255]);
        assert_eq!(image.pixels[0][3], [0, 0, 0, 255]);
        assert_eq!(image.pixels[0][4], [0, 0, 0, 255]);
        assert_eq!(image.pixels[0][5], [0, 0, 0, 255]);
        // check if blue pixels are mutated
        assert_eq!(image.pixels[1][0], [255, 255, 255, 255]);
        assert_eq!(image.pixels[1][1], [0, 0, 255, 255]);
        assert_eq!(image.pixels[1][2], [0, 0, 255, 255]);
        assert_eq!(image.pixels[1][3], [0, 0, 255, 255]);
        assert_eq!(image.pixels[1][4], [0, 0, 255, 255]);
        assert_eq!(image.pixels[1][5], [255, 255, 255, 255]);
    }

    // #[test]
    // fn test_pixel_operations() {
    //     // TODO: Test pixel setting and getting
    // }

    // #[test]
    // fn test_image_statistics() {
    //     // TODO: Test image statistics calculations
    // }
} 