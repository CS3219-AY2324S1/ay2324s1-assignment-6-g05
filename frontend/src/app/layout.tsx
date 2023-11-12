import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import { Providers } from "../contexts/providers";
import NavBar from "@/components/common/NavBar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PeerPrep",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen bg-background" suppressHydrationWarning={true}>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
