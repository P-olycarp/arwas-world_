"use client";

import { useState, useTransition, type FormEvent } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error && (
        <p role="alert" className="rounded-card border border-line border-l-4 border-l-oman bg-panel p-3 text-body-lg">
          {error}
        </p>
      )}
      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-body-lg font-semibold">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="password" className="text-body-lg font-semibold">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
