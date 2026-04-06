import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newslight — Yahoo!ニュース",
  description:
    "通信量を抑えた Yahoo!ニュース一覧。広告・余計なスクリプトなしで閲覧できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
