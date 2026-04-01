browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "Me want cookie!") {
    getCookies("https://www.oculus.com", "oc_ac_at", sendResponse);
    return true;
  }
});

function getCookies(domain, name, callback) {
  browser.cookies.get({ url: domain, name: name }, function (cookie) {
    callback(cookie ? cookie.value : null);
  });
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    browser.tabs.sendMessage(
      tabId,
      {
        message: "urlChanged",
        url: changeInfo.url,
      },
      (response) => {
        if (browser.runtime.lastError) {
          console.warn(
            "Could not send message to content script:",
            browser.runtime.lastError.message,
          );
        } else {
          console.log("Message sent successfully:", response);
        }
      },
    );
  }
});

browser.webRequest.onHeadersReceived.addListener(
  function (details) {
    let responseHeaders = details.responseHeaders;

    responseHeaders.push({
      name: "Access-Control-Allow-Origin",
      value: "https://www.meta.com"
    });

    responseHeaders.push({
      name: "Access-Control-Allow-Methods",
      value: "*"
    });

    responseHeaders.push({
      name: "Access-Control-Allow-Headers",
      value: "*"
    });

    return { responseHeaders };
  },
  { urls: ["*://securecdn.oculus.com/*"] },
  ["blocking", "responseHeaders"]
);