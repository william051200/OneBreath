# Contributing

Thanks for your interest in OneBreath! This project is small and opinionated, but contributions are welcome.

## Development setup

1. macOS 14+ and Xcode 15+
2. Install [XcodeGen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`
3. Clone the repo, then:
   ```bash
   xcodegen generate
   open OneBreath.xcodeproj
   ```

## Code style
- Swift API Design Guidelines
- 4-space indent, no trailing whitespace
- Prefer `@Observable` over `ObservableObject`
- One type per file unless trivially small
- Comment only what needs clarification — don't narrate obvious code

## Commits
- Conventional commits encouraged: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep commits focused and atomic

## Pull requests
- Open against `main`
- Include screenshots/screen recordings for UI changes
- Ensure tests pass: ⌘U in Xcode
- Update relevant docs (`README.md`, `docs/`)

## Reporting issues
Please include:
- iOS version and device model
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Philosophy
OneBreath is intentionally minimal. Before proposing a feature, ask:
> Does this help someone hold their breath longer or measure it more easily?

If not, it probably belongs in a different app.
