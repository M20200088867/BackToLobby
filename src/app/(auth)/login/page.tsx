import { Gamepad2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mesh-gradient min-h-screen flex items-center justify-center p-4">
      <div className="glass p-8 rounded-3xl max-w-md w-full text-center space-y-6">
        <Gamepad2 className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground">
          Login with Google or Steam to start your gaming diary.
        </p>
      </div>
    </div>
  );
}
