import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "CASTER101 - Chia Token Market",
  description: "Emoji market for Chia and Base tokens by aWizard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ position: 'relative', overflow: 'hidden' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
