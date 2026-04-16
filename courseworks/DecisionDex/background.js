chrome.runtime.onInstalled.addListener(() => {
  console.log("DecisionDex installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true, source: "background" });
  }
});
