# Project Recap — Projet Congé

## Architecture Decisions

### `/api` prefix
- `server.servlet.context-path=/api` in `application-dev.properties` / `application-prod.properties`
- Controllers have `@RequestMapping("/jours-feries")` (no `/api`)
- Spring adds `/api` automatically to all routes

### Alias `@/` (Vite + TS)
- `vite.config.ts`: `alias: { "@": path.resolve(__dirname, "src") }`
- `tsconfig.app.json`: `"paths": { "@/*": ["./src/*"] }`
- All imports use `@/` instead of `../../`

### i18n (Internationalization)
- `frontend/src/i18n/index.ts` with i18next + react-i18next
- 3 languages: `fr.json`, `en.json`, `ar.json`
- Language switcher in `Navbar.tsx` (Select component)
- Default: `fr`, fallback: `fr`

### FreeMarker → PDF
- Backend template: `templates/decision-conge.ftl`
- `PdfGenerationService.java` uses FreeMarker + Flying Saucer (ITextRenderer)
- Frontend: `GET /demandes/{id}/generate-pdf` → blob download

### Security (routes-config.yml)
- YAML file loaded via `@ConfigurationProperties(prefix = "routes")`
- `SecurityConfig.java` applies rules: permitAll / hasAuthority / hasAnyAuthority / authenticated
- JWT: 15min access, 7 days refresh, rate-limiting login (5 attempts)

### Constants
- `frontend/src/constants/constants.ts`: STATUS_COLOR, STATUS_TKEY, TYPE_COLOR, TYPE_TKEY, ROLE_TKEY
- Directions/divisions/services NOT in constants — loaded dynamically via API + Redux (lazy loading)

### Logger
- `logback-spring.xml`: 3 appenders (console, app.log, error.log)
- MDC `user` key, masks passwords/tokens
- `@Slf4j` on services

### Services (no repetition)
- **Backend**: MapStruct for DTO mapping, Lombok `@RequiredArgsConstructor`, EmailService centralized, GlobalExceptionHandler
- **Frontend**: 3 layers — API layer (HTTP calls) → Redux thunks (state) → Service layer (pure logic, `leave.service.ts` only)

### Moroccan Holidays (fixed)
- `JourFerieService.java`: 9 fixed holidays seeded via `@PostConstruct`
- Auto-seeds for current year + 2 years ahead
- Admin can add/edit/delete in UI

---

## Lombok Annotations Explained

### `@Data`
= `@Getter` + `@Setter` + `@ToString` + `@EqualsAndHashCode` + `@RequiredArgsConstructor`

### `@Getter` / `@Setter`
Generate getters/setters for all fields. Used everywhere to access entity fields.

### `@ToString`
Generates `toString()` showing all fields. Without it, you get `ClassName@3f1b1d` (memory address). With it: `JourFerie(id=1, date=2026-07-30, libelle=Fête du Trône)`. Used by:
- Logger: `log.info("object: {}", obj)` calls toString()
- Debugger: inspecting variables in IDE

**`exclude`**: Used on Direction/Division to prevent infinite loop (bidirectional relationships → circular toString → StackOverflow)

### `@EqualsAndHashCode`
Generates `equals()` and `hashCode()` based on all fields.

**`equals()`**: Compares two objects by their data, not memory address.
`new Role(1L, "ADMIN").equals(new Role(1L, "ADMIN"))` → true (with), false (without)

**`hashCode()`**: Generates a number (like a locker/drawer number) for fast organization in HashSets/HashMaps.

**Why needed**: `User.java:67` — `private Set<Role> roles = new HashSet<>()`. Without it, adding the same role twice creates duplicates because each object goes to a different "locker" (different hashCode). With it, same role → same hashCode → same locker → equals() catches duplicate → no duplicate.

**Contract**: if `a.equals(b)` is true, then `a.hashCode() == b.hashCode()` must be true.

### `@NoArgsConstructor`
Empty constructor. **Required by Hibernate** — JPA creates objects with no-arg constructor first, then fills fields.

### `@AllArgsConstructor`
Constructor with all fields. Used by MapStruct (auto-generated mappers) and for creating objects the traditional way.

### `@Builder`
Creates objects using a fluent API: `JourFerie.builder().date(d).libelle("Fête").build()`
- No need to remember parameter order
- Can skip fields (they stay null/0)
- More readable than constructors with many params

### `@RequiredArgsConstructor`
Generates constructor for all `final` fields. Used for **dependency injection**:
```java
@RequiredArgsConstructor
public class JourFerieController {
    private final JourFerieService jourFerieService;
}
```
Spring sees the generated constructor and automatically injects the service.

### `@Slf4j`
Adds a `log` field: `log.info("message: {}", data)` — no need to write `LoggerFactory.getLogger(...)`.

---

## Key Java Concepts

### Entity = Table row
- Each object = one row in DB
- `jourFerieRepository.findById(1L)` returns the object representing the row where id=1
- `jourFerie.getLibelle()` gets that specific row's libelle

### Dependency Injection
- Spring manages object creation (services, controllers, repositories)
- You never write `new JourFerieService()`
- `@RequiredArgsConstructor` + `final` fields = Spring provides what you need
- Flow: Client HTTP → Controller → Service → Repository → DB

### Classes vs Objects
- **Class** (e.g. `JourFerie`) = blueprint/plan
- **Object** (e.g. `JourFerie j = new JourFerie()`) = actual thing in memory
- Services/Controllers: Spring creates 1 instance (singleton), you never do `new`
- Entities: You create objects when saving: `JourFerie.builder().build()` → `repository.save(j)`
