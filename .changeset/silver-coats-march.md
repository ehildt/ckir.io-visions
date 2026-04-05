---
"@ckir.io/visions": minor
---

Refactored repository into a monorepo structure with dedicated `/server` and `/dashboard` packages.

- **Dashboard added** — Introduced a new Vue 3 frontend dashboard in `/dashboard`, built with Vite and Tailwind CSS v4, communicating via Socket.IO for real-time AI image analysis results.
- **Per-package README files** — Created `server/README.md` and `dashboard/README.md` with `depbadge` integration. Updated `depbadgerc.yml` manifests in both packages to sync with actual `package.json` dependencies and generated fresh dependency/devDependency badges.
- **Root README updated** — Added a "Monorepo Packages" section referencing the new sub-packages, cleaned up dependency badge lists to reflect actual server packages, and added an **AI GUIDANCE** footer link pointing to the new wiki page.
- **AI Guidance wiki** — Created `.wiki/ai-guidance.md` explaining the philosophy around AI-assisted development: vibe coding for prototyping, context coding for generation, and the critical need to *own the generated code* by reading, debugging, and refactoring it. Includes honest disclosure that this project intentionally experiments with AI-generated code without always strictly refactoring to personal standards. References real-world articles on vibe coding technical debt.
- **Wiki singular voice** — Updated all `.wiki` files from plural/impersonal voice ("we", "our", "team") to singular first-person voice ("I", "my") to accurately reflect solo developer ownership.
- **Development guide** — Removed contribution guidelines and code of conduct sections from `development.md` as they don't apply to a solo project.

> **Production Warning** — The AI Guidance page explicitly discourages applying the current AI-heavy, loosely-refactored approach to enterprise or production software, and outlines the stricter standards that would be required in those contexts.
