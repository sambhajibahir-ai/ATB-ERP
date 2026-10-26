import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATB ERP • ATB Software Enterprise Management Suite",
  description: "ATB Software Enterprise Resource Planning system powered by Next.js and Neon Serverless PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
