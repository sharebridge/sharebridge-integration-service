import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createIntegrationServer } from "../src/server.js";
import { LocalPreferencesRepository } from "../src/preferencesRepository.js";
import { PreferencesStore } from "../src/preferencesStore.js";
import { OrderIntentStore } from "../src/orderIntentStore.js";

async function postJson(baseUrl, route, payload) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : {} };
}

test("POST order-intents registers intent when instructions copied", async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sb-order-intent-"));
  t.after(() => fs.rm(tempDir, { recursive: true, force: true }));

  const store = new PreferencesStore(path.join(tempDir, "preferences.json"));
  const repo = new LocalPreferencesRepository(store);
  await repo.init();
  const orderIntentStore = new OrderIntentStore({ dataDir: tempDir });
  await orderIntentStore.init();

  const server = createIntegrationServer({
    preferencesRepository: repo,
    orderIntentStore
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  t.after(() => server.close());

  const { status, body } = await postJson(
    `http://127.0.0.1:${port}`,
    "/v1/donor-seeker/order-intents",
    {
      user_id: "alice",
      pack_id: "pack-test-1",
      status: "instructions_copied",
      has_reference_photo: true,
      verbal_handover_notes: "blue gate",
      presets_snapshot: [
        {
          restaurant_name: "A2B",
          app_name: "Zomato",
          order_url: "https://www.zomato.com/x"
        }
      ]
    }
  );

  assert.equal(status, 201);
  assert.match(body.order_intent_id, /^oi-/);
  assert.equal(body.status, "instructions_copied");
  assert.equal(body.pack_id, "pack-test-1");

  const saved = orderIntentStore.listForUser("alice");
  assert.equal(saved.length, 1);
});
