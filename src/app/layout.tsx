import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadsArk | Enterprise CRM",
  description: "Enterprise CRM",
};

import { AuthProvider } from "@/hooks/useAuth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen font-inter font-body-md text-on-surface bg-[#F8FAFC]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
