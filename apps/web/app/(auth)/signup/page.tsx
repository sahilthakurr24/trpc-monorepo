"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SignupForm } from "~/components/signup-form";
import { useGoogleLogin, useSignUp } from "~/hooks/api/auth";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const { createUserWithEmailAndPasswordAsync } = useSignUp();
  const { refetchGoogleLogin, isFetching: isGoogleRedirecting } = useGoogleLogin();
  const { handleSubmit, register } = useForm<FormValues>();
  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    const { id } = await createUserWithEmailAndPasswordAsync({
      email: values.email,
      full_name: values.name,
      password: values.password,
    });

    console.log(`User is created with ID : ${id}`);
    router.replace("/dashboard");
  };

  const onGoogleClick = async () => {
    try {
      const result = await refetchGoogleLogin();
      const authUrl = result.data?.url;

      if (!authUrl) {
        toast.error("Unable to start Google sign up");
        return;
      }

      window.location.href = authUrl;
    } catch {
      toast.error("Unable to start Google sign up");
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            ChaiForm
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm
              isGoogleSubmitting={isGoogleRedirecting}
              onGoogleClick={onGoogleClick}
              onSubmit={handleSubmit(onSubmit)}
              register={register}
            />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <Image
          width={50}
          height={100}
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
