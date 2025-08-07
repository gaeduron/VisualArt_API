#!/bin/bash
set -e

# Clean previous builds
rm -rf target/wasm32-unknown-unknown
rm -rf pkg

# Build WASM
cargo build --target wasm32-unknown-unknown --release

# Create pkg directory
mkdir -p pkg

# Generate JavaScript bindings and TypeScript types
wasm-bindgen target/wasm32-unknown-unknown/release/image_evaluator.wasm \
    --out-dir ./pkg \
    --target web \
    --typescript

# Create package.json
cat > pkg/package.json << EOF
{
  "name": "image-evaluator-wasm",
  "version": "0.1.0",
  "description": "WASM package for image evaluation",
  "main": "image_evaluator.js",
  "types": "image_evaluator.d.ts",
  "files": [
    "image_evaluator.js",
    "image_evaluator.d.ts",
    "image_evaluator_bg.wasm"
  ],
  "keywords": ["wasm", "image", "evaluation", "rust"],
  "author": "Your Name",
  "license": "MIT"
}
EOF