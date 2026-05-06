# Contributing

Thanks for your interest in OneBreath! This project is small and opinionated, but contributions are welcome.

## Development setup

1. Node.js 20+
2. Clone and install:
   ```bash
   git clone https://github.com/william051200/OneBreath.git
   cd OneBreath
   npm install
   npm start
   ```
3. Scan the QR with **Expo Go** on your phone, or press `a` for Android emulator / `w` for web.

## Code style
- TypeScript strict mode
- 2-space indent, single quotes, semicolons
- Functional components + hooks; no class components
- One component per file unless trivially small
- Comment only what needs clarification

## Commits
- Conventional commits encouraged: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep commits focused and atomic

## Pull requests
- Open against `main`
- Include screenshots/screen recordings for UI changes
- Run `npx tsc --noEmit` before pushing
- Update relevant docs

## Reporting issues
Please include:
- Platform (iOS / Android / web) and OS version
- Device model
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Philosophy
OneBreath is intentionally minimal. Before proposing a feature, ask:
> Does this help someone hold their breath longer or measure it more easily?

If not, it probably belongs in a different app.
