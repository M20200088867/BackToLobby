export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="glass p-8 rounded-3xl space-y-4">
      <h1 className="text-3xl font-bold">@{username}</h1>
      <p className="text-muted-foreground">
        User profile — bio, platform badges, gaming diary, and stats coming
        soon.
      </p>
    </div>
  );
}
