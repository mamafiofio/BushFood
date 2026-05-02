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
