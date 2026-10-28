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

## Measurement test build (1.0.7)

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

Build with `eas build --profile measurement-test --platform all`.
Run the physical-device checks below before enabling a production release.
Sync the bundled revised privacy disclosure to the separate Invixe-Policy site
and update store privacy declarations before releasing measurement to users.
For testing, review the bundled disclosure and consent prompt before opting in.

## Verification

- Release preparation: version **1.0.7**, local iOS build **13**, Android code
  **12**. EAS production increments its remote build counters on every build;
  retries may therefore have higher numbers. `npm run check:release` validates
  the shared marketing version before EAS builds. The measurement-test profile enables the SDK after consent; production remains
  disabled pending physical-device verification and disclosure updates.

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
