# Security

M3E Canvas is a static site. It has no server, no accounts and no network calls of
its own beyond loading fonts; everything you draw stays in your browser's local
storage. That keeps the attack surface small, but if you find something, please
tell us.

## Reporting

Use GitHub's private vulnerability reporting for this repository:
**Security → Report a vulnerability**. Please do not open a public issue for
security problems.

Include what you found, how to reproduce it and, if you can, what impact you think
it has. You will get a reply within a week.

## Scope

Things that count: anything that lets a page, a pasted image or a crafted document
run code, read data it should not, or break the site for other visitors. Things
that do not: the prompt text an AI tool generates from your sketch, and the
behaviour of that tool.
