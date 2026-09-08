#!/bin/bash
# HSC Ultimate — PRO icon: book + bookmark + "HSC" monogram
# Pure ImageMagick, no SVG dependency, professional education app style
set -e
cd "$(dirname "$0")/.."

# Brand colors
BG1="#3b82f6"      # primary blue
BG2="#1e40af"      # deep blue
ACCENT="#fbbf24"   # gold/yellow (for bookmark, sparkle)
WHITE="white"
SHADOW="rgba(0,0,0,0.15)"

mkdir -p resources/android resources/pwa

# === Master 1024x1024 ===
SIZE=1024

# Step 1: Rounded square gradient background
convert -size ${SIZE}x${SIZE} \
  "gradient:${BG1}-${BG2}" \
  \( -size ${SIZE}x${SIZE} xc:transparent \
     -fill white -draw "roundrectangle 0,0 $((SIZE-1)),$((SIZE-1)) $((SIZE*22/100)),$((SIZE*22/100))" \) \
  -compose CopyOpacity -composite \
  /tmp/icon_bg.png

# Step 2: Open book illustration (centered, white)
# Draw two open book pages with center fold
convert /tmp/icon_bg.png \
  -fill "rgba(255,255,255,0.98)" \
  -stroke "$BG2" -strokewidth 4 \
  -draw "roundrectangle $((SIZE*22/100)),$((SIZE*30/100)) $((SIZE*50/100)),$((SIZE*70/100)) 24,24" \
  -draw "roundrectangle $((SIZE*50/100)),$((SIZE*30/100)) $((SIZE*78/100)),$((SIZE*70/100)) 24,24" \
  -fill "$BG1" \
  -draw "roundrectangle $((SIZE*49/100)),$((SIZE*30/100)) $((SIZE*51/100)),$((SIZE*70/100)) 4,4" \
  /tmp/icon_book.png

# Step 3: Add text lines on book pages
convert /tmp/icon_book.png \
  -fill "rgba(59,130,246,0.7)" -strokewidth 0 \
  -draw "roundrectangle $((SIZE*26/100)),$((SIZE*38/100)) $((SIZE*46/100)),$((SIZE*40/100)) 2,2" \
  -draw "roundrectangle $((SIZE*26/100)),$((SIZE*44/100)) $((SIZE*44/100)),$((SIZE*46/100)) 2,2" \
  -draw "roundrectangle $((SIZE*26/100)),$((SIZE*50/100)) $((SIZE*46/100)),$((SIZE*52/100)) 2,2" \
  -draw "roundrectangle $((SIZE*26/100)),$((SIZE*56/100)) $((SIZE*42/100)),$((SIZE*58/100)) 2,2" \
  -draw "roundrectangle $((SIZE*54/100)),$((SIZE*38/100)) $((SIZE*74/100)),$((SIZE*40/100)) 2,2" \
  -draw "roundrectangle $((SIZE*54/100)),$((SIZE*44/100)) $((SIZE*72/100)),$((SIZE*46/100)) 2,2" \
  -draw "roundrectangle $((SIZE*54/100)),$((SIZE*50/100)) $((SIZE*74/100)),$((SIZE*52/100)) 2,2" \
  -draw "roundrectangle $((SIZE*54/100)),$((SIZE*56/100)) $((SIZE*70/100)),$((SIZE*58/100)) 2,2" \
  /tmp/icon_lines.png

# Step 4: Add gold bookmark (right side of book, hanging down)
convert /tmp/icon_lines.png \
  -fill "$ACCENT" -strokewidth 0 \
  -draw "polygon $((SIZE*64/100)),$((SIZE*30/100)) $((SIZE*72/100)),$((SIZE*30/100)) $((SIZE*72/100)),$((SIZE*78/100)) $((SIZE*68/100)),$((SIZE*72/100)) $((SIZE*64/100)),$((SIZE*78/100))" \
  -fill "rgba(251,191,36,0.4)" \
  -draw "polygon $((SIZE*65/100)),$((SIZE*32/100)) $((SIZE*71/100)),$((SIZE*32/100)) $((SIZE*71/100)),$((SIZE*76/100)) $((SIZE*68/100)),$((SIZE*70/100)) $((SIZE*65/100)),$((SIZE*76/100))" \
  /tmp/icon_bookmark.png

# Step 5: HSC text at top
convert /tmp/icon_bookmark.png \
  -gravity north \
  -font DejaVu-Sans-Bold -pointsize 110 -fill "$WHITE" \
  -annotate +0+$((SIZE*8/100)) "HSC" \
  /tmp/icon_hsc.png

# Step 6: ULTIMATE text at bottom
convert /tmp/icon_hsc.png \
  -gravity south \
  -font DejaVu-Sans -pointsize 38 -fill "rgba(255,255,255,0.95)" \
  -annotate +0+$((SIZE*8/100)) "ULTIMATE" \
  resources/icon-only.png

echo "  ✅ Master 1024×1024 generated"

# === Android standard icons ===
echo ""
echo "=== Android Icons ==="
for entry in "mdpi:48" "hdpi:72" "xhdpi:96" "xxhdpi:144" "xxxhdpi:192"; do
  density="${entry%%:*}"
  size="${entry##*:}"
  convert resources/icon-only.png -resize ${size}x${size} resources/android/${density}.png
done
convert resources/icon-only.png -resize 512x512 resources/android/playstore.png
echo "  ✅ 6 Android densities + playstore"

# === Adaptive icon (Android 8+) ===
echo ""
echo "=== Adaptive Icon ==="
# Background: same gradient (without text/book, so any color works)
convert -size 432x432 \
  "gradient:${BG1}-${BG2}" \
  \( -size 432x432 xc:transparent \
     -fill white -draw "roundrectangle 0,0 431,431 95,95" \) \
  -compose CopyOpacity -composite \
  resources/android/adaptive-background.png

# Foreground: just the book + bookmark (no background, no text)
# 432x432 transparent with content in safe 288x288 center
convert -size 432x432 xc:transparent \
  -fill "rgba(255,255,255,0.98)" \
  -stroke "$BG2" -strokewidth 4 \
  -draw "roundrectangle $((432*22/100)),$((432*30/100)) $((432*50/100)),$((432*70/100)) 12,12" \
  -draw "roundrectangle $((432*50/100)),$((432*30/100)) $((432*78/100)),$((432*70/100)) 12,12" \
  -fill "$BG1" \
  -draw "roundrectangle $((432*49/100)),$((432*30/100)) $((432*51/100)),$((432*70/100)) 2,2" \
  -fill "rgba(59,130,246,0.7)" \
  -draw "roundrectangle $((432*26/100)),$((432*40/100)) $((432*46/100)),$((432*42/100)) 1,1" \
  -draw "roundrectangle $((432*26/100)),$((432*46/100)) $((432*44/100)),$((432*48/100)) 1,1" \
  -draw "roundrectangle $((432*26/100)),$((432*52/100)) $((432*46/100)),$((432*54/100)) 1,1" \
  -draw "roundrectangle $((432*54/100)),$((432*40/100)) $((432*74/100)),$((432*42/100)) 1,1" \
  -draw "roundrectangle $((432*54/100)),$((432*46/100)) $((432*72/100)),$((432*48/100)) 1,1" \
  -draw "roundrectangle $((432*54/100)),$((432*52/100)) $((432*74/100)),$((432*54/100)) 1,1" \
  -fill "$ACCENT" \
  -draw "polygon $((432*64/100)),$((432*30/100)) $((432*72/100)),$((432*30/100)) $((432*72/100)),$((432*78/100)) $((432*68/100)),$((432*72/100)) $((432*64/100)),$((432*78/100))" \
  resources/android/adaptive-foreground.png
echo "  ✅ adaptive-background + foreground (432×432)"

# === PWA icons ===
echo ""
echo "=== PWA Icons ==="
for size in 72 96 128 144 152 192 256 384 512; do
  convert resources/icon-only.png -resize ${size}x${size} resources/pwa/icon-${size}.png
done
echo "  ✅ 9 PWA sizes"

# === Splash screens ===
echo ""
echo "=== Splash Screens ==="
gen_splash() {
  local w=$1 h=$2 outfile=$3
  convert -size ${w}x${h} "gradient:${BG1}-${BG2}" \
    -gravity center \
    -font DejaVu-Sans-Bold -pointsize 120 -fill "$WHITE" -annotate +0-50 "HSC" \
    -font DejaVu-Sans -pointsize 36 -fill "rgba(255,255,255,0.9)" -annotate +0+50 "ULTIMATE" \
    "$outfile"
}
gen_splash 320 480 resources/android-port-mdpi.png
gen_splash 480 800 resources/android-port-hdpi.png
gen_splash 720 1280 resources/android-port-xhdpi.png
gen_splash 960 1600 resources/android-port-xxhdpi.png
gen_splash 1280 1920 resources/android-port-xxxhdpi.png
gen_splash 1280 720 resources/android-land-xxhdpi.png
gen_splash 1125 2436 resources/ios-iphone-x.png
gen_splash 1242 2208 resources/ios-iphone-8-plus.png
gen_splash 2480 1200 resources/windows.png
echo "  ✅ 9 splash screens"

echo ""
echo "============================================"
ls -lh resources/android/playstore.png resources/android/adaptive-foreground.png
echo "============================================"
