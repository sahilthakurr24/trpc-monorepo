"use client";

import { trpc } from "~/trpc/client";

export function useSignUp() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });
  return {
    createUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status,
    isError,
  };
}

export function useSignIn() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: signinUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.signinUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    signinUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}

export const useUser = () => {
  const {
    data: user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery();

  return {
    user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};
