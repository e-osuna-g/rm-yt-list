(async () => {
  console.log(chrome.extension);
  const src = chrome.extension.getURL("content-script/main.js");
  const contentScript = await import(src);
  contentScript.main(/* chrome: no need to pass it */);
})();
