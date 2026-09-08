#!/bin/bash
# HSC Ultimate — DESIGN VARIANTS
# Generates: animated splash frames, light/dark variants, monogram, brand badge
set -e
cd "$(dirname "$0")/.."

# Brand colors
BG1_LIGHT="#60a5fa"       # lighter blue
BG2_LIGHT="#3b82f6"       # primary blue
BG1_DARK="#1e40af"        # deep blue
BG2_DARK="#0c1e4f"        # navy

ACCENT="#fbbf24"          # gold
ACCENT2="#f59e0b"         # darker gold
WHITE="white"
DARK="rgba(0,0,0,0.9)"

mkdir -p resources/animated resources/variants public/store

echo "============================================"
echo "  HSC ULTIMATE — DESIGN VARIANTS"
echo "============================================"

# ============================================
# 1. Monogram (compact - just HSC letters in a square)
# ============================================
echo ""
echo "=== 1. Monogram (compact) ==="
for size in 256 512 1024; do
  convert -size ${size}x${size} \
    "gradient:#3b82f6-#1e40af" \
    \( -size ${size}x${size} xc:transparent \
       -fill white -draw "roundrectangle 0,0 $((size-1)),$((size-1)) $((size*22/100)),$((size*22/100))" \) \
    -compose CopyOpacity -composite \
    -gravity center \
    -font DejaVu-Sans-Bold -pointsize $((size*45/100)) -fill white -annotate +0+0 "H" \
    resources/variants/monogram-${size}.png
  echo "  ✅ monogram-${size}.png"
done

# ============================================
# 2. Light mode variant
# ============================================
echo ""
echo "=== 2. Light Mode Variant ==="
convert -size 1024x1024 \
  "gradient:${BG1_LIGHT}-${BG2_LIGHT}" \
  \( -size 1024x1024 xc:transparent \
     -fill white -draw "roundrectangle 0,0 1023,1023 225,225" \) \
  -compose CopyOpacity -composite \
  -fill "rgba(255,255,255,0.98)" \
  -stroke "#1e40af" -strokewidth 4 \
  -draw "roundrectangle 225,307 510,717 24,24" \
  -draw "roundrectangle 510,307 795,717 24,24" \
  -fill "#1e40af" \
  -draw "roundrectangle 502,307 510,717 4,4" \
  -fill "rgba(30,64,175,0.7)" \
  -draw "roundrectangle 266,389 462,409 2,2" \
  -draw "roundrectangle 266,451 440,471 2,2" \
  -draw "roundrectangle 266,513 462,533 2,2" \
  -draw "roundrectangle 266,575 420,595 2,2" \
  -draw "roundrectangle 550,389 750,409 2,2" \
  -draw "roundrectangle 550,451 728,471 2,2" \
  -draw "roundrectangle 550,513 750,533 2,2" \
  -draw "roundrectangle 550,575 700,595 2,2" \
  -fill "$ACCENT" \
  -draw "polygon 655,307 737,307 737,798 696,747 655,798" \
  -gravity north \
  -font DejaVu-Sans-Bold -pointsize 110 -fill white -annotate +0+82 "HSC" \
  -gravity south \
  -font DejaVu-Sans -pointsize 38 -fill "rgba(255,255,255,0.95)" -annotate +0+82 "ULTIMATE" \
  resources/variants/light-mode.png
echo "  ✅ light-mode.png"

# ============================================
# 3. Dark mode variant
# ============================================
echo ""
echo "=== 3. Dark Mode Variant ==="
convert -size 1024x1024 \
  "gradient:${BG1_DARK}-${BG2_DARK}" \
  \( -size 1024x1024 xc:transparent \
     -fill white -draw "roundrectangle 0,0 1023,1023 225,225" \) \
  -compose CopyOpacity -composite \
  -fill "rgba(255,255,255,0.98)" \
  -stroke "$BG1_DARK" -strokewidth 4 \
  -draw "roundrectangle 225,307 510,717 24,24" \
  -draw "roundrectangle 510,307 795,717 24,24" \
  -fill "$BG1_DARK" \
  -draw "roundrectangle 502,307 510,717 4,4" \
  -fill "rgba(255,255,255,0.5)" \
  -draw "roundrectangle 266,389 462,409 2,2" \
  -draw "roundrectangle 266,451 440,471 2,2" \
  -draw "roundrectangle 266,513 462,533 2,2" \
  -draw "roundrectangle 266,575 420,595 2,2" \
  -draw "roundrectangle 550,389 750,409 2,2" \
  -draw "roundrectangle 550,451 728,471 2,2" \
  -draw "roundrectangle 550,513 750,533 2,2" \
  -draw "roundrectangle 550,575 700,595 2,2" \
  -fill "$ACCENT" \
  -draw "polygon 655,307 737,307 737,798 696,747 655,798" \
  -gravity north \
  -font DejaVu-Sans-Bold -pointsize 110 -fill white -annotate +0+82 "HSC" \
  -gravity south \
  -font DejaVu-Sans -pointsize 38 -fill "rgba(255,255,255,0.95)" -annotate +0+82 "ULTIMATE" \
  resources/variants/dark-mode.png
echo "  ✅ dark-mode.png"

# ============================================
# 4. Brand badge (for marketing, smaller)
# ============================================
echo ""
echo "=== 4. Brand Badge ==="
convert -size 800x800 xc:transparent \
  -fill "gradient:#3b82f6-#1e40af" \
  -draw "circle 400,400 400,40" \
  -fill "rgba(255,255,255,0.95)" \
  -draw "circle 400,400 400,100" \
  -fill "gradient:#3b82f6-#1e40af" \
  -draw "circle 400,400 400,180" \
  -gravity center \
  -font DejaVu-Sans-Bold -pointsize 130 -fill white -annotate +0+0 "HSC" \
  resources/variants/badge-circle.png
echo "  ✅ badge-circle.png"

# Star badge
convert -size 800x800 xc:transparent \
  -fill "gradient:#fbbf24-#f59e0b" \
  -draw "polygon 400,80 460,300 700,300 510,440 580,680 400,560 220,680 290,440 100,300 340,300" \
  -gravity center \
  -font DejaVu-Sans-Bold -pointsize 110 -fill "#1e40af" -annotate +0+0 "HSC" \
  resources/variants/badge-star.png
echo "  ✅ badge-star.png"

# Shield badge
convert -size 800x800 xc:transparent \
  -fill "gradient:#3b82f6-#1e40af" \
  -draw "path 'M 400,80 L 700,180 L 700,440 Q 700,640 400,720 Q 100,640 100,440 L 100,180 Z'" \
  -fill "rgba(255,255,255,0.95)" \
  -stroke "#3b82f6" -strokewidth 8 \
  -draw "roundrectangle 250,300 550,500 20,20" \
  -gravity center \
  -font DejaVu-Sans-Bold -pointsize 100 -fill "#1e40af" -annotate +0+0 "HSC" \
  resources/variants/badge-shield.png
echo "  ✅ badge-shield.png"

# ============================================
# 5. Animated splash frames (8 frames for Lottie/JSON)
# ============================================
echo ""
echo "=== 5. Animated Splash Frames ==="
for i in 0 1 2 3 4 5 6 7; do
  SIZE=512
  # Animation: book opens, bookmark drops, text appears
  # Frame 0-1: empty gradient (book loading)
  # Frame 2-3: book pages appear
  # Frame 4-5: bookmark drops
  # Frame 6-7: HSC text appears

  case $i in
    0|1)
      # Empty state
      convert -size ${SIZE}x${SIZE} \
        "gradient:#3b82f6-#1e40af" \
        \( -size ${SIZE}x${SIZE} xc:transparent \
           -fill white -draw "roundrectangle 0,0 $((SIZE-1)),$((SIZE-1)) $((SIZE*22/100)),$((SIZE*22/100))" \) \
        -compose CopyOpacity -composite \
        resources/animated/frame-${i}.png
      ;;
    2|3)
      # Book appears
      convert -size ${SIZE}x${SIZE} \
        "gradient:#3b82f6-#1e40af" \
        \( -size ${SIZE}x${SIZE} xc:transparent \
           -fill white -draw "roundrectangle 0,0 $((SIZE-1)),$((SIZE-1)) $((SIZE*22/100)),$((SIZE*22/100))" \) \
        -compose CopyOpacity -composite \
        -fill "rgba(255,255,255,0.95)" \
        -draw "roundrectangle $((SIZE*22/100)),$((SIZE*30/100)) $((SIZE*50/100)),$((SIZE*70/100)) 12,12" \
        -draw "roundrectangle $((SIZE*50/100)),$((SIZE*30/100)) $((SIZE*78/100)),$((SIZE*70/100)) 12,12" \
        resources/animated/frame-${i}.png
      ;;
    4|5)
      # Bookmark appears
      convert -size ${SIZE}x${SIZE} \
        "gradient:#3b82f6-#1e40af" \
        \( -size ${SIZE}x${SIZE} xc:transparent \
           -fill white -draw "roundrectangle 0,0 $((SIZE-1)),$((SIZE-1)) $((SIZE*22/100)),$((SIZE*22/100))" \) \
        -compose CopyOpacity -composite \
        -fill "rgba(255,255,255,0.95)" \
        -draw "roundrectangle $((SIZE*22/100)),$((SIZE*30/100)) $((SIZE*50/100)),$((SIZE*70/100)) 12,12" \
        -draw "roundrectangle $((SIZE*50/100)),$((SIZE*30/100)) $((SIZE*78/100)),$((SIZE*70/100)) 12,12" \
        -fill "$ACCENT" \
        -draw "polygon $((SIZE*64/100)),$((SIZE*30/100)) $((SIZE*72/100)),$((SIZE*30/100)) $((SIZE*72/100)),$((SIZE*78/100)) $((SIZE*68/100)),$((SIZE*72/100)) $((SIZE*64/100)),$((SIZE*78/100))" \
        resources/animated/frame-${i}.png
      ;;
    6|7)
      # Text appears
      convert -size ${SIZE}x${SIZE} \
        "gradient:#3b82f6-#1e40af" \
        \( -size ${SIZE}x${SIZE} xc:transparent \
           -fill white -draw "roundrectangle 0,0 $((SIZE-1)),$((SIZE-1)) $((SIZE*22/100)),$((SIZE*22/100))" \) \
        -compose CopyOpacity -composite \
        -fill "rgba(255,255,255,0.95)" \
        -draw "roundrectangle $((SIZE*22/100)),$((SIZE*30/100)) $((SIZE*50/100)),$((SIZE*70/100)) 12,12" \
        -draw "roundrectangle $((SIZE*50/100)),$((SIZE*30/100)) $((SIZE*78/100)),$((SIZE*70/100)) 12,12" \
        -fill "$ACCENT" \
        -draw "polygon $((SIZE*64/100)),$((SIZE*30/100)) $((SIZE*72/100)),$((SIZE*30/100)) $((SIZE*72/100)),$((SIZE*78/100)) $((SIZE*68/100)),$((SIZE*72/100)) $((SIZE*64/100)),$((SIZE*78/100))" \
        -gravity north \
        -font DejaVu-Sans-Bold -pointsize 60 -fill white -annotate +0+50 "HSC" \
        -gravity south \
        -font DejaVu-Sans -pointsize 22 -fill "rgba(255,255,255,0.95)" -annotate +0+50 "ULTIMATE" \
        resources/animated/frame-${i}.png
      ;;
  esac
  echo "  ✅ frame-${i}.png"
done

# ============================================
# 6. Combine animated frames into GIF
# ============================================
echo ""
echo "=== 6. Animated GIF ==="
convert -delay 100 -loop 0 resources/animated/frame-*.png resources/animated/splash.gif
echo "  ✅ splash.gif"
ls -lh resources/animated/splash.gif

# ============================================
# 7. App Store screenshots background
# ============================================
echo ""
echo "=== 7. Screenshot Templates ==="
# Phone mockup background (just gradient — for adding device frames later)
convert -size 1080x1920 "gradient:#1e40af-#3b82f6" \
  -gravity center \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white -annotate +0+0 "HSC ULTIMATE" \
  resources/variants/screenshot-bg.png
echo "  ✅ screenshot-bg.png (1080×1920)"

# Tablet landscape
convert -size 1920x1200 "gradient:#1e40af-#3b82f6" \
  -gravity center \
  -font DejaVu-Sans-Bold -pointsize 100 -fill white -annotate +0+0 "HSC ULTIMATE" \
  resources/variants/screenshot-bg-tablet.png
echo "  ✅ screenshot-bg-tablet.png (1920×1200)"

# ============================================
# 8. Favicon variants
# ============================================
echo ""
echo "=== 8. Favicon Variants ==="
for size in 16 32 48 64; do
  convert resources/variants/monogram-256.png -resize ${size}x${size} resources/variants/favicon-${size}.png
  echo "  ✅ favicon-${size}.png"
done

# ICO bundle (for browser tabs)
convert resources/variants/favicon-16.png resources/variants/favicon-32.png resources/variants/favicon-48.png resources/variants/favicon.ico
echo "  ✅ favicon.ico (multi-resolution)"

# ============================================
# Copy to public/
# ============================================
echo ""
echo "=== Copy to public/ ==="
cp resources/variants/monogram-256.png public/favicon.png
cp resources/variants/light-mode.png public/store/logo-light.png
cp resources/variants/dark-mode.png public/store/logo-dark.png
cp resources/variants/badge-circle.png public/store/badge-circle.png
cp resources/variants/badge-star.png public/store/badge-star.png
cp resources/variants/badge-shield.png public/store/badge-shield.png
cp resources/animated/splash.gif public/store/splash.gif
cp resources/variants/screenshot-bg.png public/store/screenshot-bg.png
cp resources/variants/screenshot-bg-tablet.png public/store/screenshot-bg-tablet.png
cp resources/variants/favicon.ico public/favicon.ico
echo "  ✅ Copied to public/ and public/store/"

echo ""
echo "============================================"
echo "  ✅ ALL DESIGN VARIANTS GENERATED"
echo "============================================"
echo ""
echo "Variants folder:"
ls resources/variants/
echo ""
echo "Animated frames:"
ls resources/animated/