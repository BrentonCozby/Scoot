export function filterString(searchTerm = '', value = '') {
  return value.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())
}

export default {
  filterString
}
