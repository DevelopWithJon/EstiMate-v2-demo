export function formValueConstructorRental() {
  const formValueObj = {
    units: document.getElementById("units-rental"),
    listingPrice: document.getElementById("listing-price-rental"),
    reserves: document.getElementById("reserves-rental"),
    dispositionYear: document.getElementById("disposition-year-rental"),
    loanToValue: document.getElementById("loan-to-value-rental"),
    interestRate: document.getElementById("interest-rate-rental"),
    closingCosts: document.getElementById("closing-costs-rental"),
    sellingCosts: document.getElementById("selling-costs-rental"),
    exitCap: document.getElementById("exit-cap-rental"),
    revenueGrowth: document.getElementById("revenue-growth-rental"),
    expenseGrowth: document.getElementById("expense-growth-rental"),
    rentIncome: document.getElementById("rental-income-rental"),
    repairMaintenance: document.getElementById("repair-maintenance-rental"),
    vacancy: document.getElementById("vacancy-rental"),
    managementFee: document.getElementById("management-fee-rental"),
    insurance: document.getElementById("insurance-rental"),
    propertyTax: document.getElementById("property-tax-rental"),
    water: document.getElementById("water-rental"),
    gas: document.getElementById("gas-rental"),
    electricity: document.getElementById("electricity-rental"),
    capitalExpenditure: document.getElementById("capital-expenditure-rental"),
    utilities: document.getElementById("utilities-rental"),
    HOA: document.getElementById("HOA-rental"),
    capRate: document.getElementById("cap-rate-value-rental"),
    leveredProfit: document.getElementById("levered-profit-value-rental"),
    leveredMultiplier: document.getElementById(
      "levered-multiplier-value-rental"
    ),
    cashOnCash: document.getElementById("cash-on-cash-value-rental"),
    totalExpenses: document.getElementById("total-expenses-value-rental"),
    NOI: document.getElementById("NOI-value-rental"),
    Strategy: "rental",
  };
  return formValueObj;
}

export function formValueConstructorBRRRR() {
  const formValueObj = {
    units: document.getElementById("units-brrrr"),
    listingPrice: document.getElementById("listing-price-brrrr"),
    rehabCosts: document.getElementById("rehab-costs-brrrr"),
    hardMoneyLoanToCost: document.getElementById(
      "hard-money-loan-to-cost-brrrr"
    ),
    hardMoneyLoanToValue: document.getElementById(
      "hard-money-loan-to-value-brrrr"
    ),
    hardMoneyInterestRate: document.getElementById(
      "hard-money-interest-rate-brrrr"
    ),
    refinanceInterestRate: document.getElementById(
      "refinance-interest-rate-brrrr"
    ),
    monthsUntilRefinance: document.getElementById(
      "months-until-refinance-brrrr"
    ),
    downPayment: document.getElementById("down-payment-brrrr"),
    closingCosts: document.getElementById("closing-costs-brrrr"),
    vacancy: document.getElementById("vacancy-brrrr"),
    managementFee: document.getElementById("management-fee-brrrr"),
    repairMaintenance: document.getElementById("repair-maintenance-brrrr"),
    insurance: document.getElementById("insurance-brrrr"),
    propertyTax: document.getElementById("property-tax-brrrr"),
    water: document.getElementById("water-brrrr"),
    gas: document.getElementById("gas-brrrr"),
    electricity: document.getElementById("electricity-brrrr"),
    capitalExpenditure: document.getElementById("capital-ex-brrrr"),
    utilities: document.getElementById("utilities-brrrr"),
    HOA: document.getElementById("HOA-brrrr"),
    rentIncome: document.getElementById("rent-income-brrrr"),
    afterRepairValue: document.getElementById("after-repair-value-brrrr"),
    capRate: document.getElementById("cap-rate-value-brrrr"),
    capRateAfterRepair: document.getElementById(
      "cap-rate-after-repairs-value-brrrr"
    ),
    cashOnCash: document.getElementById("cash-on-cash-value-brrrr"),
    totalExpenses: document.getElementById("total-expenses-value-brrrr"),
    totalEquity: document.getElementById("total-equity-value-brrrr"),
    NOI: document.getElementById("NOI-value-brrrr"),
    Strategy: "BRRRR",
  };
  return formValueObj;
}

export function formValues(formValueObj) {
  const formMap = {};

  if (formValueObj.Strategy === "BRRRR") {
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
  }
  else if (formValueObj.Strategy === "rental"){
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
    formMap["Repairs and Maintenance"] = formValueObj.repairMaintenance.value;
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
  }
  return formMap;
}

export function updateFormValueObj(formValueObj, formMap) {
  const mapping = {
    // Mapping for BRRRR strategy
    listingPrice: 'listingPrice',
    rehabCosts: 'rehabCosts',
    hardMoneyLoanToValue: 'hardMoneyLoanToValue',
    hardMoneyInterestRate: 'hardMoneyInterestRate',
    refinanceInterestRate: 'refinanceInterestRate',
    monthsUntilRefinance: 'monthsUntilRefinance',
    downPayment: 'downPayment',
    closingCosts: 'closingCosts',
    vacancy: 'vacancy',
    managementFee: 'managementFee',
    repairMaintenance: 'repairMaintenance',
    insurance: 'insurance',
    propertyTax: 'propertyTax',
    water: 'water',
    gas: 'gas',
    electricity: 'electricity',
    capitalExpenditure: 'capitalExpenditure',
    utilities: 'utilities',
    HOA: 'HOA',
    rentIncome: 'rentIncome',
    afterRepairValue: 'afterRepairValue',

    // Mapping for rental strategy
    "Listing Price": 'listingPrice',
    Reserves: 'reserves',
    "Financing LTV": 'loanToValue',
    "Loan Rate": 'interestRate',
    Vacancy: 'vacancy',
    "Revenue Growth": 'revenueGrowth',
    "Expense Growth": 'expenseGrowth',
    "Disposition Year": 'dispositionYear',
    "Selling Costs": 'sellingCosts',
    "Exit Cap": 'exitCap',
    Management: 'managementFee',
    "Repairs and Maintenance": 'repairMaintenance',
    "Rent Income": 'rentIncome',
    Insurance: 'insurance',
    "Property Tax": 'propertyTax',
    Water: 'water',
    Gas: 'gas',
    Electricity: 'electricity',
    "Capital Expenditure": 'capitalExpenditure',
    Utilities: 'utilities',
    HOA: 'HOA',
    "Closing Cost": 'closingCosts',
  };

  for (const key in formMap) {
    if (formMap.hasOwnProperty(key) && mapping[key]) {
      const formKey = mapping[key];
      if (formValueObj[formKey]) {
        formValueObj[formKey].value = formMap[key]; // Update the value
      }
    }
  }
  return formValueObj;
}
export function isEmpty(formValueObj) {
  // Iterate through each property in the formValueObj
  for (const key in formValueObj) {
    // Check if the property is an element and its value is not null or empty
    if (formValueObj.hasOwnProperty(key)) {
      const element = formValueObj[key];
      // Check if the element is an HTML element and its value is not empty
      if (element && element.value !== null && element.value.trim() !== "") {
        return false; // Found a non-null value
      }
    }
  }
  return true; // All values are null or empty
}
