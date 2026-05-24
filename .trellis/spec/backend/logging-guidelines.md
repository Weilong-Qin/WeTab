# Logging Guidelines

> How logging is done in this project.

---

## Overview

vTab currently has no backend logger, observability stack, or structured logging pipeline. Runtime code should stay quiet by default because it runs inside the user's browser extension context.

---

## Log Levels

No project log-level contract exists. Avoid introducing a logging library for current frontend or service work.

Temporary debugging logs are acceptable during local investigation but must be removed before committing.

---

## Structured Logging

No structured logging format applies. If a future backend exists, define its logging contract in this file before adding application logs.

---

## What to Log

For current extension code, prefer UI state, tests, and service return values over logs. Do not add routine logs for bookmark reads, search input, folder selection, or preference reads.

---

## What NOT to Log

Never log:

* Bookmark titles, URLs, domains, or folder names.
* OpenAI-compatible endpoint URLs, API keys, or model settings from the options page.
* Browser profile, language, or storage contents.
* Full native bookmark trees.
