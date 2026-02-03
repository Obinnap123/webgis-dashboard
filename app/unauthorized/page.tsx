import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. Please contact an
          administrator if you believe this is a mistake.
        </p>
        <Link href="/dashboard">
          <Button variant="primary" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
