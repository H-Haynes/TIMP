import axios from "axios"
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"
import { REFRESH_TOKEN_CODE } from "./constant"
import { handleAxiosError, handleBackendError, handleResponseError, handleServiceResult } from "./helper"
import { transformRequestData } from './utils'
import { handleRefreshToken } from "./helper"
import whiteCode from "./whiteCode"
/**
 * 封装axios请求类
 * @author Soybean<honghuangdc@gmail.com>
 */
export default class CustomAxiosInstance {
  instance: AxiosInstance
  backendConfig: Service.BackendResultConfig
  /**
   * @param axiosConfig - axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  constructor(
    axiosConfig: AxiosRequestConfig,
    backendConfig: Service.BackendResultConfig = { codeKey: "code", dataKey: "data", msgKey: "message", successCode: 200 }
  ) {
    this.backendConfig = backendConfig
    this.instance = axios.create(axiosConfig)
    this.setInterceptor()
  }

  setInterceptor() {
    /** 设置请求拦截器 */
    this.instance.interceptors.request.use(
      async (config) => {
        const handleConfig = { ...config }
        if (handleConfig.headers) {
          const { userInfo } = useStore('userInfo')
          const contentType = handleConfig.headers["Content-Type"] as string // 数据转换
          handleConfig.headers.Authorization = "Bearer " + userInfo.value.token // 设置token
          handleConfig.data = await transformRequestData(handleConfig.data, contentType)
        }
        return handleConfig
      },
      (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError)
        return handleServiceResult(error, null)
      }
    )
    /** 设置响应拦截器 */
    this.instance.interceptors.response.use(
      async (response) => {
        // 如果是文件流，通过
        if (response.data instanceof Blob) {
          return Promise.resolve(response.data)
        }
        const { status } = response
        if (status === 200 || status < 300 || status === 304) {
          const backend = response.data
          const { codeKey, dataKey, successCode } = this.backendConfig
          if (backend[codeKey] === successCode || whiteCode.includes(backend[codeKey])) {
            // return handleServiceResult(null, backend[dataKey]);
            return handleServiceResult(null, backend)
          }

          // token失效, 刷新token
          if (REFRESH_TOKEN_CODE.includes(backend[codeKey])) {
            // const config = await handleRefreshToken(response.config)
            // if (config) {
            //   return this.instance.request(config)
            // }
            return handleRefreshToken(backend)
          }

          const error = handleBackendError(backend, this.backendConfig) // 处理后端返回的错误
          return handleServiceResult(error, null)
        }
        const error = handleResponseError(response) //处理请求成功后的错误
        return handleServiceResult(error, null)
      },
      (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError)
        return handleServiceResult(error, null)
      }
    )
  }
}
