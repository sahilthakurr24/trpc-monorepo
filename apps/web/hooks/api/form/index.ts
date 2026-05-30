"use client";

import { trpc } from "~/trpc/client";

export function useCreateForm() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createFormAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.listFormByUserId.invalidate();
    },
  });

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

export function useUserForms() {
  const {
    data: forms = [],
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.listFormByUserId.useQuery();
  return {
    forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
}
