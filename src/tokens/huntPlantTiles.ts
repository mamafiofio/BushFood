import fingerlime from "../assets/native-plants/Fingerlime.svg";
import midyim from "../assets/native-plants/Midyim.svg";
import murnong from "../assets/native-plants/Murnong.svg";
import wattleseed from "../assets/native-plants/Wattleseed.svg";

/** Homescreen plant markers — order matches Figma 2×2 (olive, lilac, forest, coral). */
export const HUNT_PLANT_TILES = [
  { id: "wattleseed", label: "Wattleseed", src: wattleseed },
  { id: "murnong", label: "Murnong", src: murnong },
  { id: "fingerlime", label: "Finger lime", src: fingerlime },
  { id: "midyim", label: "Midyim", src: midyim },
] as const;
