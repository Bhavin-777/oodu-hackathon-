# TransitOps

Smart Transport Operations Platform — fleet, driver, dispatch, maintenance, and
expense management.

## Stack

React 19 + Vite + TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query,
React Router, React Hook Form + Zod, Recharts, Firebase (Auth, Firestore,
Storage).

## Getting started

```bash
npm install
cp .env.example .env
# fill in .env with your Firebase project's SDK config
npm run dev
```

## Project structure

```
src/
 ├── components/    # shared + ui (shadcn) components
 ├── pages/         # route-level pages
 ├── layouts/       # app shell / dashboard layout
 ├── hooks/         # custom hooks (incl. TanStack Query hooks per entity)
 ├── services/      # Firestore read/write functions per entity
 ├── firebase/      # Firebase app + SDK initialization
 ├── contexts/      # Theme, Auth context providers
 ├── lib/           # queryClient, cn() utility
 ├── types/         # shared TypeScript types (entities, status enums)
 ├── constants/     # static lookup values
 └── assets/
```

## Design tokens

Theme lives in `src/index.css` as CSS variables (Tailwind v4 CSS-first
config, no `tailwind.config.ts`). Dark mode is the default; toggling adds/
removes a `.dark` class on `<html>` via `ThemeContext`.

The platform's signature visual element is the **status rail**: a 3px
colored left border (`.status-rail-*` utility classes) that encodes
vehicle/driver/trip status consistently across cards and tables.

## Status so far

- [x] Project scaffold (Vite, TS, Tailwind v4, path aliases)
- [x] Theme tokens + dark mode
- [x] TanStack Query + Firebase client setup
- [x] Base shadcn/ui components (button, card, badge)
- [ ] Authentication (next module)
- [ ] Dashboard
- [ ] Vehicle Management
- [ ] Driver Management
- [ ] Trip Management
- [ ] Maintenance
- [ ] Fuel & Expenses
- [ ] Reports
