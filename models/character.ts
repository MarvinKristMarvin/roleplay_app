import { model, Schema, models } from "mongoose";

const traitSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const itemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, required: true },
  slots: { type: Number, required: true },
});

const statSchema = new Schema({
  name: { type: String, required: true },
  base: { type: Number, required: true },
  traits: { type: Number, required: true },
  items: { type: Number, required: true },
  value: { type: Number, required: true },
});

const skillSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  description: { type: String, required: true },
});

const characterSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  experience: { type: Number, required: true },
  actuallife: { type: Number, required: true },
  resurrections: { type: Number, required: true },
  riels: { type: Number, required: true },
  actualslots: { type: Number, required: true },
  description: { type: String, required: true },
  skillpoints: { type: Number, required: true },
  traits: [traitSchema],
  items: [itemSchema],
  stats: [statSchema],
  skills: [skillSchema],
});

export const Character =
  models.Character || model("Character", characterSchema);
export const Trait = models.Trait || model("Trait", traitSchema);
export const Item = models.Item || model("Item", itemSchema);
export const Stat = models.Stat || model("Stat", statSchema);
export const Skill = models.Skill || model("Skill", skillSchema);
