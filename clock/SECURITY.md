# Security policy

## Supported versions

Only the latest commit on the default branch is supported. This is a
client-side app with no server component and no stored data, so there is no
backport queue — upgrade by pulling or reloading.

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Use GitHub's private reporting on this repository
(**Security → Report a vulnerability**), or
[`Report a vulnerability`](https://docs.github.com/en/site-policy/privacy-policies/github-private-reporting).

Include what you found, how to reproduce it, and the impact. You can expect an
acknowledgement within a few days. Fixes land on the default branch and are
published automatically by the deploy workflow.

## Scope

In scope:

- The service worker in `sw.js` — a caching bug there can serve stale or
  attacker-controlled content to someone who has installed the app.
- The build script `tools/build.php` — it writes files into a directory that
  gets deployed, so a path-traversal or unsafe-overwrite bug is a real risk.
- Anything in `index.php` that runs on a server hosting this project.
- Cross-site scripting through city names, aliases or time zone strings, since
  that data ends up in the page.

Out of scope:

- Reporting a bug in a dependency. Please report those upstream; see
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for versions in use.
- The app making requests to jsDelivr for Bootstrap and Bootstrap Icons. These
  are documented, expected, and cached.
- Physical attacks, social engineering, or anything requiring an already
  compromised account.
