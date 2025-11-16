import { APIGatewayProxyHandler } from "aws-lambda";
import { get } from "../../functions/example";
import { success, handleError, badRequest, notFound } from "../../lib/http";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest("id is required");

    const example = await get(id);
    if (!example) return notFound("Example not found");

    return success(example);
  } catch (err) {
    return handleError(err);
  }
};
