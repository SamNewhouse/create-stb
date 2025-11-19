import { getClient, listTables, tableExists, createTable } from "../lib/dynamodb";

/**
 * List of table configs to create.
 * Extend this array to add more generic example tables.
 */
const tables = [
  {
    TableName: "Example",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function createTables(): Promise<void> {
  console.log("🏗️  Creating DynamoDB tables (Docker/local)...\n");

  const client = getClient();

  try {
    const existingTables = await listTables(client);
    console.log("Existing tables:", existingTables);
    console.log("");

    for (const tableConfig of tables) {
      const { TableName } = tableConfig;

      if (!TableName) {
        console.error("❌ Table config missing TableName:", tableConfig);
        continue;
      }

      try {
        const exists = await tableExists(client, TableName);
        if (exists) {
          console.log(`✅ Table '${TableName}' already exists`);
        } else {
          console.log(`Creating table '${TableName}'...`);
          await createTable(client, tableConfig);
          console.log(`✅ Table '${TableName}' created successfully`);
        }
      } catch (error: any) {
        if (error?.name === "ResourceInUseException") {
          console.log(`✅ Table '${TableName}' already exists (AWS error)`);
        } else {
          console.error(`❌ Failed to create table '${TableName}':`, error?.message ?? error);
        }
      }
    }

    console.log("\n🎉 Table creation complete!");
    console.log("📊 Check your tables at: http://localhost:8001\n");
  } catch (error: any) {
    console.error("❌ Error in table creation process:", error?.message ?? error);
    process.exit(1);
  }
}

createTables();

/**
 * Usage:
 * Run this script after starting local DynamoDB (Docker or otherwise).
 * Edit `tables` to add/remove demo tables. All configuration is managed by your central DynamoDB utility (`lib/dynamodb.ts`).
 */
