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
    browser.tabs
      .sendMessage(tabId, {
        message: "urlChanged",
        url: changeInfo.url,
      })
      .then((response) => {
        console.log("Message sent successfully: ", response);
      })
      .catch(onError);
  }
});

function onError(error) {
  console.error(`Error: ${error}`);
}

browser.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    let requestHeaders = details.requestHeaders.filter(
      (h) =>
        !["sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site"].includes(
          h.name.toLowerCase(),
        ),
    );

    requestHeaders.push({ name: "sec-fetch-dest", value: "document" });
    requestHeaders.push({ name: "sec-fetch-mode", value: "navigate" });
    requestHeaders.push({ name: "sec-fetch-site", value: "none" });

    return { requestHeaders };
  },
  { urls: ["*://securecdn.oculus.com/*", "*://store.meta.com/*"] },
  ["blocking", "requestHeaders", "extraHeaders"],
);

browser.webRequest.onHeadersReceived.addListener(
  setHeaders,
  { urls: ["*://securecdn.oculus.com/*", "*://store.meta.com/*"] },
  ["blocking", "responseHeaders", "extraHeaders"],
);

function setHeaders(details) {
  let responseHeaders = details.responseHeaders.filter(
    (h) =>
      ![
        "access-control-allow-origin",
        "access-control-allow-methods",
        "access-control-allow-headers",
      ].includes(h.name.toLowerCase()),
  );
  console.log(responseHeaders);
  responseHeaders.push({
    name: "Access-Control-Allow-Origin",
    value: "*",
  });

  responseHeaders.push({
    name: "Access-Control-Allow-Methods",
    value: "*",
  });

  responseHeaders.push({
    name: "Access-Control-Allow-Headers",
    value: "*",
  });

  return { responseHeaders: responseHeaders };
}
