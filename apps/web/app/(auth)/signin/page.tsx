"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SigninForm } from "~/components/signin-form";
import { useGoogleLogin, useSignIn } from "~/hooks/api/auth";

type FormValues = {
  email: string;
  password: string;
};

export default function SigninPage() {
  const router = useRouter();
  const { signinUserWithEmailAndPasswordAsync, error, isPending } = useSignIn();
  const { refetchGoogleLogin, isFetching: isGoogleRedirecting } = useGoogleLogin();
  const { handleSubmit, register } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await signinUserWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
      });

      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Unable to sign in");
    }
  };

  const onGoogleClick = async () => {
    try {
      const result = await refetchGoogleLogin();
      const authUrl = result.data?.url;

      if (!authUrl) {
        toast.error("Unable to start Google sign in");
        return;
      }

      window.location.href = authUrl;
    } catch {
      toast.error("Unable to start Google sign in");
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            ChaiForm
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SigninForm
              errorMessage={error?.message}
              isGoogleSubmitting={isGoogleRedirecting}
              isSubmitting={isPending}
              onGoogleClick={onGoogleClick}
              onSubmit={handleSubmit(onSubmit)}
              register={register}
            />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_34%),linear-gradient(135deg,var(--muted),var(--background)_54%,color-mix(in_oklab,var(--primary)_18%,transparent))]" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="max-w-md space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Streamyst</p>
            <h2 className="text-4xl font-semibold tracking-normal">
              Stream in style with your workspace ready.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
