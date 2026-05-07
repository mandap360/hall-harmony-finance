## Goal
Unblock the app. Profile fetch currently fails with `permission denied for function is_super_admin`, leaving every page empty.

## Root cause
A previous security migration revoked `EXECUTE` on `public.is_super_admin()` from `authenticated`. RLS policies on `profiles` and `organizations` invoke this function, so every query under those policies errors out for signed-in users.

## Fix
Single migration:

```sql
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
```

This does NOT make anyone a super admin. The function body still gatekeeps by `profiles.is_super_admin = true` for `auth.uid()` and returns `false` for everyone else. `anon` and `public` remain revoked.

## Out of scope
- Removing super-admin policies entirely (deferred until the separate admin app is built and uses `service_role`).
- Any code changes — purely a DB grant.
