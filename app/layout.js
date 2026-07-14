import "./globals.css";

export const metadata = {
  title: "SQL Practice Dashboard",
  description: "Interactive PostgreSQL practice dashboard backed by Neon.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
