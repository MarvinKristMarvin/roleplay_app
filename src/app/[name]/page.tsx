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

type Trait = {
  name: string;
  description: string;
};

type Stat = {
  name: string;
  base: number;
  traits: number;
  items: number;
  value: number;
};

type Item = {
  name: string;
  description: string;
  category: string;
  slots: number;
};

type Skill = {
  name: string;
  level: number;
  description: string;
};

type Character = {
  _id: string;
  name: string;
  level: number;
  experience: number;
  actuallife: number;
  resurrections: number;
  riels: number;
  actualslots: number;
  description: string;
  skillpoints: number;
  traits: Trait[];
  items: Item[];
  stats: Stat[];
  skills: Skill[];
};

export default function NamePage() {
  const { name } = useParams();

  const updateStatsFromTraits = (character: Character) => {
    console.log("Updating stats from traits...");
    const statMap = new Map();

    // Copy existing stats to maintain item-based bonuses
    character.stats.forEach((stat: Stat) => {
      statMap.set(stat.name, { ...stat, traits: 0 }); // Reset traits to 0
    });

    // Regex to match "+1 LUCK", "-2 Charisme", etc.
    const statRegex = /([-+]?\d+)\s+([A-Za-zÀ-ÿ]+)/g;

    character.traits.forEach((trait: Trait) => {
      let match;
      while ((match = statRegex.exec(trait.description)) !== null) {
        const value = parseInt(match[1], 10);
        const statName = match[2];

        if (statMap.has(statName)) {
          statMap.get(statName).traits += value;
        } else {
          statMap.set(statName, {
            name: statName,
            base: 0,
            traits: value,
            items: 0,
            value: 0,
          });
        }
      }
    });

    // Convert statMap back to an array
    return {
      ...character,
      stats: Array.from(statMap.values()),
    };
  };

  const updateStatsFromItems = (character: Character) => {
    console.log("Updating stats from items...");
    const statMap = new Map();

    // Copy existing stats to maintain trait-based bonuses
    character.stats.forEach((stat: Stat) => {
      statMap.set(stat.name, { ...stat, items: 0 }); // Reset items to 0
    });

    // Regex to match "+1 LUCK", "-2 Charisme", etc.
    const statRegex = /([-+]?\d+)\s+([A-Za-zÀ-ÿ]+)/g;

    character.items.forEach((item: Item) => {
      // Ignore items in the "Inventaire" category
      if (item.category === "Inventaire") return;

      let match;
      while ((match = statRegex.exec(item.description)) !== null) {
        const value = parseInt(match[1], 10);
        const statName = match[2];

        if (statMap.has(statName)) {
          statMap.get(statName).items += value;
        } else {
          statMap.set(statName, {
            name: statName,
            base: 0,
            traits: 0,
            items: value,
            value: 0,
          });
        }
      }
    });

    // Convert statMap back to an array
    return {
      ...character,
      stats: Array.from(statMap.values()),
    };
  };

  const parseSkillDescriptions = (character: Character) => {
    console.log("Parsing skill descriptions with real stats...");
    // Create a Map of stat values for easy lookup - with lowercase keys
    const statsMap = new Map<string, number>();
    character.stats.forEach((stat) => {
      statsMap.set(
        stat.name.toLowerCase(),
        stat.base + stat.traits + stat.items
      );
    });

    // Function to evaluate formulas
    const evaluateFormula = (formula: string): string => {
      return formula.replace(
        /(\d*\.?\d*)\s*([A-Za-zÀ-ÿ]+)/g,
        (match, multiplier, statName) => {
          const lowerStatName = statName.toLowerCase();
          if (statsMap.has(lowerStatName)) {
            const statValue = statsMap.get(lowerStatName) || 0;
            return multiplier
              ? (parseFloat(multiplier) * statValue).toString()
              : statValue.toString();
          }
          return "???";
        }
      );
    };

    // Process each skill description
    return {
      ...character,
      skills: character.skills.map((skill) => ({
        ...skill,
        description: skill.description.replace(
          /\(([^)]+)\)(?:\s*=\s*-?\d+|\s*=\s*(?:ERROR|\?\?\?))?/g, // Updated to match both ERROR and ???
          (match, formula) => {
            const evaluatedFormula = evaluateFormula(formula);
            try {
              const result = Math.round(eval(evaluatedFormula));
              return isNaN(result)
                ? `(${formula}) = ???`
                : `(${formula}) = ${result}`;
            } catch {
              return `(${formula}) = ???`;
            }
          }
        ),
      })),
    };
  };

  // Usage: Call this function whenever traits change
  /*const setCharacterStatsStatTraitsUpdate = (newCharacter: Character) => {
    setCharacter(updateStatsFromTraits(newCharacter));
  };*/

  const [character, setCharacter] = useState({
    _id: "initial",
    name: name as string,
    level: 1,
    experience: 10,
    actuallife: 20,
    resurrections: 5,
    riels: 100,
    actualslots: 0,
    description: `Ecrire sa description ici...`,
    skillpoints: 0,
    traits: [
      {
        name: "Stats initiales du personnage",
        description: "+20 VIE, +5 FOR, +2 AGI, +3 INT",
      },
      {
        name: "Robuste",
        description: "+2 ARMURE",
      },
    ],
    items: [
      {
        name: "Epée artisanale",
        description: "+10 EPEE, +1 FOR",
        category: "Main",
        slots: 3,
      },
      {
        name: "Potion de soin",
        description: "",
        category: "Inventaire",
        slots: 1,
      },
      {
        name: "Ecaille de dragon chauve",
        description: "",
        category: "Inventaire",
        slots: 1,
      },
      {
        name: "Pantalon en lin",
        description: "+2 AGI",
        category: "Jambes",
        slots: 1,
      },
      {
        name: "Chemise en lin",
        description: "+2 AGI",
        category: "Buste",
        slots: 1,
      },
      {
        name: "Sacoche à Didas",
        description: "+3 SLOT",
        category: "Sac",
        slots: 2,
      },
    ],
    stats: [
      {
        name: "SLOT",
        base: 0,
        traits: 0,
        items: 0,
        value: 0,
      },
      {
        name: "VIE",
        base: 0,
        traits: 0,
        items: 0,
        value: 0,
      },
      {
        name: "FOR",
        base: 0,
        traits: 0,
        items: 0,
        value: 0,
      },
      {
        name: "AGI",
        base: 0,
        traits: 0,
        items: 0,
        value: 0,
      },
      {
        name: "INT",
        base: 0,
        traits: 0,
        items: 0,
        value: 0,
      },
    ],
    skills: [
      {
        name: "Coup d'épée",
        level: 1,
        description: "Inflige (FOR + EPEE) dégats.",
      },
      {
        name: "Posture défensive",
        level: 1,
        description: "Donne (0.2 AGI + 3) ARMURE pendant un tour.",
      },
    ],
  });

  // Fetch character data when component mounts or name changes
  useEffect(() => {
    const fetchOrCreateCharacter = async () => {
      try {
        // First, try to fetch the character
        const response = await fetch(`/api/character?name=${name}`);

        if (response.ok) {
          // Character exists, update state with fetched data
          const characterData = await response.json();
          setCharacter(characterData);
        } else if (response.status === 404) {
          // Character not found, create a new one
          const createResponse = await fetch(`/api/character`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(character), // Send current character state as the default values
          });

          if (createResponse.ok) {
            // Character created successfully, update state with the response
            const newCharacterData = await createResponse.json();
            console.log("New character created:", newCharacterData);
            setCharacter(newCharacterData);
          } else {
            throw new Error("Failed to create character");
          }
        } else {
          throw new Error("Failed to fetch character data");
        }
      } catch (error) {
        console.error("Error in fetch or create character:", error);
        // You can set an error state here if needed
      }
    };

    fetchOrCreateCharacter();
  }, [name]); // Re-fetch when name changes

  const [tab, setTab] = useState("description");

  const [deleteStep, setDeleteStep] = useState(0);

  const [openedModal, setOpenedModal] = useState("");

  // Whenever the character updates (base stats, traits or items), recalculate the stats
  useEffect(() => {
    setCharacter((prev) => {
      const updatedCharacter = updateStatsFromTraits(prev); // First update (Traits -> Stats)
      const updatedCharacter2 = updateStatsFromItems(updatedCharacter); // Second update (Items -> Stats)
      const finalCharacter = updateCharacterStats(updatedCharacter2); // Calculate final values

      return parseSkillDescriptions(finalCharacter); // Second update (Calculate final values)
    });
  }, [
    character.traits,
    character.items,
    openedModal,
    //...character.stats.map((stat) => stat.base),
  ]);

  const updateCharacterStats = (character: Character) => {
    return {
      ...character,
      stats: character.stats
        .map((stat: Stat) => ({
          ...stat,
          value: stat.base + stat.traits + stat.items,
        }))
        .filter((stat) => stat.value !== 0), // Remove stats where value is 0
    };
  };

  // Reset deleteStep when openedModal changes
  useEffect(() => {
    setDeleteStep(0);
  }, [openedModal]);

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
    | {
        type: "stat";
        name: string;
        base: number;
        traits: number;
        items: number;
        value: number;
      }
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

  // Handles skillpoints input value
  const [tempSkillpoints, setTempSkillpoints] = useState(character.skillpoints);

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
    console.log("Saving character");
    if (!modalInfos) return; // Prevent errors if modalInfos is null

    // Update local state first
    setCharacter((prev) => {
      let updatedCharacter = { ...prev };

      switch (modalInfos.type) {
        case "trait": {
          const updatedName = (
            document.getElementById("trait_name") as HTMLInputElement
          )?.value.trim();
          const updatedDescription = (
            document.getElementById("trait_description") as HTMLTextAreaElement
          )?.value.trim();
          if (!updatedName) return prev;
          updatedCharacter = {
            ...prev,
            traits: prev.traits.map((trait) =>
              trait.name === modalInfos.name
                ? {
                    ...trait,
                    name: updatedName,
                    description: updatedDescription,
                  }
                : trait
            ),
          };
          break;
        }
        case "item": {
          const updatedName = (
            document.getElementById("item_name") as HTMLInputElement
          )?.value.trim();
          const updatedDescription = (
            document.getElementById("item_description") as HTMLTextAreaElement
          )?.value.trim();
          const updatedSlots = selectedSlot
            ? parseInt(selectedSlot.value, 10)
            : modalInfos.slots;
          const updatedCategory = selectedType?.value || modalInfos.category;
          if (!updatedName) return prev;
          updatedCharacter = {
            ...prev,
            items: prev.items.map((item) =>
              item.name === modalInfos.name
                ? {
                    ...item,
                    name: updatedName,
                    description: updatedDescription,
                    slots: updatedSlots,
                    category: updatedCategory,
                  }
                : item
            ),
          };
          break;
        }
        case "skill": {
          const updatedName = (
            document.getElementById("skill_name") as HTMLInputElement
          )?.value.trim();
          const updatedDescription = (
            document.getElementById("skill_description") as HTMLTextAreaElement
          )?.value.trim();
          const updatedLevel =
            parseInt(
              (document.getElementById("skill_level") as HTMLInputElement)
                ?.value,
              10
            ) || modalInfos.level;
          if (!updatedName) return prev;
          updatedCharacter = {
            ...prev,
            skills: prev.skills.map((skill) =>
              skill.name === modalInfos.name
                ? {
                    ...skill,
                    name: updatedName,
                    description: updatedDescription,
                    level: updatedLevel,
                  }
                : skill
            ),
          };
          break;
        }
        case "stat": {
          const updatedBase =
            parseInt(
              (document.getElementById("stat_base") as HTMLInputElement)?.value,
              10
            ) || 0;
          console.log(updatedBase);
          updatedCharacter = {
            ...prev,
            stats: prev.stats.map((stat) =>
              stat.name === modalInfos.name
                ? { ...stat, base: updatedBase }
                : stat
            ),
          };
          break;
        }
        default:
          return prev;
      }

      // Return the updated character state
      return updatedCharacter;
    });

    // Close modal immediately for better user experience
    setOpenedModal("");
  };

  const handleCreate = () => {
    if (!modalInfos) return;
    console.log("Creating:", modalInfos);

    setCharacter((prev) => {
      console.log("Current modalInfos.type:", modalInfos?.type);

      switch (modalInfos.type) {
        case "trait": {
          console.log("trait");

          const newName = (
            document.getElementById("new_trait_name") as HTMLInputElement
          )?.value.trim();
          const newDescription = (
            document.getElementById(
              "new_trait_description"
            ) as HTMLTextAreaElement
          )?.value.trim();

          if (!newName) return prev;

          return {
            ...prev,
            traits: [
              ...prev.traits,
              { type: "trait", name: newName, description: newDescription },
            ],
          };
        }

        case "item": {
          console.log("Creating Item...");

          const newName = (
            document.getElementById("new_item_name") as HTMLInputElement
          )?.value.trim();
          const newDescription = (
            document.getElementById(
              "new_item_description"
            ) as HTMLTextAreaElement
          )?.value.trim();

          console.log("New Item Name:", newName);
          console.log("New Item Description:", newDescription);

          if (!newName) return prev;

          const newSlots = selectedSlot ? parseInt(selectedSlot.value, 10) : 0;
          const newCategory = selectedType?.value || "";

          console.log("New Slots:", newSlots);
          console.log("New Category:", newCategory);

          return {
            ...prev,
            items: [
              ...prev.items,
              {
                type: "item",
                name: newName,
                description: newDescription,
                slots: newSlots,
                category: newCategory,
              },
            ],
          };
        }

        case "skill": {
          console.log("skill");

          const newName = (
            document.getElementById("new_skill_name") as HTMLInputElement
          )?.value.trim();
          const newDescription = (
            document.getElementById(
              "new_skill_description"
            ) as HTMLTextAreaElement
          )?.value.trim();
          const newLevel =
            parseInt(
              (document.getElementById("new_skill_level") as HTMLInputElement)
                ?.value,
              10
            ) || 1;

          if (!newName) return prev;

          return {
            ...prev,
            skills: [
              ...prev.skills,
              {
                type: "skill",
                name: newName,
                description: newDescription,
                level: newLevel,
              },
            ],
          };
        }

        case "stat": {
          const newBase =
            parseInt(
              (document.getElementById("new_stat_base") as HTMLInputElement)
                ?.value,
              10
            ) || 0;
          const newValue =
            parseInt(
              (document.getElementById("new_stat_value") as HTMLInputElement)
                ?.value,
              10
            ) || 0;

          return {
            ...prev,
            stats: [
              ...prev.stats,
              {
                name: modalInfos.name,
                base: newBase,
                traits: modalInfos.traits,
                items: modalInfos.items,
                value: newValue,
              },
            ],
          };
        }

        default:
          return prev;
      }
    });

    setOpenedModal(""); // Close modal
  };

  const handleDelete = () => {
    if (!modalInfos) return;

    setCharacter((prev) => {
      switch (modalInfos.type) {
        case "trait":
          return {
            ...prev,
            traits: prev.traits.filter(
              (trait) => trait.name !== modalInfos.name
            ),
          };

        case "item":
          return {
            ...prev,
            items: prev.items.filter((item) => item.name !== modalInfos.name),
          };

        case "skill":
          return {
            ...prev,
            skills: prev.skills.filter(
              (skill) => skill.name !== modalInfos.name
            ),
          };

        case "stat":
          return {
            ...prev,
            stats: prev.stats.filter((stat) => stat.name !== modalInfos.name),
          };

        default:
          return prev;
      }
    });

    setOpenedModal(""); // Close modal
  };

  const handleDeleteClick = () => {
    if (deleteStep < 1) {
      setDeleteStep((prev) => prev + 1);
    } else {
      handleDelete(); // Call the actual delete function on the second click
    }
  };

  const handlePatch = async () => {
    try {
      // Ensure latest state update before sending the request
      setCharacter((prevCharacter) => {
        const updatedCharacter = { ...prevCharacter };

        fetch(`/api/character`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: updatedCharacter._id, // Make sure `_id` exists
            ...updatedCharacter,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Character updated:", data);
            setCharacter(data); // Ensure UI reflects new data
          })
          .catch((error) => console.error("Error updating character:", error));

        return updatedCharacter;
      });
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  return (
    <main className="NamePage">
      <header className="main_header">
        <div
          className="name_and_level"
          onClick={() => setOpenedModal("modify_experience")}
        >
          <h1>{character.name.replace(/_/g, " ")}</h1>
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
            <span>
              {character.items
                .filter((item) => item.category === "Inventaire")
                .reduce((sum, item) => sum + item.slots, 0)}{" "}
              /{" "}
              {character.stats.find((stat) => stat.name === "SLOT")?.value ?? 0}
            </span>
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
            <p style={{ whiteSpace: "pre-wrap" }}>
              {character.description || "Description du personnage"}
            </p>
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
            <button
              onClick={() => {
                setOpenedModal("create_trait");
                setModalInfos({ type: "trait", name: "", description: "" });
              }}
            >
              +
            </button>
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
                  return a.slots - b.slots;
                }

                return 0;
              })
              .map((item, index) => (
                <div
                  key={index}
                  className="item"
                  onClick={() => {
                    setOpenedModal("modify_item");
                    setModalInfos({
                      type: "item",
                      name: item.name,
                      description: item.description,
                      category: item.category,
                      slots: item.slots,
                    });
                  }}
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

            <button
              onClick={() => {
                setOpenedModal("create_item");
                setModalInfos({
                  type: "item",
                  name: "",
                  description: "",
                  category: "",
                  slots: 0,
                });
              }}
            >
              +
            </button>
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
                  onClick={() => {
                    setOpenedModal("modify_stat");
                    setModalInfos({
                      type: "stat",
                      name: stat.name,
                      value: stat.value,
                      traits: stat.traits,
                      items: stat.items,
                      base: stat.base,
                    });
                  }}
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
            onClick={() => {
              setOpenedModal("modify_skillpoints");
            }}
          >
            <Image
              src="/icons/cube.png"
              alt="dice"
              width={22}
              height={22}
              className="icon"
            />
            <p className="skills_points">{character.skillpoints}</p>
          </header>

          <div className="skills_container">
            {character.skills
              .slice() // Create a shallow copy to avoid modifying state directly
              .sort((a, b) => b.level - a.level) // Sort in descending order (higher levels first)
              .map((skill, index) => (
                <div
                  key={index}
                  className="skill"
                  onClick={() => {
                    setOpenedModal("modify_skill");
                    setModalInfos({
                      type: "skill",
                      name: skill.name,
                      level: skill.level,
                      description: skill.description,
                    });
                  }}
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
            onClick={() => {
              setOpenedModal("create_skill");
              setModalInfos({
                type: "skill",
                name: "",
                level: 0,
                description: "",
              });
            }}
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
                    inputMode="numeric"
                    value={character.level}
                    ref={refs.level}
                    onFocus={() => handleFocus(refs.level)}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        level: isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value),
                      })
                    }
                  />
                  <span>Niveau</span>
                </div>
                <div className="input_container">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={character.experience}
                    ref={refs.XP}
                    onFocus={() => handleFocus(refs.XP)}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        experience: isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value),
                      })
                    }
                  />
                  <span>XP</span>
                </div>

                <button
                  className="modal_button confirm"
                  onClick={() => {
                    setOpenedModal("");
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
                <p className="modal_title">Modifier</p>
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
                    inputMode="numeric"
                    value={character.actuallife}
                    ref={refs.life}
                    onFocus={() => handleFocus(refs.life)}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        actuallife: isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value),
                      })
                    }
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
                    inputMode="numeric"
                    value={character.resurrections}
                    ref={refs.resurrections}
                    onFocus={() => handleFocus(refs.resurrections)}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        resurrections: isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value),
                      })
                    }
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
                    inputMode="numeric"
                    value={character.riels}
                    ref={refs.riels}
                    onFocus={() => handleFocus(refs.riels)}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        riels: isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value),
                      })
                    }
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
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    setOpenedModal("");
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
                  id="description_input"
                  defaultValue={character.description}
                  rows={15}
                />
                <button
                  className="modal_button confirm margintop"
                  onClick={() => {
                    const newDescription = (
                      document.getElementById(
                        "description_input"
                      ) as HTMLTextAreaElement
                    )?.value;
                    setCharacter((prev) => ({
                      ...prev,
                      description: newDescription,
                    }));
                    setOpenedModal(""); // Close modal after saving
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
                <button
                  className="modal_button delete margintop"
                  onClick={() => {
                    handleDeleteClick();
                    handlePatch();
                  }}
                >
                  {deleteStep === 0 ? "SUPPRIMER" : "CONFIRMER SUPPRESSION"}
                </button>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    handleSave();
                    handlePatch();
                  }}
                >
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
                  <input
                    type="text"
                    placeholder="Aptitude"
                    id="new_trait_name"
                  />
                  <input
                    type="text"
                    placeholder="Bonus"
                    id="new_trait_description"
                  />
                  <button
                    className="modal_button confirm margintop"
                    onClick={() => {
                      handleCreate();
                      handlePatch();
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY ITEM */}
      {isClient &&
      openedModal === "modify_item" &&
      modalInfos?.type === "item" ? (
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
                <input
                  type="text"
                  placeholder="Nom"
                  defaultValue={modalInfos.name}
                  id="item_name"
                />
                <div>
                  <Select
                    options={optionsSlots}
                    defaultValue={{
                      value: modalInfos.slots.toString(),
                      label: modalInfos.slots.toString(),
                    }}
                    onChange={(selectedOption) =>
                      setSelectedSlot(selectedOption)
                    }
                    placeholder="Encombrement"
                    styles={customStyles}
                    onFocus={(e) => e.preventDefault()} // Prevents input from being focused
                  />

                  <Select
                    options={optionsType}
                    defaultValue={{
                      value: modalInfos.category,
                      label: modalInfos.category,
                    }}
                    onChange={(selectedOption) =>
                      setSelectedType(selectedOption)
                    }
                    styles={customStyles}
                    onFocus={(e) => e.preventDefault()} // Prevents input from being focused
                  />
                </div>
                <textarea
                  placeholder="Description"
                  rows={3}
                  defaultValue={modalInfos.description}
                  id="item_description"
                />

                <button
                  className="modal_button delete margintop"
                  onClick={() => {
                    handleDeleteClick();
                    handlePatch();
                  }}
                >
                  {deleteStep === 0 ? "SUPPRIMER" : "CONFIRMER SUPPRESSION"}
                </button>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    handleSave();
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
                <input type="text" placeholder="Nom" id="new_item_name" />
                <div>
                  <Select
                    options={optionsSlots}
                    onChange={(selectedOption) =>
                      setSelectedSlot(selectedOption)
                    }
                    placeholder="Encombrement"
                    styles={customStyles}
                  />

                  <Select
                    options={optionsType}
                    defaultValue={selectedType}
                    onChange={(selectedOption) =>
                      setSelectedType(selectedOption)
                    }
                    placeholder="Type"
                    styles={customStyles}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  rows={3}
                  id="new_item_description"
                />
                <button
                  className="modal_button confirm margintop"
                  onClick={() => {
                    handleCreate();
                    handlePatch();
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY STAT*/}
      {isClient &&
      openedModal === "modify_stat" &&
      modalInfos?.type === "stat" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">{modalInfos.name} de base</p>
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
                  inputMode="numeric"
                  defaultValue={modalInfos.base}
                  id="stat_base"
                />
                <button
                  className="modal_button confirm margintop"
                  onClick={() => {
                    handleSave();
                    updateCharacterStats(character);
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
                <input
                  type="text"
                  inputMode="numeric"
                  value={tempSkillpoints}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const parsedValue = parseInt(inputValue, 10);

                    if (!isNaN(parsedValue)) {
                      setTempSkillpoints(parsedValue);
                    } else if (inputValue === "") {
                      setTempSkillpoints(0);
                    }
                  }}
                />
                <button
                  className="modal_button confirm margintop"
                  onClick={() => {
                    setCharacter((prevCharacter) => ({
                      ...prevCharacter,
                      skillpoints: tempSkillpoints >= 0 ? tempSkillpoints : 0,
                    }));
                    setOpenedModal("");
                    handlePatch();
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
      {/* MODAL MODIFY SKILL */}
      {isClient &&
      openedModal === "modify_skill" &&
      modalInfos?.type === "skill" ? (
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
                  defaultValue={modalInfos.name}
                  id="skill_name"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Niveau"
                  defaultValue={modalInfos.level}
                  id="skill_level"
                />
                <textarea
                  placeholder="Description"
                  defaultValue={modalInfos.description}
                  rows={10}
                  id="skill_description"
                />
                <button
                  className="modal_button delete margintop"
                  onClick={() => {
                    handleDeleteClick();
                    handlePatch();
                  }}
                >
                  {deleteStep === 0 ? "SUPPRIMER" : "CONFIRMER SUPPRESSION"}
                </button>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    handleSave();
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
                <input type="text" placeholder="Nom" id="new_skill_name" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Niveau"
                  id="new_skill_level"
                />
                <textarea
                  placeholder="Description"
                  rows={3}
                  id="new_skill_description"
                />
                <button
                  className="modal_button confirm margintop"
                  onClick={() => {
                    handleCreate();
                    handlePatch();
                  }}
                >
                  OK
                </button>
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
