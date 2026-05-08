/**
 * Repository abstraction for donor preferences.
 *
 * The HTTP handlers in server.js depend only on this contract; they do not
 * care whether presets live on disk today or in sharebridge-user-service
 * tomorrow. Concrete implementations decide where the data actually lives.
 *
 * Contract:
 *   init()                          -> Promise<void>
 *   listByUser(userId)              -> Promise<Preset[]>
 *   upsertForUser(userId, presets)  -> Promise<Preset[]>  (full set after upsert)
 *
 * When the user-service preferences API ships, plug in the remote
 * implementation by setting `PREFERENCES_BACKEND=user_service` and
 * `USER_SERVICE_BASE_URL=...`. The HTTP handlers do not need to change.
 */

export class LocalPreferencesRepository {
  constructor(store) {
    if (!store) {
      throw new Error("LocalPreferencesRepository requires a PreferencesStore");
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
 * Placeholder repository documenting the planned remote contract against
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
export class UserServicePreferencesRepository {
  constructor({ baseUrl }) {
    if (!baseUrl) {
      throw new Error(
        "UserServicePreferencesRepository requires baseUrl (USER_SERVICE_BASE_URL)"
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
      "UserServicePreferencesRepository is not yet implemented. " +
        "Set PREFERENCES_BACKEND=local until the user-service preferences API ships."
    );
  }

  async upsertForUser(_userId, _presets) {
    throw new Error(
      "UserServicePreferencesRepository is not yet implemented. " +
        "Set PREFERENCES_BACKEND=local until the user-service preferences API ships."
    );
  }
}
