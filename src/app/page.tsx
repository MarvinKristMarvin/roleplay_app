"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [characterName, setCharacterName] = useState("");
  return (
    <main className="HomePage">
      <Image
        src="/jdrbackground.jpg"
        alt="background image"
        fill
        priority
        unoptimized={true}
        className="background"
      />
      <div className="menu">
        <input
          type="text"
          placeholder="Nom du personnage"
          onChange={(e) => setCharacterName(e.target.value)}
        />
        <Link href={`/${characterName}`}>
          <button>Connexion</button>
        </Link>
      </div>
    </main>
  );
}
