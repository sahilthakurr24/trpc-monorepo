import { trpc } from "~/trpc/client";

export  function useSignUp() {
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation();
  return {
    createUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status,
    isError
  };
}
