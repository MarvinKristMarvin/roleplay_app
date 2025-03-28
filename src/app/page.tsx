"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [characterName, setCharacterName] = useState("");

  // Format the URL by replacing spaces with underscores
  const getFormattedUrl = (name: string) => {
    return `/${name.replace(/ /g, "_")}`;
  };

  useEffect(() => {
    // Scroll to bottom of page on initial load
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  return (
    <main className="HomePage">
      <div className="bg_container">
        {" "}
        <Image
          src="/jdrbackground.jpg"
          alt="background image"
          fill={true} // Ensure the image covers the entire viewport with priority
          unoptimized={true}
          className="background"
          priority
        />
      </div>

      <div className="menu">
        <input
          type="text"
          placeholder="Nom du personnage"
          onChange={(e) => setCharacterName(e.target.value)}
          value={characterName}
          maxLength={17}
        />
        <Link href={getFormattedUrl(characterName)}>
          <button>Connexion</button>
        </Link>
      </div>
    </main>
  );
}
