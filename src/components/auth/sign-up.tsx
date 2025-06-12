"use client";

import { SignUpValidation } from "@/lib/validations/auth";
import { userCreateSchema } from "@/lib/validations/user";
import { api } from "@/trpc/react";
import { createContext, useContext, useState } from "react";
import { z } from "zod";
import { FormValidationError } from "./errors";
import Button from "../ui/button";

type FormState = z.infer<typeof SignUpValidation>;
type UserInfo = Omit<FormState, "profile" | "address">;

type UpdateFieldProps = {
  section: "required" | "profile" | "address";
  field: string;
  value: unknown;
};

type SignUpContextType = {
  userInfo: UserInfo;
  profile: FormState["profile"];
  address: FormState["address"];
  isLoading: boolean;
  isComplete: boolean;
  errorMessage: string | null;
  updateField: (props: UpdateFieldProps) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

type SignUpProviderProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

const SignUpProvider = ({
  children,
  onSuccess,
  onError,
}: SignUpProviderProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [profile, setProfile] = useState<FormState["profile"]>({
    bio: "",
    skills: [],
    interests: [],
    avatar: "http://localhost:3000/icons/1.png",
  });
  const [address, setAddress] = useState<FormState["address"]>({
    street: "",
    city: "",
    region: "",
    postCode: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signUpMutation = api.user.signUp.useMutation({
    onSuccess: () => {
      setIsComplete(true);
      onSuccess?.();
    },
    onError: (error) => {
      const message = error.message ?? "Something went wrong";
      setErrorMessage(message);
      onError?.(message);
    },
  });

  const updateField = (props: UpdateFieldProps) => {
    const { section, field, value } = props;
    if (section === "required") {
      setUserInfo((prev) => {
        return { ...prev, [field]: value };
      });
    } else if (section === "profile") {
      setProfile((prev) => {
        return { ...prev, [field]: value };
      });
    } else if (section === "address") {
      setAddress((prev) => {
        return { ...prev, [field]: value };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Clean up empty optional fields
      const cleanFormState = {
        ...userInfo,
        role: "communityMember",
        profile: Object.keys(profile ?? {}).length > 0 ? profile : undefined,
        address: Object.keys(address ?? {}).length > 0 ? address : undefined,
      };

      const validatedFields = userCreateSchema.safeParse(cleanFormState);

      if (!validatedFields.success) {
        // console.error(validatedFields.error);
        throw new FormValidationError("Please check your input and try again");
      }

      await signUpMutation.mutateAsync(validatedFields.data);
    } catch (err) {
      let message = "Something went wrong";

      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        message = String(err.message);
      }

      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: SignUpContextType = {
    userInfo,
    profile,
    address,
    isLoading,
    isComplete,
    errorMessage,
    updateField,
    handleSubmit,
  };

  return (
    <SignUpContext.Provider value={value}>{children}</SignUpContext.Provider>
  );
};

// Custom hook for consuming context
const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (context === undefined) {
    throw new FormValidationError(
      "useSignUp must be used within a SignUpProvider",
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
  const { handleSubmit } = useSignUp();
  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

const RequiredField = ({
  field,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  field: keyof UserInfo;
}) => {
  const { userInfo, updateField } = useSignUp();
  return (
    <input
      type={field === "password" ? "password" : "text"}
      value={userInfo[field]}
      onChange={(e) =>
        updateField({
          section: "required",
          field,
          value: e.target.value,
        })
      }
      className={className}
      required
      {...props}
    />
  );
};

const ProfileField = ({
  field,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  field: keyof FormState["profile"];
}) => {
  const { profile, updateField } = useSignUp();
  const value = profile ? profile[field] : "";

  return (
    <input
      type="text"
      value={Array.isArray(value) ? value.join(", ") : value}
      onChange={(e) =>
        updateField({
          section: "profile",
          field,
          value:
            field === "skills" || field === "interests"
              ? e.target.value.split(",").map((item) => item.trim())
              : e.target.value,
        })
      }
      className={className}
      {...props}
    />
  );
};

const AddressField = ({
  field,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  field: keyof FormState["address"];
}) => {
  const { address, updateField } = useSignUp();
  return (
    <input
      type="text"
      value={address ? address[field] : ""}
      onChange={(e) =>
        updateField({
          section: "address",
          field,
          value: e.target.value,
        })
      }
      className={className}
      {...props}
    />
  );
};

const SubmitButton = ({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isLoading } = useSignUp();
  return (
    <Button type="submit" loading={isLoading} className={className} {...props}>
      {children}
    </Button>
  );
};

const FormError = ({
  className = "",
  //icon = false,
}: {
  className?: string;
  icon: boolean;
}) => {
  const { errorMessage } = useSignUp();
  if (!errorMessage) return null;
  return <div className={className}>{errorMessage}</div>;
};

const CompleteMessage = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isComplete } = useSignUp();
  if (!isComplete) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const SignUp = {
  Provider: SignUpProvider,
  Form,
  RequiredField,
  ProfileField,
  AddressField,
  SubmitButton,
  Error: FormError,
  CompleteMessage,
};
