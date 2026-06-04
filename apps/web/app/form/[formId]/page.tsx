"use client";

import { FileText, Loader2, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { usePublicForm, useSubmitPublicForm } from "~/hooks/api/form";

type FieldValueMap = Record<string, string>;

export default function PublicFormPage() {
  const params = useParams<{ formId: string }>();
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;
  const { form, error, isLoading } = usePublicForm(formId);
  const { submitPublicFormAsync, isPending } = useSubmitPublicForm();
  const [values, setValues] = useState<FieldValueMap>({});
  const [submitted, setSubmitted] = useState(false);

  const orderedFields = useMemo(() => {
    return [...(form?.fields ?? [])].sort((first, second) => {
      return Number(first.index) - Number(second.index);
    });
  }, [form?.fields]);

  const setFieldValue = (fieldId: string, value: string) => {
    setValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missingField = orderedFields.find((field) => {
      return field.isRequired && !values[field.id]?.trim();
    });

    if (missingField) {
      toast.error(`${missingField.label} is required`);
      return;
    }

    try {
      await submitPublicFormAsync({
        formId,
        values: orderedFields.map((field) => ({
          formFieldId: field.id,
          value: values[field.id] ?? "",
        })),
      });
      setSubmitted(true);
      toast.success("Form submitted");
    } catch {
      toast.error("Unable to submit form");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-svh bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-lg">
            <CardContent className="flex min-h-56 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (error || !form) {
    return (
      <main className="min-h-svh bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Form unavailable</CardTitle>
              <CardDescription>{error?.message ?? "This form could not be loaded."}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-svh bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <CardTitle>Thanks for submitting</CardTitle>
              <CardDescription>Your response has been saved.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="rounded-lg">
          <CardHeader className="border-b">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            {form.description ? <CardDescription>{form.description}</CardDescription> : null}
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {orderedFields.length > 0 ? (
                orderedFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.isRequired ? <span className="text-destructive"> *</span> : null}
                    </Label>
                    {field.description ? (
                      <p className="text-sm text-muted-foreground">{field.description}</p>
                    ) : null}

                    {field.type === "YES_NO" ? (
                      <RadioGroup
                        value={values[field.id] ?? ""}
                        onValueChange={(value) => setFieldValue(field.id, value)}
                        className="grid grid-cols-2 gap-3"
                      >
                        <Label className="flex items-center gap-2 rounded-md border p-3">
                          <RadioGroupItem value="yes" />
                          Yes
                        </Label>
                        <Label className="flex items-center gap-2 rounded-md border p-3">
                          <RadioGroupItem value="no" />
                          No
                        </Label>
                      </RadioGroup>
                    ) : field.type === "TEXT" ? (
                      <Textarea
                        id={field.id}
                        value={values[field.id] ?? ""}
                        placeholder={field.placeholder ?? undefined}
                        required={field.isRequired}
                        disabled={isPending}
                        onChange={(event) => setFieldValue(field.id, event.target.value)}
                      />
                    ) : (
                      <Input
                        id={field.id}
                        type={
                          field.type === "EMAIL"
                            ? "email"
                            : field.type === "NUMBER"
                              ? "number"
                              : field.type === "PASSWORD"
                                ? "password"
                                : "text"
                        }
                        value={values[field.id] ?? ""}
                        placeholder={field.placeholder ?? undefined}
                        required={field.isRequired}
                        disabled={isPending}
                        onChange={(event) => setFieldValue(field.id, event.target.value)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  This form does not have any fields yet.
                </div>
              )}

              <div className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={isPending || orderedFields.length === 0}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
