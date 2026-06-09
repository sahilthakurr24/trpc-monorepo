"use client";

import { AlertCircle, Plus, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useUserForms } from "~/hooks/api/form";
import { cn } from "~/lib/utils";

type FormStatus = "active" | "draft" | "idle";
type StatusFilter = "all" | FormStatus;
type MetricTone = "total" | FormStatus;
type UserForm = ReturnType<typeof useUserForms>["forms"][number];

const statusLabels: Record<FormStatus, string> = {
  active: "Active",
  draft: "Draft",
  idle: "Idle",
};

const statusClassNames: Record<FormStatus, string> = {
  active:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  draft:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  idle:
    "border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground",
};

function getFormStatus(form: UserForm): FormStatus {
  if (!form.description?.trim()) return "draft";

  const lastActivity = form.updatedAt ?? form.createdAt;
  if (!lastActivity) return "idle";

  const daysSinceActivity =
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceActivity <= 30 ? "active" : "idle";
}

function formatDate(value: Date | string | null) {
  if (!value) return "Not updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { forms, error, isLoading } = useUserForms();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [query, setQuery] = React.useState("");

  const formsWithStatus = React.useMemo(() => {
    return forms
      .map((form) => ({
        ...form,
        status: getFormStatus(form),
        lastActivity: form.updatedAt ?? form.createdAt,
      }))
      .sort((first, second) => {
        const firstTime = first.lastActivity ? new Date(first.lastActivity).getTime() : 0;
        const secondTime = second.lastActivity ? new Date(second.lastActivity).getTime() : 0;
        return secondTime - firstTime;
      });
  }, [forms]);

  const stats = React.useMemo(() => {
    return {
      total: formsWithStatus.length,
      active: formsWithStatus.filter((form) => form.status === "active").length,
      draft: formsWithStatus.filter((form) => form.status === "draft").length,
      idle: formsWithStatus.filter((form) => form.status === "idle").length,
    };
  }, [formsWithStatus]);

  const filteredForms = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return formsWithStatus.filter((form) => {
      const matchesStatus = statusFilter === "all" || form.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        form.title.toLowerCase().includes(normalizedQuery) ||
        form.description?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [formsWithStatus, query, statusFilter]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your forms and their status.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/dashboard/forms">
                <Plus className="size-4" />
                New form
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="rounded-lg border-destructive/40">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error.message}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-3 @4xl/main:grid-cols-4">
          <Metric
            label="Total"
            value={stats.total}
            tone="total"
            isLoading={isLoading}
            isSelected={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <Metric
            label="Active"
            value={stats.active}
            tone="active"
            isLoading={isLoading}
            isSelected={statusFilter === "active"}
            onClick={() => setStatusFilter("active")}
          />
          <Metric
            label="Draft"
            value={stats.draft}
            tone="draft"
            isLoading={isLoading}
            isSelected={statusFilter === "draft"}
            onClick={() => setStatusFilter("draft")}
          />
          <Metric
            label="Idle"
            value={stats.idle}
            tone="idle"
            isLoading={isLoading}
            isSelected={statusFilter === "idle"}
            onClick={() => setStatusFilter("idle")}
          />
        </div>

        <Card className="rounded-lg">
          <CardHeader className="gap-4 border-b">
            <div className="flex flex-col gap-3 @3xl/main:flex-row @3xl/main:items-start @3xl/main:justify-between">
              <div>
                <CardTitle>Forms</CardTitle>
                <CardDescription>Filter by status or search by title.</CardDescription>
              </div>
              <div className="relative w-full @3xl/main:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search forms"
                  className="pl-9"
                />
              </div>
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <TabsList className="grid w-full grid-cols-4 @3xl/main:w-fit">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="idle">Idle</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <DashboardLoadingRows />
            ) : filteredForms.length === 0 ? (
              <div className="flex flex-col items-center p-8 text-center">
                <EmptyFormsIllustration className="mb-4 h-24 w-32 text-muted-foreground" />
                <p className="font-medium">No forms found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a form or change the current filters.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Form</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last activity</TableHead>
                    <TableHead className="px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="max-w-[420px] px-6">
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/forms/${form.id}`}
                            className="font-medium hover:underline"
                          >
                            {form.title}
                          </Link>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {form.description || "No description added"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("rounded-md", statusClassNames[form.status])}
                        >
                          {statusLabels[form.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDate(form.lastActivity)}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/dashboard/forms/${form.id}/submission`}>Responses</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  isLoading,
  isSelected,
  onClick,
}: {
  label: string;
  value: number;
  tone: MetricTone;
  isLoading: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="text-left" onClick={onClick} disabled={isLoading}>
      <Card
        className={cn(
          "rounded-lg transition-colors hover:border-primary/40 hover:bg-muted/30",
          isSelected && "border-primary/50 bg-primary/5"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {isLoading ? "-" : value}
            </CardTitle>
          </div>
          <MetricIllustration tone={tone} className="h-10 w-14 shrink-0" />
        </CardHeader>
      </Card>
    </button>
  );
}

function DashboardLoadingRows() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

function MetricIllustration({
  tone,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  tone: MetricTone;
}) {
  const classes: Record<MetricTone, { stroke: string; fill: string; soft: string }> = {
    total: {
      stroke: "stroke-primary",
      fill: "fill-primary",
      soft: "fill-primary/10",
    },
    active: {
      stroke: "stroke-emerald-500",
      fill: "fill-emerald-500",
      soft: "fill-emerald-500/10",
    },
    draft: {
      stroke: "stroke-amber-500",
      fill: "fill-amber-500",
      soft: "fill-amber-500/10",
    },
    idle: {
      stroke: "stroke-muted-foreground/60",
      fill: "fill-muted-foreground/60",
      soft: "fill-muted",
    },
  };
  const colors = classes[tone];

  return (
    <svg viewBox="0 0 72 48" fill="none" aria-hidden="true" {...props}>
      <rect x="6" y="8" width="60" height="32" rx="8" className={colors.soft} />
      <path
        d="M14 32h44"
        className="stroke-muted-foreground/20"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="16" y="23" width="7" height="9" rx="2" className={colors.fill} opacity="0.45" />
      <rect x="28" y="18" width="7" height="14" rx="2" className={colors.fill} opacity="0.65" />
      <rect
        x="40"
        y={tone === "idle" ? "22" : tone === "draft" ? "16" : "13"}
        width="7"
        height={tone === "idle" ? "10" : tone === "draft" ? "16" : "19"}
        rx="2"
        className={colors.fill}
        opacity="0.85"
      />
      <path
        d={
          tone === "idle"
            ? "M15 18c8 4 14 4 21 2 7-3 12-1 20 3"
            : tone === "draft"
              ? "M15 27c8-5 14-6 21-3 7 3 12 0 20-7"
              : "M15 29c8-9 14-10 21-7 7 2 12-6 20-12"
        }
        className={colors.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyFormsIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" {...props}>
      <rect x="34" y="18" width="92" height="84" rx="10" className="fill-muted stroke-border" />
      <rect x="50" y="36" width="60" height="8" rx="4" className="fill-background" />
      <rect x="50" y="54" width="44" height="7" rx="3.5" className="fill-background" />
      <rect x="50" y="71" width="52" height="7" rx="3.5" className="fill-background" />
      <circle cx="118" cy="28" r="14" className="fill-primary/10 stroke-primary/25" />
      <path d="M112 28h12M118 22v12" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 104h110" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
