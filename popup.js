import { getLocal, setLocal } from "./util/local.js";
const times =
  `<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>`;
chrome.storage.local.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key == "WL") {
      console.log(newValue);
      const list = document.querySelector("#list");
      const elArray = [];
      for (let el of newValue) {
        const div = document.createElement("div");
        const remove = document.createElement("span");
        div.innerHTML = el.channel;
        remove.innerHTML = times;
        remove.addEventListener("click", async () => {
          let wl = await getLocal("WL");
          let newWL = wl.WL.filter((wl_filter) =>
            wl_filter.channel !== el.channel
          );
          await setLocal("WL", newWL);
        });
        div.prepend(remove);
        //div.appendChild(remove);
        elArray.push(div);
      }
      list.replaceChildren(...elArray);
    }
    if (key === "RM") {
      generateTakenLists(newValue);
    }
  }
});

async function appendList() {
  var query = { active: true, currentWindow: true };

  let currentTab = (await chrome.tabs.query(query))[0];
  let currentList = new URL(currentTab.url).searchParams.get("list");
  const listElement = await chrome.storage.local.get(currentList);
  const list = document.querySelector("#list");
  const elArray = [];
  for (let index in listElement[currentList]) {
    const el = listElement[currentList][index];
    const div = document.createElement("div");
    const remove = document.createElement("span");
    remove.innerHTML = times;
    remove.classList.add("remove");
    div.innerHTML = el.channel;
    //remove = ;
    remove.addEventListener("click", async () => {
      let wl = (await getLocal(currentList))[currentList];
      let newWL = wl.WL.filter((wl_filter) => wl_filter.channel !== el.channel);
      await setLocal([currentList], newWL);
    });
    div.prepend(remove);
    elArray.push(div);
    list.appendChild(div);
  }
  list.replaceChildren(...elArray);
}
function cleanItem(str) {
  return str.trim().split("\n").filter((e) => e.trim().length).map((e) =>
    e.trim()
  ).join(" ");
}
async function generateTakenLists(RM) {
  const takenList = document.querySelector("#taken_lists");
  const listInfo = (await getLocal("list-info"))["list-info"];
  console.log("listInfo", listInfo);
  let elements = [];
  for (let index in RM) {
    let ix = document.createElement("button");
    ix.setAttribute("type", "button");
    ix.classList.add("btn", "btn-primary");

    const list = RM[index];
    ix.innerHTML = listInfo[index].name;
    ix.type = "button";
    ix.addEventListener("click", () => {
      const anchor = document.createElement("a");
      let videosRows = [];
      for (let el in list) {
        let channelName = cleanItem(list[el].channelName);
        let videoName = cleanItem(list[el].videoName);
        if (channelName.indexOf(",") >= 0 || channelName.indexOf('"') >= 0) {
          channelName = '"' + channelName + '"';
        }
        if (videoName.indexOf(",") >= 0 || videoName.indexOf('"') >= 0) {
          videoName = '"' + videoName + '"';
        }
        videosRows.push(
          `${channelName},${videoName},${list[el].link},${list[el].seconds}`,
        );
      }
      const csv = videosRows.join("\n");
      anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      anchor.download = listInfo[index].name;
      anchor.style = "display:none";
      document.body.appendChild(anchor);
      anchor.click();
    });

    elements.push(ix);
  }
  takenList.replaceChildren(...elements);
}

async function takenList(list) {
  const removed = (await getLocal("RM"))["RM"];
  generateTakenLists(removed);
}
appendList();
takenList();
document.querySelector("#btn_borrar")
  .addEventListener("click", async () => {
    let currentList = await chrome.runtime.sendMessage({
      "get": "currentList",
    });
    const listElement = (await getLocal(currentList))[currentList];
    await chrome.runtime.sendMessage({
      borrar: true,
      channels: listElement,
    });
  });
document.querySelector("#btn_parar")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({
      action: "parar",
    });
  });
document.querySelectorAll(".tab-selector")
  .forEach((el) =>
    el.addEventListener("click", (e) => {
      document.querySelectorAll(".tab-selector").forEach((el) =>
        el.classList.remove("active")
      );
      el.classList.add("active");
      const tabItems = document.querySelectorAll(".tab-item");
      for (let item of tabItems) {
        item.classList.remove("tab-item-active");
        item.classList.add("tab-item-inactive");
      }
      const showEl = document.querySelectorAll(el.dataset.target);
      for (let item of showEl) {
        item.classList.remove("tab-item-inactive");
        item.classList.add("tab-item-active");
      }
    })
  );
