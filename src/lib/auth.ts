import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

function getTurso() {
  return createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = getTurso();
        const result = await client.execute({
          sql: 'SELECT * FROM User WHERE email = ?',
          args: [credentials.email as string],
        });

        if (result.rows.length === 0) return null;
        const row = result.rows[0] as any;

        if (!row.passwordHash) return null;
        if (!row.emailVerified) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          row.passwordHash
        );
        if (!isValid) return null;

        return {
          id: row.id,
          email: row.email,
          name: row.name,
          image: row.image,
          role: row.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
});
