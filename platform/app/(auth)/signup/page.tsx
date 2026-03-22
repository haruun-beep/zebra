import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign Up — Zebra Landscaping" };

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zebra-green-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zebra-green mb-4">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-zebra-green-deep">Zebra Landscaping</h1>
          <p className="text-muted-foreground mt-1">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
