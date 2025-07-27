import { getCSVAndRemoveVideos, wait } from "./../util/yt.js";
import { timeStringToSeconds } from "./../util/util.js";
import { getLocal, setLocal } from "../util/local.js";
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
      let currentList = new URL(window.location.href).searchParams.get("list");
      let got = await chrome.storage.local.get(currentList);

      if (!Array.isArray(got[currentList])) got[currentList] = [];
      if (got[currentList].some((el) => el.channel == channelName)) {
        return;
      }

      got[currentList].push({
        channel: channelName,
        videoName: videoName,
        seconds: seconds,
        link: link,
      });
      chrome.storage.local.set({ [currentList]: got[currentList] });
    }, { passive: true });

    x.children[1].children[0].children[1].appendChild(btn);
  }
  // scroll to bottom
  console.log("finish");
}

const timeout = setInterval(() => {
  const body = document.querySelector("div#contents");
  if (body) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        addButtons();
      }
    });
    resizeObserver.observe(body);
    clearInterval(timeout);
  }
}, 100);

chrome.runtime.onMessage.addListener( // this is the message listener
  async function (request, sender, sendResponse) {
    const videosTaken = await getCSVAndRemoveVideos(request.channels);
    let currentList = new URL(window.location.href).searchParams.get("list");
    let removed = (await getLocal("RM")).RM;
    removed = removed || {};
    removed[currentList] = removed[currentList] || {};
    for (let video of videosTaken) {
      let id = new URL(video.link).searchParams.get("v");
      removed[currentList][id] = {
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
    return true;
  },
);

function getPlaylistName() {
  const try1Arr = document.querySelectorAll(
    ".thumbnail-and-metadata-wrapper yt-dynamic-sizing-formatted-string #container.dynamic-text-container yt-formatted-string#text",
  );

  for (const el of try1Arr) {
    if (el.innerText && el.innerText.length > 0) {
      return el.innerText;
    }
  }

  const try2 = document.querySelector(
    "#page-header yt-dynamic-text-view-model h1",
  );
  if (try2) {
    return try2.innerText;
  }
  return null;
}

async function addCurrentListInfo() {
  const name = getPlaylistName();
  if (!name) {
    return;
  }
  let currentList = new URL(window.location.href).searchParams.get("list");
  let listInfo = await getLocal("list-info");
  if (listInfo["list-info"]) {
    listInfo = listInfo["list-info"];
  }
  console.log("listInfo", listInfo);
  listInfo[currentList] = {
    id: currentList,
    name: name,
  };
  setLocal("list-info", listInfo);
}
addCurrentListInfo();
