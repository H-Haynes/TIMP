import { ref } from "vue"
import type { Ref } from "vue"
import type { AxiosInstance, AxiosRequestConfig } from "axios"

import useBoolean from "@/hooks/useBoolean"
import useLoading from "@/hooks/useLoading"
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

  /**
   * 异步promise请求
   * @param param : 请求参数
   * - url: 请求地址
   * - method: 请求方法(默认get)
   * - data: 请求的body的data
   * - axiosConfig: axios配置
   */
  async function asyncRequest<T>(param: RequestParam): Promise<Service.RequestResult<T>> {
    const { url } = param
    const method = param.method || "get"
    const { instance } = customInstance
    const res = (await getRequestResponse({ instance, method, url, data: param.data, config: param.axiosConfig })) as Service.RequestResult<T>
    return res
  }

  /**
   * get请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  function get<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    url = isObject(data) ? url + "?" + qs.stringify(data) : url
    return asyncRequest<T>({ url, method: "get", axiosConfig: config })
  }

  /**
   * post请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  function post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: "post", data, axiosConfig: config })
  }
  /**
   * put请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  function put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: "put", data, axiosConfig: config })
  }

  /**
   * delete请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  function handleDelete<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return asyncRequest<T>({ url, method: "delete", data, axiosConfig: config })
  }

  /**
   * download
   * @param url 请求地址
   * @param fileName 文件名
   * @param data 参数
   * @param config axios配置
   */
  function download<T>(url: string, fileName: string, data?: any, config = { method: "get" } as AxiosRequestConfig) {
    return asyncRequest<T>({
      url,
      method: (config.method || "get") as RequestMethod,
      data,
      axiosConfig: Object.assign(
        {
          responseType: "blob"
        },
        config
      )
    }).then((res: any) => {
      const blob = new Blob([res])
      if ("msSaveOrOpenBlob" in navigator) {
        window.navigator.msSaveOrOpenBlob && window.navigator.msSaveOrOpenBlob(blob, fileName) // 针对浏览器
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

  return {
    get,
    post,
    put,
    delete: handleDelete,
    download
  }
}

interface RequestResultHook<T = any> {
  data: Ref<T | null>
  error: Ref<Service.RequestError | null>
  loading: Ref<boolean>
  network: Ref<boolean>
}

/**
 * 创建hooks请求
 * @param axiosConfig - axios配置
 * @param backendConfig - 后端接口字段配置
 */
export function createHookRequest(axiosConfig: AxiosRequestConfig, backendConfig?: Service.BackendResultConfig) {
  const customInstance = new CustomAxiosInstance(axiosConfig, backendConfig)

  /**
   * hooks请求
   * @param param - 请求参数
   * - url: 请求地址
   * - method: 请求方法(默认get)
   * - data: 请求的body的data
   * - axiosConfig: axios配置
   */
  function useRequest<T>(param: RequestParam): RequestResultHook<T> {
    const { loading, startLoading, endLoading } = useLoading()
    const { bool: network, setBool: setNetwork } = useBoolean(window.navigator.onLine)

    startLoading()
    const data = ref<T | null>(null) as Ref<T | null>
    const error = ref<Service.RequestError | null>(null)

    function handleRequestResult(response: any) {
      const res = response as Service.RequestResult<T>
      data.value = res.data
      error.value = res.error
      endLoading()
      setNetwork(window.navigator.onLine)
    }

    const { url } = param
    const method = param.method || "get"
    const { instance } = customInstance

    getRequestResponse({ instance, method, url, data: param.data, config: param.axiosConfig }).then(handleRequestResult)

    return {
      data,
      error,
      loading,
      network
    }
  }

  /**
   * get请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  function get<T>(url: string, config?: AxiosRequestConfig) {
    return useRequest<T>({ url, method: "get", axiosConfig: config })
  }

  /**
   * post请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  function post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return useRequest<T>({ url, method: "post", data, axiosConfig: config })
  }
  /**
   * put请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  function put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return useRequest<T>({ url, method: "put", data, axiosConfig: config })
  }

  /**
   * delete请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  function handleDelete<T>(url: string, config: AxiosRequestConfig) {
    return useRequest<T>({ url, method: "delete", axiosConfig: config })
  }
  return {
    get,
    post,
    put,
    delete: handleDelete
  }
}

async function getRequestResponse(params: { instance: AxiosInstance; method: RequestMethod; url: string; data?: any; config?: AxiosRequestConfig }) {
  const { instance, method, url, data, config } = params
  // console.log("params", params)
  let res: any
  if (method === "get") {
    res = await instance[method](url, config)
  } else if (method === "delete") {
    res = await instance[method](url, { ...config, data })
  } else {
    res = await instance[method](url, data, config)
  }
  // console.log("res-----", res)
  return res
}
