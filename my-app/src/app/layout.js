import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../context/Web3Context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Supply Chain Management",
  description: "Blockchain-based supply chain management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
