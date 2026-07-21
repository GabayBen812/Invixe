@echo off
REM Build Invixe release APK (cmd). Forces a short Gradle home.
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "GRADLE_USER_HOME=%USERPROFILE%\.gradle"
set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"
set "NODE_ENV=production"

if not exist "%ANDROID_HOME%\platforms\android-35" (
  echo Android SDK platform 35 missing at %ANDROID_HOME%
  exit /b 1
)

echo ANDROID_HOME=%ANDROID_HOME%
echo GRADLE_USER_HOME=%GRADLE_USER_HOME%
cd /d "%~dp0"

call gradlew.bat --stop >NUL 2>&1
call gradlew.bat assembleRelease --no-daemon
if errorlevel 1 exit /b 1

echo.
echo APK output:
dir /s /b "%~dp0app\build\outputs\apk\release\*.apk"
