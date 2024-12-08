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
} from "./functionsForm.js";
import {getActiveTabURL, getSiteData, clearAllLocalStorage} from "./functionsChrome.js"
import { updateRealtorPopupValuesBRRRR } from "./updateRealtorPopup-brrrr.js";

class PopupManager {
  constructor(activeTab) {
    this.activeTab = activeTab;
    this.siteName = activeTab.siteName;
    this.currentPropertyId = activeTab.currentPropertyId;
    this.result = null;
    this.displayCalculations = null;
    this.reload = null;
    this.formMap = {};
    this.formValueObj = {};
    this.existingSessionFormValueObj = {};
    this.state = null;
    this.col = document.getElementsByClassName("collapsible");
    this.auth_submit_btn = document.getElementById("auth-submit-btn");
    this.username = document.getElementById("username");
    (this.password = document.getElementById("password")),
      (this.postBtn = document.getElementsByClassName("post-btn")),
      (this.calculateRentalBtn = document.getElementById("calculate")),
      (this.calculateBRRRRBtn = document.getElementById("calculate-brrrr")),
      (this.resetBtn = document.getElementsByClassName("reset-btn"));
    this.userData = JSON.parse(localStorage.getItem("userdata"));
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

  loadForm() {
    if (
      this.existingSessionFormValueObj &&
      this.existingSessionFormValueObj.Strategy === this.state
    ) {
      this.formValueObj = this.existingSessionFormValueObj;
    } else {
      revertForm();
    }
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
    if (this.userData && this.userData.accessToken && this.userData.userid) {
      hideAuthPage();
    } else {
      showAuthPage();
    }
  }

  handleToggle() {
    if (document.getElementById("main-content").style.display === "block") {
      document.getElementById("brrrr-content").style.display = "none"; // Hide maincontent
      document.getElementById("brrrr-content").style.display = "block"; // Show brrrcontent
    } else if (
      document.getElementById("brrrr-content").style.display === "block"
    ) {
      document.getElementById("main-content").style.display = "block"; // Show maincontent
      document.getElementById("brrrr-content").style.display = "none"; // Hide brrrcontent
    }
    this.getState();
    this.loadForm();
  }

  static async postData(
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

  initializeSession(tabId, propertyId) {
    const newToken = generateToken(tabId, propertyId);
    const existingSessionData = loadSessionData();
    if (
      existingSessionData &&
      existingSessionData.token &&
      isSessionValid(existingSessionData, newToken)
    ) {
      this.result = existingSessionData.result;
      this.displayCalculations = existingSessionData.displayCalculations;
      this.form = existingSessionData.form;
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
  }

  static async getAccessToken(
    username,
    password,
    headers,
    retries = 2,
    delay = 1000
  ) {
    const url = "https://esti-matecalculator.com/api/auth/getAccessToken";
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
        return this.getAccessToken(
          username,
          password,
          headers,
          retries - 1,
          delay
        );
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
  static async sendMessage(
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
    } else if (
      siteName === "realtor.com" &&
      formValueObj.Strategy === "BRRRR"
    ) {
      updateRealtorPopupValuesBRRRR(
        result,
        displayCalculations,
        formValueObj,
        null
      );
    } else if (
      siteName === "zillow.com" &&
      formValueObj.Strategy === "rental"
    ) {
      updateZillowPopupValues(result, displayCalculations, formValueObj, null);
    }
  }
  updateApp() {
    if (
      this.result !== null &&
      this.result !== undefined &&
      this.displayCalculations !== null &&
      this.displayCalculations !== undefined &&
      this.form !== null &&
      this.form !== undefined
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
          this.form
        );
      }
    }
  }
  revertForm() {
    if (!formValueObj || Object.keys(formValueObj).length === 0) {
      console.log("formValueObj is empty or not defined.");
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
    [i].addEventListener("click", function () {
      popup.handleToggle();
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

document
  .getElementById("calculate-brrrr")
  .addEventListener("click", async () => {
    return formValues("BRRRR");
  });
document.getElementById("calculate").addEventListener("click", async () => {
  return formValues("rental");
});

// ELEMENTS

// MAIN

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const popup = new PopupManager(activeTab);
  popup.loadForm();
  popup.updateApp();

  document
    .getElementById("auth-submit-btn")
    .addEventListener("click", async () => {
      const response = await popup.getAccessToken(
        username.value,
        password.value,
        {
          "Content-Type": "application/json",
        }
      );

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
          hideAuthPage();
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
