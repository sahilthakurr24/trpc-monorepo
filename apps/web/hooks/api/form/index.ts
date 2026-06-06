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

export function useGenerateFormWithAi() {
  const {
    mutateAsync: generateFormWithAiAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.generateFormWithAi.useMutation();

  return {
    generateFormWithAiAsync,
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

export function usePublicForm(formId: string) {
  const {
    data: form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getPublicFormById.useQuery({ formId });

  return {
    form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
}

export function useSubmitPublicForm() {
  const {
    mutateAsync: submitPublicFormAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.submitPublicForm.useMutation();

  return {
    submitPublicFormAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}

export function useFormSubmissions(formId: string) {
  const {
    data: submissions = [],
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getFormSubmissionsByFormId.useQuery({ formId });

  return {
    submissions,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
}
