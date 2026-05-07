import test from "node:test";
import assert from "node:assert/strict";
import {
  LocalPreferencesGateway,
  UserServicePreferencesGateway
} from "../src/preferencesGateway.js";

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

test("LocalPreferencesGateway delegates list and upsert to store", async () => {
  const store = new _FakeStore();
  const gateway = new LocalPreferencesGateway(store);
  await gateway.init();

  await gateway.upsertForUser("alice", [{ id: "p1" }]);
  const presets = await gateway.listByUser("alice");
  assert.deepEqual(presets, [{ id: "p1" }]);
});

test("LocalPreferencesGateway requires a store", () => {
  assert.throws(() => new LocalPreferencesGateway(null), /requires a PreferencesStore/);
});

test("UserServicePreferencesGateway requires baseUrl", () => {
  assert.throws(
    () => new UserServicePreferencesGateway({}),
    /requires baseUrl/
  );
});

test("UserServicePreferencesGateway throws clearly until implemented", async () => {
  const gateway = new UserServicePreferencesGateway({
    baseUrl: "http://example.invalid"
  });
  await assert.rejects(
    () => gateway.listByUser("alice"),
    /not yet implemented/
  );
  await assert.rejects(
    () => gateway.upsertForUser("alice", []),
    /not yet implemented/
  );
});
