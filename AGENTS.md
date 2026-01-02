# Repository Guidelines

## Project Structure & Module Organization

- Root configuration lives in `package.json`, `vite.config.js`, and `index.html`.
- Source code is in `src/` with `src/main.jsx` as the entry and `src/App.jsx` as the top-level component.
- Styles start in `src/index.css`; place additional assets under `src/assets/` when needed.
- The root `app.jsx` is unused by the Vite setup and can be removed once no longer needed.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server.
- `npm run build`: build the production bundle into `dist/`.
- `npm run preview`: preview the production build locally.

## Coding Style & Naming Conventions

- Use consistent, conventional JavaScript/JSX style across files you touch: 2-space indentation, trailing semicolons, and single quotes are acceptable defaults if you are establishing a style.
- Prefer `PascalCase` for React-style components and `camelCase` for variables, functions, and file names.
- Keep file names short and descriptive; avoid abbreviations unless they are widely understood.

## Testing Guidelines

- No test framework is configured yet.
- If you add tests, use a consistent naming pattern such as `*.test.jsx` and keep tests near the code they cover or under a dedicated `tests/` directory.
- Add a `test` script alongside the framework setup and describe expected usage here.

## Commit & Pull Request Guidelines

- There is no Git history in this folder. Use short, imperative commit messages (e.g., “Add initial UI scaffold”).
- PRs should describe the change, list any manual verification performed, and include screenshots for UI updates.

## Configuration & Environment Notes

- Document any required environment variables or local setup in this file or a `README.md` once they exist.
- Keep secrets out of the repo; use `.env` files and add them to `.gitignore`.
