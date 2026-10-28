const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/services/analytics/meta.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function fixture({ enabled = true, os = 'android', permission = 'granted', consent = null, expoGo = false, manifestMissing = false } = {}) {
  const events = [], calls = [];
  let stored = consent;
  const sdk = { Settings: new Proxy({}, { get: (_, name) => (...args) => calls.push([name, ...args]) }),
    AppEventsLogger: { logEvent: (...args) => events.push(args) } };
  const mocks = {
    '@react-native-async-storage/async-storage': { default: { getItem: async () => stored, setItem: async (_, value) => { stored = value; } } },
    'expo-constants': { default: { expoConfig: manifestMissing ? null : { extra: { metaMeasurementEnabled: enabled } }, executionEnvironment: expoGo ? 'storeClient' : 'standalone' }, ExecutionEnvironment: { StoreClient: 'storeClient' } },
    'react-native': { Platform: { OS: os } },
    'expo-tracking-transparency': { getTrackingPermissionsAsync: async () => ({ status: permission }), requestTrackingPermissionsAsync: async () => ({ status: permission }) },
    'react-native-fbsdk-next': sdk,
  };
  const context = { exports: {}, __DEV__: false, process: { env: { EXPO_PUBLIC_META_MEASUREMENT_ENABLED: enabled ? "true" : "false" } }, require: name => { assert.ok(mocks[name], name); return mocks[name]; } };
  vm.runInNewContext(source, context);
  return { api: context.exports, events, calls, revokeATT: () => { permission = 'denied'; } };
}
const drain = () => new Promise(resolve => setImmediate(resolve));
test('disabled build and Expo Go never initialize or log', async () => {
  for (const settings of [{ enabled: false }, { expoGo: true }, { os: 'web' }]) {
    const f = fixture(settings); await f.api.setMeasurementConsent(true);
    f.api.trackRegistrationCompleted(); await drain(); assert.equal(f.calls.length, 0); assert.equal(f.events.length, 0);
  }
});
test('unknown/denied consent drops events without replay', async () => {
  const f = fixture(); await f.api.refreshMeasurementConsent(); f.api.trackLessonCompleted();
  await f.api.setMeasurementConsent(false); f.api.trackRegistrationCompleted();
  await drain(); assert.equal(f.calls.length, 0); assert.equal(f.events.length, 0);
  await f.api.setMeasurementConsent(true); await drain(); assert.equal(f.events.length, 0);
});
test('approved Android sends only allowlisted events without personal parameters', async () => {
  const f = fixture(); await f.api.setMeasurementConsent(true);
  f.api.trackRegistrationCompleted(); f.api.trackLessonCompleted(); await drain();
  assert.equal(JSON.stringify(f.events), JSON.stringify([['fb_mobile_complete_registration'], ['invixe_lesson_completed']]));
});
test('revoking consent blocks subsequent events and disables native auto logging', async () => {
  const f = fixture(); await f.api.setMeasurementConsent(true);
  const revocation = f.api.setMeasurementConsent(false); f.api.trackLessonCompleted(); await revocation;
  assert.equal(f.events.length, 0); assert.ok(f.calls.some(([name, value]) => name === 'setAutoLogAppEventsEnabled' && value === false));
});
test('iOS ATT denied blocks initialization even with app consent', async () => {
  const f = fixture({ os: 'ios', permission: 'denied' }); await f.api.setMeasurementConsent(true);
  f.api.trackLessonCompleted(); await drain(); assert.equal(f.calls.length, 0); assert.equal(f.events.length, 0);
});
test('iOS ATT revoked outside the app blocks next event', async () => {
  const f = fixture({ os: 'ios' }); await f.api.setMeasurementConsent(true); f.revokeATT();
  f.api.trackLessonCompleted(); await drain(); assert.equal(f.events.length, 0);
});

test('enabled native builds keep consent available even without an Expo manifest', async () => {
  const f = fixture({ manifestMissing: true });
  assert.equal(f.api.isMetaMeasurementConfigured(), true);
  await f.api.refreshMeasurementConsent();
  assert.equal(f.events.length, 0);
  assert.equal(f.calls.length, 0);
  await f.api.setMeasurementConsent(true);
  f.api.trackLessonCompleted(); await drain();
  assert.equal(f.events.length, 1);
});
