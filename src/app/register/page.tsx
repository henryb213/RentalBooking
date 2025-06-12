"use client";

import Image from "next/image";
import { SignUp } from "@/components/auth/sign-up";
import Link from "next/link";

function Register() {
  return (
    <SignUp.Provider
      onSuccess={() => console.log("Signed in!")}
      onError={(error) => console.error(error)}
    >
      <SignUp.Form>
        <div className="bg-cardBackground px-6 py-12 shadow sm:rounded-xl sm:px-12">
          <div className="w-full sm:mx-auto sm:max-w-sm">
            <Image
              alt="New Leaf"
              src="/logo.png"
              className="mx-auto h-12 w-auto"
              width={256}
              height={256}
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-secondary-foreground">
              Register
            </h2>
          </div>

          <SignUp.CompleteMessage className="mt-4 flex w-full justify-center rounded-md bg-primary/50 px-1.5 py-3 text-center align-middle ring-1 ring-inset ring-primary sm:mx-auto sm:w-full sm:max-w-sm">
            Thank you for registering! Please check your email to complete the
            process.
          </SignUp.CompleteMessage>

          <SignUp.Error
            className="mt-4 flex w-full justify-center rounded-md bg-primary-foreground px-1.5 py-3 text-center align-middle text-destructive ring-1 ring-inset ring-secondary-foreground/50 sm:mx-auto sm:w-full sm:max-w-sm"
            icon={true}
          />

          <div className="mt-10 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm/6 font-medium text-secondary-foreground"
              >
                First Name
              </label>
              <SignUp.RequiredField
                className="block w-full rounded-md border-0 bg-background py-1.5 pl-2 text-secondary-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                field="firstName"
                placeholder="First Name"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm/6 font-medium text-secondary-foreground"
              >
                Last Name
              </label>

              <SignUp.RequiredField
                className="block w-full rounded-md border-0 bg-background py-1.5 pl-2 text-secondary-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                field="lastName"
                placeholder="Last Name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-secondary-foreground"
              >
                Email address
              </label>

              <SignUp.RequiredField
                className="block w-full rounded-md border-0 bg-background py-1.5 pl-2 text-secondary-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                field="email"
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

              <SignUp.RequiredField
                className="block w-full rounded-md border-0 bg-background py-1.5 pl-2 text-secondary-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                field="password"
                placeholder="Password"
              />
            </div>

            <div>
              <SignUp.SubmitButton className="w-full">
                Register
              </SignUp.SubmitButton>
            </div>
          </div>
          <p className="mt-10 text-center text-sm/6 text-secondary-foreground/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-1 hover:text-primary/90 hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </SignUp.Form>
    </SignUp.Provider>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex justify-center p-2">
      <div className="mr-4 mt-4 w-full sm:w-1/2">
        <Register />
      </div>
    </div>
  );
}
