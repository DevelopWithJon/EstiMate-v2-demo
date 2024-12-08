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
  formValues,
  updateFormValueObj
} from "./functionsForm.js";
import {
  getActiveTabURL,
  getSiteData,
  clearAllLocalStorage,
} from "./functionsChrome.js";
import { updateRealtorPopupValuesBRRRR } from "./updateRealtorPopup-brrrr.js";
import { showAlert } from "./miscUtils.js";
class PopupManager {
  constructor(activeTab) {
    this.activeTab = activeTab;
    this.retries = 0;
    this.accessToken = null;
    this.currentPropertyId = "";
    this.result = null;
    this.displayCalculations = null;
    this.reload = null;
    this.formMap = {};
    this.formValueObj = {};
    this.existingSessionFormValueObj = {};
    this.existingFormMap = {};
    this.allCalculations = {};
    this.state = "rental";
    this.col = document.getElementsByClassName("collapsible");
    this.auth_submit_btn = document.getElementById("auth-submit-btn");
    this.username = document.getElementById("username");
    this.password = document.getElementById("password");
    (this.postBtn = document.getElementsByClassName("post-btn")),
      (this.calculateRentalBtn = document.getElementById("calculate")),
      (this.calculateBRRRRBtn = document.getElementById("calculate-brrrr")),
      (this.resetButtons = document.querySelectorAll(".reset-btn"));
    this.userData = JSON.parse(localStorage.getItem("userdata"));
    this.handleToggle = this.handleToggle.bind(this);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const toggleButtons = document.getElementsByClassName("togglebtn");
    for (let i = 0; i < toggleButtons.length; i++) {
      toggleButtons[i].addEventListener("click", (event) => {
        this.handleToggle();
      });
    }

    this.setupCalculateListeners();

    this.resetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.revertForm(); // Call the revertForm method
      });
    });
    // this.sendMessage();
  }

  setupCalculateListeners() {
    document
      .getElementById("calculate-brrrr")
      .addEventListener("click", () => this.calculateFormValues());

    document
      .getElementById("calculate")
      .addEventListener("click", () => this.calculateFormValues());
  }

  calculateFormValues() {
    this.formMap = formValues(this.formValueObj);
    this.updateApp();

    sendMSG(
      this.activeTab.id,
      this.siteName,
      this.activeTab.url,
      this.formMap,
      this.formValueObj,
      this.currentPropertyId,
      this.sessionToken,
      this.timestamp,
      this.formValueObj.Strategy
    );
    // while (this.retries < 2) {
    //   this.delayRecalculate(1000);
    //   this.retries++;
    // }
  }

  _parserUserData() {
    const userData = localStorage.getItem("userdata");
    const { accessToken, userid, username, password } = JSON.parse(userData);
    this.accessToken = accessToken; // Assigning to this.accessToken
    this.userid = userid; // Assigning to this.userid
    this.username = username; // Assigning to this.username
    this.password = password; // Assigning to this.password
  }

  _getSiteData() {
    // Ensure proper destructuring syntax
    const regex = new RegExp(
      "^(?:https?://)?(?:[^@/\n]+@)?(?:www.)?([^:/?\n]+)"
    );
    this.siteName = regex.exec(this.activeTab.url)[1].replace("www.", "");

    if (this.siteName === "realtor.com") {
      const regexPropertyID = /\d+-\d+/;
      const urlParams = this.activeTab.url.split("_M");
      const matches = urlParams[urlParams.length - 1].match(regexPropertyID);

      if (matches) {
        this.currentPropertyId = matches[0];
      }
    } else if (this.siteName === "zillow.com") {
      const regexPropertyID = /(\d+)_zpid/;
      const matches = this.activeTab.url.match(regexPropertyID);

      if (matches) {
        this.currentPropertyId = matches[1];
      }
    }
  }

  getState() {
    if (
      document.getElementById("main-content").style.display === "block" &&
      document.getElementById("brrrr-content").style.display === "none"
    ) {
      this.state = "rental";
    } else if (
      document.getElementById("brrrr-content").style.display === "block" &&
      document.getElementById("main-content").style.display === "none"
    ) {
      this.state = "BRRRR";
    }
  }

  delayRecalculate(delay) {
    setTimeout(() => {
      this.calculateFormValues();
    }, delay);
  }

  loadForm() {
    if (
      this.existingFormMap &&
      this.existingState === this.state
    ) 
    {
      console.log("MET")
      if (this.state === "rental") {
        this.formValueObj = formValueConstructorRental();
      }
      else if (this.state === "BRRRR") {
        this.formValueObj = formValueConstructorBRRRR();
      }
      this.formValueObj = updateFormValueObj(this.formValueObj, this.existingFormMap);
      console.log(this.formValueObj);
    } else {
      this.revertForm();
    }
    this.updateApp()
  }

  showAuthPage() {
    document.body.classList.add("auth-active");
    document.getElementById("auth-page").style.display = "flex";
    document.getElementById("main-content").style.display = "none";
  }

  hideAuthPage() {
    document.body.classList.remove("auth-active");
    document.getElementById("auth-page").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  }

  handleAuthModal() {
    if (this.accessToken && this.userid) {
      this.hideAuthPage();
    } else {
      this.showAuthPage();
    }
  }

  handleToggle() {
    if (document.getElementById("main-content").style.display === "block") {
      document.getElementById("main-content").style.display = "none"; // Hide maincontent
      document.getElementById("brrrr-content").style.display = "block"; // Show brrrcontent
    } else if (
      document.getElementById("brrrr-content").style.display === "block"
    ) {
      document.getElementById("main-content").style.display = "block"; // Show maincontent
      document.getElementById("brrrr-content").style.display = "none"; // Hide brrrcontent
    }
    this.getState();
    this.loadForm();
    this.revertForm();
  }

  async postData(
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
          username: this.username,
          password: this.password,
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

  createOverlayWheel() {
    this.overlay = document.createElement("div");
    this.overlay.style.cssText = `
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
    this.loadingWheel = document.createElement("div");
    this.loadingWheel.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
    this.overlay.appendChild(loadingWheel);
  }

  showOverlay() {
    document.body.appendChild(this.overlay);
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  hideOverlay() {
    if (document.body.contains(this.overlay)) {
      document.body.removeChild(this.overlay);
      document.body.style.overflow = ""; // Restore scrolling
    }
  }

  async initializeSession(tabId, propertyId) {
    const newToken = generateToken(tabId, propertyId);
    const existingSessionData = await loadSessionData();
    if (
      existingSessionData &&
      existingSessionData.token &&
      isSessionValid(existingSessionData, newToken)
    ) {
      this.result = existingSessionData.result;
      this.displayCalculations = existingSessionData.displayCalculations;
      this.form = existingSessionData.form;
      this.existingState = existingSessionData.state;
      this.existingFormMap = existingSessionData.formMap;
      this.existingSessionFormValueObj = existingSessionData.formValueObj;
      this.sessionToken = existingSessionData.token;
      this.timestamp = Date.now();
    } else {
      const newTimestamp = Date.now();
      console.log("New session created:", {
        token: newToken,
        timestamp: newTimestamp,
      });
      this.revertForm();
      this.sessionToken = newToken;
      this.timestamp = newTimestamp;
    }
    this.loadForm();
  }

  async getAccessToken(headers, retries = 2, delay = 1000) {
    const url = "https://esti-matecalculator.com/api/auth/getAccessToken";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          username: this.username.value,
          password: this.password.value,
        }),
      });

      if (response.status === 429 || response.status === 500) {
        if (retries <= 0) {
          throw new Error("Too many retries");
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getAccessToken(headers, retries - 1, delay);
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
  updateApp() {
    if (
      this.result !== null &&
      this.result !== undefined &&
      this.displayCalculations !== null &&
      this.displayCalculations !== undefined
    ) {

      if (
        this.siteName === "realtor.com" &&
        this.formValueObj.Strategy === "rental"
      ) {
        updateRealtorPopupValues(
          this.result,
          this.displayCalculations,
          this.formValueObj,
          null
        );
      } else if (
        this.siteName === "realtor.com" &&
        this.formValueObj.Strategy === "BRRRR"
      ) {
        updateRealtorPopupValuesBRRRR(
          this.result,
          this.displayCalculations,
          this.formValueObj,
          null
        );
      } else if (
        this.siteName === "zillow.com" &&
        this.formValueObj.Strategy === "BRRRR"
      ) {
        updateZillowPopupValues(
          this.result,
          this.displayCalculations,
          this.formValueObj,
          null
        );
      }
    }
  }
  revertForm() {
    if (this.state === "BRRRR") {
      this.formValueObj = formValueConstructorBRRRR();
      // Set values for BRRRR strategy
      this.formValueObj.units.value = ""; // Assuming you want to reset this
      this.formValueObj.listingPrice.value = ""; // Resetting listing price
      this.formValueObj.rehabCosts.value = ""; // Resetting rehab costs
      this.formValueObj.hardMoneyLoanToCost.value = 100.0; // Example value
      this.formValueObj.hardMoneyLoanToValue.value = 70.0; // Example value
      this.formValueObj.hardMoneyInterestRate.value = 15.0; // Example value
      this.formValueObj.refinanceInterestRate.value = ""; // Example value
      this.formValueObj.monthsUntilRefinance.value = 3; // Example value
      this.formValueObj.downPayment.value = 25.0; // Example value
      this.formValueObj.closingCosts.value = 4.0; // Example value
      this.formValueObj.vacancy.value = 5.0; // Example value
      this.formValueObj.managementFee.value = ""; // Resetting management fee
      this.formValueObj.insurance.value = ""; // Resetting insurance
      this.formValueObj.propertyTax.value = ""; // Resetting property tax
      this.formValueObj.repairMaintenance.value = "";
      this.formValueObj.water.value = ""; // Resetting water
      this.formValueObj.gas.value = ""; // Resetting gas
      this.formValueObj.electricity.value = ""; // Resetting electricity
      this.formValueObj.capitalExpenditure.value = ""; // Resetting capital expenditure
      this.formValueObj.utilities.value = ""; // Resetting utilities
      this.formValueObj.HOA.value = ""; // Resetting HOA
      this.formValueObj.rentIncome.value = ""; // Resetting rent income

      this.formValueObj.capRate.textContent = "0%";
      this.formValueObj.capRateAfterRepair.textContent = "0%";
      this.formValueObj.afterRepairValue.textContent = "$0";
      this.formValueObj.cashOnCash.textContent = "0%";
      this.formValueObj.totalExpenses.textContent = "$0";
      this.formValueObj.NOI.textContent = "$0";
    } else if (this.state === "rental") {
      this.formValueObj = formValueConstructorRental();
      // Set values for Rental strategy
      this.formValueObj.listingPrice.value = ""; // Resetting listing price
      this.formValueObj.reserves.value = ""; // Resetting reserves
      this.formValueObj.loanToValue.value = 70.0; // Example value
      this.formValueObj.dispositionYear.value = 10.0;
      this.formValueObj.interestRate.value = ""; // Example value
      this.formValueObj.closingCosts.value = 3; // Example value
      this.formValueObj.vacancy.value = 6.25; // Example value
      this.formValueObj.managementFee.value = ""; // Resetting management fee
      this.formValueObj.sellingCosts.value = 5.0; // Example value
      this.formValueObj.exitCap.value = 7.0; // Example value
      this.formValueObj.expenseGrowth.value = 2.0; // Example values
      this.formValueObj.revenueGrowth.value = 3.0; // Example values
      this.formValueObj.insurance.value = ""; // Resetting insurance
      this.formValueObj.propertyTax.value = ""; // Resetting property tax
      this.formValueObj.water.value = ""; // Resetting water
      this.formValueObj.electricity.value = ""; // Resetting electricity
      this.formValueObj.capitalExpenditure.value = ""; // Resetting capital expenditure
      this.formValueObj.utilities.value = ""; // Resetting utilities
      this.formValueObj.HOA.value = ""; // Resetting HOA
      this.formValueObj.rentIncome.value = ""; // Resetting rental income

      this.formValueObj.capRate.textContent = "0%";
      this.formValueObj.leveredProfit.textContent = "$0";
      this.formValueObj.leveredMultiplier.textContent = "0x";
      this.formValueObj.cashOnCash.textContent = "0%";
      this.formValueObj.totalExpenses.textContent = "$0";
      this.formValueObj.NOI.textContent = "$0";
    }
    clearAllLocalStorage();
  }
}

// LISTENERS

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

document.getElementById("signupPageBtn").addEventListener("click", function () {
  window.open("https://esti-matecalculator.com/sign-in", "_blank");
  // document.getElementById('auth-page').style.display = 'none';
});

signoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userdata");
  showAuthPage();
});

document.getElementById("loginPageBtn").addEventListener("click", function () {
  // document.getElementById('auth-page').style.display = 'none';
  document.getElementById("loginModal").style.display = "block";
  // document.getElementById('main-content').style.display = 'block';
});
document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("loginModal").style.display = "none";
});

document.getElementById("auth-submit-btn").onclick = function () {
  document.getElementById("loginModal").style.display = "none";
};

window.onclick = function (event) {
  if (event.target == document.getElementById("loginModal")) {
    document.getElementById("loginModal").style.display = "none";
  }
};

for (let i = 0; i < document.getElementsByClassName("togglebtn").length; i++) {
  document
    .getElementsByClassName("togglebtn")
    [i].addEventListener("click", () => {
      this.handleToggle(); // Use arrow function to maintain context
    });
}

for (
  var i = 0;
  i < document.getElementsByClassName("collapsible").length;
  i++
) {
  document
    .getElementsByClassName("collapsible")
    [i].addEventListener("click", function () {
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
        this.classList.remove("active");
      } else {
        for (
          var j = 0;
          j < document.getElementsByClassName("collapsible").length;
          j++
        ) {
          document.getElementsByClassName("collapsible")[
            j
          ].nextElementSibling.style.display = "none";
          document
            .getElementsByClassName("collapsible")
            [j].classList.remove("active");
        }
        content.style.display = "block";
        this.classList.add("active");
      }
    });
}

// ELEMENTS

// MAIN

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const popup = new PopupManager(activeTab);
  popup._parserUserData();
  popup._getSiteData();
  popup.initializeSession();
  popup.handleAuthModal();

  document
    .getElementById("auth-submit-btn")
    .addEventListener("click", async () => {
      const response = await popup.getAccessToken({
        "Content-Type": "application/json",
      });

      try {
        // Show loading state
        document.getElementById("auth-submit-btn").disabled = true;
        document.getElementById("auth-submit-btn").textContent = "Loading...";

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
          document.getElementById("loginModal").style.display = "none";
          document.getElementById("main-content").style.display = "block";
          popup.handleAuthModal();
        } else {
          showAlert("Invalid username or password");
        }
      } catch (error) {
        showAlert("An error occurred. Please try again.");
      } finally {
        document.getElementById("auth-submit-btn").disabled = false;
        document.getElementById("auth-submit-btn").textContent = "Log In";
      }
    });
});

async function sendMSG(
  tabId,
  siteName,
  url,
  formMap,
  formValueObj,
  currentPropertyId,
  sessionToken,
  timestamp,
  strategy
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

  if (siteName === "realtor.com" && strategy === "rental") {
    updateRealtorPopupValues(result, displayCalculations, formValueObj, null);
  } else if (siteName === "realtor.com" && strategy === "BRRRR") {
    updateRealtorPopupValuesBRRRR(
      result,
      displayCalculations,
      formValueObj,
      null
    );
  } else if (siteName === "zillow.com" && strategy === "rental") {
    updateZillowPopupValues(result, displayCalculations, formValueObj, null);
  }
  saveSessionData(
    sessionToken,
    timestamp,
    result,
    displayCalculations,
    formMap,
    allCalculations,
    formValueObj,
    strategy
  );
}
