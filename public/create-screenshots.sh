#!/bin/bash

# Install ImageMagick if needed (for creating placeholder screenshots)
# brew install imagemagick

# Create mobile screenshot (standard phone size)
convert -size 1080x1920 xc:"#FF6B35" \
  -gravity center \
  -pointsize 60 -fill white -annotate +0-200 "Itesiwaju" \
  -pointsize 40 -fill white -annotate +0-100 "Community Management" \
  -pointsize 30 -fill white -annotate +0+100 "Mobile View" \
  screenshot-mobile.png

# Create desktop screenshot (wide format)
convert -size 1920x1080 xc:"#FF6B35" \
  -gravity center \
  -pointsize 80 -fill white -annotate +0-150 "Itesiwaju" \
  -pointsize 50 -fill white -annotate +0-50 "Community Management" \
  -pointsize 40 -fill white -annotate +0+100 "Desktop View" \
  screenshot-desktop.png

echo "Screenshots created successfully"
