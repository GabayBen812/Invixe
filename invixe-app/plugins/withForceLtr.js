const {
  withAndroidManifest,
  withMainActivity,
  withDangerousMod,
} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Force LTR layout so the app is never mirrored on RTL (e.g. Hebrew) devices.
 * 1. Set android:supportsRtl="false" in manifest
 * 2. In MainActivity onCreate: window.decorView.layoutDirection = LAYOUT_DIRECTION_LTR
 * 3. In styles.xml AppTheme: android:layoutDirection="ltr"
 */
function withForceLtr(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];
    if (application?.$) {
      application.$['android:supportsRtl'] = 'false';
    }
    return config;
  });

  config = withMainActivity(config, (config) => {
    let content = config.modResults.contents;
    if (content.includes('LAYOUT_DIRECTION_LTR')) return config;
    content = content.replace(
      /super\.onCreate\(null\)\s*\n(\s*)\}/,
      `super.onCreate(null)\n    // Force LTR: ignore system RTL (e.g. Hebrew device)\n    window.decorView.layoutDirection = android.view.View.LAYOUT_DIRECTION_LTR\n$1}`
    );
    config.modResults.contents = content;
    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const stylesPath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/values/styles.xml'
      );
      if (!fs.existsSync(stylesPath)) return config;
      let styles = fs.readFileSync(stylesPath, 'utf8');
      if (styles.includes('android:layoutDirection')) return config;
      styles = styles.replace(
        /(<style name="AppTheme"[^>]*>)\s*\n(\s*<item)/,
        `$1\n    <item name="android:layoutDirection">ltr</item>\n$2`
      );
      fs.writeFileSync(stylesPath, styles);
      return config;
    },
  ]);

  return config;
}

module.exports = withForceLtr;
