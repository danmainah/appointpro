import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: "professional" | "client";
      slug?: string;
    };
  }

  interface User {
    role?: string;
    slug?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    slug?: string;
  }
}
