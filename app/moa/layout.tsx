import "../globals.css";
import Head from "next/head";
import type { Metadata } from "next";
import { Header } from "./components/header";

export const metadata: Metadata = {
  title: "MOA Management Platform",
  description: "Manage company MOAs",
  // icons: {
  //   icon: "/BetterInternshipLogo.ico",
  // },
};

/**
 * Hire root layout
 *
 * @component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HTMLContent>{children}</HTMLContent>;
}

/**
 * I don't like overly-nested components lol.
 *
 * @component
 */
const HTMLContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  "use client";

  return (
    <html lang="en" className="min-w-fit w-full h-[100vh] overflow-hidden">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="h-full w-full min-h-screen overflow-hidden ">
        <main className="flex flex-col items-center w-full">
          <Header></Header>
          <div className="flex-1">{children}</div>
        </main>
      </body>
    </html>
  );
};
