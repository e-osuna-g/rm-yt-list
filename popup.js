import { getLocal, setLocal } from "./util/local.js";
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
        remove.innerHTML = "✖️";
        remove.addEventListener("click", async () => {
          let wl = await getLocal("WL");
          let newWL = wl.WL.filter((wl_filter) =>
            wl_filter.channel !== el.channel
          );
          await setLocal("WL", newWL);
        });
        div.appendChild(remove);
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
    div.innerHTML = el.channel;
    remove.innerHTML = "✖️";
    remove.addEventListener("click", async () => {
      let wl = (await getLocal(currentList))[currentList];
      let newWL = wl.WL.filter((wl_filter) => wl_filter.channel !== el.channel);

      await setLocal([currentList], newWL);
      //console.log("afterwards", await getLocal("WL"));
    });
    div.appendChild(remove);
    elArray.push(div);
    list.appendChild(div);
  }
  list.replaceChildren(...elArray);
}

async function generateTakenLists(RM) {
  const takenList = document.querySelector("#taken_lists");
  const listInfo = (await getLocal("list-info"))["list-info"];
  console.log("listInfo", listInfo);
  let elements = [];
  for (let index in RM) {
    let ix = document.createElement("button");
    const list = RM[index];
    ix.innerHTML = listInfo[index].name;
    ix.type = "button";
    ix.addEventListener("click", () => {
      const anchor = document.createElement("a");
      let videosRows = [];
      for (let el in list) {
        let channelName = list[el].channelName;
        let videoName = list[el].videoName;
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
    const currentList = (await getLocal("currentList")).currentList;

    const listElement = (await getLocal(currentList))[currentList];

    const response = await chrome.runtime.sendMessage({
      borrar: true,
      channels: listElement,
    });
    console.log("response22", response);
  });
