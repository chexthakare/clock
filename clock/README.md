# Time Bridge

Stop doing timezone maths in your head.

Time Bridge answers the three questions that come up on every call with a
client or colleague in another country:

1. **What time is it for them right now?**
2. **They said "9am" — what is that in my time?**
3. **When are we both actually free?**

It is a single-page installable web app (PWA) that works offline and needs no
account, no API keys and no server.

![Time Bridge](assets/icons/icon-512.png)

## Features

- **Six places at a time** — search ~450 cities, grouped by country, with flags.
- **Live clocks** that tick every second and show the day and the offset from
  your own time.
- **Natural-language time entry** — type `9am`, `2:30 pm`, `14:00` or `noon` and
  it is converted to every selected place at once.
- **Overlap finder** — set each side's working hours and get back the slots that
  work for both, in 1-hour or 30-minute increments.
- **Animated sky** — a real 3D sky (three.js) whose sun position, colour and
  sunrise/sunset times follow the selected place and the real clock, with an
  optional rain effect.
- **Automatic daylight saving** — IANA time zone ids are the source of truth, so
  DST is handled by the platform rather than by a hand-maintained table.
- **Offline and installable** — add it to your home screen or install it like a
  desktop app.
- **Light and dark themes**, following your system preference by default.

## Privacy

There is no analytics, no telemetry, no cookies and no backend.

- Nothing you type or select is ever sent anywhere. The app makes no network
  requests of its own.
- "Add my timezone" reads the time zone the **browser** reports
  (`Intl.DateTimeFormat().resolvedOptions().timeZone`). It does **not** ask for
  GPS permission and cannot tell you your street address.
- Your selected places, working hours and theme are kept in `localStorage` on
  your own device so the app is still there when you come back. Clearing site
  data erases them.

The only third-party requests the page makes are for Bootstrap and Bootstrap
Icons from jsDelivr, which are cached locally on first load. If you would rather
it made no third-party requests at all, see [Contributing](CONTRIBUTING.md).

## Running it locally

### With PHP (editable source)

Any PHP 8.1+ server works. From the project root:

```bash
php -S localhost:8000
```

Then open <http://localhost:8000>.

On XAMPP, drop the folder in `htdocs/` and open `http://localhost/<folder>/`.

PHP extensions required: `intl` (canonicalising time zone ids), `timezone`
(latitude/longitude lookup) and `mbstring` (flag emoji). All three ship with
XAMPP and with the `php` packages on most Linux distributions.

### Without PHP (static build)

The build script renders `index.php` into a `dist/` directory that contains no
PHP at all and can be served by any static host:

```bash
php tools/build.php
```

The result is in `dist/`. Preview it with anything:

```bash
php -S localhost:8000 -t dist
```

Options:

| Flag | Meaning |
| --- | --- |
| `--out=DIR` | Output directory relative to the project root. Default `dist`. |
| `--force` | Replace the output directory even if it holds files the build did not write. |

The build keys the service-worker cache on a hash of the file *contents*, so the
same source always produces the same cache version and unchanged files do not
force a re-download.

## Deploying

Because `dist/` is plain static files, deployment is the usual three steps:

```bash
php tools/build.php
# copy dist/ to your web root, object store, or Pages directory
```

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to the default branch. To use it, set **Settings → Pages → Source** to
**GitHub Actions**.

## How it fits together

```
index.php              PHP front controller AND the HTML template.
                       Builds a payload of ~450 places, resolves legacy
                       time zone ids to their modern equivalents, looks up
                       each zone's latitude/longitude, and embeds the result
                       as JSON in a <script id="boot-data"> tag.

tools/build.php        Renders index.php and copies the static shell into
                       dist/index.html, so the app can be hosted without PHP.

assets/app.js          All UI logic. Reads the boot payload and takes over.
assets/solar.js        Sunrise, sunset and solar position maths. Pure, no DOM.
assets/sky.js          three.js scene that renders the sky.
assets/solar.js,
assets/vendor/         three.js r160, vendored so the sky works offline.
assets/style.css,
assets/sky.css         Styling.
sw.js                  Service worker: precaches the shell, serves it offline.
manifest.webmanifest   PWA install metadata.
```

### Why does the entry point use `./` and not `./index.php`?

So that one build works on both kinds of host. Apache resolves `./` to
`index.php` because it is a directory index; GitHub Pages resolves the same URL
to `index.html`. The app therefore refers to itself only as `./`, and the build
needs no URL rewriting. Keep it that way — changing those references back to an
explicit filename will break one of the two deployments.

### Why is the city list in PHP at all?

`index.php` is the source of truth, because the data has to be derived at build
time: `IntlTimeZone` canonicalises deprecated ids such as `Asia/Calcutta`, and
`timezone_location_get` supplies coordinates that the solar and sky code need.
Doing it in PHP keeps the browser's job to rendering, and keeps the shipped
`index.html` static and cacheable.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow, how to test your change, and how to add a city. Everyone taking part
is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

MIT — see [LICENSE](LICENSE).

Bundled and CDN-loaded dependencies keep their own licences; those are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
