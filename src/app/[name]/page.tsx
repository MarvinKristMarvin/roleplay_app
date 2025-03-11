"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Select from "react-select";
import { StylesConfig } from "react-select";
import { useEffect } from "react";

const optionsSlots = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
];

const optionsType = [
  { value: "Ressource", label: "Ressource" },
  { value: "Main", label: "Main" },
  { value: "Mains", label: "Mains" },
  { value: "Tête", label: "Tête" },
  { value: "Buste", label: "Buste" },
  { value: "Jambes", label: "Jambes" },
  { value: "Pieds", label: "Pieds" },
  { value: "Sac", label: "Sac" },
  { value: "Accessoire", label: "Accessoire" },
];

type OptionType = {
  value: string;
  label: string;
};

// Custom styles for the Select component
const customStyles: StylesConfig<{ value: string; label: string }, false> = {
  control: (provided) => ({
    ...provided,
    border: "4px solid rgb(233, 187, 156)" /* $mediumcolor */,
    color: "#300f00" /* $darkcolor */,
    borderRadius: "0.25rem",
    marginBottom: "0.5rem",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.875rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#300f00", // Dark color for selected text
  }),
  menu: (provided) => ({
    ...provided,
    border: "2px solid rgb(233, 187, 156)", // Medium color for dropdown container
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "darkColor", // Placeholder text color
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#300f00" : "white",
    color: state.isSelected ? "white" : "#300f00",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",

    borderBottom: "1px solid rgb(233, 187, 156)",
  }),
};

export default function NamePage() {
  const { name } = useParams();

  const [tab, setTab] = useState("skills");

  const [openedModal, setOpenedModal] = useState("");

  // isClient only true when on client, this condition prevents mismatches SSR/CSR
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [selectedSlot, setSelectedSlot] = useState<OptionType | null>(null);
  const [selectedType, setSelectedType] = useState<OptionType | null>(null);

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

            <div className="item" onClick={() => setOpenedModal("modify_item")}>
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
            <button onClick={() => setOpenedModal("create_item")}>+</button>
          </div>
        </>
      ) : (
        ""
      )}
      {tab === "stats" ? (
        <>
          <div className="stats_container">
            <div className="stat" onClick={() => setOpenedModal("modify_stat")}>
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
          <header
            className="skills_header"
            onClick={() => setOpenedModal("modify_skillpoints")}
          >
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
            <div
              className="skill"
              onClick={() => setOpenedModal("modify_skill")}
            >
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
      {/* MODAL CREATE ITEM */}
      {isClient && openedModal === "create_item" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Créer un objet</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" placeholder="Nom" />
                <div>
                  <Select
                    options={optionsSlots}
                    value={selectedSlot}
                    onChange={(selectedOption) =>
                      setSelectedSlot(selectedOption)
                    }
                    placeholder="Encombrement"
                    styles={customStyles}
                  />

                  <Select
                    options={optionsType}
                    value={selectedType}
                    onChange={(selectedOption) =>
                      setSelectedType(selectedOption)
                    }
                    placeholder="Type"
                    styles={customStyles}
                  />
                </div>
                <input type="text" placeholder="Description" />
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY ITEM */}
      {isClient && openedModal === "modify_item" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Modifier l&apos;objet</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" placeholder="Nom" />
                <div>
                  <Select
                    options={optionsSlots}
                    value={selectedSlot}
                    onChange={(selectedOption) =>
                      setSelectedSlot(selectedOption)
                    }
                    placeholder="Encombrement"
                    styles={customStyles}
                  />

                  <Select
                    options={optionsType}
                    value={selectedType}
                    onChange={(selectedOption) =>
                      setSelectedType(selectedOption)
                    }
                    placeholder="Type"
                    styles={customStyles}
                  />
                </div>
                <input type="text" placeholder="Description" />
                <button className="modal_button equip">EQUIPER</button>
                <button className="modal_button delete">SUPPRIMER</button>
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY STAT*/}
      {isClient && openedModal === "modify_stat" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Vie de base</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" defaultValue={28} />
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL SKILL POINTS*/}
      {isClient && openedModal === "modify_skillpoints" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Points de compétence</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" defaultValue={4} />
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY SKILL */}
      {isClient && openedModal === "modify_skill" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Modifier compétence</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input
                  type="text"
                  placeholder="Nom"
                  defaultValue={"Balayage aquatique"}
                />
                <input type="text" placeholder="Niveau" defaultValue={2} />
                <input
                  type="text-area"
                  placeholder="Description"
                  defaultValue={"Ma formule mathématique"}
                />
                <button className="modal_button delete">SUPPRIMER</button>
                <button className="modal_button confirm">OK</button>
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
