// EAS uses the committed ios/ project instead of automatically running prebuild.
const fs = require('node:fs');
if (process.env.EXPO_PUBLIC_META_MEASUREMENT_ENABLED === 'true') {
  const token = process.env.META_CLIENT_TOKEN?.trim();
  if (!token) throw new Error('Missing META_CLIENT_TOKEN');
  if (process.env.EAS_BUILD_PLATFORM !== 'android' && fs.existsSync('ios/invixeapp/Info.plist')) {
    const plist = require('@expo/plist').default.parse(fs.readFileSync('ios/invixeapp/Info.plist', 'utf8'));
    if (plist.FacebookAppID !== '1766622331291748' || plist.FacebookClientToken !== token ||
        !plist.NSUserTrackingUsageDescription || plist.FacebookAutoLogAppEventsEnabled !== false ||
        plist.FacebookAdvertiserIDCollectionEnabled !== false || plist.FacebookAutoInitEnabled !== false) {
      throw new Error('Meta native configuration is stale. Run expo prebuild --platform ios --no-install with the same Meta environment, review and commit the native diff, then rebuild.');
    }
  }
}
