// Inject the client token during native builds without committing it to Git.
// All native collection defaults stay disabled until the consent gate runs.
const fs = require('node:fs');
const enabled = process.env.EXPO_PUBLIC_META_MEASUREMENT_ENABLED === 'true';
const token = enabled ? process.env.META_CLIENT_TOKEN?.trim() : 'disabled-until-configured';
if (!token || !/^[a-zA-Z0-9-]+$/.test(token)) throw new Error('Missing or invalid META_CLIENT_TOKEN');
for (const [file, pattern] of [
  ['ios/invixeapp/Info.plist', /(<key>FacebookClientToken<\/key>\s*<string>)[^<]*(<\/string>)/],
  ['android/app/src/main/res/values/strings.xml', /(<string name="facebook_client_token"[^>]*>)[^<]*(<\/string>)/],
]) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (!pattern.test(source)) throw new Error(`Missing Meta client token placeholder in ${file}`);
  fs.writeFileSync(file, source.replace(pattern, (_, prefix, suffix) => prefix + token + suffix));
}
console.log(`Native Meta token configured; measurement ${enabled ? 'enabled after consent' : 'disabled'}.`);
