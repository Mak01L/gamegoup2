#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy static files
cp -r public/* dist/

echo "Build completed successfully"