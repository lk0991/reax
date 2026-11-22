# Render the preview through Storybook's own frame

The preview renders each story in Storybook's own preview frame. A small helper starts the project's `storybook dev`, serves it at the root of its own address, and serves the preview page and API under `/__reax/`, so the page and the frame share an origin and the page can reach into the story's DOM. This replaces the earlier assumption of a separate Vite page that renders stories with `composeStories`.

## Considered options

- **A separate Vite page using `composeStories`.** Rejected: it has to reproduce each project's bundler setup. Storybook ships separate builders for Vite, webpack 5, Next.js and Next.js on Vite, and a Vite-only page cannot honour a webpack or Next.js project's aliases, loaders and plugins.
- **A static Storybook build.** Rejected for the preview: every Apply would need a rebuild of tens of seconds. It stays the right choice for `visual-test`.

## Consequences

- The preview and `visual-test` render stories identically, with the project's own decorators, providers and global styles, and any bundler Storybook supports works.
- The helper must proxy Storybook, including its hot-reload socket, bind it to `127.0.0.1` only, and stop its whole process group on exit.
- The Anatomy view reads argument types through the story frame's preview API, which is not formally public. The implementation must check it first and keep the declared-arguments fallback.
- Storybook 8 and newer is supported; 7 is best effort.
