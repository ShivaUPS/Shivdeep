# Wi-Connect Firestore Security Specification

## 1. Data Invariants
1. **Strict Owner Isolation (PII & Multi-Tenant)**: Every user's profile (`/users/{userId}`) and all subcollections (`devices`, `files`, `threads`, `messages`, `clipboard`) are strictly readable and writable ONLY by the authenticated, email-verified user whose `request.auth.uid == userId`.
2. **Master Gate**: Every subcollection write verifies that the parent `/users/{userId}` document exists (or for `/messages/{messageId}`, that `/users/{userId}/threads/{threadId}` exists) and belongs to `request.auth.uid`.
3. **Immutable Identity & Timestamps**: `uid`, `ownerId`, `id`, `threadId`, and `createdAt` can never be mutated after creation. `createdAt` and `updatedAt` must equal `request.time`.
4. **No Shadow Fields**: Every `create` enforces `hasAll` + `hasOnly`, and every `update` uses action-based `affectedKeys().hasOnly(...)` combined with `isValid[Entity](incoming())`.
5. **Bounded Arrays & Strings**: `syncedDeviceIds` is bounded to `<= 20` string items, and every string has strict `.size()` limits.
6. **Verified Email Mandate**: All write operations require `request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: `GET /users/uid-1` with `auth = null`.
2. **Cross-Tenant PII Read**: `GET /users/uid-1` as `uid-2` (attempts to read another user's email).
3. **Unverified Email Write**: `CREATE /users/uid-1` as `uid-1` with `email_verified: false`.
4. **Identity Spoofing on Create**: `CREATE /users/uid-1/devices/dev-1` as `uid-1` with `ownerId: "uid-2"`.
5. **Shadow Field Injection**: `CREATE /users/uid-1` with extra ghost field `isAdmin: true`.
6. **Path ID Poisoning**: `CREATE /users/uid-1/files/../../evil` or 200-char ID string.
7. **Immutable Timestamp Tampering**: `UPDATE /users/uid-1/devices/dev-1` changing `createdAt` to a past timestamp.
8. **Client-Forged Timestamp**: `CREATE /users/uid-1/clipboard/clip-1` with client-supplied `createdAt != request.time`.
9. **Oversized String DoW Attack**: `CREATE /users/uid-1/clipboard/clip-1` with `text` > 10,000 chars.
10. **Array Flood Attack**: `UPDATE /users/uid-1/files/file-1` setting `syncedDeviceIds` to 25 elements or non-string `[123]`.
11. **Orphaned Message Write**: `CREATE /users/uid-1/threads/nonexistent/messages/msg-1` when parent thread does not exist.
12. **List Scraping Across Tenants**: `LIST /users/uid-1/files` as `uid-2`.
