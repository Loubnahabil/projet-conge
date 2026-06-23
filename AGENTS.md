# Agents.md — Projet Congé

## Stack
- **Frontend**: React 19 + MUI 9 + Redux Toolkit + i18next + Vite 8 + SCSS (sass)
- **Backend**: Spring Boot 3 + Spring Security + JPA/Hibernate + PostgreSQL
- **Build**: `npx vite build` (frontend), `mvnw compile` (backend)

## Project Structure
```
frontend/
  src/
    api/            — axiosInstance.ts
    components/
      atoms/        — small reusable components
      molecules/    — composed components
      organisms/    — complex components (tables, forms, modals)
    constants/
      constants.ts  — DOCUMENT_TYPE, STATUS_COLOR, ROLE_TKEY, etc.
    i18n/
      locales/      — fr.json, en.json, ar.json
    layout/         — AppLayout, Sidebar, etc.
    pages/
      Admin/        — UserPage, StructurePage, JourFeriePage, QuotaManagementPage, Admindashboardpage, Auditpage
      LoginPage.tsx — uses SCSS (no MUI), plain HTML
      MesDemandePage.tsx
      Chefdashboardpage.tsx
      Signatairepage.tsx
    routes/         — AppRoutes.tsx, PrivateRoute.tsx
    store/
      slices/       — authSlice, userSlice, demandeSlice, structureSlice, jourFerieSlice, quotaSlice, statsSlice, auditSlice
      index.ts      — store + RootState + AppDispatch
    utils/
      errorUtils.ts — extractError() calls i18next.t(errorCode, params)
      useExportUsers.ts
backend/
  src/main/java/com/example/backend/
    config/
    controller/
    dto/
    entity/
    exception/      — ErrorCode.java, BusinessException.java, DuplicateResourceException.java,
                      ResourceNotFoundException.java, AccountLockedException.java,
                      GlobalExceptionHandler.java
    repository/
    security/
    service/        — UserService, DemandeService, AuthService, JourFerieService,
                      ServiceService, DivisionService, DirectionService,
                      DocumentStorageService, QuotaService, StatistiquesService,
                      PdfGenerationService, DemandeHistoriqueService
```

## Architecture & Patterns

### Error Handling (i18n)
- Backend throws exceptions carrying `ErrorCode` (enum key like `error.user.not.found`) + `Map<String, Object> params`
- `GlobalExceptionHandler` returns JSON: `{ errorCode, error, params? }` (with `params` optional, `status` only on BusinessException currently)
- Frontend `extractError(err)` reads `err.response.data`, calls `i18next.t(errorCode, params)`, falls back to `errors.operationError`
- All slices use `extractError()` or `i18next.t("errors.xxx")` in `.rejected` handlers

### Redux Thunks
- All `createAsyncThunk` exports are named WITHOUT "Thunk" suffix (e.g., `saveUser`, `fetchUsersList`)
- Extra reducers reference them as `builder.addCase(saveUser.fulfilled, ...)`
- `.fulfilled.match(result)` pattern used in component handlers (LoginPage, UserPage)

### SCSS (non-MUI page)
- `LoginPage.tsx` + `LoginPage.scss` — styled without MUI (Coach requirement)

### Structuring
- `DOCUMENT_TYPE.CERTIFICAT_MEDICAL` / `DOCUMENT_TYPE.DECISION_SIGNEE` constants used (not magic strings)

## Key Build Commands
```bash
# Frontend
cd frontend
npx vite build          # production build (skips typecheck — faster)
npx vite                # dev server

# Backend
cd backend
.\mvnw compile          # compile
```

## Known Issues (from audit)

### High Priority
1. `DemandeForm.tsx:41` — `selectedFile` prop defined but never destructured/used (dead prop)
2. `useExportUsers.ts:10-18` — Module-level `i18next.t()` calls freeze translations at load time
3. `constants.ts:37-42` — Missing `ROLE_TKEY` entries for `CHEF_SERVICE`, `CHEF_DIVISION`, `DIRECTEUR`
4. `DocumentStorageService.java:25`, `PdfGenerationService.java:72` — `RuntimeException` thrown directly, bypasses ErrorCode system

### Medium Priority
5. `AccountLockedException.java` — lacks ErrorCode/params fields (inconsistent with hierarchy)
6. `GlobalExceptionHandler.java:87` — BusinessException adds extra `"status"` field (inconsistent response shape)
7. `GlobalExceptionHandler.java:58-64` — Validation errors return `{ field: message }` instead of standard envelope
8. `DemandeService.java:528` — `CAN_ONLY_CANCEL_OWN` error code paired with "modifier" message
9. `StructureTree.tsx` — empty file
10. `DemandeDetail.tsx:44`, `DemandeDetailDrawer.tsx:21` — missing `.catch()` on axios calls
11. `Signatairepage.tsx:159` — `generatePdf()` not awaited, no `.catch()`

### Low Priority
12. `jourFerieSlice.ts:5` — unused `import { AxiosError }`
13. Multiple pages — both `export const` and `export default` for same component
14. Inconsistent `@/store` vs `@/store/index` import paths
15. `DuplicateResourceException.java:12` — no-arg ctor uses `RESOURCE_NOT_FOUND` instead of duplicate code
16. `ErrorCode.java:25` — `NOT_AUTHORIZED` defined but never used
17. Some `ResourceNotFoundException` throws use single-arg ctor (no explicit ErrorCode)

## Open Questions
- Coach asked about removing "Thunk" suffix from function names — DONE (all renamed)
- Coach asked about removing `createAsyncThunk` entirely vs just renaming — NOT DECIDED yet

## Things Completed
- SCSS LoginPage (Coach request: one page not using MUI)
- Modal stays open on error (UserFormModal)
- i18n error codes with ErrorCode enum + params map
- DOCUMENT_TYPE constants replacing magic strings
- All 33 thunk exports renamed (removed "Thunk" suffix)
