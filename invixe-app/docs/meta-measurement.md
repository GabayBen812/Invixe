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

## Measurement test build (1.0.9)

Meta identity verification completed on 2026-10-28; the API restriction banner
cleared and Events Manager opened. It has not received an event yet.

The `measurement-test` EAS profile extends production signing, uses the preview
EAS environment and enables measurement after consent. Android produces an APK
for direct installation; iOS produces a store-signed IPA for TestFlight.
The Client Token is stored as a Sensitive project variable `META_CLIENT_TOKEN`
in Expo preview with the owner's explicit approval. It is not the App Secret.
It is embedded in the binary, so it must not be treated as a server secret.

`eas-build-post-install` runs the release guard, injects the token into the
committed native templates, then validates both the token and disabled native
collection defaults. Production/preview profiles remain disabled and reset the
native token to the inert placeholder. Do not commit generated token values.
Local opt-in configuration is in gitignored `.env.meta.local`; it is not loaded
by default. Export its variables explicitly when testing the injection script.

Load the gitignored `.env.meta.local` variables into the local process, then
build with `eas build --profile measurement-test --platform all`. EAS needs the
token during local config evaluation before fetching its preview variables.
For iOS, submit the exact successful build ID with
`eas submit --platform ios --profile measurement-test --id <build-id>`.
This uploads to App Store Connect/TestFlight, not a public App Store release.
Run the physical-device checks below before enabling a production release.
Sync the bundled revised privacy disclosure to the separate Invixe-Policy site
and update store privacy declarations before releasing measurement to users.
For testing, review the bundled disclosure and consent prompt before opting in.

## Verification

- Release preparation: version **1.0.9**, local iOS build **16**, Android code
  **14**. EAS production increments its remote build counters on every build;
  retries may therefore have higher numbers. `npm run check:release` validates
  the shared marketing version before EAS builds. The measurement-test profile enables the SDK after consent; production remains
  disabled pending physical-device verification and disclosure updates.

- `npm run test:meta` checks consent, ATT denial/revocation, disabled builds and
  event payload boundaries with mocked native modules.
- `npx tsc --noEmit` checks types; the repository currently has unrelated baseline
  type errors. Do not treat mocked tests as proof of native SDK networking.
- Test fresh installs on physical iOS and Android: deny consent and verify no
  events; allow consent (and ATT on iOS), then verify activation, one registration
  and a first lesson completion in Events Manager overview (all events, correct date range).
  Test Events is account-filtered and is not proof that other users did not send events;
  end users never need Facebook login. Reopen, sign in again and
  repeat a lesson to check duplicates. Revoke in Profile and OS settings and
  verify no further events, including after force quit and relaunch.
- Test Google and Apple sign-in after native plugin changes.
- Confirm campaign access to the linked advertising account, complete Meta eligibility checks, and run
  a controlled app-install campaign. Events arriving alone do not prove ad
  attribution or correct cost-per-install reporting. Consent opt-outs reduce
  measurable installs; no promise of identifying every downloader.

The 1.0.8 consent gate reads Expo’s compile-time public flag rather than relying
on runtime Constants.expoConfig availability. The 1.0.7 IPA contains the flag
and token, but the tester reported missing consent controls. The tester confirmed the consent UI appeared in 1.0.8.
Event receipt is still unverified.

## 1.0.9 delivery diagnosis

A read-only Meta SDK configuration request with the existing client token returned
HTTP 200 and enabled event/advertiser-ID collection on 2026-10-28. This confirms
configuration access, not receipt of app events.

Expo's Facebook subscriber initializes the SDK at launch while auto logging is
disabled. Calling initializeSDK again after consent is idempotent; it does not
activate that session again. The local iOS InvixeMeta module now explicitly calls
activateApp after consent and ATT, with native flags checked on the main queue.
The SDK deduplicates activations. This addresses a missing first-session activation;
it is not yet established as the cause of missing lesson events.

Registration and first lesson events request an immediate SDK flush. The test
profile exposes a local diagnostic button under Profile: consent, ATT, event gate,
last event handed to the SDK, native config presence and SDK flush error code.
No tokens, device/user IDs, raw error text or lesson contents are exposed.
The error observer uses Meta's public AppEventsLoggingResult notification, which
reports errors only. No error does NOT prove delivery. Counters reset on restart.
Screenshots of the diagnostic state after a real new lesson can separate local
gating problems from native/configuration/network failures without Facebook login.
The diagnostic UI is absent unless EXPO_PUBLIC_META_DIAGNOSTICS=true.

### Build and configuration status (2026-10-28)

- Native InvixeMeta target compiles successfully with CocoaPods' default output
  paths on the local Xcode toolchain (arm64 simulator SDK; no simulator run).
- iOS 1.0.9 (16): EAS build `585d3c94-c31b-4d21-94d2-09cc313569d9`;
  automatic TestFlight submission `ae78d48c-1cfe-4ceb-8776-2ebe077a9a0b` is scheduled.
- Android 1.0.9 (14): EAS build `90c1b196-1ce4-498e-b833-190c022bd9e3`.
- iOS build 15 was canceled in the queue to include the native queue barrier.
- The existing public privacy URL was saved in Meta Basic settings and the UI
  confirmed Changes saved. The URL returns HTTP 200 but still has the old copy.
  Draft policy update: https://github.com/GabayBen812/Invixe-Policy/pull/1.
  Neither the Meta app nor a public store release has been published.
