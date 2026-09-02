import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cangErJinKai = localFont({
  src: "./fonts/CangErJinKai-W04.ttf",
  variable: "--font-cang-er-jin-kai",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Woke Soul — 流动盛宴",
  description: "一片流动盛宴，一个充满爱与善良的博客",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${cangErJinKai.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
