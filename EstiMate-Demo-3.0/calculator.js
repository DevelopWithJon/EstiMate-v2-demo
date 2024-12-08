async function calculateData(form, result) {
  if (form["Units"] === "" || form["Units"] === undefined) {
    const { units } = formatRentData(result);
    form["Units"] = units;
  }

  if (
    form["Loan Rate"] === "" ||
    form["Loan Rate"] === undefined ||
    form["Loan Rate"] === null
  ) {
    const loan_rate = await getMortgageRates();
    form["Loan Rate"] = loan_rate;
    result["loan_rate"] = loan_rate;
  }

  if (form["Rent Income"] === "" || form["Rent Income"] === undefined) {
    let response = await estimateRent(result);
    form["Rent Income"] = response.rent * form["Units"];
  }

  const propertyFeatureMap = {
    Insurance: Boolean(form["Insurance"])
      ? parseFloat(form["Insurance"]) * 12
      : 0,
    Water: Boolean(form["Water"]) ? parseFloat(form["Water"]) * 12 : 0,
    Electricity: Boolean(form["Electricity"])
      ? parseFloat(form["Electricity"]) * 12
      : 0,
    repairMaintenance: Boolean(form["repairMaintenance"])
      ? parseFloat(form["repairMaintenance"]) * 12
      : 0,
    revenue: Boolean(form["Rent Income"])
      ? parseFloat(form["Rent Income"]) * 12
      : 0,
    vacancy: Boolean(form["Vacancy"]) ? parseFloat(form["Vacancy"]) / 100 : 0,
    expenseGrowth: Boolean(form["Expense Growth"])
      ? parseFloat(form["Expense Growth"]) / 100
      : 0.02,
    revenueGrowth: Boolean(form["Revenue Growth"])
      ? parseFloat(form["Revenue Growth"]) / 100
      : 0.03,
    Management: Boolean(form["Management"])
      ? parseFloat(form["Management"]) * 12
      : 0,
    HOA: Boolean(form["HOA"]) ? parseFloat(form["HOA"]) * 12 : 0,
    Utilities: Boolean(form["Utilities"])
      ? parseFloat(form["Utilities"]) * 12
      : 0,
    Gas: Boolean(form["Gas"]) ? parseFloat(form["Gas"]) * 12 : 0,
    capitalEx: Boolean(form["capitalEx"])
      ? parseFloat(form["capitalEx"]) * 12
      : 0,
    financingLTV: Boolean(form["Financing LTV"])
      ? parseFloat(form["Financing LTV"])
      : 70.0,
    mortgageRate: Boolean(form["Loan Rate"])
      ? parseFloat(form["Loan Rate"]) / 100
      : (await getMortgageRates()) / 100,
    Disposition: Boolean(form["Disposition Year"])
      ? parseFloat(form["Disposition Year"])
      : 10,
    exitCap: Boolean(form["Exit Cap"]) ? parseFloat(form["Exit Cap"]) / 100 : 0,
    salesCost: Boolean(form["Selling Costs"])
      ? parseFloat(form["Selling Costs"]) / 100
      : 0,
    listingPrice: Boolean(form["Listing Price"])
      ? parseFloat(form["Listing Price"])
      : 0,
    reserves: Boolean(form["Reserves"]) ? parseFloat(form["Reserves"]) : 0,
    units: Boolean(form["Units"]) ? parseFloat(form["Units"]) : 1,
    propertyTax: Boolean(form["Property Tax"])
      ? parseFloat(form["Property Tax"]) * 12
      : result['property_tax'],
    closingCosts: Boolean(form["Closing Cost"])
      ? parseFloat(form["Closing Cost"]) / 100
      : 0,
  };
  const propertyFundamentalsMap = {
    listingPrice: parseFloat(result["price"]),
  };


  const calc = new Calculator(propertyFeatureMap, propertyFundamentalsMap);

  const calculationResults = {
    displayCalcs: {
      yearOneCap: calc.calculateYearOneCap() * 100,
      leveredProfit: calc.calculateleveredProfit(),
      leveredMultiplier: calc.calculateleveredMoM(),
      cashOnCash: calc.calculateAllCOC()[0] * 100,
      totalExpense: calc.calculateAllTotalExpenses()[0],
      NOI: calc.calculateAllNOI()[0],
      rentIncome: form["Rent Income"],
      units: propertyFeatureMap.units,
    },
    allCalcs: {
      propertyId: "",
      reportNickName: "",
      address: result.line,
      city: result.city,
      state: result.state,
      zip: result.zip,
      image: result.image,
      loan_to_value: propertyFeatureMap.financingLTV,
      closing_cost: propertyFeatureMap.closingCosts,
      selling_cost: propertyFeatureMap.salesCost,
      exit_cap: propertyFeatureMap.exitCap,
      reserves: propertyFeatureMap.reserves,
      interest: propertyFeatureMap.mortgageRate,
      year_one_cap: calc.calculateYearOneCap(),
      unlevered_irr: calc.calculateUnleveredIRR(),
      levered_irr: calc.calculateLeveredIRR(),
      unlevered_mom: calc.calculateleveredMoM(),
      levered_mom: calc.calculateleveredMoM(),
      levered_profit: calc.calculateleveredProfit(),
      bedrooms: result.bedrooms,
      bathrooms: result.bathrooms,
      year_built: result.year_built,
      water_source: "",
      property_subtype: result.property_sub_type,
      listing_price: result.price,
      sales_status: result.status,
      sqft: result.sqft,
      all_cash_on_cash: calc.calculateAllCOC(),
      all_insurance: calc.calculateAllInsurance(),
      all_water: calc.calculateAllWater(),
      all_electricity: calc.calculateAllElectricity(),
      all_RM: calc.calculateAllRM(),
      all_vacancy: calc.calculateAllVacancy(),
      all_revenue: calc.calculateAllRevenue(),
      all_management: calc.calculateAllManagement(),
      all_HOA: calc.calculateAllHOA(),
      all_utilities: calc.calculateAllUtilities(),
      all_gas: calc.calculateAllGas(),
      all_capex: calc.calculateAllCapitalEx(),
      all_total_expenses: calc.calculateAllTotalExpenses(),
      all_total_loan_payment: calc.calculateAllTotalLoanPayment(),
      all_principal: calc.calculatePrincipal(),
      all_interest: calc.calculateAllInterest(),
      all_loan_balance: calc.calculateAllLoanBalance(),
      all_balloon: calc.calculateAllBalloon(),
      all_ending_balance: calc.calculateAllEndingBalance(),
      all_NOI: calc.calculateAllNOI(),
      all_net_deposit_proceeds: calc.calculateAllNetDepositionProceeds(),
      all_unlevered_yield: calc.calculateAllunleveredYield(),
      all_DSCR: calc.calculateAllDSCR(),
      all_NOI_growth: calc.calculateAllNoiGrowth(),
      all_NOI_margin: calc.calculateAllNOIMargin(),
      all_CFG_growth: calc.calculateAllleveredCFGrowth(),
    },
  };
  return calculationResults;
}

class Calculator {
  constructor(propertyFeatureMap, propertyFundamentalsMap) {
    this.propertyFeatureMap = propertyFeatureMap;
    this.propertyFundamentalsMap = propertyFundamentalsMap;
    this.dispositionYear = this.propertyFeatureMap["Disposition"];
    this.calculatedAllRevenue = this.calculateAllRevenue();
    this.calculatedLoan = this.calculateLoan();
    this.calculatedInterest = this.calculateInterest();
    this.calculatedPrincipal = this.calculatePrincipal();
    this.calculatedAllPrincipal = this.calculateAllPrincipal();
    this.calculatedAllLoanBalance = this.calculateAllLoanBalance();
    this.calculatedAllTotalLoanPayment = this.calculateAllTotalLoanPayment();
    this.calculatedAllNOI = this.calculateAllNOI();
    this.calculatedUnleveredCashFlow = this.calculateUnleveredCashFlow();
    this.calculatedLeveredCashFlow = this.calculateLeveredCashFlow();
  }

  calculateAllTax() {
    let taxValue = parseFloat(this.propertyFeatureMap["propertyTax"]);
    if (taxValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const taxArray = [];
      taxArray.push(taxValue);

      while (i--) {
        taxValue = taxValue * (1 + expenseGrowth);
        taxArray.push(taxValue);
      }
      return taxArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }
  calculateAllInsurance() {
    let insuranceValue = parseFloat(this.propertyFeatureMap["Insurance"]);
    if (insuranceValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const insuranceArray = [];
      insuranceArray.push(insuranceValue);

      while (i--) {
        insuranceValue = parseFloat(insuranceValue * (1 + expenseGrowth));
        insuranceArray.push(insuranceValue);
      }
      return insuranceArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllWater() {
    let waterValue = parseFloat(this.propertyFeatureMap["Water"]);
    if (waterValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const waterArray = [];
      waterArray.push(waterValue);

      while (i--) {
        waterValue = waterValue * (1 + expenseGrowth);
        waterArray.push(waterValue);
      }
      return waterArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllElectricity() {
    let electricityValue = parseFloat(this.propertyFeatureMap["Electricity"]);
    if (electricityValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const electricityArray = [];
      electricityArray.push(electricityValue);

      while (i--) {
        electricityValue = electricityValue * (1 + expenseGrowth);
        electricityArray.push(electricityValue);
      }
      return electricityArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllRM() {
    let rmValue = parseFloat(this.propertyFeatureMap["RM"]);
    if (rmValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const rmArray = [];
      rmArray.push(rmValue);

      while (i--) {
        rmValue = rmValue * (1 + expenseGrowth);
        rmArray.push(rmValue);
      }
      return rmArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllVacancy() {
    let revenueValue = parseFloat(this.propertyFeatureMap["revenue"]);
    let vacancyValue =
      revenueValue * parseFloat(this.propertyFeatureMap["vacancy"]);
    if (vacancyValue) {
      let i = this.dispositionYear;
      const vacancyArray = [];
      vacancyArray.push(vacancyValue);

      while (i--) {
        vacancyArray.push(vacancyValue);
      }
      return vacancyArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllRevenue() {
    let revenueValue = parseFloat(this.propertyFeatureMap["revenue"]);
    if (revenueValue) {
      const revenueGrowth = parseFloat(
        this.propertyFeatureMap["revenueGrowth"]
      );
      let i = this.dispositionYear;
      const revenueArray = [];
      revenueArray.push(revenueValue);

      while (i--) {
        revenueValue = revenueValue * (1 + revenueGrowth);
        revenueArray.push(revenueValue);
      }
      return revenueArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllManagement() {
    let managementValue = parseFloat(this.propertyFeatureMap["Management"]);
    if (managementValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const managementArray = [];
      managementArray.push(managementValue);

      while (i--) {
        managementValue = managementValue * (1 + expenseGrowth);
        managementArray.push(managementValue);
      }
      return managementArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllHOA() {
    let hoaValue = parseFloat(
      this.propertyFeatureMap["Calculated Total Monthly Association Fees"]
    );
    if (hoaValue) {
      hoaValue = hoaValue;
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const hoaArray = [];
      hoaArray.push(hoaValue);

      while (i--) {
        hoaValue = hoaValue * (1 + expenseGrowth);
        hoaArray.push(hoaValue);
      }
      return hoaArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllUtilities() {
    let utilitiesValue = parseFloat(this.propertyFeatureMap["Utilities"]);
    if (utilitiesValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const utilitiesArray = [];
      utilitiesArray.push(utilitiesValue);

      while (i--) {
        utilitiesValue = utilitiesValue * (1 + expenseGrowth);
        utilitiesArray.push(utilitiesValue);
      }
      return utilitiesArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllGas() {
    let gasValue = parseFloat(this.propertyFeatureMap["Gas"]);
    if (gasValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const gasArray = [];
      gasArray.push(gasValue);

      while (i--) {
        gasValue = gasValue * (1 + expenseGrowth);
        gasArray.push(gasValue);
      }
      return gasArray;
    }
    return new Array(this.dispositionYear).fill(0);
  }

  calculateAllCapitalEx() {
    let CapitalExValue = parseFloat(this.propertyFeatureMap["capitalEx"]);
    if (CapitalExValue) {
      const expenseGrowth = parseFloat(
        this.propertyFeatureMap["expenseGrowth"]
      );
      let i = this.dispositionYear;
      const CapitalExArray = [];
      CapitalExArray.push(CapitalExValue);

      while (i--) {
        CapitalExValue = CapitalExValue * (1 + expenseGrowth);
        CapitalExArray.push(CapitalExValue);
      }
      return CapitalExArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
  calculateAllClosingCosts() {
    return [this.propertyFeatureMap["closingCosts"], 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  calculateAllTotalExpenses() {
    const taxArray = this.calculateAllTax();
    const insuranceArray = this.calculateAllInsurance();
    const waterArray = this.calculateAllWater();
    const electricityArray = this.calculateAllElectricity();
    const rmArray = this.calculateAllRM();
    const managementArray = this.calculateAllManagement();
    const capexArray = this.calculateAllCapitalEx();
    const gasArray = this.calculateAllGas();
    const hoaArray = this.calculateAllHOA();
    const utilitiesArray = this.calculateAllUtilities();

    const expenseArray = [];
    for (let i = 0; i < this.dispositionYear; i++) {
      let sumExpenses =
        taxArray[i] +
        insuranceArray[i] +
        waterArray[i] +
        electricityArray[i] +
        rmArray[i] +
        managementArray[i] +
        capexArray[i] +
        gasArray[i] +
        hoaArray[i] +
        utilitiesArray[i];


      expenseArray.push(sumExpenses);
    }
    return expenseArray;
  }
  calculateLoan() {
    const listingPrice = determineListingPrice(
      this.propertyFeatureMap,
      this.propertyFundamentalsMap
    );

    const closingCost =
      this.propertyFeatureMap["closingCosts"] *
      (listingPrice + this.propertyFeatureMap["reserves"]);
    const financingLTV = this.propertyFeatureMap["financingLTV"] / 100;
    const loanAmount =
      (listingPrice + this.propertyFeatureMap["reserves"] + closingCost) *
      financingLTV;
    return loanAmount;
  }

  calculateInterest() {
    const loanAmount = this.calculatedLoan;
    const mortgageRate = parseFloat(this.propertyFeatureMap["mortgageRate"]);
    return loanAmount * mortgageRate;
  }

  //TODO: NEED REVIEW FOR THIS FUNCTION
  calculatePrincipal() {
    const mortgageRate = parseFloat(this.propertyFeatureMap["mortgageRate"]);
    const interest = this.calculatedInterest;
    const principalPayment = interest / (Math.pow(1 + mortgageRate, 30) - 1);
    return principalPayment;
  }

  calculateAllTotalLoanPayment() {
    const interestArray = this.calculateAllInterest();
    const principalPaymentsArray = this.calculatedAllPrincipal;
    const balloonArray = this.calculateAllBalloon();
    const totalLoanPaymentArray = [];

    for (let i = 0; i < this.dispositionYear; i++) {
      totalLoanPaymentArray.push(
        principalPaymentsArray[i] + interestArray[i] + balloonArray[i]
      );
    }
    return totalLoanPaymentArray;
  }

  calculateAllPrincipal() {
    let principalPayment = this.calculatedPrincipal;
    const mortgageRate = this.propertyFeatureMap["mortgageRate"];

    let i = this.dispositionYear;
    const principalPaymentArray = [];
    principalPaymentArray.push(principalPayment);
    while (i--) {
      principalPayment = principalPayment * (1 + mortgageRate);
      principalPaymentArray.push(principalPayment);
    }
    return principalPaymentArray;
  }

  calculateAllInterest() {
    const initialInterest = this.calculatedInterest;
    const initialPrincipalPayment = this.calculatedPrincipal;
    let interest = initialInterest;
    const totalLoanPayment = initialInterest + initialPrincipalPayment;
    const principalPaymentArray = this.calculatedAllPrincipal;
    const interestArray = [];
    let i = 1;

    if (initialInterest) {
      interestArray.push(interest);

      do {
        interest = totalLoanPayment - principalPaymentArray[i];
        interestArray.push(interest);
        i++;
      } while (i <= this.dispositionYear);
      return interestArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllLoanBalance() {
    let loanValue = this.calculatedLoan;
    const loanBalanceArray = [];
    const principalPaymentArray = this.calculatedAllPrincipal;
    let i = 1;
    if (loanValue) {
      loanBalanceArray.push(loanValue);

      do {
        loanValue = loanValue - principalPaymentArray[i];
        loanBalanceArray.push(loanValue);
        i++;
      } while (i <= this.dispositionYear);
      return loanBalanceArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllBalloon() {
    const balloonArray = [];
    const loanBalanceArray = this.calculatedAllLoanBalance;
    const principalPaymentArray = this.calculatedAllPrincipal;

    if (principalPaymentArray) {
      let i = this.dispositionYear - 1;
      while (i--) {
        balloonArray.push(0);
      }

      balloonArray.push(
        loanBalanceArray[this.dispositionYear - 1] -
          principalPaymentArray[this.dispositionYear - 1]
      );
      return balloonArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllEndingBalance() {
    const loanBalanceArray = this.calculatedAllLoanBalance;
    const principalPaymentArray = this.calculatedAllPrincipal;
    const balloonArray = this.calculateAllBalloon();
    const endingBalanceArray = [];
    let endingBalanceValue = 0;
    let i = 0;
    if (principalPaymentArray) {
      do {
        endingBalanceValue =
          loanBalanceArray[i] + principalPaymentArray[i] + balloonArray[i];
        endingBalanceArray.push(endingBalanceValue);
        i++;
      } while (i < this.dispositionYear);
      endingBalanceArray.push(0);
      return endingBalanceArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllNOI() {
    const totalExpenseArray = this.calculateAllTotalExpenses();
    const revenueArray = this.calculatedAllRevenue;
    const vacancyArray = this.calculateAllVacancy();
    const noiArray = [];

    if (revenueArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        let noi = revenueArray[i] - totalExpenseArray[i] - vacancyArray[i];
        noiArray.push(noi);
      }
      return noiArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  // TODO: NEED REVIEW FOR THIS FUNCTION
  calculateAllNOIMargin() {
    const noiArray = this.calculatedAllNOI;
    const revenueArray = this.calculatedAllRevenue;
    const noiMarginArray = [];
    if (noiArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        let noiMargin = noiArray[i] / revenueArray[i];
        noiMarginArray.push(noiMargin);
      }
      return noiMarginArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllNetDepositionProceeds() {
    const noiArray = this.calculatedAllNOI;
    const exitCapValue = this.propertyFeatureMap["exitCap"];
    const salesCostValue = this.propertyFeatureMap["salesCost"];
    const netDepositionProceedArray = new Array(this.dispositionYear - 1).fill(
      0
    );
    const NetDepositionProceedValue =
      (noiArray[noiArray.length - 1] / exitCapValue) * (1 - salesCostValue);
    netDepositionProceedArray.push(NetDepositionProceedValue);
    return netDepositionProceedArray;
  }

  calculateYearOneCap() {
    const noiArray = this.calculatedAllNOI;
    const listingPrice = determineListingPrice(
      this.propertyFeatureMap,
      this.propertyFundamentalsMap
    );
    return noiArray[0] / listingPrice;
  }

  calculateUnleveredCashFlow() {
    const noiArray = this.calculatedAllNOI;
    const listingPrice = determineListingPrice(
      this.propertyFeatureMap,
      this.propertyFundamentalsMap
    );
    const netDepositionProceedArray = this.calculateAllNetDepositionProceeds();
    const unleveredCashFlowArray = [];
    const closingCost = this.propertyFeatureMap["closingCosts"] * listingPrice;
    const reserves = this.propertyFeatureMap["reserves"];

    const TotalDebt = (listingPrice + closingCost + reserves) * -1;
    unleveredCashFlowArray.push(TotalDebt);

    if (unleveredCashFlowArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        unleveredCashFlowArray.push(noiArray[i] + netDepositionProceedArray[i]);
      }
      return unleveredCashFlowArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
  calculateUnleveredIRR() {
    const unleveredCashFlowArray = this.calculatedUnleveredCashFlow;
    return IRR(unleveredCashFlowArray);
  }
  calculateUnleveredProfit() {
    const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
    const unleveredProfit = unleveredCashFlowArray
      .slice(1)
      .reduce((partialSum, a) => {
        if (Number.isFinite(a)) {
          return partialSum + a;
        } else {
          console.error("Non-finite number found:", a);
          return partialSum;
        }
      }, 0);
    return unleveredProfit - unleveredCashFlowArray[0];
  }
  calculateUnleveredMoM() {
    const unleveredCashFlowArray = this.calculatedUnleveredCashFlow.slice(1);
    const unleveredSum = unleveredCashFlowArray.reduce(
      (partialSum, a) => partialSum + a,
      0
    );
    const initialUnleveredCashFlowValue = this.calculatedUnleveredCashFlow[0];
    const MoM = unleveredSum / (-1 * initialUnleveredCashFlowValue);
    return MoM;
  }
  calculateLeveredIRR() {
    const leveredCashFlowArray = this.calculateLeveredCashFlow();
    return IRR(leveredCashFlowArray);
  }
  calculateleveredProfit() {
    const leveredCashFlowArray = this.calculateLeveredCashFlow();
    const leveredProfit = leveredCashFlowArray
      .slice(1)
      .reduce((partialSum, a) => {
        if (Number.isFinite(a)) {
          return partialSum + a;
        } else {
          console.error("Non-finite number found:", a);
          return partialSum;
        }
      }, 0);
    return leveredProfit - leveredCashFlowArray[0];
  }
  calculateleveredMoM() {
    const leveredCashFlowArray = this.calculateLeveredCashFlow().slice(1);
    const leveredSum = leveredCashFlowArray.reduce(
      (partialSum, a) => partialSum + a,
      0
    );
    const initialLeveredCashFlowValue = this.calculateLeveredCashFlow()[0];
    const MoM = leveredSum / (-1 * initialLeveredCashFlowValue);
    return MoM;
  }

  calculateLeveredCashFlow() {
    const unleveredCashFlowArray = this.calculatedUnleveredCashFlow;
    const totalLoanPayment = this.calculatedAllTotalLoanPayment;
    const leveredCashFlowArray = [];

    if (totalLoanPayment) {
      let initialUnleveredCashFlowValue =
        this.calculatedUnleveredCashFlow[0] + this.calculatedAllLoanBalance[0];
      leveredCashFlowArray.push(initialUnleveredCashFlowValue);
      for (let i = 0; i < this.dispositionYear; i++) {
        leveredCashFlowArray.push(
          unleveredCashFlowArray[i + 1] - totalLoanPayment[i]
        );
      }

      return leveredCashFlowArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
  calculateAllCOC() {
    const leveredCashFlowArray = this.calculateLeveredCashFlow();
    const initialLeveredCashFlowValue = leveredCashFlowArray[0];
    const cocArray = [];
    if (leveredCashFlowArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        cocArray.push(
          (leveredCashFlowArray[i + 1] / (initialLeveredCashFlowValue * -1))
        );
      }
      return cocArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
  calculateAllunleveredYield() {
    const noiArray = this.calculatedAllNOI;
    const unleveredCashFlowArray = this.calculatedUnleveredCashFlow;
    const initialUnleveredCashFlowValue = unleveredCashFlowArray[0];
    const unleveredYielAdrray = [];
    if (noiArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        unleveredYielAdrray.push(
          noiArray[i] / (initialUnleveredCashFlowValue * -1)
        );
      }
      return unleveredYielAdrray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
  calculateAllDSCR() {
    const totalLoanPaymentArray = this.calculatedAllTotalLoanPayment;
    const unleveredCashFlowArray = this.calculatedUnleveredCashFlow;
    const dscrArray = [];
    if (unleveredCashFlowArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        dscrArray.push(
          unleveredCashFlowArray[i + 1] / totalLoanPaymentArray[i]
        );
      }
      return dscrArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllDebtYield() {
    const unleveredCashFlowArray = this.calculatedUnleveredCashFlow;
    const leveredProfit = this.calculateleveredProfit();
    const debtYieldArray = [];
    if (debtYieldArray) {
      for (let i = 0; i < this.dispositionYear; i++) {
        debtYieldArray.push(unleveredCashFlowArray[i + 1] / leveredProfit);
      }
      return debtYieldArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
  calculateAllNoiGrowth() {
    const noiArray = this.calculatedAllNOI;
    const noiGrowthArray = [];
    if (noiArray) {
      noiGrowthArray.push(0);
      for (let i = 1; i < this.dispositionYear; i++) {
        noiGrowthArray.push(noiArray[i] / noiArray[i - 1] - 1);
      }
      return noiGrowthArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }

  calculateAllleveredCFGrowth() {
    const leveredCashFlowArray = this.calculateLeveredCashFlow();
    const leveredCFGrowthArray = [];
    if (leveredCFGrowthArray) {
      leveredCFGrowthArray.push(0);
      for (let i = 2; i < this.dispositionYear + 1; i++) {
        leveredCFGrowthArray.push(
          leveredCashFlowArray[i] / leveredCashFlowArray[i - 1] - 1
        );
      }
      return leveredCFGrowthArray;
    } else {
      return new Array(this.dispositionYear).fill(0);
    }
  }
}

function IRR(cashFlows, guess = 0.1) {
  const tolerance = 1e-6; // Desired accuracy
  const maxIterations = 1000; // Maximum number of iterations
  let irr = guess;

  function npv(rate) {
    return cashFlows.reduce(
      (acc, curr, i) => acc + curr / Math.pow(1 + rate, i),
      0
    );
  }

  function npvDerivative(rate) {
    return cashFlows.reduce(
      (acc, curr, i) => acc - (i * curr) / Math.pow(1 + rate, i + 1),
      0
    );
  }

  for (let i = 0; i < maxIterations; i++) {
    const npvValue = npv(irr);
    const npvDerivativeValue = npvDerivative(irr);

    const newIrr = irr - npvValue / npvDerivativeValue;

    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr * 100; // IRR as a percentage
    }

    irr = newIrr;
  }

  return null;
}

const determineListingPrice = (propertyFeatureMap, propertyFundamentalsMap) => {
  if (
    propertyFeatureMap["listingPrice"] != "0" &&
    propertyFeatureMap["listingPrice"] != null
  ) {
    return parseFloat(propertyFeatureMap["listingPrice"]);
  } else {
  }
  return Number(propertyFundamentalsMap["listingPrice"]);
};
