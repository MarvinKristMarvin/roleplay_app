import { NextRequest, NextResponse } from "next/server";
import { Character } from "../../../../models/character";
import connectDB from "../../../../lib/db"; // Adjust the path if needed

interface CharacterData {
  name: string;
  level: number;
  experience: number;
  actuallife: number;
  resurrections: number;
  riels: number;
  actualslots: number;
  description: string;
  skillpoints: number;
  traits: { name: string; description: string }[];
  items: {
    name: string;
    description: string;
    category: string;
    slots: number;
  }[];
  stats: {
    name: string;
    base: number;
    traits: number;
    items: number;
    value: number;
  }[];
  skills: { name: string; level: number; description: string }[];
}

export async function GET(request: NextRequest) {
  try {
    await connectDB(); // connect to the database before query
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    let characters;
    if (name) {
      characters = await Character.findOne({ name });
      if (!characters) {
        return new NextResponse("Character not found", { status: 404 });
      }
    } else {
      characters = await Character.find({});
    }

    return new NextResponse(JSON.stringify(characters), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error fetching characters", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Partial<CharacterData> = await request.json();
    const newCharacter: CharacterData = {
      name: data.name ?? "",
      level: data.level ?? 1,
      experience: data.experience ?? 0,
      actuallife: data.actuallife ?? 0,
      resurrections: data.resurrections ?? 0,
      riels: data.riels ?? 0,
      actualslots: data.actualslots ?? 0,
      description: data.description ?? "",
      skillpoints: data.skillpoints ?? 0,
      traits: data.traits ?? [],
      items: data.items ?? [],
      stats: data.stats ?? [],
      skills: data.skills ?? [],
    };

    const character = new Character(newCharacter);
    await character.save();
    return new NextResponse(JSON.stringify(character), { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error creating character", { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    if (!id) return new NextResponse("Id is required", { status: 400 });

    const character = await Character.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!character) {
      return new NextResponse("Character not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(character), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error updating character", { status: 500 });
  }
}
