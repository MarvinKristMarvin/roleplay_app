"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function NamePage() {
  const { name } = useParams();
  const [tab, setTab] = useState("skills");
  const [modal, setModal] = useState(true);

  return (
    <main className="NamePage">
      <header className="main_header">
        <div className="name_and_level">
          <h1>{name}</h1>
          <span className="lvl">12</span>
        </div>
        <div className="experience">
          <div className="experience_bar"></div>
        </div>
        <div className="life_and_resurrection">
          <div className="life">
            <Image
              src="/heart5-Photoroom.png"
              alt="heart"
              width={36}
              height={36}
            />
            <span className="hp">50 / 114</span>
          </div>

          <div className="resurrection">
            <Image
              src="/star5-Photoroom.png"
              alt="star"
              width={36}
              height={36}
            />
            <span className="current_resurrection">5</span>
          </div>
        </div>
        <header className="inventory_header">
          <div className="gold">
            <Image
              src="/coin5-Photoroom.png"
              alt="gold"
              width={36}
              height={36}
            />
            <span>132</span>
          </div>
          <div className="slots">
            <Image
              src="/box4-Photoroom.png"
              alt="gold"
              width={36}
              height={36}
            />
            <span>12 / 14</span>
          </div>
        </header>
        <div className="tabs">
          <div className="description" onClick={() => setTab("description")}>
            <Image
              src="/fiche1-Photoroom.png"
              alt="description"
              width={60}
              height={60}
              className={tab === "description" ? "selected" : ""}
            />
            <span>description</span>
          </div>
          <div className="inventory" onClick={() => setTab("inventory")}>
            <Image
              src="/inventory3-Photoroom.png"
              alt="inventory"
              width={60}
              height={60}
              className={tab === "inventory" ? "selected" : ""}
            />
            <span>inventory</span>
          </div>
          <div className="stats" onClick={() => setTab("stats")}>
            <Image
              src="/dice4-Photoroom.png"
              alt="stats"
              width={60}
              height={60}
              className={tab === "stats" ? "selected" : ""}
            />
            <span>stats</span>
          </div>
          <div className="skills" onClick={() => setTab("skills")}>
            <Image
              src="/competences2-Photoroom.png"
              alt="skills"
              width={60}
              height={60}
              className={tab === "skills" ? "selected" : ""}
            />
            <span>skills</span>
          </div>
        </div>
      </header>

      {/* DESCRIPTION */}
      {tab === "description" ? (
        <>
          <div className="description_text">
            <p>
              Voici ma longue description, avec des longues lignes qui
              retournent à la ligne puis des lignes qui sautent Genre ici Et
              double la
            </p>
          </div>
          <div className="traits">
            <p>&#9671; Altruiste (+2 Aide)</p>
            <p>&#9671; Sage (+1 INT, +1 Réflexion)</p>
            <p>&#9671; Maladroit (-1 AGI, -1 Agilité)</p>
            <button>+</button>
          </div>
        </>
      ) : (
        ""
      )}

      {tab === "inventory" ? (
        <>
          <div className="items">
            <button>+</button>

            <div className="item">
              <div className="name_and_slot">
                <p className="name">Oeil de crabe géant</p>
                <span>1</span>
              </div>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Sifflet runique</p>
                <span>1</span>
              </div>
              <p className="infos">Appelle la voile runique</p>
            </div>

            <div className="item">
              <div className="name_and_slot">
                <p className="name">Marteau en plomb lourd</p>
                <span>5</span>
              </div>
              <p className="infos">+12 ARME, +4 FOR, -1 SLOTS</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Epée en cornes de griffon à plumes roses</p>
                <span>
                  <Image
                    src="/icons/hands.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>

              <p className="infos">+10 ARME, +4 FOR, +10 VIE</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Chapeau délabré</p>
                <span>
                  <Image
                    src="/icons/head.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>
              <p className="infos">+1 INT, -1 Charisme</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Cuirasse souple</p>
                <span>
                  <Image
                    src="/icons/fashion.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>
              <p className="infos">+5 VIE, +1 AGI</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Pantalon en cuir</p>
                <span>
                  <Image
                    src="/icons/pants.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>
              <p className="infos">+5 VIE, +3 SLOTS</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Bottes en cuir</p>
                <span>
                  <Image
                    src="/icons/boots.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>
              <p className="infos">+5 VIE, +2 AGI</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Sac en toile</p>
                <span>
                  <Image
                    src="/icons/backpack.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>
              <p className="infos">+5 SLOTS</p>
            </div>
            <div className="item">
              <div className="name_and_slot">
                <p className="name">Embleme de guerre</p>
                <span>
                  <Image
                    src="/icons/necklace.png"
                    alt=""
                    width={20}
                    height={20}
                    className="icon"
                  />
                </span>
              </div>
              <p className="infos">+10 VIE, +1 Charisme, +1 Courage</p>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {tab === "stats" ? (
        <>
          <div className="stats_container">
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">VIE</p>
                <p className="stat_value">2000</p>
              </div>
            </div>
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">FOR</p>
                <p className="stat_value">8</p>
              </div>
            </div>
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">AGI</p>
                <p className="stat_value">19</p>
              </div>
            </div>
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">INT</p>
                <p className="stat_value">10</p>
              </div>
            </div>
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">SLOT</p>
                <p className="stat_value">6</p>
              </div>
            </div>
          </div>
          <div className="stats_container">
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">Chance</p>
                <p className="stat_value">2</p>
              </div>
            </div>
            <div className="stat">
              <div className="name_and_value">
                <p className="stat_name">Esquive</p>
                <p className="stat_value">-1</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {tab === "skills" ? (
        <>
          <header className="skills_header">
            <Image
              src="/icons/cube.png"
              alt="dice"
              width={22}
              height={22}
              className="icon"
            ></Image>
            <p className="skills_points">4</p>
          </header>
          <div className="skills_container">
            <div className="skill">
              <div className="name_and_level">
                <p className="skill_name">Coup de marteau</p>
                <p className="skill_level">3</p>
              </div>
              <p className="skill_description">
                Inflige (1 for + 0.5 agi + 1.5 epee) = 20 dégâts. Stun dans 20%
                des cas environ selon la différence de force.
              </p>
            </div>
            <div className="skill">
              <div className="name_and_level">
                <p className="skill_name">Balayage aquatique</p>
                <p className="skill_level">1</p>
              </div>
              <p className="skill_description">
                Inflige (0.5 int + 1 mag + 5) = 18 dégâts. Peut faire tomber.
              </p>
            </div>
          </div>
          <button className="skill_button">+</button>
        </>
      ) : (
        ""
      )}
      {modal === true ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Créer un objet</p>
                <button
                  className="modal_button_close"
                  onClick={() => setModal(false)}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" placeholder="Nom" />
                <select id="slots" name="slots">
                  <option value="" disabled selected>
                    Encombrement
                  </option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                </select>
                <select id="type" name="type">
                  <option value="Ressource">Ressource</option>
                  <option value="Main">Main</option>
                  <option value="Mains">Mains</option>
                  <option value="Tête">Tête</option>
                  <option value="Buste">Buste</option>
                  <option value="Jambes">Jambes</option>
                  <option value="Pieds">Pieds</option>
                  <option value="Sac">Sac</option>
                  <option value="Accessoire">Accessoire</option>
                </select>
                <input type="text" placeholder="Description" />
                <button className="modal_button_confirm">CONFIRMER</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </main>
  );
}
