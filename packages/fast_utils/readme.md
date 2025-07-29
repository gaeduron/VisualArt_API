# Fast Utils - Rust WASM Library

Fast utils is a library of utility computes in Rust compiled to WebAssembly (WASM).
These utils will be used in React clients via WASM or in the backend via Node.js.

## 🚀 Quick Start

### Prerequisites
1. **Rust** (install via [rustup.rs](https://rustup.rs/))
2. **wasm-pack** (install via `cargo install wasm-pack`)
3. **Node.js** (for build scripts)

### Build WASM
```bash
# Install dependencies
npm install

# Build WASM
npm run build
```

This creates a `pkg/` directory with:
- `fast_utils.wasm` - The compiled WASM binary
- `fast_utils.js` - JavaScript bindings
- `fast_utils.d.ts` - TypeScript definitions

## 📦 Usage in Frontend

### Next.js/React (Bundler Target)
```typescript
// No manual initialization needed with bundler target!
import * as wasm from 'fast-utils';

// Use directly in components
const speed = wasm.compute_drawing_speed(250000, startTime, endTime);
console.log(`Drawing speed: ${speed} pixels/second`);
```

### Vanilla JavaScript (Web Target)
```javascript
import init, { compute_drawing_speed } from './pkg/fast_utils.js';

await init();
const speed = compute_drawing_speed(1000, Date.now() - 1000, Date.now());
console.log(speed); // 1000.0 pixels/second
```

## 🔧 API Reference

### `compute_drawing_speed(pixel_count, start_time, end_time)`

**INTENTION:** Calculate the rate at which pixels are being drawn

**Parameters:**
- `pixel_count` (u16): Number of pixels drawn (e.g., 500x500 = 250000)
- `start_time` (i64): Drawing started at (timestamp in milliseconds)
- `end_time` (i64): Drawing ended at (timestamp in milliseconds, if 0, uses current time)

**Returns:**
- `f64`: Drawing speed in pixels per second

**Example:**
```rust
// 1000 pixels drawn in 2 seconds
compute_drawing_speed(1000, 1000, 3000) // Returns 500.0
```

## 🏗️ Development

### Project Structure
```
fast_utils/
├── src/
│   └── lib.rs          # Main Rust library with WASM bindings
├── Cargo.toml          # Rust dependencies and build config
├── package.json        # Node.js build scripts
└── pkg/               # Generated WASM files (after build)
```

### Development Commands
```bash
# Build WASM
npm run build

# Watch mode for development
npm run build:watch

# Run tests
npm test

# Clean build artifacts
npm run clean
```

## 🔄 Integration with Main Project

### In your Next.js app:
```typescript
import * as wasm from 'fast-utils';

const speed = wasm.compute_drawing_speed(pixelCount, startTime, endTime);
```