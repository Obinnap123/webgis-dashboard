"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CreateUserInput } from "@/types";
import { ArrowLeft } from "lucide-react";
import * as z from "zod";

const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().optional(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["ADMIN", "STAFF"], { message: "Invalid role selected" }),
});

export default function NewUserPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    setIsLoading(true);

    try {
      const validationResult = createUserSchema.safeParse({
        email,
        name: name || undefined,
        password,
        role: role as "ADMIN" | "STAFF",
      });

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      const userData: CreateUserInput = validationResult.data;

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to create user");
        return;
      }

      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-600 mt-2">Create a new team member account</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={validationErrors.email}
              />

              <Input
                label="Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={validationErrors.name}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={validationErrors.password}
              />

              <Select
                label="Role"
                value={role}
                onChange={(value) => setRole(value)}
                options={[
                  { value: "STAFF", label: "Staff" },
                  { value: "ADMIN", label: "Admin" },
                ]}
                error={validationErrors.role}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="default"
                  isLoading={isLoading}
                  disabled={isLoading || Object.keys(validationErrors).length > 0}
                >
                  Create User
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/admin/users")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
