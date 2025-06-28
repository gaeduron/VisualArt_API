# Canvas

These components are going to be used to create a drawing tool that should do the following:
Canvas:
- Have a square canvas 500x500px by default
- The canvas background can be changed with a 500x500px image
- The canvas can be exported as a png (download button)
Tools:
- Pixel brush, 2px wide, with the color #000000 by default
- Brush color can be changed in a palette of 4 pastel colors (black, blue, green, red)
- Clear canvas button
- Undo
- Redo
- Eraser tool, 10px wide by default
- eraser size can be changed between 2 size (8px, 80px)

The goal is to be as simple as possible in feature and in code complexity.

## process:
Let's build this progressively to make it easy to review for the human. he can't review more than 100 lines at a time so let's do things incrementally.

step 1 (completed):
- Have a square canvas 500x500px by default
- Pixel brush, 2px wide, with the color #000000 by default

step 2:
- Undo and Redo buttons with support for shortcuts (ctrl+z and ctrl+maj+z respectively on mac use command)