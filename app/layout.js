import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "SQL Practice Dashboard",
  description: "Interactive PostgreSQL practice dashboard backed by Neon.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="sk">
      <body>{children}</body>
    </html>
    </ClerkProvider>
  );
}
