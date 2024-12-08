export function updateRealtorPopupValues(
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

  if (estimates === true) {
    console.log(result);
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

    formValueObj.interestRate.value =
      formValueObj.interestRate.value === ""
        ? (
            parseFloat(
              result["mortgage_details"]["estimate"]["average_rate"]["rate"]
            ) * 100
          ).toFixed(2)
        : formValueObj.interestRate.value;

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
    formValueObj.interestRate.value =
      parseFloat(formValueObj.interestRate.value) * 100;
    formValueObj.propertyTax.value = formValueObj.propertyTax.value;
    formValueObj.closingCosts.value = formValueObj.closingCosts.value;
  }

  if (form === null || form === undefined) {
    formValueObj.reserves.value =
      formValueObj.reserves.value === "" ? 0 : formValueObj.reserves.value;

    formValueObj.expenseGrowth.value =
      formValueObj.expenseGrowth.value === ""
        ? 0
        : formValueObj.expenseGrowth.value;

    formValueObj.sellingCosts.value =
      formValueObj.sellingCosts.value === ""
        ? 0
        : formValueObj.sellingCosts.value;

    formValueObj.exitCap.value =
      formValueObj.exitCap.value === "" ? 0 : formValueObj.exitCap.value;

    formValueObj.revenueGrowth.value =
      formValueObj.revenueGrowth.value === ""
        ? 0
        : formValueObj.revenueGrowth.value;

    formValueObj.loanToValue.value =
      formValueObj.loanToValue.value === ""
        ? 0
        : formValueObj.loanToValue.value;

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

    formValueObj.managementFee.value =
      formValueObj.managementFee.value === ""
        ? 0
        : formValueObj.managementFee.value; // HOA details -> total association fees

    formValueObj.repairMaintenance.value =
      formValueObj.repairMaintenance.value === ""
        ? 0
        : formValueObj.repairMaintenance.value; // HOA details -> total association fees

    formValueObj.units.value =
      formValueObj.units.value === ""
        ? displayCalculations["units"]
        : formValueObj.units.value;
  } else {
    formValueObj.reserves.value =
      formValueObj.reserves.value === ""
        ? form["Reserves"]
        : formValueObj.reserves.value;

    formValueObj.sellingCosts.value =
      formValueObj.sellingCosts.value === ""
        ? form["Selling Costs"]
        : formValueObj.sellingCosts.value;

    formValueObj.exitCap.value =
      formValueObj.exitCap.value === ""
        ? form["Exit Cap"]
        : formValueObj.exitCap.value;

    formValueObj.revenueGrowth.value =
      formValueObj.revenueGrowth.value === ""
        ? form["Revenue Growth"]
        : formValueObj.revenueGrowth.value;

    formValueObj.ftv.value =
      formValueObj.ftv.value === ""
        ? form["Financing LTV"]
        : formValueObj.ftv.value;

    formValueObj.vacancy.value =
      formValueObj.vacancy.value === ""
        ? form["Vacancy"]
        : formValueObj.vacancy.value;

    formValueObj.expenseGrowth.value =
      formValueObj.expenseGrowth.value === ""
        ? form["Expense Growth"]
        : form["Expense Growth"];

    formValueObj.HOA.value =
      formValueObj.HOA.value === "" ? result["hoa"] : formValueObj.HOA.value;

    formValueObj.utilities.value =
      formValueObj.utilities.value === ""
        ? form["Utilities"]
        : formValueObj.utilities.value; // utilities details are given not values

    formValueObj.capitalExpenditure.value =
      formValueObj.capitalExpenditure.value === ""
        ? form["capitalExpenditure"]
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

    formValueObj.managementFee.value =
      formValueObj.managementFee.value === ""
        ? form["Management"]
        : formValueObj.managementFee.value;
        
    formValueObj.repairMaintenance.value =
      formValueObj.repairMaintenance.value === ""
        ? form["Repairs and Maintenance"]
        : formValueObj.repairMaintenance.value;

    formValueObj.closingCosts.value =
      formValueObj.closingCosts.value === ""
        ? form["Closing Cost"]
        : formValueObj.closingCosts.value;

    formValueObj.interestRate.value =
      formValueObj.interestRate.value === ""
        ? result["loan_rate"]
        : formValueObj.interestRate.value;

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
  if (formValueObj.rentIncome.value === "") {
    formValueObj.rentIncome.value = displayCalculations["rentIncome"];
  }
  updateTextContent(
    "leveredProfit",
    formValueObj.leveredProfit,
    displayCalculations,
    (value) => "$" + formatNumber(value)
  );
  updateTextContent(
    "leveredMultiplier",
    formValueObj.leveredMultiplier,
    displayCalculations,
    (value) => formatNumber(value) + "x"
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
    "yearOneCap",
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
