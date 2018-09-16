export function sortString(a, b) {
  return (a || '').toLowerCase().trim().localeCompare((b || '').toLowerCase().trim())
}

export function sortInt(a, b) {
  return parseInt((a || 0), 10) - parseInt((b || 0), 10)
}

export function sortFloat(a, b) {
  return parseFloat((a || 0)) - parseFloat((b || 0))
}

export default {
  sortString,
  sortInt,
  sortFloat
}
