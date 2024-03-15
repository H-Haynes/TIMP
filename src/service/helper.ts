import type { AxiosRequestConfig } from "axios"
import type { AxiosError, AxiosResponse } from "axios"
import {
  DEFAULT_REQUEST_ERROR_CODE,
  DEFAULT_REQUEST_ERROR_MSG,
  ERROR_STATUS,
  NETWORK_ERROR_CODE,
  NETWORK_ERROR_MSG,
  REQUEST_TIMEOUT_CODE,
  REQUEST_TIMEOUT_MSG,
} from "./constant"
import { exeStrategyActions } from "./utils"
import { showErrorMsg } from "./msg"
import whiteCode from "./whiteCode"



/**
 * 刷新token
 * @param axiosConfig - token失效时的请求配置
 */
export async function handleRefreshToken(axiosConfig: AxiosRequestConfig) {
  console.log(axiosConfig)
  const { logout } = useStore("userInfo")
  logout()
}



type ErrorStatus = keyof typeof ERROR_STATUS

/**
 * 处理axios请求失败的错误
 * @param axiosError - 错误
 */
export function handleAxiosError(axiosError: AxiosError) {
  const error: Service.RequestError = {
    type: "axios",
    code: DEFAULT_REQUEST_ERROR_CODE,
    // message: DEFAULT_REQUEST_ERROR_MSG
    message: axiosError.response?.data?.message ?? DEFAULT_REQUEST_ERROR_MSG
  }


  const actions: Common.StrategyAction[] = [
    [
      // 网路错误
      !window.navigator.onLine || axiosError.message === "Network Error",
      () => {
        Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG })
      }
    ],
    [
      // 超时错误
      axiosError.code === REQUEST_TIMEOUT_CODE && axiosError.message.includes("timeout"),
      () => {
        Object.assign(error, { code: REQUEST_TIMEOUT_CODE, msg: REQUEST_TIMEOUT_MSG })
      }
    ],
    [
      // 请求不成功的错误
      Boolean(axiosError.response),
      () => {
        const errorCode: ErrorStatus = (axiosError.response?.status as ErrorStatus) || "DEFAULT"
        const msg = ERROR_STATUS[errorCode]
        Object.assign(error, { code: errorCode, msg })
      }
    ]
  ]

  exeStrategyActions(actions)

  showErrorMsg(error)

  return error
}

/**
 * 处理请求成功后的错误
 * @param response - 请求的响应
 */
export function handleResponseError(response: AxiosResponse) {
  const error: Service.RequestError = {
    type: "axios",
    code: DEFAULT_REQUEST_ERROR_CODE,
    message: DEFAULT_REQUEST_ERROR_MSG
  }

  if (!window.navigator.onLine) {
    Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG }) // 网路错误
  } else {
    // 请求成功的状态码非200的错误
    const errorCode: ErrorStatus = response.status as ErrorStatus
    const msg = ERROR_STATUS[errorCode] || DEFAULT_REQUEST_ERROR_MSG
    Object.assign(error, { type: "http", code: errorCode, message: msg })
  }
  showErrorMsg(error)

  return error
}

/**
 * 处理后端返回的错误(业务错误)
 * @param backendResult - 后端接口的响应数据
 */
export function handleBackendError(backendResult: Record<string, any>, config: Service.BackendResultConfig) {
  const { codeKey, msgKey } = config
  const error: Service.RequestError = {
    type: "backend",
    code: backendResult[codeKey],
    message: backendResult[msgKey]
  }

  showErrorMsg(error)

  return error
}



/** 统一失败和成功的请求结果的数据类型 */
export async function handleServiceResult<T = any>(error: Service.RequestError | null, data: any) {
  // if (error) {
  //   const fail: Service.FailedResult = { error, data: null }
  //   return fail
  // }
  // const success: Service.SuccessResult<T> = { error: null, data }
  // return success

  if (data && whiteCode.includes(data.code)) {
    return Promise.resolve(data)
  } else if (error) {
    return Promise.reject(error)
  }
}

/** 请求结果的适配器：用于接收适配器函数和请求结果 */
export function adapter<T extends Service.ServiceAdapter>(
  adapterFun: T,
  ...args: Service.MultiRequestResult<TypeUtil.GetFunArgs<T>>
): Service.RequestResult<ReturnType<T>> {
  let result: Service.RequestResult | undefined

  const hasError = args.some((item: any) => {
    const flag = Boolean(item.error)
    if (flag) {
      result = { error: item.error, data: null }
    }
    return flag
  })

  if (!hasError) {
    const adapterFunArgs = args.map((item) => item.data)
    result = { error: null, data: adapterFun(...adapterFunArgs) }
  }

  return result!
}


