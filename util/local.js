export async function getLocal(key) {
  return await chrome.storage.local.get(key);
}

export async function setLocal(key, newVal) {
  return await chrome.storage.local.set({ [key]: newVal });
}
