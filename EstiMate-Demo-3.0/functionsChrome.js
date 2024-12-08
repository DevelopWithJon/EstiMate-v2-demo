export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  return tabs[0];
}

export function clearAllLocalStorage() {
  chrome.storage.local.clear(() => {
    if (chrome.runtime.lastError) {
      console.error("Error clearing local storage:", chrome.runtime.lastError);
    } else {
    }
  });
  localStorage.removeItem("sessiondata");
}

export function getSiteData(activeTab) {
    const regex = new RegExp("^(?:https?://)?(?:[^@/\n]+@)?(?:www.)?([^:/?\n]+)");
    const siteName = regex.exec(activeTab.url)[1].replace("www.", "");
    let currentPropertyId = "";
  
    if (siteName === "realtor.com") {
      const regexPropertyID = /\d+-\d+/;
      const urlParams = activeTab.url.split("_M");
      const matches = urlParams[urlParams.length - 1].match(regexPropertyID);
  
      if (matches) {
        currentPropertyId = matches[0];
      }
    } else if (siteName === "zillow.com") {
      const regexPropertyID = /(\d+)_zpid/;
      const matches = activeTab.url.match(regexPropertyID);
  
      if (matches) {
        currentPropertyId = matches[1];
      }
    }
    return { siteName: siteName, currentPropertyId: currentPropertyId };
  }