import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { api } from "@/convex/_generated/api";
import { convexServer } from "@/lib/convexServer";

export default NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await convexServer.query(api.users.verifyCredentials, {
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!user) {
            return null;
          }

          const passwordValid = await convexServer.action(
            api.auth.actions.verifyPassword,
            {
              password: credentials.password as string,
              hash: user.password,
            },
          );
          if (!passwordValid) {
            throw new Error("Invalid email or password");
          }
          return {
            id: user._id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            status: user.status,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log("token", token);

      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
