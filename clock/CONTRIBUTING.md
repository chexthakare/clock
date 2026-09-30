# Contributing to Time Bridge

Thanks for wanting to help. This project is small and friendly, and PRs are
welcome whether you are fixing a typo or rewriting the sky.

Everyone participating is expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Getting set up

You need PHP 8.1 or newer with the `intl`, `timezone` and `mbstring`
extensions. No package manager and no `npm install` — the only build dependency
is PHP itself.

```bash
git clone https://github.com/<your-username>/time-bridge.git
cd time-bridge
php -S localhost:8000
```

Open <http://localhost:8000>. There is no build step for development; edit a
file, refresh the page.

## Before you open a pull request

1. **Check the static build still works.** `dist/` is what most people actually
   download, so a change that only works under `php -S` is not finished:

   ```bash
   php tools/build.php
   php -S localhost:8000 -t dist
   ```

2. **Check the page has no console errors**, in both light and dark themes, and
   on a narrow window.

3. **Keep it working offline.** Unload the page, then go offline and reload. The
   app should come back. If you added a file that the app needs, add it to the
   `SHELL` list in `sw.js` too, or it will not be precached.

4. **Open the service worker carefully during development.** Browsers cache
   aggressively. If you see stale behaviour, unregister the worker in DevTools
   or use a hard reload.

## Style

- Match the file you are editing. The JavaScript (`assets/`, `sw.js`) uses
  2-space indentation and single quotes; the PHP (`index.php`,
  `tools/build.php`) uses 4 spaces and single quotes. Prefer `const`/`let` over
  `var`.
- In `index.php`, follow the existing `strict_types` and type-hinted style.
- Comments should explain *why* something is the way it is. Do not narrate what
  the next line does.
- Keep the app dependency-free. If a change needs a new library, raise it as an
  issue first so we can discuss vendoring, CDN loading, or not needing it at all.

## Adding a city

Cities live in the `$CITIES` array in `index.php`, sorted into regional blocks.
Each entry is:

```php
['City name', 'Country name', 'IANA/Timezone', 'TWO-LETTER-CODE'],
```

```php
['Mumbai', 'India', 'Asia/Kolkata', 'IN'],
```

Please keep them in alphabetical order within the block, and use a canonical
IANA id. If the city is not new but the zone is, that is a good contribution too
— the app resolves old ids like `Asia/Calcutta` on its own, but the list should
not grow duplicates.
You do not need to add coordinates. `index.php` looks up latitude and longitude
from the zone at build time.

## Adding a time zone that has no city

Zones with no entry in `$CITIES` are still reachable — `index.php` adds any
remaining zone from `DateTimeZone::listIdentifiers()` as a fallback. So a pull
request that only adds a friendly city name is a genuine improvement, not a
prerequisite for the zone working at all.

## Reporting bugs

Open an issue and include:

- your browser and version, and your operating system;
- roughly where you are in the world, since timezone bugs are often
  DST-specific;
- what you did, what you expected, and what happened instead;
- a screenshot if the sky or the layout is involved.

If the bug is about a specific time, name the city, the date and the time. That
is almost always enough for someone else to reproduce it.
