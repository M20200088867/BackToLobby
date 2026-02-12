import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/layout/page-transition";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mesh-gradient min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
