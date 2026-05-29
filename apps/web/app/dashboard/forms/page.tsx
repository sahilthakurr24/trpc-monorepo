"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, FileText, Loader2, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useCreateForm } from "~/hooks/api/form";

const createFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(55, "Title must be 55 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(300, "Description must be 300 characters or fewer."),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

const defaultValues: CreateFormValues = {
  title: "",
  description: "",
};

export default function FormsPage() {
  const router = useRouter();
  const { createFormAsync, error, isPending } = useCreateForm();
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const descriptionValue = form.watch("description");

  const onSubmit = async (values: CreateFormValues) => {
    try {
      await createFormAsync(values);

      toast.success("Form created successfully");
      form.reset(defaultValues);
      router.refresh();
    } catch {
      toast.error("Unable to create form");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">Forms</h1>
            <p className="text-sm text-muted-foreground">
              Create polished forms for collecting structured responses.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-lg">
            <CardHeader className="border-b">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <CardTitle>Create a new form</CardTitle>
              <CardDescription>
                Start with a clear title and a short description for respondents.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Customer feedback survey"
                            autoComplete="off"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use a specific name that is easy to recognize later.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Description</FormLabel>
                          <span className="text-xs text-muted-foreground">
                            {descriptionValue.length}/300
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Collect feedback about the latest product experience, support quality, and next improvements."
                            className="min-h-32 resize-none"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Tell respondents what this form is for in one or two sentences.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error?.message ? (
                    <p className="text-sm font-medium text-destructive" role="alert">
                      {error.message}
                    </p>
                  ) : null}

                  <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending || !form.formState.isDirty}
                      onClick={() => form.reset(defaultValues)}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Creating
                        </>
                      ) : (
                        <>
                          <Plus className="size-4" />
                          Create form
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="text-base">Publishing checklist</CardTitle>
                <CardDescription>Keep the first draft focused before adding fields.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Write for respondents</p>
                    <p className="text-muted-foreground">
                      Make the purpose obvious before they start answering.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <ArrowRight className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Next step</p>
                    <p className="text-muted-foreground">
                      After creation, add fields and configure response settings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Form endpoint</CardTitle>
                <CardDescription>This page submits through the protected tRPC procedure.</CardDescription>
                <CardAction className="text-xs font-medium text-muted-foreground">
                  form.createForm
                </CardAction>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
