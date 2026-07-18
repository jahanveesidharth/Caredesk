# CareDesk

CareDesk is a role-based hospital operations workspace for reception, clinical care, diagnostics, pharmacy, billing, inventory, HR, administration, and a patient portal.

## Run locally

```bash
npm install
npm run dev
```

Use any of the demo accounts shown on the sign-in screen (password: `password`). Demo activity is saved in the browser, so registrations, appointments, orders, payments and stock adjustments survive refreshes. Hospital administrators can restore the sample workspace from **Hospital Settings**.

## Production setup

1. Create a Supabase project and run [supabase/schema.sql](supabase/schema.sql).
2. Add a `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Configure user `app_metadata` server-side with a `tenant_id` and allowed `role`. Do not let clients assign either claim.
4. Replace the demo data adapter in `src/context/DataContext.tsx` with Supabase queries and mutations before handling live patient data. The supplied schema includes tenant-scoped tables and row-level security as the backend foundation.

## Verification

```bash
npm run build
npm run lint
```

CareDesk is a software template, not a compliance certification. Obtain legal, privacy, security, clinical-safety and accessibility reviews before any production healthcare deployment.
