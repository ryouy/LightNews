import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newslight",
  description:
    "軽量Yahoo!ニュース一覧とウェザーニュースの天気",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-white text-neutral-900 antialiased">
        <div className="mx-auto max-w-lg">
          <SiteNav />
        </div>
        {children}
      </body>
    </html>
  );
}
