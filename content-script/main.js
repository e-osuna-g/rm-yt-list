import { getCSVAndRemoveVideos, wait } from "./../util/yt.js";
import { timeStringToSeconds } from "./../util/util.js";
import { getLocal } from "../util/local.js";
function getAllChannels() {
  const rt = new Set();
  for (const row of document.querySelectorAll("ytd-playlist-video-renderer")) {
    const channelName =
      row.children[1].children[0].children[1].children[1].children[0]
        .children[0].children[0].innerText;
    rt.add(channelName);
  }
  return rt;
}

async function addButtons() {
  for (const x of document.querySelectorAll("ytd-playlist-video-renderer")) {
    let btn = document.createElement("button");
    btn.innerHTML = "borrar videos de canal";
    const channelName =
      x.children[1].children[0].children[1].children[1].children[0].children[0]
        .children[0].innerText;
    const videoName =
      x.children[1].children[0].children[1].children[0].innerText;
    const seconds = timeStringToSeconds(
      x.querySelector(
        "ytd-thumbnail-overlay-time-status-renderer .badge-shape-wiz__text",
      )?.innerText,
    );

    const link = x.querySelector("a").href;
    btn.addEventListener("click", async (e) => {
      let got = await chrome.storage.local.get("WL");

      if (!Array.isArray(got.WL)) got.WL = [];
      if (got.WL.some((el) => el.channel == channelName)) {
        return;
      }

      got.WL.push({
        channel: channelName,
        videoName: videoName,
        seconds: seconds,
        link: link,
      });
      chrome.storage.local.set({ WL: got.WL });
    }, { passive: true });

    x.children[1].children[0].children[1].appendChild(btn);
  }
  console.log("finish");
}

let interval = setInterval(() => {
  let channels = getAllChannels();
  if (document.readyState == "complete" && channels.size > 1) {
    console.log("clearing");
    clearInterval(interval);
    addButtons();
  }
}, 1000);
async function removeAndBackup(ParaBorrar) {
}

chrome.runtime.onMessage.addListener( // this is the message listener
  async function (request, sender, sendResponse) {
    console.log("ahahahahahah", request);
    const csv = await getCSVAndRemoveVideos(request.channels);
    let localVal = (await getLocal("WL_CSV")).WL_CSV;
    console.log("localcsv", localVal);
    if (!Array.isArray(localVal)) localVal = [];
    localVal.push(csv);

    chrome.storage.local.set({
      WL_CSV: localVal,
    });
    sendResponse("borrados");
    return true;
  },
);
