import fingerLimePhoto from "../assets/native-plants/found/photos/finger-lime.png";
import kangarooGrassPhoto from "../assets/native-plants/found/photos/kangaroo-grass.png";
import lillyPillyPhoto from "../assets/native-plants/found/photos/lilly-pilly.png";
import midyimPhoto from "../assets/native-plants/found/photos/midyim.png";
import murnongPhoto from "../assets/native-plants/found/photos/murnong.png";
import wattleseedPhoto from "../assets/native-plants/found/photos/wattleseed.png";
import fingerLimeSticker from "../assets/native-plants/found/stickers/sticker-finger-lime.svg";
import kangarooGrassSticker from "../assets/native-plants/found/stickers/sticker-kangaroo-grass.svg";
import lillyPillySticker from "../assets/native-plants/found/stickers/sticker-lilly-pilly.svg";
import midyimSticker from "../assets/native-plants/found/stickers/sticker-midyim.svg";
import murnongSticker from "../assets/native-plants/found/stickers/sticker-murnong.svg";
import wattleseedSticker from "../assets/native-plants/found/stickers/sticker-wattleseed.svg";
import type { HuntPlantId } from "./huntPlantTiles";

/** Found-sheet hero photo + sticker art (per plant). Tile circle art comes from `HUNT_PLANT_TILES`. */
export const HUNT_PLANT_FOUND_MEDIA: Record<HuntPlantId, { photoSrc: string; stickerSrc: string }> = {
  fingerlime: { photoSrc: fingerLimePhoto, stickerSrc: fingerLimeSticker },
  "kangaroo-grass": { photoSrc: kangarooGrassPhoto, stickerSrc: kangarooGrassSticker },
  "lilly-pilly": { photoSrc: lillyPillyPhoto, stickerSrc: lillyPillySticker },
  midyim: { photoSrc: midyimPhoto, stickerSrc: midyimSticker },
  murnong: { photoSrc: murnongPhoto, stickerSrc: murnongSticker },
  wattleseed: { photoSrc: wattleseedPhoto, stickerSrc: wattleseedSticker },
};
