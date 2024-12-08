async function calculateDataBRRRR(formValueObj, result) {

  if (!formValueObj.units) {
    const { units } = formatRentData(result);
    formValueObj.units = units;
  }

  if (!formValueObj.refinanceInterestRate) {
    const loan_rate = await getMortgageRates();
    formValueObj.refinanceInterestRate = loan_rate;
    result["loan_rate"] = loan_rate;
  }

  if (!formValueObj.rentIncome) {
    let response = await estimateRent(result);
    formValueObj.rentIncome = response.rent * formValueObj.units;
  }

  if (!formValueObj.afterRepairValue) {
    let response = await comparables(result);
    formValueObj.afterRepairValue = response.price;
  }

  if (!formValueObj.managementFee) {
    formValueObj.managementFee = formValueObj.rentIncome * 0.1;
  }

  if (!formValueObj.repairMaintenance) {
    formValueObj.repairMaintenance = parseFloat(formValueObj.rentIncome) * 0.05;
  }

  const propertyFeatureMap = {
    listingPrice: Boolean(formValueObj.listingPrice)
      ? parseFloat(formValueObj.listingPrice)
      : parseFloat(result["price"]),
    hardMoneyLoanToValue: Boolean(formValueObj.hardMoneyLoanToValue)
      ? parseFloat(formValueObj.hardMoneyLoanToValue)
      : 0,
    hardMoneyLoanToCost: Boolean(formValueObj.hardMoneyLoanToCost)
      ? parseFloat(formValueObj.hardMoneyLoanToCost) / 100
      : 0,
    hardMoneyInterestRate: Boolean(formValueObj.hardMoneyInterestRate)
      ? parseFloat(formValueObj.hardMoneyInterestRate) / 100
      : 0,
    rehabCosts: Boolean(formValueObj.rehabCosts)
      ? parseFloat(formValueObj.rehabCosts)
      : 0,
    refinanceInterestRate: Boolean(formValueObj.refinanceInterestRate)
      ? parseFloat(formValueObj.refinanceInterestRate) / 100
      : 0,
    monthsUntilRefinance: Boolean(formValueObj.monthsUntilRefinance)
      ? parseInt(formValueObj.monthsUntilRefinance)
      : 0,
    downPayment: Boolean(formValueObj.downPayment)
      ? parseFloat(formValueObj.downPayment) / 100
      : 0,
    closingCosts: Boolean(formValueObj.closingCosts)
      ? parseFloat(formValueObj.closingCosts) / 100
      : 0,
    vacancy: Boolean(formValueObj.vacancy)
      ? parseFloat(formValueObj.vacancy) / 100
      : 0,
    managementFee: Boolean(formValueObj.managementFee)
      ? parseFloat(formValueObj.managementFee)
      : 0,
    insurance: Boolean(formValueObj.insurance)
      ? parseFloat(formValueObj.insurance)
      : 0,
    propertyTax: Boolean(formValueObj.propertyTax)
      ? parseFloat(formValueObj.propertyTax)
      : parseFloat(
          result["mortgage_details"]["estimate"]["monthly_payment_details"][4][
            "amount"
          ]
        ),
    repairMaintenance: Boolean(formValueObj.repairMaintenance)
      ? parseFloat(formValueObj.repairMaintenance)
      : 0,
    water: Boolean(formValueObj.water) ? parseFloat(formValueObj.water) : 0,
    gas: Boolean(formValueObj.gas) ? parseFloat(formValueObj.gas) : 0,
    electricity: Boolean(formValueObj.electricity)
      ? parseFloat(formValueObj.electricity)
      : 0,
    capitalExpenditure: Boolean(formValueObj.capitalExpenditure)
      ? parseFloat(formValueObj.capitalExpenditure)
      : 0,
    utilities: Boolean(formValueObj.utilities)
      ? parseFloat(formValueObj.utilities)
      : 0,
    HOA: Boolean(formValueObj.HOA) ? parseFloat(formValueObj.HOA) : 0,
    rentIncome: Boolean(formValueObj.rentIncome)
      ? parseFloat(formValueObj.rentIncome)
      : 0,
    afterRepairValue: Boolean(formValueObj.afterRepairValue)
      ? parseFloat(formValueObj.afterRepairValue)
      : 0,
    hardMoneyLoanToCost: Boolean(formValueObj.hardMoneyLoanToCost)
      ? parseFloat(formValueObj.hardMoneyLoanToCost)
      : 0,
    strategy: formValueObj.Strategy, // Assuming you want to set the strategy explicitly
  };

  const calculator = new CalculatorBRRRR(propertyFeatureMap);

  const calculatorResults = {
    totalEquity: calculator.calculateTotalEquity(),
    monthlyHardMoneyInterestPayment:
      calculator.calculateMonthlyHardMoneyInterestPayment(),
    hardMoneyClosingCost: calculator.calculateHardMoneyClosingCost(),
    refinanceClosingCosts: calculator.calculateRefinanceClosingCosts(),
    propertyTax: calculator.calculatePropertyTax(),
    totalMonthlyExpense: calculator.calculateTotalMonthlyExpense(),
    totalCashInvestment: calculator.calculateTotalCashInvestment(),
    totalAnnualExpense: calculator.calculateTotalAnnualExpense(),
    totalAnnualIncome: calculator.calculateTotalAnnualIncome(),
    NOI: calculator.calculateNOI(),
    annualMortgagePayment: calculator.calculateAnnualMortgagePayment(),
    annualCashFlow: calculator.calculateAnnualCashFlow(),
    cashOnCashReturn: calculator.calculateCashOnCashReturn(),
    capRate: calculator.calculateCapRate(),
    capRateAfterRepair: calculator.calculateCapRateAfterRepair(),
  };

  return {
    website: "",
    allCalcs: {},
    displayCalcs: {
      capRate: calculatorResults.capRate * 100,
      capRateAfterRepair: calculatorResults.capRateAfterRepair * 100,
      NOI: calculatorResults.NOI,
      cashOnCash: calculatorResults.cashOnCashReturn * 100,
      totalExpense: calculatorResults.totalAnnualExpense,
      rentIncome: formValueObj.rentIncome,
      units: formValueObj.units,
      afterRepairValue: formValueObj.afterRepairValue,
      totalEquity: calculatorResults.totalEquity,
      managementFee: formValueObj.managementFee,
      repairMaintenance: formValueObj.repairMaintenance,
    },
  };
}

class CalculatorBRRRR {
  constructor(propertyFeatureMap) {
    this.propertyFeatureMap = propertyFeatureMap;
  }
  calculateHardMoneyLoanAmount() {
    let listingPriceValue = this.propertyFeatureMap["listingPrice"];
    let rehabCostsValue = this.propertyFeatureMap["rehabCosts"];

    let afterRepairValue = this.propertyFeatureMap["afterRepairValue"];
    let hardMoneyLoanToCostValue =
      this.propertyFeatureMap["hardMoneyLoanToCost"];
    let acquisitionCostValue =
      this.propertyFeatureMap["closingCosts"] * listingPriceValue;
    const arv70 = afterRepairValue * 0.7;

    const initialCost = listingPriceValue + rehabCostsValue;
    const hardMoneyLoanAmount =
      hardMoneyLoanToCostValue * initialCost + acquisitionCostValue > arv70
        ? arv70
        : hardMoneyLoanToCostValue * initialCost + acquisitionCostValue;

    return hardMoneyLoanAmount;
  }

  calculateTotalEquity() {
    let afterRepairValue = this.propertyFeatureMap["afterRepairValue"];
    const calculateNewMortgage = this.calculateNewMortgage();

    return afterRepairValue - calculateNewMortgage;
  }

  calculateMonthlyHardMoneyInterestPayment() {
    let hardMoneyInterestRate =
      this.propertyFeatureMap["hardMoneyInterestRate"];

    const hardMoneyLoanAmount = this.calculateHardMoneyLoanAmount();

    return (hardMoneyLoanAmount * hardMoneyInterestRate) / 12;
  }

  calculateHardMoneyInterestPaymentUntilRefinance(){
    const monthlyHardMoneyInterestPayment = this.calculateMonthlyHardMoneyInterestPayment();
    let monthsUntilRefinance = this.propertyFeatureMap["monthsUntilRefinance"];
    return monthlyHardMoneyInterestPayment * monthsUntilRefinance;
  }

  calculateHardMoneyClosingCost() {
    let listingPriceValue = this.propertyFeatureMap["listingPrice"];

    const closingCosts =
      this.propertyFeatureMap["closingCosts"] * listingPriceValue;

    return closingCosts;
  }

  calculateRefinanceClosingCosts() {
    let afterRepairValue = this.propertyFeatureMap["afterRepairValue"];
    const closingCosts =
      this.propertyFeatureMap["closingCosts"] * afterRepairValue;

    return closingCosts;
  }

  calculatePropertyTax() {
    let propertyTaxRate = this.propertyFeatureMap["propertyTax"];
    return propertyTaxRate;
  }

  calculateTotalMonthlyExpense() {
    let utilitiesExpense = this.propertyFeatureMap["utilities"];
    let capitalExpenditureExpense =
      this.propertyFeatureMap["capitalExpenditure"];
    let electricityExpense = this.propertyFeatureMap["electricity"];
    let gasExpense = this.propertyFeatureMap["gas"];
    let waterExpense = this.propertyFeatureMap["water"];
    let hoaExpense = this.propertyFeatureMap["HOA"];
    let managementExpense = this.propertyFeatureMap["managementFee"];
    let repairMaintenanceExpense = this.propertyFeatureMap["repairMaintenance"];
    let insuranceExpense = this.propertyFeatureMap["insurance"];
    const propertyTaxExpense = this.calculatePropertyTax();

    return (
      utilitiesExpense +
      capitalExpenditureExpense +
      electricityExpense +
      gasExpense +
      waterExpense +
      hoaExpense +
      managementExpense +
      repairMaintenanceExpense +
      insuranceExpense +
      propertyTaxExpense
    );
  }

  calculateTotalCashInvestment() {
    const acquisitionCostValue = this.calculateHardMoneyClosingCost();
    let rehabCostsValue = this.propertyFeatureMap["rehabCosts"];
    const hardMoneyInterestPayments = this.calculateHardMoneyInterestPaymentUntilRefinance();

    return acquisitionCostValue + rehabCostsValue + hardMoneyInterestPayments;
  }

  calculateTotalAnnualExpense() {
    const totalMonthlyExpense = this.calculateTotalMonthlyExpense();
    return totalMonthlyExpense * 12;
  }

  calculateTotalAnnualIncome() {
    let rent = this.propertyFeatureMap["rentIncome"];
    let vacancyRateValue = this.propertyFeatureMap["vacancy"];
    const annualRentIncome = rent * 12;
    return annualRentIncome - vacancyRateValue * annualRentIncome;
  }

  calculateNewMortgage(){
    const hardMoneyLoanAmount = this.calculateHardMoneyLoanAmount();
    let closingCosts = this.calculateHardMoneyClosingCost();
    let afterRepairValue = this.propertyFeatureMap["afterRepairValue"];

    if ((hardMoneyLoanAmount + closingCosts) > afterRepairValue * 0.75){
      return afterRepairValue * 0.75;
    }
    return hardMoneyLoanAmount + closingCosts;
  }
  calculateIncomeLostDuringRepairs(){
    let rent = this.propertyFeatureMap["rentIncome"];
    let monthsUntilRefinance = this.propertyFeatureMap["monthsUntilRefinance"];

    return rent * monthsUntilRefinance;
  }

  calculateNOI() {
    const totalAnnualIncome = this.calculateTotalAnnualIncome();
    const totalAnnualExpense = this.calculateTotalAnnualExpense();
    return totalAnnualIncome - totalAnnualExpense;
  }

  calculateInitialNOI(){
    const totalAnnualIncome = this.calculateTotalAnnualIncome();
    const totalAnnualExpense = this.calculateTotalAnnualExpense();
    const incomeLostDuringRepairs = this.calculateIncomeLostDuringRepairs();
    return totalAnnualIncome - totalAnnualExpense - incomeLostDuringRepairs;
  }


  calculateAnnualMortgagePayment() {
    let interestRateValue = this.propertyFeatureMap["refinanceInterestRate"];
    let mortgageTermValue = 30;

    const mortgage = this.calculateNewMortgage();
    const principalPayment =
      (mortgage * interestRateValue) /
      (Math.pow(1 + interestRateValue, mortgageTermValue) - 1);

    return principalPayment + mortgage * interestRateValue;
  }

  calculateAnnualCashFlow() {
    const noi = this.calculateNOI();
    const calculateAnnualMortgagePayment =
      this.calculateAnnualMortgagePayment();

    return noi - calculateAnnualMortgagePayment;
  }

  calculateInitialAnnualCashFlow() {
    const noi = this.calculateInitialNOI();
    const annualMortgagePayment =
      this.calculateAnnualMortgagePayment();
    const hardMoneyInterestPayments = this.calculateHardMoneyInterestPaymentUntilRefinance()

    return noi - (annualMortgagePayment + hardMoneyInterestPayments);
  }

  calculateCashOnCashReturn() {
    const annualCashFlow = this.calculateAnnualCashFlow();
    const totalCashInvestment = this.calculateTotalCashInvestment();
    return annualCashFlow / totalCashInvestment;
  }

  calculateInitialCashOnCashReturn() {
    const annualCashFlow = this.calculateAnnualCashFlow();
    const totalCashInvestment = this.calculateTotalCashInvestment();
    return annualCashFlow / totalCashInvestment;
  }

  calculateCapRate() {
    let listingPrice = this.propertyFeatureMap["listingPrice"];
    const acquisitionCost = this.calculateHardMoneyClosingCost();
    let rehabCosts = this.propertyFeatureMap["rehabCosts"];

    const noi = this.calculateNOI();

    return (
      noi /
      (listingPrice +
        acquisitionCost +
        rehabCosts)
    );
  }
  calculateCapRateAfterRepair() {
    let afterRepairValue = this.propertyFeatureMap["afterRepairValue"];
    const noi = this.calculateNOI();

    return noi / afterRepairValue;
  }
}
