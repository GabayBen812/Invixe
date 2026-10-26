# Meta app measurement foundation

Meta app: `1766622331291748` (Invixe). Business: `1568696771504692` (`invixe_`).
Ad account: `1579050870121242` — saved in Meta app settings and verified after reload.
Bundle/package: `com.gabayben812.invixeapp`. Apple store ID: `6759206244`.

## Status

Disabled by default. No Meta events should be sent by the default build.
This is preparation, not a verified install-attribution integration. Android store configuration, production privacy disclosures, and physical-device
Events Manager/attribution checks still need to be completed.

The JS layer requests explicit optional consent. iOS also requires ATT grant.
Unknown/denied consent, denied ATT, web and Expo Go drop events. Events before
consent are not queued for later replay. Preference is per installation, not per
account. Change it under Profile > העדפות מדידת פרסום. Removing consent stops
future logging; it does not delete data already sent to Meta.

Events:
- SDK automatic activation/install reporting, only after consent.
- `fb_mobile_complete_registration`: successful completed onboarding (including
  OAuth), or a new OAuth account that does not require onboarding. Ordinary login
  does not emit registration.
- `invixe_lesson_completed`: first completion of a lesson after successful server
  persistence. Repeats and inferred parent completions are not separate events.

No custom event parameters, user IDs, emails, names, simulated trades, portfolio
values or journal data are sent. SDK auto events can include actual App Store
purchases if real purchases are introduced later; do not log virtual trades as
purchases. Meta itself receives technical SDK/device data for attribution.

## Activate in a test build

1. Get **Client Token**, not App Secret, from Meta > App settings > Advanced.
   The Client Token is embedded in the binary; it is not a server secret. Keep
   App Secret out of the app and this repository.
2. Supply `EXPO_PUBLIC_META_MEASUREMENT_ENABLED=true` and `META_CLIENT_TOKEN`
   to both local Expo prebuild and the matching EAS build environment.
   Update the chosen profile in `eas.json`, which explicitly sets the flag to
   `false` while Meta identity review is pending.
   A missing token fails Expo config evaluation. Default builds use an inert
   placeholder and keep native auto initialization, logging and ID collection off.
3. This repo commits `ios/`, so configuration plugins do not run automatically
   during an EAS build. Run `npx expo prebuild --platform ios --no-install` with
   those variables and the existing Google client IDs. Review the native diff,
   then run CocoaPods install on macOS and commit the updated native project and
   Podfile.lock. Do not use `--clean` over hand-maintained native changes.
   The EAS post-install check rejects enabled builds with stale iOS Meta settings.
4. Android also has a committed native folder. Run `npx expo prebuild
   --platform android --no-install` with the same environment, review and commit
   the changes before building. The build check validates its token and safety defaults. Configure its real store listing/package and signing hashes in Meta.
5. Sync the revised disclosure with the separate **Invixe-Policy** repository
   and publish it at the privacy URL before enabling measurement. The bundled
   `registrationLegal.ts` has been updated here; its generation script reads that
   separate repo, so update that source before regenerating. Update store privacy
   declarations to match the tested SDK behavior.
6. Build a new native version (this cannot be shipped as a JS-only update or run
   inside Expo Go). Keep measurement disabled for production until checks pass.

## Verification

- Release preparation: version **1.0.6**, local iOS build **12**, Android code
  **11**. EAS production increments its remote build counters on every build;
  retries may therefore have higher numbers. `npm run check:release` validates
  the shared marketing version before EAS builds. This release includes the
  SDK but measurement remains disabled until the Client Token and checks above
  are complete; activating it requires another native build.

- `npm run test:meta` checks consent, ATT denial/revocation, disabled builds and
  event payload boundaries with mocked native modules.
- `npx tsc --noEmit` checks types; the repository currently has unrelated baseline
  type errors. Do not treat mocked tests as proof of native SDK networking.
- Test fresh installs on physical iOS and Android: deny consent and verify no
  events; allow consent (and ATT on iOS), then verify activation, one registration
  and a first lesson completion in Meta Test Events. Reopen, sign in again and
  repeat a lesson to check duplicates. Revoke in Profile and OS settings and
  verify no further events, including after force quit and relaunch.
- Test Google and Apple sign-in after native plugin changes.
- Confirm campaign access to the linked advertising account, complete Meta eligibility checks, and run
  a controlled app-install campaign. Events arriving alone do not prove ad
  attribution or correct cost-per-install reporting. Consent opt-outs reduce
  measurable installs; no promise of identifying every downloader.
