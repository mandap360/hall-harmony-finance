

## Problem

The auth logs reveal a **token refresh storm** -- dozens of simultaneous `token_revoked` and login events within the same second, eventually hitting Supabase's 429 rate limit. When a token refresh fails with 429, `onAuthStateChange` fires with a `null` session. This sets `user = null`, which makes `ProtectedRoute` redirect to `/auth`. Then `Auth.tsx` detects `user` again (from a successful refresh) and redirects back to `/` -- creating a redirect loop.

Additionally, the console shows `"JSON object requested, multiple (or no) rows returned"` from the profile fetch, meaning the `profiles` query returns 0 rows for this user. This doesn't cause the redirect but indicates a missing profile record.

## Root Cause

The `onAuthStateChange` callback unconditionally sets `user` to `session?.user ?? null` on every event, including `TOKEN_REFRESHED`. When rate-limited, the session becomes null momentarily, triggering the redirect chain.

## Plan

### 1. Fix useAuth.tsx to handle auth events properly

- Only set `user = null` on explicit `SIGNED_OUT` events, not on every callback
- Ignore transient token refresh failures
- Set up `onAuthStateChange` BEFORE `getSession` (already correct) but avoid double-setting loading state
- Add event-type filtering:
  - `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`: update user/session if session exists
  - `SIGNED_OUT`: clear user/session/profile
  - Other events with null session: ignore (don't clear user)

### 2. Fix Auth.tsx redirect timing

- Only navigate to `/` after confirming both `user` exists and `loading` is false, preventing premature redirects during the auth state settling period

### Technical Details

**useAuth.tsx changes:**
```typescript
onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
    return;
  }
  
  if (session) {
    setSession(session);
    setUser(session.user);
    setTimeout(() => fetchProfile(session.user.id), 0);
  }
  setLoading(false);
});
```

This prevents null-session token refresh failures from clearing the user state and triggering the redirect to /auth.

