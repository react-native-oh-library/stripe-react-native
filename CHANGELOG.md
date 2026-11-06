# Changelog

## [0.76.1-beta.1] - 2026-11

### Added
- HarmonyOS (RNOH) support: ArkTS TurboModules (`StripeSdk` / `OnrampSdk`), codegen component descriptors, card-field UI components, payment-sheet and web-auth sheets, plus the harmony example app. [#1](https://github.com/react-native-oh-library/stripe-react-native/pull/1)
- Jest test suite for the JS API layer (native module mock, `StripeProvider`, events, functions, helpers). [#2](https://github.com/react-native-oh-library/stripe-react-native/pull/2)
- Documentation and compliance files: bilingual README, `COMMITTERS.md`, `OAT.xml`, and extended example demos. [#3](https://github.com/react-native-oh-library/stripe-react-native/pull/3)
- Prebuilt `stripe_react_native.har` for ohpm consumption. [#5](https://github.com/react-native-oh-library/stripe-react-native/pull/5)

### Changed
- Removed the original iOS/Android library sources, CI workflows, and repo tooling. [#1](https://github.com/react-native-oh-library/stripe-react-native/pull/1)
- Example build wiring: registered `stripe_react_native` as a harmony project module, reworked entry CMakeLists and babel config. [#4](https://github.com/react-native-oh-library/stripe-react-native/pull/4)
- Package metadata: version `0.76.1-beta.1`, MIT license, fork repository links, `fast:pkg` dev script. [#6](https://github.com/react-native-oh-library/stripe-react-native/pull/6)

### Fixed
- JS spec/type issues and example harmony wiring. [#3](https://github.com/react-native-oh-library/stripe-react-native/pull/3)
- Example build configuration (harmony module registration, entry CMakeLists, babel config). [#4](https://github.com/react-native-oh-library/stripe-react-native/pull/4)
- Packaging: package metadata and `stripe_react_native.har` bundle refresh. [#6](https://github.com/react-native-oh-library/stripe-react-native/pull/6)
