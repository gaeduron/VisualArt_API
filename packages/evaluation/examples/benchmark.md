🚀 JFA Benchmark - 500x500 Image
================================
📁 Loading image fixture...
✅ Image loaded in 111.197375ms
📏 Image dimensions: (495, 495)
🎯 Target pixels (black): 1985

🔥 Running heatmap generation benchmark...
🌡️  Warm-up run...
🏃 Run 1: 47.981042ms
🏃 Run 2: 48.667875ms
🏃 Run 3: 48.555791ms
🏃 Run 4: 48.709291ms
🏃 Run 5: 49.145542ms

📊 Benchmark Results Summary for flood_fill
================================================
🔢 Runs: 5
⚡ Average: 48.611908ms
🏆 Best:    47.981042ms
🐌 Worst:   49.145542ms
📈 Range:   1.1645ms
🚀 Throughput: 5142773 pixels/second
💾 Per-pixel time: 194.45 ns
🌡️  Warm-up run...
🏃 Run 1: 960.073334ms
🏃 Run 2: 960.74675ms
🏃 Run 3: 1.004990167s
🏃 Run 4: 954.247375ms
🏃 Run 5: 970.330833ms

📊 Benchmark Results Summary for jump_flood
================================================
🔢 Runs: 5
⚡ Average: 970.077691ms
🏆 Best:    954.247375ms
🐌 Worst:   1.004990167s
📈 Range:   50.742792ms
🚀 Throughput: 257711 pixels/second
💾 Per-pixel time: 3880.31 ns

----

📊 Performance Comparison

🔥 Flood Fill (BFS-based)
Average: 48.6ms
Throughput: 5.14M pixels/second
Per-pixel: 194ns

🌊 Jump Flood Algorithm
Average: 970ms
Throughput: 258K pixels/second
Per-pixel: 3,880ns

🤔 Why is JFA Slower Here?

This makes sense when we analyze the specific characteristics of your workload:

1. Sparse Target Distribution
Only 1,985 black pixels out of 245,025 total (0.8%)
JFA's Wikipedia article notes it excels with dense seed distributions
For sparse targets, the BFS flood fill is more efficient

2. Image Size vs Algorithm Complexity
495×495 image isn't large enough to showcase JFA's O(n log n) advantage
JFA has higher constant factors due to multiple passes
BFS flood fill is O(n²) but with very low constants for this size

3. Implementation Overhead
JFA does 10 passes with seed map copying each time
BFS does 1 pass with direct distance assignment
Memory allocation overhead in JFA's multiple passes