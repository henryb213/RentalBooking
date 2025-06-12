"use client";

import Image from "next/image";
import { SignIn } from "@/components/auth/sign-in";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // redirect to edit page when user unverified
  useEffect(() => {
    if (status === "authenticated") {
      const userId = session?.user?.id;
      const isVerified = session?.user?.verified;

      if (userId && isVerified === false) {
        router.push(`/profile/${userId}/edit`);
      }
    }
  }, [session, status, router]);

  return (
    <SignIn.Provider redirectTo="/" onError={(error) => console.error(error)}>
      <SignIn.Form>
        <div className="bg-cardBackground px-6 py-12 shadow sm:rounded-xl sm:px-12">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Image
              alt="New Leaf"
              src="/logo.png"
              className="mx-auto h-12 w-auto"
              width={256}
              height={256}
            />
            <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-secondary-foreground">
              Login
            </h2>
          </div>

          <SignIn.Error
            className="mt-4 flex w-full justify-center rounded-md bg-primary-foreground px-1.5 py-3 text-center align-middle text-destructive ring-1 ring-inset ring-secondary-foreground/50 sm:mx-auto sm:w-full sm:max-w-sm"
            icon={true}
          />

          <div className="mt-6 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-secondary-foreground"
              >
                Email address
              </label>

              <SignIn.EmailField
                className="block w-full rounded-md border-0 bg-background py-1.5 pl-2 text-secondary-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary/80 sm:text-sm/6"
                id="email"
                placeholder="Email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-secondary-foreground"
              >
                Password
              </label>

              <SignIn.PasswordField
                className="block w-full rounded-md border-0 bg-background py-1.5 pl-2 text-secondary-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary/80 sm:text-sm/6"
                id="password"
                placeholder="Password"
              />
            </div>

            <div>
              <SignIn.SubmitButton className="w-full">
                Login
              </SignIn.SubmitButton>
            </div>
          </div>
          <p className="mt-10 text-center text-sm/6 text-secondary-foreground/60">
            Not registered yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-1 hover:text-primary/90 hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </SignIn.Form>
    </SignIn.Provider>
  );
}

export default function LoginPage() {
  return (
    <div className="flex h-full items-center justify-center p-2">
      <div className="mt-16 w-full sm:mx-auto sm:max-w-[480px]">
        <Login />
      </div>
    </div>
  );
}
