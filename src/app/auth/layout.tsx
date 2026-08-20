import type { Metadata } from "next";

// Auth pages are not meant to be indexed by search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
