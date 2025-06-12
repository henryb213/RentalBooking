"use client";

import { SignInValidation } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import {
  FormValidationError,
  AuthenticationError,
} from "@/components/auth/errors";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Button from "../ui/button";

// Define types for our context and components
type SignInContextType = {
  email: string;
  password: string;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

type SignInProviderProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
};

// Create context
const SignInContext = createContext<SignInContextType | undefined>(undefined);

// Create provider component
const SignInProvider = ({
  children,
  onSuccess,
  onError,
  redirectTo = "/",
}: SignInProviderProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedFields = SignInValidation.safeParse({ email, password });

      if (!validatedFields.success) {
        throw new FormValidationError("Invalid form data");
      }

      // Attempt sign in
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!response) {
        throw new AuthenticationError("Failed to authenticate");
      }

      if (response.error) {
        throw new AuthenticationError(response.error);
      }

      console.log("Succesfully logged in");

      // Handle success
      onSuccess?.();
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      let message = "Something went wrong";

      if (err instanceof AuthenticationError) {
        message = "Failed to authenticate. Please try again.";
      } else if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        message = String(err.message);
      }

      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    email,
    password,
    isLoading,
    isComplete,
    error,
    setEmail,
    setPassword,
    handleSubmit,
  };

  return (
    <SignInContext.Provider value={value}>{children}</SignInContext.Provider>
  );
};

// Custom hook for consuming context
const useSignIn = () => {
  const context = useContext(SignInContext);
  if (context === undefined) {
    throw new FormValidationError(
      "useSignIn must be used within a SignInProvider",
    );
  }
  return context;
};

// Compound components
const Form = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { handleSubmit } = useSignIn();
  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

const EmailField = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { email, setEmail } = useSignIn();
  return (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className={className}
      required
      {...props}
    />
  );
};

const PasswordField = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { password, setPassword } = useSignIn();
  return (
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className={className}
      required
      {...props}
    />
  );
};

const SubmitButton = ({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isLoading } = useSignIn();
  return (
    <Button type="submit" loading={isLoading} className={className} {...props}>
      {children}
    </Button>
  );
};

const CompleteMessage = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isComplete } = useSignIn();
  if (!isComplete) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const FormError = ({
  className = "",
  icon = false,
}: {
  className?: string;
  icon?: boolean;
}) => {
  const { error } = useSignIn();
  if (!error) return null;
  return (
    <div className={className}>
      {icon && (
        <ExclamationCircleIcon className="mr-2 h-6 w-6 text-destructive" />
      )}
      {error}
    </div>
  );
};

// Export the compound component
export const SignIn = {
  Provider: SignInProvider,
  Form,
  EmailField,
  PasswordField,
  SubmitButton,
  CompleteMessage,
  Error: FormError,
};
