import { EPlatform } from "@/enum";
import kuwoPng from "@/assets/images/kuwo.png"
import kugouPng from "@/assets/images/kugou.png"
import neteasePng from "@/assets/images/netease.png"
import qqPng from "@/assets/images/qq.png"
import miguPng from "@/assets/images/migu.png"
export const durationFormat = (value: number) => {
  if (!value) return '--:--';
  const minute = Math.floor(value / 60000);
  const second = Math.floor(value % 60000 / 1000);
  const addZero = (num: number) => num < 10 ? '0' + num : num;
  return `${addZero(minute)}:${addZero(second)}`;
}

export const secToMin = (value: number) => {
  const minute = Math.floor(value / 60);
  const second = Math.floor(value % 60);
  const addZero = (num) => num < 10 ? '0' + num : num;
  return `${addZero(minute)}:${addZero(second)}`;
}

export const countFormat = (value: number) => {
  if (isNaN(+value)) return 0;
  if (value < 10000) return value;
  if (value < 100000000) return Math.floor(value / 10000) + '万';
  return Math.floor(value / 100000000) + '亿';
}

export const durationTransSec = (value: string) => {
  if (!value) return 0;
  const temp = value.toString().split(':');
  const minute = temp[0];
  const second = temp[1];
  return (+minute) * 60 + (+second);
}

export const whichLogo = (platform: EPlatform) => {
  switch (platform) {
    case EPlatform.QQ:
      return qqPng
    case EPlatform.网易:
      return neteasePng
    case EPlatform.酷狗:
      return kugouPng
    case EPlatform.酷我:
      return kuwoPng
    case EPlatform.咪咕:
      return miguPng
    default:
      return ""
  }
}
