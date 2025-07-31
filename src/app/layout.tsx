import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MBAYA_CODE_CONTEST",
  description: "MBAYA_CODE_CONTEST edition 3",
  icons: {
    icon: "logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <div className="mt-15 text-sm text-center text-gray-600">
          <Link href="/conditions" className="text-blue-500 hover:underline">
            Conditions
          </Link>
          <p className="mt-2">
            © {new Date().getFullYear()} MBAYA CODE CONTEST. All rights
            reserved.
          </p>
          <p className="mt-2">Made by me | +241 02 35 31 34</p>
        </div>
      </body>
    </html>
  );
}
