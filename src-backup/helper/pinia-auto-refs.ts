// "https://github.com/Allen-1998/pinia-auto-refs"
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
import type { ToRef, UnwrapRef } from 'vue'
import { storeToRefs } from "pinia"

import dbStore from "@/store/db"
import downloadStore from "@/store/download"
import playSettingStore from "@/store/playSetting"
import testStore from "@/store/test"
import userInfoStore from "@/store/userInfo"

import store from "@/store"

type StoreToRefs<T extends StoreDefinition> = {
  [K in keyof ReturnType<T>]: ReturnType<T>[K] extends Function ? ReturnType<T>[K] : ToRef<UnwrapRef<ReturnType<T>[K]>>
}

const storeExports = {
  db: dbStore,
  download: downloadStore,
  playSetting: playSettingStore,
  test: testStore,
  userInfo: userInfoStore
}

export function useStore<T extends keyof typeof storeExports>(storeName: T) {
  const targetStore = storeExports[storeName](store)
  const storeRefs = storeToRefs(targetStore)
  return { ...targetStore, ...storeRefs } as StoreToRefs<(typeof storeExports)[T]>
}
