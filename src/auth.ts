import NextAuth from "next-auth";
import authOptions from "@/auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  ...authOptions,
});
