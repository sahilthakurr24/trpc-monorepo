"use client";

import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useFormSubmissions, usePublicForm } from "~/hooks/api/form";

function formatDate(value: Date | string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function FormSubmissionsPage() {
  const params = useParams<{ id: string }>();
  const formId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { form, error: formError, isLoading: isFormLoading } = usePublicForm(formId);
  const {
    submissions,
    error: submissionsError,
    isLoading: isSubmissionsLoading,
  } = useFormSubmissions(formId);
  const isLoading = isFormLoading || isSubmissionsLoading;
  const orderedFields = [...(form?.fields ?? [])].sort(
    (first, second) => Number(first.index) - Number(second.index)
  );
  const errorMessage = formError?.message ?? submissionsError?.message;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">Submissions</h1>
            <p className="text-sm text-muted-foreground">
              {form?.title
                ? `Responses for ${form.title}`
                : "Review submitted responses for this form."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeft className="size-4" />
              Back to builder
            </Link>
          </Button>
        </div>

        <Card className="rounded-lg">
          <CardHeader className="border-b">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Response table</CardTitle>
            <CardDescription>
              Fields are shown as columns using their current labels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {errorMessage ? (
              <div className="border-b px-6 py-4 text-sm font-medium text-destructive">
                {errorMessage}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex min-h-56 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : orderedFields.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-medium">No fields found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add fields in the builder before reviewing submissions.
                </p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-medium">No submissions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shared form responses will appear here.
                </p>
              </div>
            ) : (
              <Table containerClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-44 px-6">Submitted</TableHead>
                    {orderedFields.map((field) => (
                      <TableHead key={field.id} className="min-w-44">
                        <div className="flex items-center gap-2">
                          <span>{field.label}</span>
                          {field.isRequired ? <Badge variant="secondary">Required</Badge> : null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => {
                    const valueByFieldId = new Map(
                      (submission.values ?? []).map((value) => [
                        value.formFieldId,
                        value.value,
                      ])
                    );

                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="px-6 text-muted-foreground">
                          {formatDate(submission.createdAt)}
                        </TableCell>
                        {orderedFields.map((field) => (
                          <TableCell key={field.id} className="max-w-80 whitespace-normal">
                            {valueByFieldId.get(field.id) || (
                              <span className="text-muted-foreground">No response</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
