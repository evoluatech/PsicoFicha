# Security Specification & Threat Model (PsicoFicha / Práxis)

## 1. Data Invariants
1. **User Identity Invariant**: All patient data (`aprendentes`, `anamneses`, `sessoes`, `avaliacoes`, `relatorios`, `lembretes`) belong strictly to the authenticated clinician (`userId`). A user can NEVER read, create, update, or delete clinical records of another clinician.
2. **Schema & Volumetric Boundaries**: Document IDs must be alphanumeric strings up to 128 characters (`isValidId`). String fields must be strictly size-bounded (names <= 128 chars, notes <= 2000 chars, codes <= 32 chars).
3. **Temporal Invariant**: Creation and update timestamps (`createdAt`, `updatedAt`) must equal server time `request.time`. Field `createdAt` is immutable after creation.
4. **Owner Immutability**: `userId` cannot be changed after creation.
5. **No Blanket Reads**: All read and list operations are locked to `request.auth.uid == userId`. No open queries or cross-tenant visibility.

## 2. The Dirty Dozen Payloads (Adversarial Test Vectors)
1. **Cross-Tenant Learner Read**: Attacker attempts to `get` `/users/victim_user_123/aprendentes/apr_001`.
2. **Identity Spoofing on Create**: Attacker tries to create an aprendente under `/users/attacker_uid/aprendentes/apr_999` with `userId: 'victim_user_123'`.
3. **ID Poisoning Attack**: Attacker passes a 2KB garbage string as `aprendenteId` to exhaust memory or trigger injection.
4. **Immortal Field Tampering**: Attacker updates `createdAt` on an existing document to fake clinical chronology.
5. **Ownership Hijack Update**: Attacker attempts to change `userId` from `attacker_uid` to `victim_uid` on an existing record.
6. **Volumetric Denial-of-Wallet**: Attacker attempts to write a 1MB payload in `notasInternas` or `nomeCompleto`.
7. **Invalid Status Injection**: Attacker sets `status: 'hacked_status'` instead of the permitted enum values.
8. **Unauthenticated Read / Write**: Unauthenticated client attempts to read `/users/user_123/sessoes/sess_001` or create records.
9. **Unverified Email Write**: Attacker creates account without verified email (where email verification is mandated).
10. **Ghost Field / Shadow Property Injection**: Attacker creates an aprendente with unauthorized extra keys like `isAdmin: true` or `vipRole: 99`.
11. **Negative Duration on Session**: Attacker writes `duracaoMinutos: -120` or non-numeric value.
12. **Foreign Anamnese Modification**: Attacker attempts to update an anamnese belonging to another clinician.

## 3. Test Invariant Mapping
All 12 adversarial vectors must yield `PERMISSION_DENIED` under `firestore.rules`.
