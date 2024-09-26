import fs from "node:fs/promises";

async function globalSetup() {
  await fs.writeFile("storageState.json", "{}");
}

export default globalSetup;
