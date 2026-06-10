/** 请求的相关类型 */
declare namespace Service {
  /**
   * 请求的错误类型：
   * - axios: axios错误：网络错误, 请求超时, 默认的兜底错误
   * - http: 请求成功，响应的http状态码非200的错误
   * - backend: 请求成功，响应的http状态码为200，由后端定义的业务错误
   */
  type RequestErrorType = "axios" | "http" | "backend"

  /** 请求错误 */
  interface RequestError {
    type?: RequestErrorType
    code: string | number
    message: string
  }

  /** 后端接口返回的数据结构配置 */
  interface BackendResultConfig {
    codeKey: string
    dataKey: string
    msgKey: string
    successCode: number | string
  }

  // ─── 响应类型 ────────────────────────────────────

  /** 基础响应结构 */
  interface Base {
    code: number
    msg?: string
  }

  /** 常规对象返回 */
  interface RespSingle<T = any> extends Base {
    data: T
  }

  /** 列表（不可分页） */
  interface RespArray<T = any> extends Base {
    data: T[]
  }

  /** 分页列表 */
  interface RespList<T = any> extends Base {
    data: T[]
    total: number
  }

  /** 字符串响应 */
  interface RespString extends Base {
    data: string
  }

  /** 数字响应 */
  interface RespNumber extends Base {
    data: number
  }

  /** 布尔响应 */
  interface RespBoolean extends Base {
    data: boolean
  }

  /** 空响应（删除/更新等操作） */
  interface RespEmpty extends Base {
    data: null | undefined
  }

  /** 文件下载响应 */
  interface RespFile extends Base {
    data: Blob
  }
}
