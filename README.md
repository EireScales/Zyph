# Zyph

Monorepo for Zyph.

## Structure

- **apps/web** – Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **apps/desktop** – Electron app (TypeScript, React)
- **packages/shared** – Shared types and utilities

## Setup

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Start Next.js dev server |
| `pnpm dev:desktop` | Start Electron with Vite dev server |
| `pnpm build:web` | Build Next.js app |
| `pnpm build:desktop` | Build Electron app |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format with Prettier |

## Requirements

- Node.js >= 18
- pnpm 9.x
