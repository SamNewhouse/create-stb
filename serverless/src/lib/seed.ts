/**
 * Seeds a DynamoDB table with the provided data array.
 * Logs errors for each failed item insert but continues seeding.
 *
 * @param put - Function to perform the insert (e.g. yourTablePutFn(tableName, item))
 * @param tableName - The table to seed
 * @param data - Array of items to insert; can be any shape
 */
export async function seedTable(
  put: (tableName: string, item: any) => Promise<void>,
  tableName: string,
  data: any[],
): Promise<void> {
  console.log(`Seeding ${tableName} with ${data.length} items...`);
  for (const item of data) {
    try {
      await put(tableName, item);
    } catch (error) {
      console.error(`  ❌ Error seeding ${tableName}:`, error);
    }
  }
}

/**
 * Generates a data array, optionally post-processes it, and seeds it into a DynamoDB table.
 * Returns the data array after processing.
 *
 * @param put - Function to perform the insert (e.g. yourTablePutFn(tableName, item))
 * @param tableName - The table to seed
 * @param generator - Function generating the raw seed data array
 * @param postProcess - Optional transformation or filtering to apply to the generated data
 */
export async function generateAndSeed<T>(
  put: (tableName: string, item: T) => Promise<void>,
  tableName: string,
  generator: () => T[],
  postProcess?: (data: T[]) => T[] | void
): Promise<T[]> {
  const start = performance.now();
  let data = generator();
  if (postProcess) {
    const result = postProcess(data);
    if (result) data = result;
  }
  // Seed with dependency-injected put
  for (const item of data) {
    try {
      await put(tableName, item);
    } catch (error) {
      console.error(`  ❌ Error seeding ${tableName}:`, error);
    }
  }
  const end = performance.now();

  console.log(`✅ ${tableName} generated & seeded in ${((end - start) / 1000).toFixed(3)}s (${data.length} items)\n`);
  return data;
}
