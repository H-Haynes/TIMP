import { http } from "@/service"

export const checkUpdate = () => http.get("/timp/update/check")
