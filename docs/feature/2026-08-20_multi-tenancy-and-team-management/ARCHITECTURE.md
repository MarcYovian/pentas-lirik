# Architecture: Multi-Tenancy & Authorization
## PentasLirik Multi-Tenant Isolation

### 1. Database Schema Design
* **`organizations` Table**:
  - `id`, `name`, `slug` (unique), `invite_code` (unique, e.g. `PL-XXXXXX`), `description`, timestamps.
* **`organization_user` Pivot Table**:
  - `organization_id`, `user_id`, `role` (`ADMIN` | `OPERATOR`), `status` (`ACTIVE` | `PENDING` | `INACTIVE`), timestamps.
* **Tenant Foreign Keys**:
  - `songs.organization_id`
  - `setlists.organization_id`
  - `display_settings.organization_id`

---

### 2. Request Scoping Lifecycle
1. Frontend `apiClient` mengirimkan header `X-Organization-Id: <id>` pada setiap request.
2. Controller backend memvalidasi keanggotaan aktif (`wherePivot('status', 'ACTIVE')`) atau status Super Admin.
3. Query Eloquent secara otomatis difilter dengan `where('organization_id', $orgId)`.
4. Jika user mencoba mengakses ID milik organisasi lain, sistem menolak dengan `403 Forbidden` (Anti-IDOR).
