import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      gruppeId?: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    gruppeId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    gruppeId?: number;
  }
}
