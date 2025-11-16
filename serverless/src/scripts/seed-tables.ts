import { generatePlainExamples } from "../functions/example";
import { Tables } from "../types";
import { generateAndSeed } from "../lib/seed";
import { getClient, putItem } from "../lib/dynamodb";

async function seedAllTables(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...\n");
    const client = getClient();

    const put = (tableName: string, item: any) => putItem(client, tableName, item);

    const example = await generateAndSeed(put, Tables.Example, generatePlainExamples);

    console.log("🎉 Database seeding complete!");
    console.log("📊 Final data counts:");
    console.log(`  - Example: ${example.length}\n`);
    console.log("View data at: http://localhost:8001");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedAllTables();
