import type { SignInCredentials } from "@ecommerce-mf/types";
import { LogIn, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "./Button";

export type AuthPanelProps = {
  description?: string;
  error?: string;
  isPending?: boolean;
  onSignIn: (credentials: SignInCredentials) => Promise<void> | void;
  title?: string;
};

export function AuthPanel({
  description,
  error,
  isPending = false,
  onSignIn,
  title = "Sign in",
}: AuthPanelProps) {
  const [credentials, setCredentials] = useState<SignInCredentials>({
    email: "",
    password: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSignIn(credentials);
  };

  return (
    <section className="auth-panel">
      <div className="auth-panel-header">
        <div className="auth-panel-icon">
          <ShieldCheck aria-hidden="true" size={22} />
        </div>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="username"
            onChange={(event) =>
              setCredentials({
                ...credentials,
                email: event.target.value,
              })
            }
            required
            type="email"
            value={credentials.email}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            minLength={8}
            onChange={(event) =>
              setCredentials({
                ...credentials,
                password: event.target.value,
              })
            }
            required
            type="password"
            value={credentials.password}
          />
        </label>

        <Button disabled={isPending} icon={<LogIn aria-hidden="true" size={16} />} type="submit">
          {isPending ? "Signing in" : "Sign in"}
        </Button>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
