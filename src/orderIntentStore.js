import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = "order-intents.json";

export class OrderIntentStore {
  constructor({ dataDir = DEFAULT_DATA_DIR } = {}) {
    this.dataDir = dataDir;
    this.filePath = path.join(dataDir, STORE_FILE);
    this.byUser = {};
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      this.byUser = parsed?.byUser && typeof parsed.byUser === "object"
        ? parsed.byUser
        : {};
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
      this.byUser = {};
    }
  }

  async persist() {
    await fs.writeFile(
      this.filePath,
      JSON.stringify({ byUser: this.byUser }, null, 2),
      "utf8"
    );
  }

  async createForUser(userId, record) {
    await this.init();
    const list = Array.isArray(this.byUser[userId]) ? this.byUser[userId] : [];
    list.push(record);
    this.byUser[userId] = list;
    return record;
  }

  listForUser(userId) {
    return Array.isArray(this.byUser[userId]) ? [...this.byUser[userId]] : [];
  }
}
