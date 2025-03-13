"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Select from "react-select";
import { StylesConfig } from "react-select";
import { useEffect, useRef } from "react";

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
  { value: "Inventaire", label: "Inventaire" },
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
    marginBottom: "0.75rem",
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

  const [character, setCharacter] = useState({
    name: "Barus",
    level: 7,
    experience: 50,
    actuallife: 32,
    resurrections: 3,
    riels: 156,
    actualslots: 6,
    description: "My description",
    skillpoints: 3,
    traits: [
      {
        name: "Trait 1",
        description: "Trait 1 description",
      },
      {
        name: "Trait 2",
        description: "Trait 2 description",
      },
    ],
    items: [
      {
        name: "Chaussettes puantes",
        description: "+4 VIE, -2 Charisme",
        category: "Pieds",
        slots: "1",
      },
      {
        name: "Bracelet de guerre",
        description: "+5 VIE, +2 FOR, +1 Charisme",
        category: "Accessoire",
        slots: "1",
      },
      {
        name: "Marteau-matique",
        description: "+4 MARTEAU, +2 FOR, +3 AGI, 30% de chance de réattaquer",
        category: "Mains",
        slots: "4",
      },
      {
        name: "Oeil de crabi-crabou",
        description: "",
        category: "Inventaire",
        slots: "1",
      },
      {
        name: "Plume de phénix",
        description: "",
        category: "Inventaire",
        slots: "0",
      },
    ],
    stats: [
      {
        name: "VIE",
        base: 45,
        value: 60,
      },
      {
        name: "FOR",
        base: 5,
        value: 9,
      },
      {
        name: "AGI",
        base: 5,
        value: 10,
      },
      {
        name: "INT",
        base: 5,
        value: 10,
      },
      {
        name: "SLOT",
        base: 0,
        value: 8,
      },
    ],
    skills: [
      {
        name: "Coup de marteau",
        level: 3,
        description:
          "Inflige (FOR + MARTEAU) dégats. 3% de chance d'assomer par force supérieure",
      },
      {
        name: "Carapace",
        level: 2,
        description: "Donne +8 ARMURE jusqu'au prochain tour",
      },
    ],
  });

  const [tab, setTab] = useState("skills");

  const [openedModal, setOpenedModal] = useState("");
  const [modalInfos, setModalInfos] = useState<
    | { type: "trait"; name: string; description: string }
    | {
        type: "item";
        name: string;
        description: string;
        category: string;
        slots: number;
      }
    | { type: "skill"; name: string; description: string; level: number }
    | { type: "stat"; name: string; base: number; value: number }
    | null
  >(null);

  // isClient only true when on client, this condition prevents mismatches SSR/CSR
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [selectedSlot, setSelectedSlot] = useState<OptionType | null>(null);
  const [selectedType, setSelectedType] = useState<OptionType | null>(
    optionsType[0]
  );

  // Handles input focus, cursor at the end
  const refs = {
    level: useRef<HTMLInputElement>(null),
    XP: useRef<HTMLInputElement>(null),
    life: useRef<HTMLInputElement>(null),
    resurrections: useRef<HTMLInputElement>(null),
    riels: useRef<HTMLInputElement>(null),
  };
  const handleFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      const length = ref.current.value.length;
      ref.current.setSelectionRange(length, length);
    }
  };

  const handleSave = () => {
    if (!modalInfos) return; // Prevent errors if modalInfos is null

    const name = (document.getElementById("trait_name") as HTMLInputElement)
      .value;
    const description = (
      document.getElementById("trait_description") as HTMLInputElement
    ).value;

    setCharacter((prev) => ({
      ...prev,
      traits: prev.traits.map((trait) =>
        trait.name === modalInfos.name ? { ...trait, name, description } : trait
      ),
    }));

    setOpenedModal(""); // Close modal
  };

  return (
    <main className="NamePage">
      <header className="main_header">
        <div
          className="name_and_level"
          onClick={() => setOpenedModal("modify_experience")}
        >
          <h1>{name}</h1>
          <span className="lvl">{character.level}</span>
        </div>
        <div
          className="experience"
          onClick={() => setOpenedModal("modify_experience")}
        >
          <div
            className="experience_bar"
            style={{ width: `${character.experience}%` }}
          ></div>
        </div>
        <div
          className="life_and_resurrection"
          onClick={() => setOpenedModal("modify_infos")}
        >
          <div className="life">
            <Image
              src="/heart5-Photoroom.png"
              alt="heart"
              width={36}
              height={36}
            />
            <span className="hp">
              {character.actuallife} /{" "}
              {character.stats.find((stat) => stat.name === "VIE")?.value}
            </span>
          </div>

          <div className="resurrection">
            <Image
              src="/star5-Photoroom.png"
              alt="star"
              width={36}
              height={36}
            />
            <span className="current_resurrection">
              {character.resurrections}
            </span>
          </div>
        </div>
        <header
          className="inventory_header"
          onClick={() => setOpenedModal("modify_infos")}
        >
          <div className="gold">
            <Image
              src="/coin5-Photoroom.png"
              alt="gold"
              width={36}
              height={36}
            />
            <span>{character.riels}</span>
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
          <div
            className="description_text"
            onClick={() => setOpenedModal("modify_description")}
          >
            <p>{character.description}</p>
          </div>
          <div className="traits">
            {character.traits.map((trait, index) => (
              <p
                key={index}
                className="trait"
                onClick={() => {
                  setOpenedModal("modify_trait");
                  setModalInfos({
                    type: "trait",
                    name: trait.name,
                    description: trait.description,
                  });
                }}
              >
                &#9671; {trait.name} : {trait.description}
              </p>
            ))}
            <button onClick={() => setOpenedModal("create_trait")}>+</button>
          </div>
        </>
      ) : (
        ""
      )}

      {tab === "inventory" ? (
        <>
          <div className="items">
            {character.items
              .slice() // Create a shallow copy to avoid mutating state
              .sort((a, b) => {
                const order = [
                  "Inventaire",
                  "Mains",
                  "Main",
                  "Tête",
                  "Buste",
                  "Jambes",
                  "Pieds",
                  "Sac",
                  "Accessoire",
                ];

                // First, sort by type according to the predefined order
                const typeOrderA = order.indexOf(a.category);
                const typeOrderB = order.indexOf(b.category);

                if (typeOrderA !== typeOrderB) {
                  return typeOrderA - typeOrderB;
                }

                // If both items are "Inventaire", sort by slots in ascending order
                if (
                  a.category === "Inventaire" &&
                  b.category === "Inventaire"
                ) {
                  return parseInt(a.slots) - parseInt(b.slots);
                }

                return 0;
              })
              .map((item, index) => (
                <div
                  key={index}
                  className="item"
                  onClick={() => setOpenedModal("modify_item")}
                >
                  <div className="name_and_slot">
                    <p className="name">{item.name}</p>
                    {item.category === "Inventaire" && (
                      <span>{item.slots}</span>
                    )}
                    {item.category === "Main" && (
                      <span>
                        <Image
                          src="/icons/palm-of-hand.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Mains" && (
                      <span>
                        <Image
                          src="/icons/hands.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Tête" && (
                      <span>
                        <Image
                          src="/icons/head.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Buste" && (
                      <span>
                        <Image
                          src="/icons/fashion.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Jambes" && (
                      <span>
                        <Image
                          src="/icons/pants.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Pieds" && (
                      <span>
                        <Image
                          src="/icons/boots.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Sac" && (
                      <span>
                        <Image
                          src="/icons/backpack.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                    {item.category === "Accessoire" && (
                      <span>
                        <Image
                          src="/icons/necklace.png"
                          alt=""
                          width={20}
                          height={20}
                          className="icon"
                        />
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="infos">{item.description}</p>
                  )}
                </div>
              ))}

            <button onClick={() => setOpenedModal("create_item")}>+</button>
          </div>
        </>
      ) : (
        ""
      )}
      {tab === "stats" ? (
        <>
          <div className="stats_container">
            {character.stats
              .slice() // Create a shallow copy to avoid modifying state directly
              .sort((a, b) => {
                const aIsUpper = /^[A-Z]+$/.test(a.name) ? 1 : 0; // Convert boolean to number
                const bIsUpper = /^[A-Z]+$/.test(b.name) ? 1 : 0; // Convert boolean to number
                return bIsUpper - aIsUpper; // Sort uppercase first
              })
              .map((stat, index) => (
                <div
                  key={index}
                  className="stat"
                  onClick={() => setOpenedModal("modify_stat")}
                >
                  <div className="name_and_value">
                    <p className="stat_name">{stat.name}</p>
                    <p className="stat_value">{stat.value}</p>
                  </div>
                </div>
              ))}
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
            />
            <p className="skills_points">4</p>
          </header>

          <div className="skills_container">
            {character.skills
              .slice() // Create a shallow copy to avoid modifying state directly
              .sort((a, b) => b.level - a.level) // Sort in descending order (higher levels first)
              .map((skill, index) => (
                <div
                  key={index}
                  className="skill"
                  onClick={() => setOpenedModal("modify_skill")}
                >
                  <div className="name_and_level">
                    <p className="skill_name">{skill.name}</p>
                    <p className="skill_level">{skill.level}</p>
                  </div>
                  <p className="skill_description">{skill.description}</p>
                </div>
              ))}
          </div>

          <button
            className="skill_button"
            onClick={() => setOpenedModal("create_skill")}
          >
            +
          </button>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY EXPERIENCE*/}
      {isClient && openedModal === "modify_experience" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Experience</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <div className="input_container">
                  <input
                    type="text"
                    defaultValue={character.level}
                    ref={refs.level}
                    onFocus={() => handleFocus(refs.level)}
                  />
                  <span>Niveau</span>
                </div>
                <div className="input_container">
                  <input
                    type="text"
                    defaultValue={character.experience}
                    ref={refs.XP}
                    onFocus={() => handleFocus(refs.XP)}
                  />
                  <span>XP</span>
                </div>

                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY INFOS*/}
      {isClient && openedModal === "modify_infos" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Horgrim</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <div className="input_container">
                  <input
                    type="text"
                    defaultValue={character.actuallife}
                    ref={refs.life}
                    onFocus={() => handleFocus(refs.life)}
                  />

                  <span>
                    <Image
                      src="/heart5-Photoroom.png"
                      alt="heart"
                      width={22}
                      height={22}
                    ></Image>
                  </span>
                </div>
                <div className="input_container">
                  <input
                    type="text"
                    defaultValue={character.resurrections}
                    ref={refs.resurrections}
                    onFocus={() => handleFocus(refs.resurrections)}
                  />
                  <span>
                    {" "}
                    <Image
                      src="/star5-Photoroom.png"
                      alt="star"
                      width={22}
                      height={22}
                    ></Image>
                  </span>
                </div>
                <div className="input_container">
                  <input
                    type="text"
                    defaultValue={character.riels}
                    ref={refs.riels}
                    onFocus={() => handleFocus(refs.riels)}
                  />
                  <span>
                    {" "}
                    <Image
                      src="/coin5-Photoroom.png"
                      alt="coin"
                      width={22}
                      height={22}
                    ></Image>
                  </span>
                </div>
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY DESCRIPTION*/}
      {isClient && openedModal === "modify_description" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Description</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <textarea
                  placeholder=""
                  defaultValue={character.description}
                  rows={15}
                />
                <button className="modal_button confirm margintop">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY TRAIT*/}
      {isClient &&
      openedModal === "modify_trait" &&
      modalInfos?.type === "trait" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Modifier aptitude</p>
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
                  defaultValue={modalInfos.name}
                  placeholder="Aptitude"
                  id="trait_name"
                />
                <input
                  type="text"
                  defaultValue={modalInfos.description}
                  placeholder="Bonus"
                  id="trait_description"
                />
                <button className="modal_button delete margintop">
                  SUPPRIMER
                </button>
                <button className="modal_button confirm" onClick={handleSave}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL CREATE TRAIT*/}
      {isClient && openedModal === "create_trait" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Nouvelle aptitude</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" placeholder="Aptitude" />
                <input type="text" placeholder="Bonus" />
                <button className="modal_button confirm margintop">OK</button>
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
                <p className="modal_title">Modifier objet</p>
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
                    styles={customStyles}
                  />
                </div>
                <textarea placeholder="Description" rows={3} />

                <button className="modal_button delete">SUPPRIMER</button>
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
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
                <p className="modal_title">Nouvel objet</p>
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
                <textarea placeholder="Description" rows={3} />
                <button className="modal_button confirm margintop">OK</button>
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
                <button className="modal_button confirm margintop">OK</button>
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
                <button className="modal_button confirm margintop">OK</button>
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
                <textarea
                  placeholder="Description"
                  defaultValue={"Ma formule mathématique"}
                  rows={3}
                />
                <button className="modal_button delete margintop">
                  SUPPRIMER
                </button>
                <button className="modal_button confirm">OK</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL CREATE SKILL */}
      {isClient && openedModal === "create_skill" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Nouvelle compétence</p>
                <button
                  className="modal_button_close"
                  onClick={() => setOpenedModal("")}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <input type="text" placeholder="Nom" />
                <input type="text" placeholder="Niveau" />
                <textarea placeholder="Description" rows={3} />
                <button className="modal_button confirm margintop">OK</button>
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
