import test from "node:test";
import assert from "node:assert/strict";
import {
  LocalPreferencesRepository,
  UserServicePreferencesRepository
} from "../src/preferencesRepository.js";

class _FakeStore {
  constructor() {
    this.byUser = new Map();
  }
  async init() {}
  getByUser(userId) {
    return this.byUser.get(userId) || [];
  }
  async saveForUser(userId, presets) {
    this.byUser.set(userId, presets);
    return presets;
  }
}

test("LocalPreferencesRepository delegates list and upsert to store", async () => {
  const store = new _FakeStore();
  const repository = new LocalPreferencesRepository(store);
  await repository.init();

  await repository.upsertForUser("alice", [{ id: "p1" }]);
  const presets = await repository.listByUser("alice");
  assert.deepEqual(presets, [{ id: "p1" }]);
});

test("LocalPreferencesRepository requires a store", () => {
  assert.throws(
    () => new LocalPreferencesRepository(null),
    /requires a PreferencesStore/
  );
});

test("UserServicePreferencesRepository requires baseUrl", () => {
  assert.throws(
    () => new UserServicePreferencesRepository({}),
    /requires baseUrl/
  );
});

test("UserServicePreferencesRepository throws clearly until implemented", async () => {
  const repository = new UserServicePreferencesRepository({
    baseUrl: "http://example.invalid"
  });
  await assert.rejects(
    () => repository.listByUser("alice"),
    /not yet implemented/
  );
  await assert.rejects(
    () => repository.upsertForUser("alice", []),
    /not yet implemented/
  );
});
