import { getLocal, setLocal } from "./util/local.js";
chrome.storage.local.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log("check me", newValue, key);
    if (key == "WL") {
      console.log(newValue);
      const list = document.querySelector("#list");
      const elArray = [];
      for (let el of newValue) {
        const div = document.createElement("div");
        const remove = document.createElement("span");
        div.innerHTML = el.channel;
        remove.innerHTML = "✖️";
        remove.addEventListener("click", async () => {
          let wl = await getLocal("WL");
          let newWL = wl.WL.filter((wl_filter) =>
            wl_filter.channel !== el.channel
          );
          console.log("new", newWL);
          await setLocal("WL", newWL);
        });
        div.appendChild(remove);
        elArray.push(div);
      }
      list.replaceChildren(...elArray);
    }
  }
});

async function appendList() {
  const listElement = await chrome.storage.local.get("WL");
  const list = document.querySelector("#list");
  const elArray = [];
  for (let el of listElement.WL) {
    const div = document.createElement("div");
    const remove = document.createElement("span");
    div.innerHTML = el.channel;
    remove.innerHTML = "✖️";
    remove.addEventListener("click", async () => {
      let wl = await getLocal("WL");
      let newWL = wl.WL.filter((wl_filter) => wl_filter.channel !== el.channel);

      await setLocal("WL", newWL);
      console.log("afterwards", await getLocal("WL"));
    });
    div.appendChild(remove);
    elArray.push(div);
    list.appendChild(div);
  }
  list.replaceChildren(...elArray);
}
appendList();

document.querySelector("#btn_borrar")
  .addEventListener("click", async () => {
    const listElement = await chrome.storage.local.get("WL");
    console.log("sending message");
    const response = await chrome.runtime.sendMessage({
      borrar: true,
      channels: listElement.WL,
    });
    console.log(response);
  });
