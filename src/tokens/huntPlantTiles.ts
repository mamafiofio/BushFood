import fingerlime from "../assets/native-plants/Fingerlime.svg";
import kangarooGrass from "../assets/native-plants/KangarooGrass.svg";
import lillyPilly from "../assets/native-plants/LillyPilly.svg";
import midyim from "../assets/native-plants/Midyim.svg";
import murnong from "../assets/native-plants/Murnong.svg";
import wattleseed from "../assets/native-plants/Wattleseed.svg";

/** Homescreen plant markers — 2-column grid (6 tiles). */
export const HUNT_PLANT_TILES = [
  { id: "wattleseed", label: "Wattleseed", src: wattleseed },
  { id: "fingerlime", label: "Finger lime", src: fingerlime },
  { id: "kangaroo-grass", label: "Kangaroo grass", src: kangarooGrass },
  { id: "lilly-pilly", label: "Lilly pilly", src: lillyPilly },
  { id: "midyim", label: "Midyim", src: midyim },
  { id: "murnong", label: "Murnong", src: murnong },
] as const;

export type HuntPlantId = (typeof HUNT_PLANT_TILES)[number]["id"];

const tileById = Object.fromEntries(HUNT_PLANT_TILES.map((tile) => [tile.id, tile])) as Record<
  HuntPlantId,
  (typeof HUNT_PLANT_TILES)[number]
>;

/** Welcome marquee — same six plants; Murnong then Midyim at the end of each loop. */
const WELCOME_MARQUEE_ORDER = [
  "wattleseed",
  "murnong",
  "kangaroo-grass",
  "lilly-pilly",
  "fingerlime",
  "midyim",
] as const satisfies readonly HuntPlantId[];

export const HUNT_WELCOME_MARQUEE_TILES = WELCOME_MARQUEE_ORDER.map((id) => tileById[id]);

/** How many full icon sets are rendered back-to-back on the welcome marquee (default: 2). */
export const HUNT_WELCOME_MARQUEE_LOOP_COPIES = 2;

/** Welcome marquee DOM track — two identical loops for seamless auto-scroll and drag wrap. */
export const HUNT_WELCOME_MARQUEE_TRACK = Array.from(
  { length: HUNT_WELCOME_MARQUEE_LOOP_COPIES },
  () => HUNT_WELCOME_MARQUEE_TILES,
).flat();
