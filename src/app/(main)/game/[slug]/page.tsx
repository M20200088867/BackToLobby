import { Gamepad2 } from "lucide-react";

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="glass p-8 rounded-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Gamepad2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{slug.replace(/-/g, " ")}</h1>
      </div>
      <p className="text-muted-foreground">
        Game detail page — cover art, metadata, pricing, and reviews coming
        soon.
      </p>
    </div>
  );
}
