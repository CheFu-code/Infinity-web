import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://infinity.chefu.co.za"),
  title: "Infinity | Make space for more",
  description: "A focused number game for the moments between everything else.",
  icons: { icon: "/infinity-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
