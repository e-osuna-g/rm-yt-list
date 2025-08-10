chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  console.log("getting message", message, sender);
  if (message.borrar === true) {
    console.log("message::", message);
    const channels = message.channels.map((el) => el.channel);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "borrar",
        channels: channels,
      }, function (response) {
      });
    });
    sendResponse("something");
  }
  if (message.get) {
    if (message.get == "currentList") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          message: "get",
          info: "currentList",
        }, function (response) {
          console.log("background::currentList", response);
          sendResponse(response);
        });
      });
    }
  }
  switch (message.action) {
    case "parar": {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log("sendParar");
        chrome.tabs.sendMessage(tabs[0].id, {
          message: "action",
          action: "parar",
        }, function (response) {
          console.log("background::Parando", response);
          sendResponse(response);
        });
      });
      break;
    }
    default: {
    }
  }
  return true;
});
