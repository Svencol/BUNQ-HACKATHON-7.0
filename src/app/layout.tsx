import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Financial Assistant",
  description: "Should you buy it? Get a smart recommendation based on your spending habits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
