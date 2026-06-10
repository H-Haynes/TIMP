declare namespace Base {
  type Page = {
    pageSize?: number
    pageNum?: number
  }
  type Option<T = string | number> = {
    label: string
    value: T
  }
}
