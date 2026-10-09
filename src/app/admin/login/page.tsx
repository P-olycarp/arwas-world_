import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await readSession()) redirect("/admin");
  return (
    <main id="main" className="admin grid min-h-dvh place-items-center px-4">
      <div className="card w-full max-w-[400px] rounded-panel p-8">
        <h1 className="mb-6">Admin sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
