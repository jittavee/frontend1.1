import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Import Navbar // Import Footer
import Footer2 from "@/components/Footer2"; // Import Footer
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FriendFinder App",
   keywords: [
    "I Care",
    "เพื่อนกัน",
    "หาเพื่อนเที่ยว",
    "ทำธุระ",
    "ขับรถ",
    "ทานข้าว",
    "ปรึกษาพูดคุย",
  ],
  description: "Find new friends for your activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <Navbar /> {/*  Navbar จะอยู่ด้านบนสุดของทุกหน้า */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer2 /> {/* Footer จะอยู่ด้านล่างสุดของทุกหน้า */}
        {/* <Footer /> Footer จะอยู่ด้านล่างสุดของทุกหน้า */}
      </body>
    </html>
  );
}