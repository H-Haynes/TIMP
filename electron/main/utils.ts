/**
 * @fileoverview 字符串工具函数
 *
 * 提供字节感知的字符串截断和填充函数，
 * 用于系统托盘标题（macOS 托盘标题按字节宽度显示，中文占 2-3 字节）。
 */

/**
 * 在字符串左侧填充空格，使字节长度达到指定值
 *
 * 用于系统托盘标题的右对齐效果。
 * 如果字符串字节长度已超过 maxLength，原样返回不做截断。
 *
 * @param str - 源字符串
 * @param maxLength - 目标字节长度
 * @returns 左侧填充空格后的字符串
 *
 * @example
 * padStartWithSpaces("Hello", 10)   // → "     Hello"
 * padStartWithSpaces("你好", 10)     // → "      你好"
 */
export const padStartWithSpaces = (str: string, maxLength: number) => {
  const byteSize = Buffer.byteLength(str, "utf8")
  if (byteSize >= maxLength) {
    return str
  }
  const spacesNeeded = maxLength - byteSize
  const spaces = " ".repeat(spacesNeeded)
  return spaces + str
}

/**
 * 按字节长度截断字符串，不足时左侧补空格到指定长度
 *
 * 遍历字符串中的每个字符，累计 UTF-8 字节长度。
 * 中文字符编码后占 2-3 字节，ASCII 字符占 1 字节。
 *
 * @param str - 源字符串
 * @param length - 目标字节长度
 * @returns 截断（或补齐）后的字符串
 *
 * @example
 * truncateString("Hello World", 8)     // → "  Hello W"
 * truncateString("你好世界，测试文本", 16) // → " 你好世界，测试文"
 */
export const truncateString = (str: string, length: number) => {
  let result = ""
  let byteLength = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i)
    if (byteLength >= length) {
      break
    }
    result += char
    byteLength += encodeURIComponent(char).length > 1 ? 2 : 1
  }
  while (byteLength < length) {
    result = " " + result
    byteLength++
  }
  return result
}
