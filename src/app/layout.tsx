import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyReply",
  description: "Student emails summarized, checked against the professor's rules, and answered with one decision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
