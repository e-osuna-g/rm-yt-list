import { timeStringToSeconds } from "./util.js";
export async function getCSVAndRemoveVideos(channelsToRemove) {
  let csv = [];
  for (const x of document.querySelectorAll("ytd-playlist-video-renderer")) {
    const channelName =
      x.children[1].children[0].children[1].children[1].children[0].children[0]
        .children[0].innerText;
    const video = x.children[1].children[0].children[1].children[0].innerText;
    const seconds = timeStringToSeconds(
      x.querySelector(
        "ytd-thumbnail-overlay-time-status-renderer .badge-shape-wiz__text",
      )?.innerText,
    );

    const link = x.querySelector("a").href;
    const chInList = channelsToRemove.find((v) => channelName.indexOf(v) >= 0);
    if (chInList) {
      console.log("removing video", video);
      //generate csv row
      csv.push(generateCSV(channelName, video, link, seconds));
      //await clickAndRemove(x);

      console.log("removed", video);
    }
  }
  return csv.join("\n");
  console.log("finish");
}
function generateCSV(channelName, videoName, link, seconds) {
  return [channelName, videoName, link, seconds].join(",");
}
export async function clickAndRemove(element) {
  element.children[2].children[0].children[2].click();
  await wait(200);
  document.querySelector("ytd-menu-popup-renderer").children[0].children[2]
    .click();
  await wait(300);
}

export function wait(ms) {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}

export function getAllChannels() {
  const rt = new Set();
  for (const row of document.querySelectorAll("ytd-playlist-video-renderer")) {
    const channelName =
      row.children[1].children[0].children[1].children[1].children[0]
        .children[0].children[0].innerText;
    rt.add(channelName);
  }
  return rt;
}
