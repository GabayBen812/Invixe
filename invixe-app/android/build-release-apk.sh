#!/usr/bin/env bash
# Build Invixe release APK from Git Bash.
# Cursor terminals inject a long GRADLE_USER_HOME under cursor-sandbox-cache
# which breaks Windows MAX_PATH (260) during CMake/ninja.

set -euo pipefail
cd "$(dirname "$0")"

export ANDROID_HOME="${ANDROID_HOME:-$LOCALAPPDATA/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

# Always use a short Gradle home — never Cursor sandbox cache.
if [[ "${GRADLE_USER_HOME:-}" == *"cursor-sandbox-cache"* ]] || [[ -z "${GRADLE_USER_HOME:-}" ]]; then
  export GRADLE_USER_HOME="$HOME/.gradle"
fi

export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export NODE_ENV="${NODE_ENV:-production}"

echo "ANDROID_HOME=$ANDROID_HOME"
echo "GRADLE_USER_HOME=$GRADLE_USER_HOME"

# Stop daemons that may still be bound to the sandbox cache path.
./gradlew.bat --stop >/dev/null 2>&1 || true

./gradlew.bat assembleRelease --no-daemon "$@"

echo
echo "APK output:"
find app/build/outputs/apk/release -name "*.apk" 2>/dev/null || true
