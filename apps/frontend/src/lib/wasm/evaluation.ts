import { WasmObservation } from 'evaluation';

/**
 * Type alias for RGBA color values.
 * values are in the range [0, 255].
 * example: [0, 0, 0, 255] is black.
 */
type RGBA = [number, number, number, number];

/**
 * A 2D array of RGBA pixels [[[R,G,B,A], ...], ...]
 */
export type Image2DArray = RGBA[][];

export type EvaluationStatistics = {
    /**
     * TODO: not sure if the Record actually have strings has key need to print to verify
     */
    pixels_per_color_count: Record<string, number>;
    top5_error_by_color: Record<string, number>;
    error_grid_per_color: Record<string, number[]>;
    total_duration: number;
    pixels_per_second: number;
};

export type EvaluationReport = {
    statistics: EvaluationStatistics;
};


/**
 * This is an adptater to the untyped Wasm Observation class.
 */
export interface IObservation {
    free(): void;
    /**
     * Creates a new observation from JavaScript image data
     * 
     * @param reference_image_data - 2D array of RGBA pixels [[[R,G,B,A], ...], ...]
     * @returns Promise<Observation> - A new observation instance
     * 
     * @example
     * ```typescript
     * const referenceImage: Image2DArray = [
     *   [[255, 255, 255, 255], [0, 0, 0, 255]],     // White, Black
     *   [[0, 0, 0, 255], [255, 255, 255, 255]]      // Black, White
     * ];
     * const observation = new Observation(referenceImage);
     * ```
     */
    new(reference_image_data: Image2DArray): void;
    /**
     * Sets the drawing image from JavaScript data
     * 
     * @param drawing_image_data - 2D array of RGBA pixels [[[R,G,B,A], ...], ...]
     * @returns Promise<void>
     * 
     * @example
     * ```typescript
     * const drawingImage: Image2DArray = [
     *   [[255, 255, 255, 255], [0, 0, 0, 255]],     // White, Black
     *   [[0, 0, 0, 255], [255, 255, 255, 255]]      // Black, White
     * ];
     * observation.set_drawing(drawingImage);
     * ```
     */
    set_drawing(drawing_image_data: Image2DArray): void;
    /**
     * Returns the evaluation report as a JavaScript object
     * 
     * @returns Promise<EvaluationReport> - Object with statistics including:
     * - pixels_per_color_count: Record<string, number>
     * - top5_error_by_color: Record<string, number>
     * - error_grid_per_color: Record<string, number[]>
     * - total_duration?: number
     * - pixels_per_second?: number
     * 
     * @example
     * ```typescript
     * const evaluation: EvaluationReport = observation.get_evaluation();
     * console.log('Error rate:', evaluation.statistics.top5_error_by_color);
     * ```
     */
    get_evaluation(): EvaluationReport;
    /**
     * Returns the total observation duration in milliseconds
     * 
     * @returns number - Duration in milliseconds
     */
    get_duration(): bigint;
    /**
     * Finishes the observation and records the end time
     * 
     * @returns void
     */
    finish_observation(): void;
    /**
     * Returns the observation start time in milliseconds
     * 
     * @returns number - Start time in milliseconds
     */
    get_start_time(): bigint;
    /**
     * Returns the observation end time in milliseconds
     * 
     * @returns number | undefined - End time in milliseconds (if finished)
     */
    get_end_time(): bigint | undefined;
    /**
     * Returns the total number of non-white pixels in the reference image
     * 
     * @returns number - Count of non-white pixels
     */
    get_total_non_white_pixels(): number;
    /**
     * Returns the drawing speed in pixels per second
     * 
     * @returns number - Speed in pixels per second
     */
    get_drawing_speed(): number;
}

/**
 * This is an adptater to the untyped Wasm Observation class.
 */
// export class Observation implements IObservation {
//     private observation: WasmObservation;

//     constructor(referenceImage: Image2DArray) {
//         this.observation = new WasmObservation(referenceImage);
//     }
// }