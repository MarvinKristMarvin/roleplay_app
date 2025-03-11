import type { Metadata } from "next";
import { Merienda, Short_Stack, Gamja_Flower } from "next/font/google";
import "./globals.scss";

/*const merienda = Merienda({
  variable: "--font-merienda",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});*/

const merienda = Merienda({
  variable: "--font-merienda",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const shortStack = Short_Stack({
  variable: "--font-shortStack",
  subsets: ["latin"],
  weight: ["400"],
});

const gamjaFlower = Gamja_Flower({
  variable: "--font-gamjaFlower",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "JDR DE MAAARV",
  description:
    "Application de jeu de rôle, avec fiches de personnages, profil, inventaire, stats et compétences. Base de données. JDR DE MAAAAAAARV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merienda.variable} ${shortStack.variable} ${gamjaFlower.variable}`}
      >
        <div className="App"> {children}</div>
      </body>
    </html>
  );
}
