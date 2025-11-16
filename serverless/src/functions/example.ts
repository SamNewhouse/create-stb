import * as Dynamodb from "../lib/dynamodb";
import { Example, Tables } from "../types";
import { shortUUID } from "../utils/helpers";

/**
 * Retrieves a single Example item by its unique identifier (id).
 * @param id - The primary key value to look up.
 * @returns The Example object if found, or null if not found.
 */
export async function get(id: string): Promise<Example> {
  const client = Dynamodb.getClient();
  return Dynamodb.getItem(client, Tables.Example, { id });
}

/**
 * Generates a generic set of Example records with random short ids.
 * Uses shortUUID() for unique 8-character values.
 * @returns An array of 10 Example objects, each with a random id.
 */
export function generatePlainExamples(): Example[] {
  return Array.from({ length: 10 }, () => ({
    id: shortUUID(),
  }));
}
