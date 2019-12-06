export function delHtmlTag(str) {
  return str.replace(/<[^>]+>/g, "");//去掉所有的html标记
}
export function delNbsp(str) {
  return str.replace(/&nbsp;/g, " ");//去掉所有的html标记
}

