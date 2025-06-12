import Credentials from "next-auth/providers/credentials";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import { UserService } from "./server/services/user.service";
import { compare } from "bcryptjs";
import { credentialsSchema } from "./lib/validations/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "plotOwner" | "communityMember";
      firstName: string;
      lastName: string;
      avatar?: string;
      verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "plotOwner" | "communityMember";
    firstName: string;
    lastName: string;
    avatar?: string;
    verified: boolean;
  }
}

export default {
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.avatar = user.avatar;
        token.verified = user.verified;
      }
      if (trigger === "update" && session) {
        token.verified = session.verified;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "admin"
          | "plotOwner"
          | "communityMember";
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as string;
        session.user.verified = token.verified as boolean;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = credentialsSchema.safeParse(credentials);
          if (!parsedCredentials.success) {
            return null;
          }

          const { email, password } = parsedCredentials.data;

          const user = await UserService.getUserByEmail(email, false);
          if (!user || !("passwordHash" in user)) {
            throw new Error("No user found with this email");
          }

          const isValid = await compare(password, user.passwordHash);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // eslint-disable-next-line
          const { passwordHash, ...sanitizedUser } = user;
          return { avatar: sanitizedUser.profile?.avatar, ...sanitizedUser };
        } catch (error) {
          console.error("Auth error: ", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
