const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}
export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

// export function convertIntToByte(value: number) {
//   let a = value & 0xFF; // 保留二进制后8位
//   let b = a % 128;
//   let c = -1 * (128 - b);
//   return c
// }