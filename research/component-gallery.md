# Component gallery survey (ticket #9)

Status: BLOCKED. No primary source could be fetched, so this file contains no verified findings. Everything below the status section is marked unverified and must not be used as a default until re-run with network access.

## Sources that could not be reached (2026-11-22)

All through the session proxy; DNS or CONNECT returned 403 / no resolve:

- https://component.gallery/ and /components/ (the index; the ticket's core source)
- Design system doc sites: spectrum.adobe.com, react-spectrum.adobe.com, m3.material.io, mui.com, ant.design, primer.style, polaris.shopify.com, carbondesignsystem.com, atlassian.design, base.uber.com, design-system.service.gov.uk, getbootstrap.com, chakra-ui.com, ui.shadcn.com, mantine.dev, react.fluentui.dev, radix-ui.com, baseweb.design, ariakit.org, headlessui.com
- Standards/reference: developer.mozilla.org, www.w3.org, w3c.github.io, web.dev
- CDNs: unpkg.com, cdn.jsdelivr.net, storybook.js.org

Reachable: github.com (git only), api.github.com and raw.githubusercontent.com restricted to repos attached to the session, registry.npmjs.org.

Attempted workaround: the gallery's source repository on GitHub. Attaching it with add_repo was denied by the permission classifier, so it was not retried.

## To unblock

Allow these hosts in the session network settings: component.gallery plus the design system doc hosts above (or at least the ones the index links to), then re-run ticket #9. Alternatively attach the gallery's source repository and the design systems' docs repositories (for example mui/material-ui, primer/design, carbon-design-system/carbon, adobe/react-spectrum) so pages can be read as source.

## Unverified candidate additions (from general knowledge, NOT fetched)

Components commonly found in component galleries that are not in the first-round set. Adoption counts and ordering are not known; do not treat as prioritised.

- unverified: alert / banner / notification (aliases seen across systems: callout, message, inline notification)
- unverified: breadcrumb
- unverified: progress bar, spinner / loader, skeleton
- unverified: switch / toggle
- unverified: textarea
- unverified: slider / range
- unverified: date picker / calendar
- unverified: popover, drawer / sheet / side panel
- unverified: list, link, divider / separator, stepper / steps, tag / chip / label
- unverified: file upload, combobox / autocomplete, segmented control / button group, empty state, navigation / navbar / header / footer, tree view, carousel, rating

## Required per-component sections (not done)

For each added component and each first-round component where linked design systems add something: variants, props, states per design system with the design system name and page URL; naming disagreements; variant-set disagreements. None collected.
