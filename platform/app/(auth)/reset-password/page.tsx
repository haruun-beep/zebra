import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reset Password — Zebra Landscaping" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zebra-green-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zebra-green mb-4">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-zebra-green-deep">Reset Password</h1>
          <p className="text-muted-foreground mt-1">Enter your email to receive a reset link</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
