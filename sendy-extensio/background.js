let latestSelectorData = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'selectorSelected') {
    latestSelectorData = message;
  }

  if (message.action === 'getLatestSelector') {
    sendResponse(latestSelectorData);
  }
});


chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: "popup.html",
    type: "popup",
    width: 550,
    height: 650,
    top: 100,
    left: 0
  });
});