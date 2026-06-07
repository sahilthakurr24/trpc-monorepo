"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
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
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            formU
          </Link>
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

      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_30%),radial-gradient(circle_at_78%_74%,color-mix(in_oklab,#22c55e_22%,transparent),transparent_32%),linear-gradient(135deg,#0f172a,#1f2937_48%,#0b1220)]" />
        <div className="absolute inset-x-12 top-12 h-px bg-white/20" />
        <div className="absolute inset-y-12 right-12 w-px bg-white/14" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold tracking-normal">formU</span>
            <span className="rounded-full border border-white/18 px-3 py-1 text-white/70 shadow-lg shadow-black/20">
              Launch faster
            </span>
          </div>

          <div className="max-w-xl space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/58">
              Start building
            </p>
            <h2 className="text-6xl font-semibold leading-[0.96] tracking-normal drop-shadow-2xl">
              Create forms that feel sharp from the first field.
            </h2>
            <p className="max-w-md text-lg leading-8 text-white/72 drop-shadow-lg">
              Join formU to design forms, share them quickly, and turn submissions into clear
              decisions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/16 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur-md">
              <p className="text-lg font-semibold">Design</p>
              <p className="text-xs leading-5 text-white/64">Create clean forms that feel ready.</p>
            </div>
            <div className="rounded-lg border border-white/16 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur-md">
              <p className="text-lg font-semibold">Share</p>
              <p className="text-xs leading-5 text-white/64">
                Send polished links with confidence.
              </p>
            </div>
            <div className="rounded-lg border border-white/16 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur-md">
              <p className="text-lg font-semibold">Learn</p>
              <p className="text-xs leading-5 text-white/64">Turn answers into clear next steps.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
