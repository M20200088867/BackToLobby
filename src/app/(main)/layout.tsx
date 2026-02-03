import { Navbar } from "@/components/layout/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mesh-gradient min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">{children}</main>
    </div>
  );
}
