"use client";

import { trpc } from "~/trpc/client";

export function useCreateForm() {
  const {
    mutateAsync: createFormAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation();

  return {
    createFormAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}
