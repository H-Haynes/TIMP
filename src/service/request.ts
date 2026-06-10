import type { AxiosInstance, AxiosRequestConfig } from "axios"

import CustomAxiosInstance from "./instance"
import qs from "qs"
import { isObject } from "./utils"

type RequestMethod = "get" | "post" | "put" | "delete"

interface RequestParam {
  url: string
  method?: RequestMethod
  data?: any
  axiosConfig?: AxiosRequestConfig
}

/**
 * 创建请求
 * @param axiosConfig - axios配置
 * @param backendConfig - 后端接口字段配置
 */
export function createRequest(axiosConfig: AxiosRequestConfig, backendConfig?: Service.BackendResultConfig) {
  const customInstance = new CustomAxiosInstance(axiosConfig, backendConfig)

  async function asyncRequest<T>(param: RequestParam): Promise<T> {
    const { url } = param
    const method = param.method || "get"
    const { instance } = customInstance
    const res = await getRequestResponse({ instance, method, url, data: param.data, config: param.axiosConfig })
    return res as T
  }

  function get<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    url = isObject(data) ? url + "?" + qs.stringify(data) : url
    return asyncRequest<T>({ url, method: "get", axiosConfig: config })
  }

  function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return asyncRequest<T>({ url, method: "post", data, axiosConfig: config })
  }

  function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return asyncRequest<T>({ url, method: "put", data, axiosConfig: config })
  }

  function handleDelete<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return asyncRequest<T>({ url, method: "delete", data, axiosConfig: config })
  }

  function download(url: string, fileName: string, data?: any, config = { method: "get" } as AxiosRequestConfig): Promise<void> {
    return asyncRequest<any>({
      url,
      method: (config.method || "get") as RequestMethod,
      data,
      axiosConfig: Object.assign({ responseType: "blob" }, config)
    }).then((res: any) => {
      const blob = new Blob([res])
      if ("msSaveOrOpenBlob" in navigator) {
        window.navigator.msSaveOrOpenBlob && window.navigator.msSaveOrOpenBlob(blob, fileName)
      } else {
        const elink = document.createElement("a")
        elink.download = fileName
        elink.style.display = "none"
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      }
    })
  }

  return { get, post, put, delete: handleDelete, download }
}

async function getRequestResponse(params: { instance: AxiosInstance; method: RequestMethod; url: string; data?: any; config?: AxiosRequestConfig }) {
  const { instance, method, url, data, config } = params
  let res: any
  if (method === "get") {
    res = await instance[method](url, config)
  } else if (method === "delete") {
    res = await instance[method](url, { ...config, data })
  } else {
    res = await instance[method](url, data, config)
  }
  return res
}
