export const padStartWithSpaces = (str: string, maxLength: number) => {
  const byteSize = Buffer.byteLength(str, 'utf8');
  if (byteSize >= maxLength) {
    return str;
  }
  const spacesNeeded = maxLength - byteSize;
  const spaces = ' '.repeat(spacesNeeded);
  return spaces + str;
}

export const truncateString = (str: string, length: number) => {
  let result = '';
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (byteLength >= length) {
      break;
    }
    result += char;
    byteLength += encodeURIComponent(char).length > 1 ? 2 : 1;
  }
  while (byteLength < length) {
    result = ' ' + result;
    byteLength++;
  }
  return result;
}
