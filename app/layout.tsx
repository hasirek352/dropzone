import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DROPZONE — Open Your Next",
  description: "Premium case opening and Case Battle community."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}
