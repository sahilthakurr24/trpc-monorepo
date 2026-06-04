"use client";

import { trpc } from "~/trpc/client";

export function useCreateFormField() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createFormFieldAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createField.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.listFieldsByFormId.invalidate({ formId: variables.formId });
    },
  });

  return {
    createFormFieldAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}

export function useFormField(id: string) {
  const {
    data: field,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getField.useQuery({ id });

  return {
    field,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
}

export function useFormFields(formId: string) {
  const {
    data: fields = [],
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.listFieldsByFormId.useQuery({ formId });

  return {
    fields,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
}

export function useUpdateFormField() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormFieldAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.updateField.useMutation({
    onSuccess: async ({ id }, variables) => {
      await utils.form.getField.invalidate({ id });
      if (variables.formId) {
        await utils.form.listFieldsByFormId.invalidate({ formId: variables.formId });
      }
    },
  });

  return {
    updateFormFieldAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}

export function useDeleteFormField() {
  const utils = trpc.useUtils();
  const {
    mutateAsync: deleteFormFieldAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.deleteField.useMutation({
    onSuccess: async ({ id }) => {
      await utils.form.getField.invalidate({ id });
      await utils.form.listFieldsByFormId.invalidate();
    },
  });

  return {
    deleteFormFieldAsync,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
}
