import Link from "next/link";
import type { UseFormRegister } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

type SigninFormValues = {
  email: string;
  password: string;
};

type SigninFormProps = React.ComponentProps<"form"> & {
  errorMessage?: string;
  isGoogleSubmitting?: boolean;
  isSubmitting?: boolean;
  onGoogleClick?: () => void;
  register: UseFormRegister<SigninFormValues>;
};

export function SigninForm({
  className,
  errorMessage,
  isGoogleSubmitting,
  isSubmitting,
  onGoogleClick,
  register,
  ...props
}: SigninFormProps) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in with your email and password
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            {...register("email")}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
              tabIndex={-1}
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            {...register("password")}
          />
        </Field>

        {errorMessage ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            disabled={isGoogleSubmitting || isSubmitting}
            onClick={onGoogleClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            {isGoogleSubmitting ? "Redirecting..." : "Sign in with Google"}
          </Button>
          <FieldDescription className="px-6 text-center">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
