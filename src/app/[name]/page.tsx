"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Select, { components } from "react-select";
import { StylesConfig } from "react-select";
import { useEffect, useRef, useCallback } from "react";

const safeEval = (expression: string) => {
  try {
    return new Function(`return (${expression})`)();
  } catch {
    return NaN;
  }
};

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

const soundCache: Record<string, HTMLAudioElement> = {}; // Store audio instances
const playSound = (soundFile: string) => {
  // Reuse existing sound if available
  if (!soundCache[soundFile]) {
    soundCache[soundFile] = new Audio(`/sounds/${soundFile}`);
  }

  const audio = soundCache[soundFile];
  audio.currentTime = 0; // Restart sound
  // Adjust volume based on sound type
  if (soundFile.includes("negative1")) {
    audio.volume = 0.25; // delete
  } else if (soundFile.includes("neutral1")) {
    audio.volume = 0.3; // ok
  } else if (soundFile.includes("neutral2")) {
    audio.volume = 0.85; // close modal
  } else if (soundFile.includes("neutral5")) {
    audio.volume = 0.25; // open modal
  } else if (soundFile.includes("neutral7")) {
    audio.volume = 0.25; // change tab
  }
  audio.play().catch((err) => console.error("Error playing sound:", err));
};

const updateStatsFromTraits = (character: Character) => {
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
  // Create a Map of stat values for easy lookup - with lowercase keys
  const statsMap = new Map<string, number>();
  character.stats.forEach((stat) => {
    statsMap.set(stat.name.toLowerCase(), stat.base + stat.traits + stat.items);
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
            const result = Math.round(safeEval(evaluatedFormula));
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

// Handle focus and place cursor at the end
const handleFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
  if (ref.current) {
    // Add a small delay to ensure the cursor is set correctly
    setTimeout(() => {
      const length = ref.current!.value.length;
      ref.current!.setSelectionRange(length, length);
    }, 0); // 0ms delay ensures it runs after the focus event
  }
};

export default function NamePage() {
  const { name } = useParams();

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
    if (openedModal === "") {
      setCharacter((prev) => {
        const updatedCharacter = updateStatsFromTraits(prev); // First update (Traits -> Stats)
        const updatedCharacter2 = updateStatsFromItems(updatedCharacter); // Second update (Items -> Stats)
        const finalCharacter = updateCharacterStats(updatedCharacter2); // Calculate final values
        return parseSkillDescriptions(finalCharacter); // Parse skill descriptions
      });
    }
  }, [character.traits, character.items, openedModal]);

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
  const [tempSkillpoints, setTempSkillpoints] = useState<string | number>(
    character.skillpoints
  );
  const [tempLife, setTempLife] = useState("");
  const [tempResurrections, setTempResurrections] = useState("");
  const [tempRiels, setTempRiels] = useState("");
  const [tempLevel, setTempLevel] = useState("");
  const [tempExperience, setTempExperience] = useState("");

  // Handles input focus, cursor at the end
  const refs = {
    level: useRef<HTMLInputElement>(null),
    XP: useRef<HTMLInputElement>(null),
    life: useRef<HTMLInputElement>(null),
    resurrections: useRef<HTMLInputElement>(null),
    riels: useRef<HTMLInputElement>(null),
  };

  const handleSave = useCallback(() => {
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
          const levelInput = (
            document.getElementById("skill_level") as HTMLInputElement
          )?.value.trim();

          let updatedLevel;

          if (/^[+\-]\d+$/.test(levelInput)) {
            // If input is "+X" or "-X", add/subtract from current level
            updatedLevel = modalInfos.level + Number(levelInput);
          } else if (/^[\d+\-*/\s]+$/.test(levelInput)) {
            // If it's a mathematical expression (e.g., "5+5"), evaluate it
            try {
              const evaluated = safeEval(levelInput);
              updatedLevel = !isNaN(evaluated) ? evaluated : modalInfos.level;
            } catch {
              updatedLevel = modalInfos.level;
            }
          } else {
            // Invalid input keeps the previous level
            updatedLevel = modalInfos.level;
          }

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
          const baseInput = (
            document.getElementById("stat_base") as HTMLInputElement
          )?.value.trim();

          let updatedBase;

          if (/^[+\-]\d+$/.test(baseInput)) {
            // If input is "+X" or "-X", add/subtract from current base value
            updatedBase = modalInfos.base + Number(baseInput);
          } else if (/^[\d+\-*/\s]+$/.test(baseInput)) {
            // If input is a valid arithmetic expression (e.g., "5+5")
            try {
              const evaluated = safeEval(baseInput);
              updatedBase = !isNaN(evaluated) ? evaluated : modalInfos.base;
            } catch {
              updatedBase = modalInfos.base;
            }
          } else {
            // Invalid input keeps the previous base value
            updatedBase = modalInfos.base;
          }

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
  }, [modalInfos, selectedSlot, selectedType?.value]);

  const handleCreate = useCallback(() => {
    if (!modalInfos) return;

    setCharacter((prev) => {
      switch (modalInfos.type) {
        case "trait": {
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
          const newName = (
            document.getElementById("new_item_name") as HTMLInputElement
          )?.value.trim();
          const newDescription = (
            document.getElementById(
              "new_item_description"
            ) as HTMLTextAreaElement
          )?.value.trim();

          if (!newName) return prev;

          const newSlots = selectedSlot ? parseInt(selectedSlot.value, 10) : 0;
          const newCategory = selectedType?.value || "";

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
  }, [modalInfos, selectedSlot, selectedType, setCharacter, setOpenedModal]); // ✅ Dependencies

  const handleDelete = useCallback(() => {
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
  }, [modalInfos, setCharacter, setOpenedModal]);

  const handleDeleteClick = useCallback(() => {
    if (deleteStep < 1) {
      setDeleteStep((prev) => prev + 1);
    } else {
      handleDelete(); // Call the actual delete function on the second click
    }
  }, [deleteStep, setDeleteStep, handleDelete]);

  const handlePatch = useCallback(async () => {
    try {
      setCharacter((prevCharacter) => {
        const updatedCharacter = { ...prevCharacter };

        fetch(`/api/character`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: updatedCharacter._id,
            ...updatedCharacter,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            setCharacter(data); // Update UI after receiving a response
          })
          .catch((error) => console.error("Error updating character:", error));

        return updatedCharacter; // Ensure state updates efficiently
      });
    } catch (error) {
      console.error("Error updating character:", error);
    }
  }, []);

  const descriptionTab = useMemo(() => {
    if (tab !== "description") return null;

    return (
      <>
        <button
          className="tutorial_button"
          onClick={() => {
            setOpenedModal("tutorial");
            playSound("neutral5.mp3");
          }}
        >
          TUTORIEL
        </button>
        <div
          className="description_text"
          onClick={() => {
            setOpenedModal("modify_description");
            playSound("neutral5.mp3");
          }}
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
                playSound("neutral5.mp3");
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
              playSound("neutral5.mp3");
              setModalInfos({ type: "trait", name: "", description: "" });
            }}
          >
            +
          </button>
        </div>
      </>
    );
  }, [tab, character.traits, character.description]);

  return (
    <main className="NamePage">
      <header className="main_header">
        <div
          className="name_and_level"
          onClick={() => {
            playSound("neutral5.mp3");
            setOpenedModal("modify_experience");
          }}
        >
          <h1>{character.name.replace(/_/g, " ")}</h1>
          <span className="lvl">{character.level}</span>
        </div>
        <div
          className="experience"
          onClick={() => {
            setOpenedModal("modify_experience");
            playSound("neutral5.mp3");
          }}
        >
          <div
            className="experience_bar"
            style={{ width: `${character.experience}%` }}
          ></div>
        </div>
        <div
          className="life_and_resurrection"
          onClick={() => {
            setOpenedModal("modify_infos");
            playSound("neutral5.mp3");
          }}
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
          onClick={() => {
            setOpenedModal("modify_infos");
            playSound("neutral5.mp3");
          }}
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
          <div
            className="description"
            onClick={() => {
              requestAnimationFrame(() => {
                setTab("description");
                playSound("neutral7.mp3");
              });
            }}
          >
            <Image
              src="/fiche1-Photoroom.png"
              alt="description"
              width={60}
              height={60}
              className={tab === "description" ? "selected" : ""}
            />
            <span>description</span>
          </div>
          <div
            className="inventory"
            onClick={() => {
              requestAnimationFrame(() => {
                setTab("inventory");
                playSound("neutral7.mp3");
              });
            }}
          >
            <Image
              src="/inventory3-Photoroom.png"
              alt="inventory"
              width={60}
              height={60}
              className={tab === "inventory" ? "selected" : ""}
            />
            <span>inventory</span>
          </div>
          <div
            className="stats"
            onClick={() => {
              requestAnimationFrame(() => {
                setTab("stats");
                playSound("neutral7.mp3");
              });
            }}
          >
            <Image
              src="/dice4-Photoroom.png"
              alt="stats"
              width={60}
              height={60}
              className={tab === "stats" ? "selected" : ""}
            />
            <span>stats</span>
          </div>
          <div
            className="skills"
            onClick={() => {
              requestAnimationFrame(() => {
                setTab("skills");
                playSound("neutral7.mp3");
              });
            }}
          >
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
      {descriptionTab}
      {/* {tab === "description" ? (
        <>
          <button
            className="tutorial_button"
            onClick={() => {
              setOpenedModal("tutorial");
              playSound("neutral5.mp3");
            }}
          >
            TUTORIEL
          </button>
          <div
            className="description_text"
            onClick={() => {
              setOpenedModal("modify_description");
              playSound("neutral5.mp3");
            }}
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
                  playSound("neutral5.mp3");
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
                playSound("neutral5.mp3");
                setModalInfos({ type: "trait", name: "", description: "" });
              }}
            >
              +
            </button>
          </div>
        </>
      ) : (
        ""
      )} */}

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
                    playSound("neutral5.mp3");
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
                playSound("neutral5.mp3");
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
                    playSound("neutral5.mp3");
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
              {
                setOpenedModal("modify_skillpoints");
                playSound("neutral5.mp3");
              }
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
                    playSound("neutral5.mp3");
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
              playSound("neutral5.mp3");
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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <div className="input_container">
                  <input
                    type="text"
                    inputMode="numeric"
                    defaultValue={String(character.level)}
                    ref={refs.level}
                    onFocus={() => {
                      handleFocus(refs.level);
                      setTempLevel("");
                    }}
                    onChange={(e) => setTempLevel(e.target.value)}
                  />
                  <span>Niveau</span>
                </div>
                <div className="input_container">
                  <input
                    type="text"
                    inputMode="numeric"
                    defaultValue={String(character.experience)}
                    ref={refs.XP}
                    onFocus={() => {
                      handleFocus(refs.XP);
                      setTempExperience("");
                    }}
                    onChange={(e) => setTempExperience(e.target.value)}
                  />
                  <span>XP</span>
                </div>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    // Process temporary values and update character
                    setCharacter((prevCharacter) => {
                      const newCharacter = { ...prevCharacter };

                      // Process level
                      if (tempLevel) {
                        const currentLevel = prevCharacter.level || 0;
                        const input = String(tempLevel).trim();

                        if (/^[+\-]\d+$/.test(input)) {
                          // If input is "+X" or "-X", add/subtract from current value
                          newCharacter.level = currentLevel + Number(input);
                        } else if (/^[\d+\-*/\s]+$/.test(input)) {
                          // If it's a mathematical expression, evaluate it
                          try {
                            const evaluated = safeEval(input);
                            newCharacter.level = !isNaN(evaluated)
                              ? evaluated
                              : character.level;
                          } catch {
                            newCharacter.level = character.level;
                          }
                        } else {
                          // Invalid input sets value to 0
                          newCharacter.level = character.level;
                        }
                      }

                      // Process experience
                      if (tempExperience) {
                        const currentExperience = prevCharacter.experience || 0;
                        const input = String(tempExperience).trim();

                        if (/^[+\-]\d+$/.test(input)) {
                          // If input is "+X" or "-X", add/subtract from current value
                          newCharacter.experience =
                            currentExperience + Number(input);
                        } else if (/^[\d+\-*/\s]+$/.test(input)) {
                          // If it's a mathematical expression, evaluate it
                          try {
                            const evaluated = safeEval(input);
                            newCharacter.experience = !isNaN(evaluated)
                              ? evaluated
                              : character.experience;
                          } catch {
                            newCharacter.experience = character.experience;
                          }
                        } else {
                          // Invalid input sets value to 0
                          newCharacter.experience = character.experience;
                        }
                      }

                      return newCharacter;
                    });

                    // Reset temporary values
                    setTempLevel("");
                    setTempExperience("");
                    playSound("neutral1.mp3");
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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <div className="input_container">
                  <input
                    type="text"
                    inputMode="numeric"
                    defaultValue={String(character.actuallife)}
                    ref={refs.life}
                    onFocus={() => {
                      handleFocus(refs.life);
                      setTempLife("");
                    }}
                    onChange={(e) => setTempLife(e.target.value)}
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
                    defaultValue={String(character.resurrections)}
                    ref={refs.resurrections}
                    onFocus={() => {
                      handleFocus(refs.resurrections);
                      setTempResurrections("");
                    }}
                    onChange={(e) => setTempResurrections(e.target.value)}
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
                    defaultValue={String(character.riels)}
                    ref={refs.riels}
                    onFocus={() => {
                      handleFocus(refs.riels);
                      setTempRiels("");
                    }}
                    onChange={(e) => setTempRiels(e.target.value)}
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
                    // Process temporary values and update character
                    setCharacter((prevCharacter) => {
                      const newCharacter = { ...prevCharacter };

                      // Process life
                      if (tempLife) {
                        const currentLife = prevCharacter.actuallife || 0;
                        const input = String(tempLife).trim();

                        if (/^[+\-]\d+$/.test(input)) {
                          // If input is "+X" or "-X", add/subtract from current value
                          newCharacter.actuallife = currentLife + Number(input);
                        } else if (/^[\d+\-*/\s]+$/.test(input)) {
                          // If it's a mathematical expression, evaluate it
                          try {
                            const evaluated = safeEval(input);
                            newCharacter.actuallife = !isNaN(evaluated)
                              ? evaluated
                              : character.actuallife;
                          } catch {
                            newCharacter.actuallife = character.actuallife;
                          }
                        } else {
                          // Invalid input sets value to 0
                          newCharacter.actuallife = character.actuallife;
                        }
                      }

                      // Process resurrections
                      if (tempResurrections) {
                        const currentResurrections =
                          prevCharacter.resurrections || 0;
                        const input = String(tempResurrections).trim();

                        if (/^[+\-]\d+$/.test(input)) {
                          // If input is "+X" or "-X", add/subtract from current value
                          newCharacter.resurrections =
                            currentResurrections + Number(input);
                        } else if (/^[\d+\-*/\s]+$/.test(input)) {
                          // If it's a mathematical expression, evaluate it
                          try {
                            const evaluated = safeEval(input);
                            newCharacter.resurrections = !isNaN(evaluated)
                              ? evaluated
                              : character.resurrections;
                          } catch {
                            newCharacter.resurrections =
                              character.resurrections;
                          }
                        } else {
                          // Invalid input sets value to 0
                          newCharacter.resurrections = character.resurrections;
                        }
                      }

                      // Process riels
                      if (tempRiels) {
                        const currentRiels = prevCharacter.riels || 0;
                        const input = String(tempRiels).trim();

                        if (/^[+\-]\d+$/.test(input)) {
                          // If input is "+X" or "-X", add/subtract from current value
                          newCharacter.riels = currentRiels + Number(input);
                        } else if (/^[\d+\-*/\s]+$/.test(input)) {
                          // If it's a mathematical expression, evaluate it
                          try {
                            const evaluated = safeEval(input);
                            newCharacter.riels = !isNaN(evaluated)
                              ? evaluated
                              : character.riels;
                          } catch {
                            newCharacter.riels = character.riels;
                          }
                        } else {
                          // Invalid input sets value to 0
                          newCharacter.riels = character.riels;
                        }
                      }

                      return newCharacter;
                    });

                    // Reset temporary values
                    setTempLife("");
                    setTempResurrections("");
                    setTempRiels("");
                    playSound("neutral1.mp3");

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
      {/* MODAL TUTORIAL */}
      {isClient && openedModal === "tutorial" ? (
        <>
          <div className="modal">
            <div className="modal_window">
              <div className="modal_header">
                <p className="modal_title">Tutoriel</p>
                <button
                  className="modal_button_close"
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
                >
                  &#10006;
                </button>
              </div>
              <div className="modal_content">
                <div className="section">
                  <h2 className="section_title">Fonctionnement</h2>
                  <p className="explications">
                    Appuyez sur un élément pour modifier ses valeurs. Sur un
                    champ de saisie de nombre, vous pouvez saisir + ou - pour
                    effectuer une addition ou soustraction.
                  </p>
                </div>
                <div className="section">
                  <h2 className="section_title">Stats</h2>
                  <p className="explications">
                    Les stats peuvent être modifiées en écrivant +1 NomDeMaStat
                    dans une aptitude ou une description d&apos;objet équipé, ou
                    alors en modifiant les stats de base dans l&apos;onglet
                    Stats. La stat SLOT augmente les places d&apos;inventaire.
                  </p>
                </div>
                <div className="section">
                  <h2 className="section_title">Objets</h2>
                  <p className="explications">
                    Un objet a une valeur d&apos;encombrement qui spécifie la
                    place qu&apos;il prend dans l&apos;inventaire.
                    L&apos;encombrement d&apos;un objet est de 0 tant qu&apos;il
                    est équipé.
                  </p>
                </div>
                <div className="section">
                  <h2 className="section_title">Compétences</h2>
                  <p className="explications">
                    Vous pouvez écrire des formules entre parenthèses dans vos
                    compétences, par exemple &quot;Inflige (1.5 FOR + AGI + 10)
                    dégâts&quot;. Les valeurs seront calculées automatiquement
                    avec vos stats
                  </p>
                </div>
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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    playSound("negative1.mp3");
                    handleDeleteClick();
                    handlePatch();
                  }}
                >
                  {deleteStep === 0 ? "SUPPRIMER" : "CONFIRMER SUPPRESSION"}
                </button>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    playSound("neutral1.mp3");

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
                    onClick={() => {
                      setOpenedModal("");
                      playSound("neutral2.mp3");
                    }}
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
                      playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    components={{
                      Input: (props) => (
                        <components.Input
                          {...props}
                          readOnly
                          inputMode="none"
                        />
                      ),
                    }}
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
                    components={{
                      Input: (props) => (
                        <components.Input
                          {...props}
                          readOnly
                          inputMode="none"
                        />
                      ),
                    }}
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
                    playSound("negative1.mp3");

                    handleDeleteClick();
                    handlePatch();
                  }}
                >
                  {deleteStep === 0 ? "SUPPRIMER" : "CONFIRMER SUPPRESSION"}
                </button>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    components={{
                      Input: (props) => (
                        <components.Input
                          {...props}
                          readOnly
                          inputMode="none"
                        />
                      ),
                    }}
                  />

                  <Select
                    options={optionsType}
                    defaultValue={selectedType}
                    onChange={(selectedOption) =>
                      setSelectedType(selectedOption)
                    }
                    placeholder="Type"
                    styles={customStyles}
                    components={{
                      Input: (props) => (
                        <components.Input
                          {...props}
                          readOnly
                          inputMode="none"
                        />
                      ),
                    }}
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
                    playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    setTempSkillpoints(e.target.value);
                  }}
                />
                <button
                  className="modal_button confirm margintop"
                  onClick={() => {
                    setCharacter((prevCharacter) => {
                      const currentSkillpoints = prevCharacter.skillpoints || 0;
                      const input = String(tempSkillpoints).trim(); // Ensure string for processing

                      let newSkillpoints;

                      if (/^[+\-]\d+$/.test(input)) {
                        // If input is just "+X" or "-X", add it to the current value
                        newSkillpoints = currentSkillpoints + Number(input);
                      } else if (/^[\d+\-*/\s]+$/.test(input)) {
                        // If it's a mathematical expression (e.g., "5+5"), evaluate it
                        try {
                          const evaluated = safeEval(input);
                          newSkillpoints = !isNaN(evaluated) ? evaluated : 0;
                        } catch {
                          newSkillpoints = 0;
                        }
                      } else {
                        // Invalid input sets skillpoints to 0
                        newSkillpoints = 0;
                      }
                      setTempSkillpoints(newSkillpoints);
                      return { ...prevCharacter, skillpoints: newSkillpoints };
                    });
                    playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    playSound("negative1.mp3");

                    handleDeleteClick();
                    handlePatch();
                  }}
                >
                  {deleteStep === 0 ? "SUPPRIMER" : "CONFIRMER SUPPRESSION"}
                </button>
                <button
                  className="modal_button confirm"
                  onClick={() => {
                    playSound("neutral1.mp3");

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
                  onClick={() => {
                    setOpenedModal("");
                    playSound("neutral2.mp3");
                  }}
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
                    playSound("neutral1.mp3");

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
