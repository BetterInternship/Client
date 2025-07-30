"use client";

import Head from "next/head";
import { usePathname } from "next/navigation";
import { Header } from "./components/header";

/**
 * I don't like overly-nested components lol.
 *
 * @component
 */
export const HTMLContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  "use client";
  const pathname = usePathname();

  return (
    <html lang="en" className="min-w-fit w-full h-[100vh] overflow-hidden">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="h-full w-full min-h-screen overflow-hidden ">
        <main className="flex flex-col items-center w-full">
          <Header showUser={!pathname.startsWith("/login")}></Header>
          <div className="flex-1">{children}</div>
        </main>
      </body>
    </html>
  );
};
