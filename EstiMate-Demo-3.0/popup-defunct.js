import { updateRealtorPopupValues } from "./updateRealtorPopup.js";
import { updateZillowPopupValues } from "./updateZillowPopup.js";
import { generateToken } from "./functionsSession.js";
import { saveSessionData } from "./functionsSession.js";
import { loadSessionData } from "./functionsSession.js";
import { isSessionValid } from "./functionsSession.js";
import {
  formValueConstructorRental,
  formValueConstructorBRRRR,
  isEmpty,
} from "./functionsForm.js";
import { updateRealtorPopupValuesBRRRR } from "./updateRealtorPopup-brrrr.js";

let result = null;
let displayCalculations = null;
let reload = false;
let formMap = {};
let form = {};
let clicks = 0;
let formValueObj = {};
let existingSessionFormValueObj = {};
let state = "";

var coll = document.getElementsByClassName("collapsible");

let auth_submit_btn = document.getElementById("auth-submit-btn"),
  username = document.getElementById("username"),
  password = document.getElementById("password"),
  postBtn = document.getElementsByClassName("post-btn"),
  calculatebtn = document.getElementById("calculate"),
  calculatebtnbrrrr = document.getElementById("calculate-brrrr"),
  resetBtn = document.getElementsByClassName("reset-btn");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchMortgageRates") {
    fetch(request.url)
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
    return true; // Will respond asynchronously
  }
});

function initializeSession(tabId, propertyId) {
  const newToken = generateToken(tabId, propertyId);
  const existingSessionData = loadSessionData();
  if (
    existingSessionData &&
    existingSessionData.token &&
    isSessionValid(existingSessionData, newToken)
  ) {
    result = existingSessionData.result;
    displayCalculations = existingSessionData.displayCalculations;
    form = existingSessionData.form;
    existingSessionFormValueObj = existingSessionData.formValueObj;
    return { sessionToken: existingSessionData.token, timestamp: Date.now() };
  } else {
    const newTimestamp = Date.now();
    console.log("New session created:", {
      token: newToken,
      timestamp: newTimestamp,
    });
    revertForm();
    return { sessionToken: newToken, timestamp: newTimestamp };
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const storedUserData = JSON.parse(localStorage.getItem("userdata"));

  const maincontent = document.getElementById("main-content");
  const brrrcontent = document.getElementById("brrrr-content");
  state = getState(maincontent, brrrcontent);

  if (storedUserData && storedUserData.accessToken && storedUserData.userid) {
    hideAuthPage();
  } else {
    showAuthPage();
  }
  const activeTab = await getActiveTabURL();
  const { siteName, currentPropertyId } = getSiteData(activeTab);
  // if (currentPropertyId == "") {
  //   blockOverlay();
  // }

  const { sessionToken, timestamp } = initializeSession(
    activeTab.id,
    currentPropertyId
  );

  loadForm();

  if (
    result !== null &&
    result !== undefined &&
    displayCalculations !== null &&
    displayCalculations !== undefined &&
    form !== null &&
    form !== undefined
  ) {
    if (siteName === "realtor.com" && formValueObj.Strategy === "rental") {
      updateRealtorPopupValues(result, displayCalculations, formValueObj, null);
    } else if (siteName === "realtor.com" && formValueObj.Strategy  === "BRRRR") {
      updateRealtorPopupValuesBRRRR(
        result,
        displayCalculations,
        formValueObj,
        null
      );
    } else if (siteName === "zillow.com" && formValueObj.Strategy  === "BRRRR") {
      updateZillowPopupValues(result, displayCalculations, formValueObj, form);
    }
  }
  async function getAccessToken(
    username,
    password,
    headers,
    retries = 2,
    delay = 1000
  ) {
    const url = "https://esti-matecalculator.com/api/auth/getAccessToken";
    console.log("getting token");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ username: username, password: password }),
      });

      if (response.status === 429 || response.status === 500) {
        if (retries <= 0) {
          throw new Error("Too many retries");
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        return getAccessToken(username, password, headers, retries - 1, delay);
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const data = await response.json();
        console.log("TOKEN", data);
        return data;
      }
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw error;
    }
  }

  const toggleButtons = document.getElementsByClassName("togglebtn");

  // Loop through each toggle button and add a click event listener
  for (let i = 0; i < toggleButtons.length; i++) {
    toggleButtons[i].addEventListener("click", function () {
      // Swap the display property of maincontent and brrrcontent
      if (maincontent.style.display === "block") {
        maincontent.style.display = "none"; // Hide maincontent
        brrrcontent.style.display = "block"; // Show brrrcontent
        state = getState(maincontent, brrrcontent);
      } else {
        maincontent.style.display = "block"; // Show maincontent
        brrrcontent.style.display = "none"; // Hide brrrcontent
        state = getState(maincontent, brrrcontent);
      }
      loadForm();
    });
  }

  auth_submit_btn.addEventListener("click", async () => {
    const response = await getAccessToken(username.value, password.value, {
      "Content-Type": "application/json",
    });

    try {
      // Show loading state
      auth_submit_btn.disabled = true;
      auth_submit_btn.textContent = "Loading...";

      const { token: accessToken, userId: userid } = response.token;


      if (accessToken && userid) {
        // Store user info in localStorage
        localStorage.setItem(
          "userdata",
          JSON.stringify({
            username: username.value,
            password: password.value,
            accessToken: accessToken,
            userid: userid,
          })
        );
        modal.style.display = "none";
        document.getElementById("main-content").style.display = "block";
        hideAuthPage();
      } else {
        showAlert("Invalid username or password");
      }
    } catch (error) {
      showAlert("An error occurred. Please try again.");
    } finally {
      auth_submit_btn.disabled = false;
      auth_submit_btn.textContent = "Log In";
    }
  });

  signoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userdata");
    showAuthPage();
  });

  calculatebtnbrrrr.addEventListener("click", async () => {
    showOverlay();


    formMap.listingPrice = formValueObj.listingPrice.value;
    formMap.rehabCosts = formValueObj.rehabCosts.value;
    formMap.hardMoneyLoanToValue = formValueObj.hardMoneyLoanToValue.value;
    formMap.hardMoneyInterestRate = formValueObj.hardMoneyInterestRate.value;
    formMap.refinanceInterestRate = formValueObj.refinanceInterestRate.value;
    formMap.monthsUntilRefinance = formValueObj.monthsUntilRefinance.value;
    formMap.downPayment = formValueObj.downPayment.value;
    formMap.closingCosts = formValueObj.closingCosts.value;
    formMap.vacancy = formValueObj.vacancy.value;
    formMap.managementFee = formValueObj.managementFee.value;
    formMap.repairMaintenance = formValueObj.repairMaintenance.value;
    formMap.insurance = formValueObj.insurance.value;
    formMap.propertyTax = formValueObj.propertyTax.value;
    formMap.water = formValueObj.water.value;
    formMap.gas = formValueObj.gas.value;
    formMap.electricity = formValueObj.electricity.value;
    formMap.capitalExpenditure = formValueObj.capitalExpenditure.value;
    formMap.utilities = formValueObj.utilities.value;
    formMap.HOA = formValueObj.HOA.value;
    formMap.rentIncome = formValueObj.rentIncome.value;
    formMap.afterRepairValue = formValueObj.afterRepairValue.value;
    formMap.Strategy = formValueObj.Strategy;

    sendMSG(
      activeTab.id,
      siteName,
      activeTab.url,
      formMap,
      currentPropertyId,
      sessionToken,
      timestamp
    );
    while (clicks < 3) {
      delayedClick(1500, calculatebtnbrrrr);
      clicks++;
    }
  });

  calculatebtn.addEventListener("click", async () => {
    showOverlay();

    formMap["Listing Price"] = formValueObj.listingPrice.value;
    formMap["Reserves"] = formValueObj.reserves.value;
    formMap["Financing LTV"] = formValueObj.loanToValue.value;
    formMap["Loan Rate"] = formValueObj.interestRate.value;
    formMap["Vacancy"] = formValueObj.vacancy.value;
    formMap["Revenue Growth"] = formValueObj.revenueGrowth.value;
    formMap["Expense Growth"] = formValueObj.expenseGrowth.value;
    formMap["Disposition Year"] = formValueObj.dispositionYear.value;
    formMap["Selling Costs"] = formValueObj.sellingCosts.value;
    formMap["Exit Cap"] = formValueObj.exitCap.value;
    formMap["Management"] = formValueObj.managementFee.value;
    formMap["Rent Income"] = formValueObj.rentIncome.value;
    formMap["Insurance"] = formValueObj.insurance.value;
    formMap["Property Tax"] = formValueObj.propertyTax.value;
    formMap["Water"] = formValueObj.water.value;
    formMap["Gas"] = formValueObj.gas.value;
    formMap["Electricity"] = formValueObj.electricity.value;
    formMap["Capital Expenditure"] = formValueObj.capitalExpenditure.value;
    formMap["Utilities"] = formValueObj.utilities.value;
    formMap["HOA"] = formValueObj.HOA.value;
    formMap["Closing Cost"] = formValueObj.closingCosts.value;
    formMap["Strategy"] = formValueObj.Strategy;

    sendMSG(
      activeTab.id,
      siteName,
      activeTab.url,
      formMap,
      currentPropertyId,
      sessionToken,
      timestamp
    );
    while (clicks < 3) {
      delayedClick(1500, calculatebtn);
      clicks++;
    }
  });
});

async function postData(
  username,
  password,
  accessToken,
  allCalculations,
  headers,
  retries = 2,
  delay = 1000
) {
  const url = "https://esti-matecalculator.com/api/reports";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        username: username,
        password: password,
        accessToken: accessToken,
        reportData: allCalculations,
      }),
    });

    if (response.status === 429 || response.status === 500) {
      if (retries <= 0) {
        throw new Error("Too many retries");
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      return postData(
        username,
        password,
        accessToken,
        allCalculations,
        headers,
        retries - 1,
        delay
      );
    } else if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Failed to post report:", error);
    throw error;
  }
}

 

for (let i = 0; i < postBtn.length; i++) {
  postBtn[i].addEventListener("click", async () => {
    try {
      const sessionData = localStorage.getItem("sessionData");
      const userData = localStorage.getItem("userdata");
  
      if (!sessionData || !userData) {
        throw new Error("Missing session or user data");
      }
  
      const { allCalculations } = JSON.parse(sessionData);
      const { accessToken, userid, username, password } = JSON.parse(userData);
  
      if (!allCalculations) {
        throw new Error("No data to post");
      }
  
      const postDataResult = await postData(
        username,
        password,
        accessToken,
        allCalculations,
        {
          "Content-Type": "application/json",
        }
      );
  
      showAlert("Data posted successfully");
    } catch (error) {
      console.error("Error posting data:", error);
      showAlert(error.message || "An error occurred while posting data");
    }
  });
}

function showAlert(message, duration = 1000) {
  const alertBox = document.getElementById("customAlert");
  alertBox.textContent = message;
  alertBox.style.display = "block";

  setTimeout(() => {
    alertBox.style.display = "none";
  }, duration);
}

function delayedClick(delay, btn) {
  setTimeout(() => {
    btn.click();
  }, delay);
}

function blockOverlay() {
  document.getElementById("overlay").style.display = "block";
  // document.getElementById('text-bubble').style.display = 'block'
}

function getState(maincontent, brrrcontent) {
  if (
    maincontent.style.display === "block" &&
    brrrcontent.style.display === "none"
  ) {
    return "rental";
  } else if (
    brrrcontent.style.display === "block" &&
    maincontent.style.display === "none"
  ) {
    return "BRRRR";
  }
}

function loadForm() {
  if (
    existingSessionFormValueObj &&
    existingSessionFormValueObj.Strategy === state
  ) {
    formValueObj = existingSessionFormValueObj;
  } else {
    revertForm();
  }
}

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
  if (obj.from === "reload") {
    revertForm();
  }
});

for (let i = 0; i < resetBtn.length; i++) {
  resetBtn[i].addEventListener("click", function() {
      revertForm(); // Call a function to handle the reset logic
  });
}

async function sendMSG(
  tabId,
  siteName,
  url,
  formMap,
  currentPropertyId,
  sessionToken,
  timestamp
) {
  const response = await chrome.tabs.sendMessage(tabId, {
    from: "pop-up-form",
    propertyId: currentPropertyId,
    form: formMap,
    website: siteName,
    id: tabId,
  });

  if (!response) {
    throw new Error("No response received from content script");
  }

  const { result, displayCalculations, allCalculations, form } = response;

  if (siteName === "realtor.com" && formValueObj.Strategy === "rental") {
    updateRealtorPopupValues(result, displayCalculations, formValueObj, null);
  } else if (siteName === "realtor.com" && formValueObj.Strategy === "BRRRR") {
    updateRealtorPopupValuesBRRRR(
      result,
      displayCalculations,
      formValueObj,
      null
    );
  } else if (siteName === "zillow.com" && formValueObj.Strategy === "rental") {
    updateZillowPopupValues(result, displayCalculations, formValueObj, null);
  }

  hideOverlay();
  allCalculations.propertyId = currentPropertyId;
  saveSessionData(
    sessionToken,
    timestamp,
    result,
    displayCalculations,
    formMap,
    allCalculations,
    formValueObj
  );
}



function clearAllLocalStorage() {
  chrome.storage.local.clear(() => {
    if (chrome.runtime.lastError) {
      console.error("Error clearing local storage:", chrome.runtime.lastError);
    } else {
    }
  });
  localStorage.removeItem("sessiondata");
}

function revertForm() {
  if (!formValueObj || Object.keys(formValueObj).length === 0) {
    return; // Exit the function if it's empty
  }
  // Check the Strategy key in the formValueObj
  if (state === "BRRRR") {
    formValueObj = formValueConstructorBRRRR();
    // Set values for BRRRR strategy
    formValueObj.units.value = ""; // Assuming you want to reset this
    formValueObj.listingPrice.value = ""; // Resetting listing price
    formValueObj.rehabCosts.value = ""; // Resetting rehab costs
    formValueObj.hardMoneyLoanToCost.value = 100.0; // Example value
    formValueObj.hardMoneyLoanToValue.value = 70.0; // Example value
    formValueObj.hardMoneyInterestRate.value = 15.0; // Example value
    formValueObj.refinanceInterestRate.value = ""; // Example value
    formValueObj.monthsUntilRefinance.value = 3; // Example value
    formValueObj.downPayment.value = 25.0; // Example value
    formValueObj.closingCosts.value = 4.0; // Example value
    formValueObj.vacancy.value = 5.0; // Example value
    formValueObj.managementFee.value = ""; // Resetting management fee
    formValueObj.insurance.value = ""; // Resetting insurance
    formValueObj.propertyTax.value = ""; // Resetting property tax
    formValueObj.repairMaintenance.value = "";
    formValueObj.water.value = ""; // Resetting water
    formValueObj.gas.value = ""; // Resetting gas
    formValueObj.electricity.value = ""; // Resetting electricity
    formValueObj.capitalExpenditure.value = ""; // Resetting capital expenditure
    formValueObj.utilities.value = ""; // Resetting utilities
    formValueObj.HOA.value = ""; // Resetting HOA
    formValueObj.rentIncome.value = ""; // Resetting rent income

    formValueObj.capRate.textContent = "0%";
    formValueObj.capRateAfterRepair.textContent = "0%";
    formValueObj.afterRepairValue.textContent = "$0";
    formValueObj.cashOnCash.textContent = "0%";
    formValueObj.totalExpenses.textContent = "$0";
    formValueObj.NOI.textContent = "$0";
  } else if (state === "rental") {
    formValueObj = formValueConstructorRental();
    // Set values for Rental strategy
    formValueObj.listingPrice.value = ""; // Resetting listing price
    formValueObj.reserves.value = ""; // Resetting reserves
    formValueObj.loanToValue.value = 70.0; // Example value
    formValueObj.interestRate.value = ""; // Example value
    formValueObj.closingCosts.value = 3; // Example value
    formValueObj.vacancy.value = 6.25; // Example value
    formValueObj.managementFee.value = ""; // Resetting management fee
    formValueObj.sellingCosts.value = 5.0; // Example value
    formValueObj.exitCap.value = 7.0; // Example value
    formValueObj.expenseGrowth.value = 2.0; // Example values
    formValueObj.insurance.value = ""; // Resetting insurance
    formValueObj.propertyTax.value = ""; // Resetting property tax
    formValueObj.water.value = ""; // Resetting water
    formValueObj.electricity.value = ""; // Resetting electricity
    formValueObj.capitalExpenditure.value = ""; // Resetting capital expenditure
    formValueObj.utilities.value = ""; // Resetting utilities
    formValueObj.HOA.value = ""; // Resetting HOA
    formValueObj.rentIncome.value = ""; // Resetting rental income

    formValueObj.capRate.textContent = "0%";
    formValueObj.leveredProfit.textContent = "$0";
    formValueObj.leveredMultiplier.textContent = "0x";
    formValueObj.cashOnCash.textContent = "0%";
    formValueObj.totalExpenses.textContent = "$0";
    formValueObj.NOI.textContent = "$0";
  }

  // Reset calculation display values

  clearAllLocalStorage();
}

function getSiteData(activeTab) {
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

for (var i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
      this.classList.remove("active");
    } else {
      for (var j = 0; j < coll.length; j++) {
        coll[j].nextElementSibling.style.display = "none";
        coll[j].classList.remove("active");
      }
      content.style.display = "block";
      this.classList.add("active");
    }
  });
}

const overlay = document.createElement("div");
overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

const loadingWheel = document.createElement("div");
loadingWheel.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

// Add the loading wheel to the overlay
overlay.appendChild(loadingWheel);

// Function to show the overlay
function showOverlay() {
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden"; // Prevent scrolling
}

// Function to hide the overlay
function hideOverlay() {
  if (document.body.contains(overlay)) {
    document.body.removeChild(overlay);
    document.body.style.overflow = ""; // Restore scrolling
  }
}

// Function to handle button click

var modal = document.getElementById("loginModal");
// var loginBtn = document.getElementById("loginBtn");
var span = document.getElementById("closeModal");
// const signoutBtn = document.getElementById("signoutBtn");

document.getElementById("signupPageBtn").addEventListener("click", function () {
  window.open("https://esti-matecalculator.com/sign-in", "_blank");
  // document.getElementById('auth-page').style.display = 'none';
});

document.getElementById("loginPageBtn").addEventListener("click", function () {
  // document.getElementById('auth-page').style.display = 'none';
  document.getElementById("loginModal").style.display = "block";
  // document.getElementById('main-content').style.display = 'block';
});
document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("loginModal").style.display = "none";
});

auth_submit_btn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function showAuthPage() {
  document.body.classList.add("auth-active");
  document.getElementById("auth-page").style.display = "flex";
  document.getElementById("main-content").style.display = "none";
}

function hideAuthPage() {
  document.body.classList.remove("auth-active");
  document.getElementById("auth-page").style.display = "none";
  document.getElementById("main-content").style.display = "block";
}
