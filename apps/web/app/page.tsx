"use client";

import { useEffect } from "react";
import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user?.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/signin");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen min-w-screen flex justify-center items-center">
        <div>Loading user...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen min-w-screen flex justify-center items-center">
        <div>{error.message}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>{'Todo -- '}</div>
    </main>
  );
}
