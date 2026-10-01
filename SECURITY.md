# Security policy

## Supported versions

LivePage has no tagged releases yet. Only the latest commit on `main` is supported, so please confirm the issue reproduces there before reporting it.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report privately through GitHub: go to the [Security tab](https://github.com/glennfaison/livepage/security) and choose **Report a vulnerability**, or use [this direct link](https://github.com/glennfaison/livepage/security/advisories/new).

Include:

- What is affected (the editor, an importer or serializer, the HTML export runtime, a template, a data source)
- Steps to reproduce, ideally with a minimal page as JSON or shortcode
- The impact you expect
- The commit, browser, and OS you tested with

This is a small project. I aim to acknowledge reports within a week and will keep you updated on the fix, but I can't promise a fixed timeline. Please allow time for a fix before disclosing publicly.

## Scope and known trust boundaries

Some behavior is intentional. Reports about these are still welcome, but they are not vulnerabilities by themselves:

- **Author-supplied code is trusted.** Generated-data and parse functions in a page's data-source settings run as code in the browser, in the editor, in previews, and in exported pages. Only open pages you trust.
- **HTML exports load React from esm.sh.** Exported files fetch pinned React and ReactDOM builds from `https://esm.sh` when opened, so they need network access.
- **REST data sources go through the browser.** They depend on the target server's CORS policy, and exported pages send requests from the viewer's browser.

Problems in this project's handling of untrusted input are in scope, for example a crafted JSON, shortcode, or template that runs code without the user having opted in, or that escapes the intended rendering.

Vulnerabilities in third-party dependencies should be reported to their maintainers. If LivePage's use of a dependency makes the problem worse, report that here.
