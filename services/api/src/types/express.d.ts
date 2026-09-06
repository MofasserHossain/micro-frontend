import type { AuthSession } from "@ecommerce-mf/types";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
      sessionToken?: string;
    }
  }
}
