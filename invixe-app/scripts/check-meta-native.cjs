// EAS uses committed native projects instead of automatically running prebuild.
const fs = require('node:fs');
if (process.env.EXPO_PUBLIC_META_MEASUREMENT_ENABLED === 'true') {
  const token = process.env.META_CLIENT_TOKEN?.trim();
  if (!token) throw new Error('Missing META_CLIENT_TOKEN');
  if (process.env.EAS_BUILD_PLATFORM !== 'ios' && fs.existsSync('android/app/src/main/AndroidManifest.xml')) {
    const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
    const strings = fs.readFileSync('android/app/src/main/res/values/strings.xml', 'utf8');
    const xml = require('xml2js');
    let resources, application;
    xml.parseString(strings, (error, data) => { if (error) throw error; resources = data.resources.string; });
    xml.parseString(manifest, (error, data) => { if (error) throw error; application = data.manifest.application[0]; });
    const values = Object.fromEntries(resources.map(entry => [entry.$.name, entry._]));
    const metadata = Object.fromEntries((application['meta-data'] || []).map(entry => [entry.$['android:name'], entry.$['android:value']]));
    if (values.facebook_app_id !== '1766622331291748' || values.facebook_client_token !== token ||
        metadata['com.facebook.sdk.ApplicationId'] !== '@string/facebook_app_id' ||
        metadata['com.facebook.sdk.ClientToken'] !== '@string/facebook_client_token' ||
        ['AutoInitEnabled', 'AutoLogAppEventsEnabled', 'AdvertiserIDCollectionEnabled'].some(key => metadata[`com.facebook.sdk.${key}`] !== 'false')) {
      throw new Error('Meta Android configuration is stale. Run expo prebuild --platform android --no-install with the same Meta environment, review and commit the native diff, then rebuild.');
    }
  }
  if (process.env.EAS_BUILD_PLATFORM !== 'android'  && fs.existsSync('ios/invixeapp/Info.plist')) {
    const plist = require('@expo/plist').default.parse(fs.readFileSync('ios/invixeapp/Info.plist', 'utf8'));
    if (plist.FacebookAppID !== '1766622331291748' || plist.FacebookClientToken !== token ||
        !plist.NSUserTrackingUsageDescription || plist.FacebookAutoLogAppEventsEnabled !== false ||
        plist.FacebookAdvertiserIDCollectionEnabled !== false || plist.FacebookAutoInitEnabled !== false) {
      throw new Error('Meta native configuration is stale. Run expo prebuild --platform ios --no-install with the same Meta environment, review and commit the native diff, then rebuild.');
    }
  }
}
