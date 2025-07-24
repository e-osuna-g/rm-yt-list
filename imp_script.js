(async () => {
  const src = chrome.runtime.getURL("content-script/main.js");
  await import(src);
  //console.log("sss", contentMain);
  //contentMain.main();
})();
