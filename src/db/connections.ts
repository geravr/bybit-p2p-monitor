import { client, schema } from "./client";
import * as schema from "./schema";

// Cliente global de PostgreSQL
export const db = {
  ...client,
  schema,
};

export { schema, client };
