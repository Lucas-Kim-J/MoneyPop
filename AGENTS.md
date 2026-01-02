# Repository Guidelines

## Project Structure & Module Organization

- Root configuration lives in `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, and `index.html`.
- Source code is in `src/` with `src/main.jsx` as the entry and `src/App.jsx` as the top-level component.
- UI building blocks live in `src/components/`; shared data lives in `src/data/`; API calls live in `src/services/`.
- Styles start in `src/index.css`; add assets under `src/assets/` when needed.
- Deployment workflow is in `.github/workflows/deploy.yml` for GitHub Pages.
- The root `app.jsx` is not used by Vite; remove or keep as legacy as needed.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server.
- `npm run build`: build the production bundle into `dist/`.
- `npm run preview`: preview the production build locally.

## Coding Style & Naming Conventions

- Use consistent, conventional JavaScript/JSX style across files you touch: 2-space indentation, trailing semicolons, and single quotes are acceptable defaults if you are establishing a style.
- Prefer `PascalCase` for React-style components and `camelCase` for variables, functions, and file names.
- Keep file names short and descriptive; avoid abbreviations unless they are widely understood.
- Tailwind utility classes are used for styling; keep class order readable and avoid deeply nested custom CSS unless needed.

## Testing Guidelines

- No test framework is configured yet.
- If you add tests, use a consistent naming pattern such as `*.test.jsx` and keep tests near the code they cover or under a dedicated `tests/` directory.
- Add a `test` script alongside the framework setup and describe expected usage here.

## Commit & Pull Request Guidelines

- Use short, imperative commit messages (e.g., “Add GitHub Pages deploy workflow”).
- PRs should describe the change, list any manual verification performed, and include screenshots for UI updates.

## Configuration & Environment Notes

- Required local env: `VITE_DEEPSEEK_API_KEY` in `.env` for AI features.
- GitHub Pages builds read `VITE_DEEPSEEK_API_KEY` from repository secrets (Actions).
- Optional env defaults: `VITE_DEEPSEEK_MODEL=deepseek-chat`, `VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com`.
- Keep secrets out of the repo; `.env` must stay in `.gitignore`.

## Deployment (GitHub Pages)

- Vite base path is set to `/MoneyPop/` in `vite.config.js`.
- Push to `main` triggers the GitHub Actions workflow and publishes `dist/` to Pages.
