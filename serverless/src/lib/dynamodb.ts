import {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
  PutItemCommand,
  GetItemCommand,
  BatchGetItemCommand,
  ScanCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DYNAMODB_ENDPOINT, AWS_SECRET_ACCESS_KEY, AWS_REGION_FALLBACK } from "../config/variables";
import { AWS_ACCESS_KEY_ID, AWS_REGION } from "../env";

/**
 * Returns a singleton DynamoDBClient configured for this environment.
 */
let dynamoClient: DynamoDBClient | null = null;

export function getClient(): DynamoDBClient {
  if (!dynamoClient) {
    const config: any = {};
    if (DYNAMODB_ENDPOINT) {
      config.endpoint = DYNAMODB_ENDPOINT;
      config.credentials = {
        accessKeyId: AWS_ACCESS_KEY_ID || "dummy",
        secretAccessKey: AWS_SECRET_ACCESS_KEY || "dummy",
      };
    }
    config.region = AWS_REGION || AWS_REGION_FALLBACK || "eu-west-2";
    dynamoClient = new DynamoDBClient(config);
  }
  return dynamoClient;
}

/**
 * Lists all DynamoDB tables for the provided client.
 */
export async function listTables(client: DynamoDBClient = getClient()): Promise<string[]> {
  const result = await client.send(new ListTablesCommand({}));
  return result.TableNames ?? [];
}

/**
 * Creates a new DynamoDB table using the given configuration.
 */
export async function createTable(
  client: DynamoDBClient = getClient(),
  tableConfig: any,
): Promise<void> {
  await client.send(new CreateTableCommand(tableConfig));
}

/**
 * Checks if a table exists.
 */
export async function tableExists(
  client: DynamoDBClient = getClient(),
  tableName: string,
): Promise<boolean> {
  try {
    const tables = await listTables(client);
    return tables.includes(tableName);
  } catch {
    return false;
  }
}

/**
 * Inserts (puts) a single item into a DynamoDB table.
 */
export async function putItem(
  client: DynamoDBClient = getClient(),
  tableName: string,
  item: any,
): Promise<void> {
  await client.send(
    new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    }),
  );
}

/**
 * Retrieves a single item by its primary key.
 */
export async function getItem(
  client: DynamoDBClient = getClient(),
  tableName: string,
  key: Record<string, any>,
): Promise<any | null> {
  const result = await client.send(
    new GetItemCommand({
      TableName: tableName,
      Key: marshall(key),
      ConsistentRead: true,
    }),
  );
  return result.Item ? unmarshall(result.Item) : null;
}

/**
 * Batch gets multiple items by keys.
 */
export async function getBatch(
  client: DynamoDBClient = getClient(),
  tableName: string,
  ids: string[],
): Promise<any[]> {
  if (!ids.length) return [];
  const keys = ids.map((id) => marshall({ id }));
  const params = {
    RequestItems: {
      [tableName]: {
        Keys: keys,
      },
    },
  };
  const result = await client.send(new BatchGetItemCommand(params));
  const items = result.Responses?.[tableName] || [];
  return items.map((item) => unmarshall(item));
}

/**
 * Scans a table, with optional filter expression and values.
 */
export async function scan(
  client: DynamoDBClient = getClient(),
  tableName: string,
  filterExpression?: string,
  expressionAttributeValues?: Record<string, any>,
): Promise<any[]> {
  const params: any = { TableName: tableName };
  if (filterExpression) params.FilterExpression = filterExpression;
  if (expressionAttributeValues)
    params.ExpressionAttributeValues = marshall(expressionAttributeValues);

  const result = await client.send(new ScanCommand(params));
  return result.Items ? result.Items.map((item) => unmarshall(item)) : [];
}

/**
 * Queries a table with the given key condition and optional index.
 */
export async function query(
  client: DynamoDBClient = getClient(),
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  indexName?: string,
): Promise<any[]> {
  const params: any = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
  };
  if (indexName) params.IndexName = indexName;

  const result = await client.send(new QueryCommand(params));
  return result.Items ? result.Items.map((item) => unmarshall(item)) : [];
}

/**
 * Updates an item by key with a given update expression.
 */
export async function update(
  client: DynamoDBClient = getClient(),
  tableName: string,
  key: Record<string, any>,
  updateExpression: string,
  expressionAttributeValues: Record<string, any>,
  expressionAttributeNames?: Record<string, string>,
): Promise<any> {
  const params: any = {
    TableName: tableName,
    Key: marshall(key),
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: "ALL_NEW",
  };
  if (expressionAttributeNames) params.ExpressionAttributeNames = expressionAttributeNames;
  const result = await client.send(new UpdateItemCommand(params));
  return result.Attributes ? unmarshall(result.Attributes) : null;
}

/**
 * Deletes an item by key.
 */
export async function deleteItem(
  client: DynamoDBClient = getClient(),
  tableName: string,
  key: Record<string, any>,
): Promise<void> {
  await client.send(
    new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    }),
  );
}
