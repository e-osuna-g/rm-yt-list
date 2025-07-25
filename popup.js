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
    if (key === "RM") {
      generateTakenLists(newValue);
    }
  }
});

async function appendList() {
  const listElement = await chrome.storage.local.get("WL");
  const list = document.querySelector("#list");
  const elArray = [];
  for (let index in listElement.WL) {
    const el = listElement.WL[index];
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

async function generateTakenLists(RM) {
  const takenList = document.querySelector("#taken_lists");
  let elements = [];
  for (let index in RM) {
    let ix = document.createElement("button");
    const list = RM[index];
    ix.innerHTML = index;
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
      anchor.download = index;
      anchor.style = "display:none";
      document.body.appendChild(anchor);
      anchor.click();
    });

    elements.push(ix);
  }
  takenList.replaceChildren(...elements);
}

async function takenList() {
  const removed = (await getLocal("RM")).RM;
  generateTakenLists(removed);
}
appendList();
takenList();
document.querySelector("#btn_borrar")
  .addEventListener("click", async () => {
    const listElement = await chrome.storage.local.get("WL");
    console.log("sending message");
    const response = await chrome.runtime.sendMessage({
      borrar: true,
      channels: listElement.WL,
    });
    console.log("response22", response);
  });
