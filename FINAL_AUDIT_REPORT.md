# Final Repository Stability Audit

**Repository:** `sg-r7/Salaty-App`  
**Audited checkout:** `/tmp/Salaty-App`  
**Audit scope:** Root configuration, `app/`, `src/`, `lib/`, `assets/`, and `.github/`  
**Audit conclusion:** **Not yet 100% production/release-ready.** The application code passes TypeScript and Android JavaScript bundle verification, and the identified runtime crash traps were hardened. However, a native APK build was not executed in this audit, and the dependency tree reports unresolved security advisories because the project is based on Expo SDK 51.

## Executive conclusion

The original launch crash is resolved. `RootLayout` now imports a defined `checkAppUpdate` export, checks that it is callable, awaits it, and catches failures so update checking cannot terminate the component tree. Provider initialization paths and resource cleanup were also reviewed and hardened.

The repository is **JS-bundle ready** and suitable for the next native build step. It should not be described as fully release-certified until a debug or preview APK is built and installed on a representative Android device, and the dependency-advisory decision is made.

## Execution log

| Check | Result | Evidence |
|---|---|---|
| `npx tsc --noEmit` | **PASS** | Completed with zero TypeScript errors after the final hardening changes. |
| `npx expo install --check` | **PASS** | Reported that dependencies are up to date. |
| `npx expo export --platform android` | **PASS** | Metro produced an Android Hermes bundle and metadata successfully. Final bundle: `dist/_expo/static/js/android/entry-c0162a4c0c8ac5e37ed8cb6c595ada2e.hbc`. |
| `git diff --check` | **PASS** | No whitespace errors. |
| Unsupported `ScrollView` props scan | **PASS** | No `inverted` usage found. |
| Effective Expo configuration | **PASS** | Expo SDK `51.0.0`, app version `1.0.10`, Android package `com.salaty.app`, and version code `10` resolved correctly. |
| Asset alignment | **PASS** | Icon, splash, adaptive icon, and notification sound paths resolve to existing files. |
| `npm audit --omit=dev --audit-level=high` | **WARNING** | 45 advisories were reported: 1 low, 30 moderate, 13 high, and 1 critical. Automatic forced remediation proposes a breaking Expo upgrade and was not applied. |

The Expo CLI emitted Node’s `punycode` deprecation warning during configuration/export. This is a tooling dependency warning, not a Metro syntax or application-runtime failure.

## Health matrix

| Area | Status | Finding |
|---|---|---|
| TypeScript compilation | **Pass** | Zero errors. |
| Metro Android bundle generation | **Pass** | Hermes bundle generated successfully. |
| Root launch effect | **Pass** | `checkAppUpdate` is defined, type-guarded, awaited, and caught. |
| Theme provider | **Pass** | No mount effect or asynchronous initialization exists. |
| Prayer provider initialization | **Pass with safeguards** | Storage, calculation, and notification effects have fallback/error paths. Prayer completion persistence now catches storage failures. |
| Notification module initialization | **Pass with safeguards** | Handler setup is guarded and catches initialization exceptions. |
| Location/GPS operations | **Pass with safeguards** | Permission and current-position failures fall back to saved/default location. |
| Magnetometer lifecycle | **Pass** | Listener is removed on unmount; active compass animation is stopped. |
| Audio lifecycle | **Pass with safeguards** | Sound is stopped/unloaded on unmount and playback control failures are caught. |
| Timer lifecycle | **Pass** | Home-screen interval is cleared on unmount. |
| Prayer state authority | **Pass** | Completion state and daily completion storage are owned by `PrayerContext`; tabs consume its API. |
| RTL and horizontal scrolling | **Pass** | RTL row styles are used and no unsupported `ScrollView.inverted` prop was found. |
| Compass numerical safety | **Pass** | Coordinate bounds, finite sensor values, magnitude, angle, and fallback guards are present. |
| Configuration alignment | **Pass** | Package/app versions and Android identifiers are aligned; referenced assets exist. |
| Native APK build | **Not verified** | Expo export is not equivalent to a Gradle/EAS APK build or device installation. |
| Dependency security posture | **Warning** | The current Expo SDK 51 dependency tree contains unresolved advisories. |

## Findings by severity

### Critical

No critical application-code crash trap was found after the final hardening pass. The original `undefined is not a function` launch failure was caused by the missing `checkAppUpdate` named export and is fixed.

The dependency audit reports one critical transitive advisory. It is a release-hygiene concern rather than evidence of an immediate app launch crash, but it prevents an unconditional security sign-off.

### High

**The native release path remains unverified.** The audit ran TypeScript and Expo’s Android JavaScript export, but it did not run `expo prebuild`, Gradle, EAS, or install an APK on a physical/emulated Android device. The GitHub workflow builds a debug APK, not a signed production release. A release decision therefore still requires a native build and smoke test.

**The dependency tree contains unresolved high-severity advisories.** `npm audit --omit=dev` reported 13 high and 1 critical advisory. The suggested forced remediation moves Expo to a breaking newer version, so it requires a planned SDK upgrade and full regression testing rather than an automatic `npm audit fix --force`.

### Medium

**Prayer notification switches in `app/(tabs)/prayers.tsx` are local UI state.** They are not persisted and are not wired to `PrayerContext` notification settings or the scheduling service. Prayer completion tracking is centralized correctly, but these per-prayer notification switches do not currently control scheduled notifications. This is a behavior-consistency risk rather than a launch crash.

**Notification permission/setup occurs during provider initialization when prayer times are available.** This is safely caught, but requesting notification permission during startup-related state transitions can produce an intrusive first-run experience. Consider moving the permission request to an explicit user action or onboarding flow while retaining background rescheduling after permission has been granted.

### Low

The repository uses Expo SDK 51 and several older transitive packages. `npm install` reports deprecation warnings for packages such as older `glob`, `rimraf`, `uuid`, and Babel proposal plugins. These warnings do not block the current bundle, but they increase maintenance and upgrade risk.

The Qibla screen uses a geographic fallback location when permission is unavailable. This is safe and visible to the user, but the fallback should remain clearly labeled and could be made configurable in a future UX pass.

## Detailed technical review

### Launch and provider mounts

`app/_layout.tsx` now treats update checking as optional. The update function is verified with `typeof`, invoked through an awaited async initializer, and wrapped in `try/catch`. The redundant notification side-effect import was removed from the root layout.

`ThemeProvider` has no mount-side effect. `PrayerProvider` has three effects for loading settings, calculating prayer times, and rescheduling notifications. Each effect has a rejection handler, while the underlying scheduling flow has its own `try/catch` and user-visible fallback state.

### Async operations and storage

Location storage, notification settings, Quran last-read state, and Azkar counts have defensive storage handling. Prayer completion persistence now catches `AsyncStorage` failures and records an error without rejecting the UI event path. User-triggered settings and location operations use `try/catch/finally` where loading indicators are shown.

### Resource cleanup

The Magnetometer subscription is removed on Qibla-screen unmount. The current compass animation is stopped and its reference cleared. Quran audio is stopped and unloaded during reader close and component unmount. The Home tab’s one-second timer is cleared during cleanup. No notification listener subscription was found that requires additional removal.

### Compass math

The Qibla implementation applies an exponential moving average with `EMA_ALPHA = 0.18`. Sensor axes are checked for finite values before magnitude calculation. Very small magnitudes are ignored. GPS coordinates are accepted only when finite and within latitude/longitude bounds. Calculated Qibla angles are finite-checked and normalized to `[0, 360)`. The shortest angular path logic is preserved, and active animations are stopped during cleanup.

### State and RTL consistency

Prayer completion state is owned by `PrayerContext` and consumed by both Home and Prayers tabs. The daily storage key is generated centrally from the local date. No duplicate completion storage implementation was found outside the provider. Horizontal category navigation uses explicit RTL-compatible row styling, and no unsupported `ScrollView.inverted` prop was found.

## Release recommendation

The repository is **ready for a preview APK build**, not yet fully release-certified. The recommended next command is:

```bash
eas build --platform android --profile preview
```

After the APK is produced, install it on an Android device and smoke-test first launch, location denial, notification denial, notification scheduling, Qibla sensor availability, Quran audio start/stop, app backgrounding, and process restart.

For production release, first decide whether to accept the current SDK 51 dependency advisories temporarily or perform a planned Expo SDK upgrade. Then run a signed production build and verify notification behavior on Android versions supported by the application.

## Final sign-off

**Sign-off status: Conditional / not 100% production-ready.**

The critical JavaScript launch crash is fixed, the TypeScript project is clean, and the Android Hermes bundle exports successfully. The remaining blockers to an unconditional production sign-off are the unexecuted native APK/device verification and the unresolved dependency security advisories.

## References

[1]: /tmp/Salaty-App/app/_layout.tsx "Root launch layout"
[2]: /tmp/Salaty-App/src/context/PrayerContext.tsx "Prayer provider and daily state authority"
[3]: /tmp/Salaty-App/app/qibla.tsx "Qibla compass and Magnetometer lifecycle"
[4]: /tmp/Salaty-App/app/(tabs)/quran.tsx "Quran audio and cleanup lifecycle"
[5]: /tmp/Salaty-App/package.json "Project dependencies and scripts"
[6]: /tmp/Salaty-App/app.json "Expo and Android application configuration"
[7]: /tmp/Salaty-App/.github/workflows/build.yml "Debug Android CI build workflow"
[8]: /tmp/Salaty-App/eas.json "EAS preview APK profile"
