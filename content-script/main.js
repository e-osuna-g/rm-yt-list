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
    if (x.querySelector(".borrar-video-btn")) {
      continue;
    }
    let btn = document.createElement("button");
    btn.classList.add("borrar-video-btn");
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

const body = document.querySelector("div#contents");
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log("showme", entry);
    addButtons();
  }
});
resizeObserver.observe(body);

async function removeAndBackup(ParaBorrar) {
}

chrome.runtime.onMessage.addListener( // this is the message listener
  async function (request, sender, sendResponse) {
    const videosTaken = await getCSVAndRemoveVideos(request.channels);
    let removed = (await getLocal("RM")).RM;
    removed = removed || {};
    removed.WL = removed.WL || {};
    for (let video of videosTaken) {
      let id = new URL(video.link).searchParams.get("v");
      removed.WL[id] = {
        channelName: video.channelName,
        videoName: video.videoName,
        link: video.link,
        seconds: video.seconds,
      };
    }

    chrome.storage.local.set({
      RM: removed,
    });
    sendResponse("borrados");
    console.log("send response");
    return true;
  },
);
