export function updateRealtorPopupValuesBRRRR(
  result,
  displayCalculations,
  formValueObj,
  form
) {
  // TO Implement an update for calc and an update for when you open app again this should include state of form before closing
  let estimates = false;

  if (result && result["mortgage_details"] !== null) {
    estimates = true; // Some times the monthly details are not present due to home sale closing. FIXME
  }

  formValueObj.listingPrice.value =
    formValueObj.listingPrice.value === ""
      ? result["price"]
      : formValueObj.listingPrice.value;

  // Expense Details

  if (estimates === true) {
    formValueObj.HOA.value =
      formValueObj.HOA.value === ""
        ? result["mortgage_details"]["estimate"]["monthly_payment_details"][2][
            "amount"
          ]
        : formValueObj.HOA.value;

    formValueObj.insurance.value =
      formValueObj.insurance.value === ""
        ? result["mortgage_details"]["estimate"]["monthly_payment_details"][1][
            "amount"
          ] +
          result["mortgage_details"]["estimate"]["monthly_payment_details"][3][
            "amount"
          ]
        : formValueObj.insurance.value;

    formValueObj.refinanceInterestRate.value =
      formValueObj.refinanceInterestRate.value === ""
        ? (
            parseFloat(
              result["mortgage_details"]["estimate"]["average_rate"]["rate"]
            ) * 100
          ).toFixed(2)
        : formValueObj.refinanceInterestRate.value;

    formValueObj.propertyTax.value =
      formValueObj.propertyTax.value === ""
        ? result["mortgage_details"]["estimate"]["monthly_payment_details"][4][
            "amount"
          ]
        : formValueObj.propertyTax.value;

    formValueObj.closingCosts.value =
      formValueObj.closingCosts.value === ""
        ? result["closing_cost"]
        : formValueObj.closingCosts.value;
  } else {
    formValueObj.HOA.value = formValueObj.HOA.value;
    formValueObj.insurance.value = formValueObj.insurance.value;
    formValueObj.hardMoneyInterestRate.value =
      parseFloat(formValueObj.hardMoneyInterestRate.value) * 100;
    formValueObj.refinanceInterestRate.value =
      parseFloat(formValueObj.refinanceInterestRate.value) * 100;
    formValueObj.propertyTax.value = formValueObj.propertyTax.value;
    formValueObj.closingCosts.value = formValueObj.closingCosts.value;
  }

  if (form === null || form === undefined) {
    formValueObj.hardMoneyLoanToValue.value =
      formValueObj.hardMoneyLoanToValue.value === ""
        ? 0
        : formValueObj.hardMoneyLoanToValue.value;

    formValueObj.hardMoneyLoanToCost.value =
      formValueObj.hardMoneyLoanToCost.value === ""
        ? 0
        : formValueObj.hardMoneyLoanToCost.value;

    formValueObj.vacancy.value =
      formValueObj.vacancy.value === "" ? 0 : formValueObj.vacancy.value;

    formValueObj.utilities.value =
      formValueObj.utilities.value === "" ? 0 : formValueObj.utilities.value; // utilities details are given not values

    formValueObj.capitalExpenditure.value =
      formValueObj.capitalExpenditure.value === ""
        ? 0
        : formValueObj.capitalExpenditure.value;

    formValueObj.electricity.value =
      formValueObj.electricity.value === ""
        ? 0
        : formValueObj.electricity.value;

    formValueObj.gas.value =
      formValueObj.gas.value === "" ? 0 : formValueObj.gas.value;

    formValueObj.water.value =
      formValueObj.water.value === "" ? 0 : formValueObj.water.value;

    formValueObj.units.value =
      formValueObj.units.value === ""
        ? displayCalculations["units"]
        : formValueObj.units.value;
  } else {
    formValueObj.ftv.value =
      formValueObj.ftv.value === ""
        ? form["Hard Money Loan-to-Value"]
        : formValueObj.ftv.value;

    formValueObj.vacancy.value =
      formValueObj.vacancy.value === ""
        ? form["Vacancy"]
        : formValueObj.vacancy.value;

    formValueObj.HOA.value =
      formValueObj.HOA.value === "" ? form["HOA"] : formValueObj.HOA.value;

    formValueObj.utilities.value =
      formValueObj.utilities.value === ""
        ? form["Utilities"]
        : formValueObj.utilities.value; // utilities details are given not values

    formValueObj.capitalExpenditure.value =
      formValueObj.capitalExpenditure.value === ""
        ? form["Capital Expenditure"]
        : formValueObj.capitalExpenditure.value;

    formValueObj.electricity.value =
      formValueObj.electricity.value === ""
        ? form["Electricity"]
        : formValueObj.electricity.value;

    formValueObj.gas.value =
      formValueObj.gas.value === "" ? form["Gas"] : formValueObj.gas.value;

    formValueObj.water.value =
      formValueObj.water.value === ""
        ? form["Water"]
        : formValueObj.water.value;

    formValueObj.insurance.value =
      formValueObj.insurance.value === ""
        ? form["Insurance"]
        : formValueObj.insurance.value;

    formValueObj.closingCosts.value =
      formValueObj.closingCosts.value === ""
        ? form["Closing Cost"]
        : formValueObj.closingCosts.value;

    formValueObj.refinanceInterestRate.value =
      formValueObj.refinanceInterestRate.value === ""
        ? result["loan_rate"]
        : formValueObj.refinanceInterestRate.value;

    formValueObj.hardMoneyInterestRate.value =
      formValueObj.hardMoneyInterestRate.value === ""
        ? 100
        : formValueObj.hardMoneyInterestRate.value;

    formValueObj.propertyTax.value =
      formValueObj.propertyTax.value === ""
        ? result["property_tax"]
        : formValueObj.propertyTax.value;

    formValueObj.units.value =
      formValueObj.units.value === ""
        ? displayCalculations["units"]
        : formValueObj.units.value;
  }

  // estimate rent value bases on api call
  // rent value has min, max , average values, we are using average value

  if (!formValueObj.rentIncome.value) {
    formValueObj.rentIncome.value = displayCalculations["rentIncome"];
  }
  if (!formValueObj.afterRepairValue.value) {
    formValueObj.afterRepairValue.value =
      displayCalculations["afterRepairValue"];
  }
  if (!formValueObj.managementFee.value) {
    formValueObj.managementFee.value = displayCalculations["managementFee"];
  }
  if (!formValueObj.repairMaintenance.value) {
    formValueObj.repairMaintenance.value =
      displayCalculations["repairMaintenance"];
  }

  updateTextContent(
    "totalEquity",
    formValueObj.totalEquity,
    displayCalculations,
    (value) => "$" + formatNumber(value)
  );
  updateTextContent(
    "capRateAfterRepair",
    formValueObj.capRateAfterRepair,
    displayCalculations,
    (value) => +formatNumber(value) + "%"
  );
  updateTextContent(
    "NOI",
    formValueObj.NOI,
    displayCalculations,
    (value) => "$" + formatNumber(value)
  );
  updateTextContent(
    "totalExpense",
    formValueObj.totalExpenses,
    displayCalculations,
    (value) => "$" + formatNumber(value)
  );
  updateTextContent(
    "cashOnCash",
    formValueObj.cashOnCash,
    displayCalculations,
    (value) => formatNumber(value) + "%"
  );
  updateTextContent(
    "capRate",
    formValueObj.capRate,
    displayCalculations,
    (value) => value.toFixed(2) + "%",
    100
  );
}
function formatNumber(number) {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

const updateTextContent = (key, element, obj, formatFunc) => {
  if (key in obj) {
    element.textContent = formatFunc(parseFloat(obj[key]));
  }
};
