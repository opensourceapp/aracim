# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do not open a public issue.** Instead, email: **security@opensourceapp.com**

You should receive a response within 48 hours. We will work with you to understand the issue and address it promptly.

## Scope

This is a client-side only application with no backend, authentication, or user data storage beyond browser localStorage. Security concerns are limited to:

- Cross-site scripting (XSS) via dependency vulnerabilities
- Supply chain attacks through compromised npm packages
- GitHub Actions workflow injection

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | Yes       |
