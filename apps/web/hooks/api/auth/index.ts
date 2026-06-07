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

export function useGoogleLogin() {
  const { data, error, isFetching, refetch, status } = trpc.auth.googleLogin.useQuery(undefined, {
    enabled: false,
  });

  return {
    googleLogin: data,
    error,
    isFetching,
    refetchGoogleLogin: refetch,
    status,
  };
}

export function useLogout() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: logoutAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    logoutAsync,
    error,
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
