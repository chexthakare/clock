# Third-party notices

Time Bridge is MIT licensed (see [LICENSE](LICENSE)). It bundles and loads the
following third-party software, each under its own licence.

## Bundled

### three.js — r160

- File: `assets/vendor/three.module.min.js`
- Licence: MIT — `Copyright 2010-2023 Three.js Authors`, `SPDX-License-Identifier: MIT`
- Project: <https://threejs.org>

Vendored rather than loaded from a CDN because it is the only large dependency
that has to work offline, and because the animated sky is the heaviest part of
the first paint. The upstream licence header is preserved verbatim at the top of
the file. Do not strip it.

## Loaded from a CDN at runtime

Both are fetched from jsDelivr and cached by the service worker, so the app
still works offline after the first visit.

### Bootstrap 5.3.3

- Licence: MIT — `Copyright (c) 2011-2023 The Bootstrap Authors`
- Project: <https://getbootstrap.com>
- Loaded: CSS and the JS bundle, for the grid, forms and modals.

### Bootstrap Icons 1.11.3

- Licence: MIT — `Copyright (c) 2019-2023 The Bootstrap Authors`
- Project: <https://icons.getbootstrap.com>
- Loaded: icon font CSS and the woff2/woff font files.

## Standard library APIs, not dependencies

No licence is required for these, but they are worth knowing about because they
are what makes the app work without a timezone database shipped in the repo:

- **IANA time zone database**, via the browser's `Intl` API and PHP's
  `timezone`/`intl` extensions. The database is in the public domain; the
  maintainers ask that you support the [tz project](https://www.iana.org/time-zones).
- **Sunrise, sunset and solar position maths**, computed in
  `assets/solar.js` using the low-precision solar coordinate algorithm from
  Jean Meeus, *Astronomical Algorithms*, ch. 25 (the same approximation
  published by the US Naval Observatory as "Approximate Solar
  Coordinates"). Accuracy is under a degree, which is fine because the sun
  position only drives a decorative sky. No code is copied from either source;
  the equations are reimplemented.
