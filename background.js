chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  console.log("getting message", message, sender);
  if (message.borrar === true) {
    const channels = message.channels.map((el) => el.channel);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "borrar",
        channels: channels,
      }, function (response) {
        console.log("response");
      });
    });
    sendResponse("something");
  }
  return true;
});
