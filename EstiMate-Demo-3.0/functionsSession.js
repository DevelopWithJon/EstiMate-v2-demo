export function generateToken(tabId, propertyId) {
  return tabId + "_" + propertyId;
}

export function saveSessionData(
  token,
  timestamp,
  result,
  displayCalculations,
  formMap,
  allCalculations,
  formValueObj,
  state
) {
  const sessionData = {
    token: token,
    timestamp: timestamp,
    result: result,
    displayCalculations: displayCalculations,
    formMap: formMap,
    allCalculations: allCalculations,
    formValueObj: formValueObj,
    state: state
  };
  chrome.storage.local.set({ sessionData: sessionData }, () => {});
}

export function loadSessionData() {
  return new Promise((resolve, reject) => {
    // Load session data from Chrome storage
    chrome.storage.local.get(["sessionData"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading session data:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.sessionData || null); // Return session data or null if not found
      }
    });
  });
}

export function isSessionValid(sessionData, newToken) {
  if (sessionData && sessionData.token && sessionData.timestamp) {
    const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds
    const now = Date.now();
    return (
      now - sessionData.timestamp < TEN_MINUTES &&
      sessionData.token === newToken
    );
  }
  return false;
}
