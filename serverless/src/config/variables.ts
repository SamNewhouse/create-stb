import * as dotenv from "dotenv";

dotenv.config();

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_REGION_FALLBACK = process.env.AWS_REGION_FALLBACK;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const STAGE = process.env.STAGE;
