This is the specs after the first draft that is now in the draft folder.
We are going to rewrite step by step this lib to make it clearer to me as Im learning Rust at the same time.

# 1. What the mental model of this evaluator?

In this evaluator we compare the drawing of the user to a reference image.
to be more specific we compute the distance between the pixel in the reference image and the pixel in the user drawing.
With that we can compute the error rate.

Possible evolutions:

- Line weight penalisation:
We currently only make linear error rate, but we could add more precise penalisation for line weight. (probably not useful as it's already hard to a line at the right place).
We would need to segment each line and compute error for the shape of the lines but it's highly advanced and probably overkill and slow. I would do that in python with a segmentation model probably.

- Color evaluation:
Currently we only make this evaluation for black pixels, but we could extend it to other colors.
If we have a subset of colors in our reference like (black, white,red, blue, green) we could compute the error rate for each color.
this could be useful to support shadows and highlights.
Same algorithm than the black pixel but each color would be a different layer to evaluate separately.
at the end we can put them all together to get the top-5 error grid or have a separate error grid for each color. (making error in shadows is less critical than in lines)

- Advanced color evaluation:
If we start to evaluate a painting there is a few things we can try:
- Luminosity evaluation -> we look at the distance between the luminosity of the pixel in the reference and the pixel in the user drawing.
- color similarity evaluation -> we look at the distance between the color of the pixel in the reference and the pixel in the user drawing.
Luminosity is more important than color similarity.
It would be nice to have an algo here that does not penalize the placement of the color. like if the color is less than 20px away it's ok or some thing. (needs more research)

# 2. What's our base data structure?
All that to say, what's our base data structure?

## the image - reference or the drawing
I would say it's a 2D array of 500x500 pixels with 4 channels (RGBA).
[
    [[u8,u8,u8,u8]]
]

depending on the evaluation we are doing we might need only a subset of this data structure.
For shape and line evaluation:
2D array of booleans.
[
    [true, false, true],
    [false, true, false],
    [true, false, true]
]
the issue with this is that we might need to allocate memory on the heap each time we want to evaluate a shape or a line.
I'd like to try to not use the heap so far.

our data structure is 500x500 pixel for now it might need to go to 1000x1000 or 2000x2000 later.

REFERENCE AND DRAWING MUST HAVE THE SAME SIZE.

This data structure can be updated with new image 2d array.
We can then do a diff between the two images to get the pixels that are different.
on these different pixel we can recompute the heatmap doing only a subset of the computation.

how can we make a diff between two images?
it's basically a xor between the two images.
we just want to get out a list of pixels that are different with their x,y and prevColor + newColor.


## The heatmap - recording the distance from the nearest pixel
Derived from the reference/drawing image.
this is a 2D array of 500x500 with 1 channel (u8).
[
    [u16]
]
For a given pixel of a given color.

With this we can compare the distance between the reference and the drawing.

## The error grid - recording the error rate for each pixel
this is a 2D array of 10x10 with 1 channel (f32). storing the top 5 error rate for each 50x50 pixel block in the grid. the error is a float between 0 and 100.
[
    [f32]
]
For a given pixel of a given color.


# 3. What do we manipulate the object in TS

We manipulate an object named "Observation"

we instanciate it with the reference image and the current time (unix timestamp).
new Observation(reference: Image2DArray, time?: number, config?: Config)

config is an object that contains the following properties:
- colorToEvaluate: [string] (default: ["#00000000"])
- posterization: number (default: 10)

it has mutiple methods.
Time tracking:
- get_duration() -> number // in milliseconds
- get_start_time() -> number // in milliseconds
- get_end_time() -> number // in milliseconds

Life cycle:
- startObservation() -> void // start recording the time
- finishObservation() -> void // stop recording the time
- resetObservation(newReference: Image2DArray, newTime?: number,newConfig?: Config)

Observation updates:
- updateDrawing(newDrawing: Image2DArray) -> void
- updateConfig(newConfig: Config) -> void

Evaluation:
- getEvaluation(options?: EvaluationReportOptions) -> EvaluationReport (readonly)

EvaluationReportOptions:
```ts
{
    colorToEvaluate: 'all' | [string] (default: ["#00000000"])
    reference: {
        includeImage: boolean (default: false)
        includeHeatmap: boolean (default: false)
    }
    drawing: {
        includeImage: boolean (default: false)
        includeHeatmap: boolean (default: false)
    }
    errorGrid: {
        include: boolean (default: false)
        image: {
            include: boolean (default: false)
            colorThresholds: {
                [string]: number
                // string is the #hex color, number is the threshold in error rate,
                // ex: "#220000": 2 -> below 2% of error rate for this color is ok
            }
        }
    }
    statistics: {
        include: boolean (default: true)
    }
}
```

EvaluationReport:
```ts
{
    statistics: {
        totalTime: number // in milliseconds
        totalPixels: number // total pixels in the reference image
        drawingSpeed: number // in pixels per second
        top5Error: number // top 5 largest error in the error grid
        top5ErrorByColor: {
            [string]: number // string is the #hex color, number is the error rate
        }
    },
    reference: {
        image: Image2DArray
        heatmap: Heatmap2DArray
    },
    drawing: {
        image: Image2DArray
        heatmap: Heatmap2DArray
    }
    errorGrid: Image2DArray
}
```

ok, I think this would be enough of a spec for this object interface.

# 4. Object implementation

Internal state:
- reference: Image2DArray // 500x500 with 4 channels (RGBA)
- drawing: Image2DArray // 500x500 with 4 channels (RGBA)
- referenceHeatmap: Heatmap2DArray // 500x500 with 1 channel (u16)
- drawingHeatmap: Heatmap2DArray // 500x500 with 1 channel (u16)
- errorGrid: 2DArray // 10x10 with 1 channel (f32)
- config: Config
- startTime: number
- endTime: number

private methods: ()
<!-- - computeHeatmap(image: Image2DArray, colorToEvaluate: string) -> Heatmap2DArray
- updateHeatmap(image: Image2DArray) -> void
- computeErrorGrid() -> void
- computeStatistics() -> void -->

# 5. implementation roadmap

## 1. Making a simplified observation object
I want to make a minimalist version that I can test.
We are going to only do a subset of the features. (just the time stuff for now)

The goal is to be able to test it in the console for now.

## 2. Initialise the observation object with the reference image
This is done with TDD.
we are going to simply load the image and add the statistics method to the observation object.
This way we can get the number of pixels, duration and drawing speed.

## 4. Wire-up the observation object in the frontend
We are going to start wiring the observation object in the frontend.

We want to start an observation when the reference image is loaded.
we stop the observation when the user trigger an evaluation with TAB.
We are going to need to manage this observation object in the state.

UI:
- a button to finish the observation of the reference image
- on the reference image we display the duration of the observation



## 5. Heatmap module
we create the heatmap module with it's structure and the methods to compute the heatmap.

## 6. Error grid module
we create the error grid module with it's structure and the methods to compute the error grid.


