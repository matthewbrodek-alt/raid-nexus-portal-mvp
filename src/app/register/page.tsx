import { Suspense } from "react";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthFormShell mode="register">
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthFormShell>
  );
}
