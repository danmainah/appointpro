import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "professional-login",
      name: "Professional",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const { default: User } = await import("@/models/User");

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: "professional",
          slug: user.slug,
        };
      },
    }),
    Credentials({
      id: "client-login",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const { default: Client } = await import("@/models/Client");

        const client = await Client.findOne({
          email: (credentials.email as string).toLowerCase(),
          isRegistered: true,
        });
        if (!client || !client.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          client.password
        );
        if (!isValid) return null;

        return {
          id: client._id.toString(),
          name: client.name,
          email: client.email,
          role: "client",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role as string;
        token.slug = (user as Record<string, unknown>).slug as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).slug = token.slug;
      }
      return session;
    },
  },
});
