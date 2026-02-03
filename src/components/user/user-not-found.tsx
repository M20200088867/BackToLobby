import Link from "next/link";
import { UserX } from "lucide-react";

export function UserNotFound() {
  return (
    <div className="glass p-8 rounded-3xl max-w-md mx-auto text-center space-y-4">
      <UserX className="h-12 w-12 mx-auto text-muted-foreground" />
      <h1 className="text-2xl font-bold">User not found</h1>
      <p className="text-muted-foreground">
        This user doesn&apos;t exist or their profile hasn&apos;t been set up yet.
      </p>
      <Link
        href="/"
        className="inline-block text-sm text-primary hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
