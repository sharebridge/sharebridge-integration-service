/**
 * Boundary between the integration service and the future authoritative
 * owner of donor preferences (sharebridge-user-service).
 *
 * Today the integration service owns donor presets via a file-backed store.
 * This gateway abstracts the access pattern so callers (HTTP handlers) do
 * not depend on the storage location, only on the contract:
 *
 *   listByUser(userId)            -> Promise<Preset[]>
 *   upsertForUser(userId, presets) -> Promise<Preset[]>  (returns full set)
 *
 * When the user-service preferences API ships, plug in a remote gateway by
 * setting `PREFERENCES_BACKEND=user_service` and `USER_SERVICE_BASE_URL=...`.
 * The HTTP handlers do not need to change.
 */

export class LocalPreferencesGateway {
  constructor(store) {
    if (!store) {
      throw new Error("LocalPreferencesGateway requires a PreferencesStore");
    }
    this._store = store;
  }

  async init() {
    return this._store.init();
  }

  async listByUser(userId) {
    return this._store.getByUser(userId);
  }

  async upsertForUser(userId, presets) {
    return this._store.saveForUser(userId, presets);
  }
}

/**
 * Placeholder gateway documenting the planned remote contract against
 * sharebridge-user-service. Intentionally not wired yet: until the user
 * service publishes its preferences API baseline we should not silently
 * fall through to a half-implemented client.
 *
 * Expected user-service contract (planned):
 *   GET    /v1/users/{user_id}/donor-presets         -> { presets: Preset[] }
 *   PUT    /v1/users/{user_id}/donor-presets         -> { presets: Preset[] }
 *
 * Auth: forward the donor's auth context (see "minimal auth context" task).
 */
export class UserServicePreferencesGateway {
  constructor({ baseUrl }) {
    if (!baseUrl) {
      throw new Error(
        "UserServicePreferencesGateway requires baseUrl (USER_SERVICE_BASE_URL)"
      );
    }
    this._baseUrl = baseUrl;
  }

  async init() {
    // No-op for now; once the remote API is reachable we may pre-flight
    // it here.
  }

  async listByUser(_userId) {
    throw new Error(
      "UserServicePreferencesGateway is not yet implemented. " +
        "Set PREFERENCES_BACKEND=local until the user-service preferences API ships."
    );
  }

  async upsertForUser(_userId, _presets) {
    throw new Error(
      "UserServicePreferencesGateway is not yet implemented. " +
        "Set PREFERENCES_BACKEND=local until the user-service preferences API ships."
    );
  }
}
