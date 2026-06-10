import { createRequest } from "./request"

export const baseUrl = import.meta.env.VITE_APP_WEB_URL || "/"

export const http = createRequest({ baseURL: baseUrl, timeout: 500000 })
