declare module mitt {
  // ...
  // 添加类型声明
  type EventHandler<T = any> = (event: T) => void;
  // ...

}
