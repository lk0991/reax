# Show a person who cannot reach the live preview a published screenshot gallery

The live preview listens on 127.0.0.1, which a person's browser cannot reach when the agent runs in a cloud or remote session. In that case the skill publishes a static gallery of the visual test's screenshots (one generated page plus the PNGs it references) as a private Artifact, and offers, with the person's approval, to deploy a static Storybook build to hosting the person already uses.

## Considered options

- **Publish the static Storybook build as an Artifact.** Rejected: the build is several megabytes of minified bundles, and the agent must read every file it publishes that it did not write. The screenshots it reads anyway, for the visual review.
- **A tunnel to the live preview.** Rejected: it needs a tool and network access the session may not have, and it exposes a server that can write to the project.
- **Screenshots in chat only.** Kept as the last fallback; a page keeps every width side by side and keeps the same link across runs.

## Consequences

- Every visual-test run writes `visual-report/gallery.html`, and its summary says whether the live preview is reachable.
- Comment, Anatomy and Edit modes exist only in the live preview. Remote sessions take comments in chat.
- Detecting a remote session is a guess from the environment; `REAX_PREVIEW_LOCAL` overrides it.
