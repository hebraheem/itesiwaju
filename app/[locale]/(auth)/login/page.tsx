import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Itesiwaju",
  description: "Login to your Itesiwaju account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <LoginForm />
    </div>
  );
}
