#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGO="$ROOT/assets/InvixeLogo.png"

if [[ ! -f "$LOGO" ]]; then
  echo "Missing logo at $LOGO" >&2
  exit 1
fi

echo "Using logo: $LOGO"

IOS_APP_ICON="$ROOT/ios/invixeapp/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
cp "$LOGO" "$IOS_APP_ICON"
echo "Updated iOS app icon"

SPLASH_IOS="$ROOT/ios/invixeapp/Images.xcassets/SplashScreenLogo.imageset"
sips -Z 200 "$LOGO" --out "$SPLASH_IOS/image.png" >/dev/null
sips -Z 400 "$LOGO" --out "$SPLASH_IOS/image@2x.png" >/dev/null
sips -Z 600 "$LOGO" --out "$SPLASH_IOS/image@3x.png" >/dev/null
echo "Updated iOS splash logo"

ANDROID_RES="$ROOT/android/app/src/main/res"

generate_icons() {
  local folder="$1"
  local size="$2"
  local name="$3"
  local dir="$ANDROID_RES/$folder"
  mkdir -p "$dir"
  sips -z "$size" "$size" "$LOGO" --out "$dir/$name" >/dev/null
}

# Standard launcher icons
generate_icons mipmap-mdpi 48 ic_launcher.png
generate_icons mipmap-hdpi 72 ic_launcher.png
generate_icons mipmap-xhdpi 96 ic_launcher.png
generate_icons mipmap-xxhdpi 144 ic_launcher.png
generate_icons mipmap-xxxhdpi 192 ic_launcher.png

generate_icons mipmap-mdpi 48 ic_launcher_round.png
generate_icons mipmap-hdpi 72 ic_launcher_round.png
generate_icons mipmap-xhdpi 96 ic_launcher_round.png
generate_icons mipmap-xxhdpi 144 ic_launcher_round.png
generate_icons mipmap-xxxhdpi 192 ic_launcher_round.png

# Adaptive icon foreground (Android 8+)
generate_icons mipmap-mdpi 108 ic_launcher_foreground.png
generate_icons mipmap-hdpi 162 ic_launcher_foreground.png
generate_icons mipmap-xhdpi 216 ic_launcher_foreground.png
generate_icons mipmap-xxhdpi 324 ic_launcher_foreground.png
generate_icons mipmap-xxxhdpi 432 ic_launcher_foreground.png

# Splash screen logo
generate_icons drawable-mdpi 128 splashscreen_logo.png
generate_icons drawable-hdpi 192 splashscreen_logo.png
generate_icons drawable-xhdpi 256 splashscreen_logo.png
generate_icons drawable-xxhdpi 384 splashscreen_logo.png
generate_icons drawable-xxxhdpi 512 splashscreen_logo.png

echo "Updated Android launcher and splash icons"
