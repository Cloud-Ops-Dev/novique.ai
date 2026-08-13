import type { Metadata } from "next";

// Auth surfaces (login, signup, password flows) must never be indexed.
export const metadata: Metadata = {
  robots: { index: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
