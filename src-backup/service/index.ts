// import { getServiceEnvConfig } from '~/.env-config';
import { createRequest } from "./request"
import type { AxiosRequestConfig } from "axios"

export const baseUrl = import.meta.env.VITE_APP_WEB_URL || "/"

export const http = createRequest({ baseURL: baseUrl, timeout: 500000 })

export const uploadRequest = createRequest({
  baseURL: baseUrl,
  timeout: 500000,
  headers: {
    ContentType: "multipart/form-data"
  }
})

export const customRequest = (options: AxiosRequestConfig) =>
  createRequest({
    baseURL: baseUrl,
    timeout: 500000,
    headers: {
      ContentType: "multipart/form-data"
    },
    ...options
  })
