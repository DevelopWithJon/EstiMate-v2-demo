
function getListingPriceZillow(propertyJSON) {
    let price = 0

    if ('price' in propertyJSON) {
        price = parseInt(propertyJSON['price'])
    }
    return price
}

// function getP

function getPropertyStatusZillow(propertyJSON) {
    let status = null
    if ('homeStatus' in propertyJSON) {
        status = propertyJSON['homeStatus']
    }
    return status
}

function getAddressZillow(propertyJSON) {
    let address = null
    let city = null
    let line = null
    let zip = null
    let state = null

    if ('address' in propertyJSON) {
        const location = propertyJSON['address']
        address = `${location.streetAddress},${location.city},${location.state},${location.zipcode}`
    }
    return address
}

function getZillowCity(propertyJSON) {
    let city = 0

    if ('city' in propertyJSON) {
        city = propertyJSON['city']
    }
    return city;
}

function getZillowZip(propertyJSON) {
    let zip = 0

    if ('zipcode' in propertyJSON) {
        zip = propertyJSON['zipcode']
    }
    return zip;
}

function getZillowImage(propertyJSON) {
    let image = 0

    if ('hiResImageLink' in propertyJSON) {
        image = propertyJSON['hiResImageLink']
    }
    return image;
}

function getZillowState(propertyJSON) {
    let state = 0

    if ('state' in propertyJSON) {
        state = propertyJSON['state']
    }
    return state;
}

function getZillowLine(propertyJSON) {
    let line = 0

    if ('streetAddress' in propertyJSON) {
        line = propertyJSON['streetAddress']
    }
    return line;
}

function getBedroomsZillow(propertyJSON) {
    const bedrooms = propertyJSON['bedrooms']
    return bedrooms
}
function getBathroomsZillow(propertyJSON) {
    const bathrooms = propertyJSON['bathrooms']
    return bathrooms
}

function getPageJSONZillow() {
    const scriptElement = $('script#__NEXT_DATA__')
    let jsonData = null
    let recordKey = []
    jsonData = JSON.parse(scriptElement.html())
    try{
        jsonData = jsonData['props']['pageProps']['componentProps']['gdpClientCache']
    }
    catch(error){
        chrome.storage.sync.set({'appReload': true})  // indicating app triggered reload of page
        window.location.reload();
    }
    jsonData = JSON.parse(jsonData)
    for (key in jsonData) {
        recordKey = key
        break
    }
    jsonData = jsonData[key]['property']
    return jsonData
}




function getTotalRoomsZillow(propertyJSON) {
    let totalRooms = 0
    const details = getPropertyFeatureDetailsZillow(propertyJSON)
    const roomsRecord = details.find(record => record.category === "Other Rooms")
    if (typeof roomsRecord != 'undefined') {
        const roomsInfo = roomsRecord['text']
        const roomElements = roomsInfo.filter(element => element.includes("Total Rooms"))

        if (roomElements.length > 0) {
            totalRooms = roomElements[0].replace("Total Rooms:", "")
            totalRooms = parseInt(totalRooms)
        }
    }

    return totalRooms
}

function getTotalFullBathroomsZillow(propertyJSON) {
    let totalBathrooms = fullBathrooms = bathrooms = 0
    const details = getPropertyFeatureDetailsZillow(propertyJSON)
    const bathroomRecord = details.find(record => record.category === "Bathrooms")

    if (typeof bathroomRecord != 'undefined') {
        const bathroomsInfo = bathroomRecord['text']
        const bathroomElements = bathroomsInfo.filter(element => element.includes("Bathrooms"))

        if (bathroomElements.length == 2) {
            bathrooms = bathroomElements.join('; ')
            bathrooms = bathrooms.replace("Total Bathrooms:", "").replace("Full Bathrooms:", "").trim()
            bathrooms = bathrooms.split(';')
        }
    }
    totalBathrooms = parseInt(bathrooms[0].trim())
    fullBathrooms = parseInt(bathrooms[1].trim())
    return [totalBathrooms, fullBathrooms]
}

function getYearBuiltZillow(propertyJSON) {
    const year = propertyJSON['yearBuilt']
    return year
}
function getPropertyTypeZillow(propertyJSON) {
    const prop_type = getFactValueByLabelZillow(propertyJSON, 'Type')
    return prop_type
}

function getHeatingDetailsZillow(propertyJSON) {
    return getFactValueByLabelZillow(propertyJSON, 'Heating')
}

function getCoolingDetailsZillow(propertyJSON) {
    return getFactValueByLabelZillow(propertyJSON, 'Cooling')
}

function getParkingDetailsZillow(propertyJSON) {
    return getFactValueByLabelZillow(propertyJSON, 'Parking')
}

function getTimeOnSiteZillow(propertyJSON) {
    return getFactValueByLabelZillow(propertyJSON, "Days on Zillow")
}

function getPricePerSqrFtZillow(propertyJSON) {
    return getFactValueByLabelZillow(propertyJSON, "Price/sqft")
}

function getFactValueByLabelZillow(propertyJSON, label) {
    const facts = propertyJSON['resoFacts']['atAGlanceFacts']
    for (let fact of facts) {
        if (fact.factLabel === label) {
            return fact.factValue
        }
    }
    return null
}

function getMLSInfoZillow(propertyJSON) {
    mlsNumber = 0
    mlsName = ''
    const attribute = propertyJSON['attributionInfo']
    if (attribute['mlsId']) {
        mlsNumber = attribute['mlsId']
    }

    if (attribute['mlsName']) {
        mlsName = attribute['mlsName']
    }
    return { 'mlsNumber': mlsNumber, 'mlsName': mlsName }
}

function getAgentInfoZillow(propertyJSON) {
    let agentName = ''
    let agentPhoneNumber = ''
    const attribute = propertyJSON['attributionInfo']

    if (attribute['agentName']) {
        agentName = attribute['agentName']
    }

    if (attribute['agentPhoneNumber']) {
        agentPhoneNumber = attribute['agentPhoneNumber']
    }
    return { 'agentName': agentName, 'agentPhoneNumber': agentPhoneNumber }
}

function getPropertyTaxRate(propertyJSON){
    let propertyTaxRate = propertyJSON['propertyTaxRate'];
    return propertyTaxRate;
}

function getZEstimateInfo(propertyJSON) {
    let zestimate = rentZestimate = null

    if (propertyJSON['zestimate']) {
        zestimate = propertyJSON['zestimate']
    }

    if (propertyJSON['rentZestimate']) {
        rentZestimate = propertyJSON['rentZestimate']
    }
    return { 'zestimate': zestimate, 'rentZestimate': rentZestimate }
}

function getSqFtZillow(propertyJSON) {
    return propertyJSON['livingArea']
}

function getNearBySchoolsZillow(propertyJSON) {
    schools = null
    if (propertyJSON['schools']) {
        schools = propertyJSON['schools']
    }
    return schools
}
function getHOADetailsZillow(propertyJSON){
    const HOADetails = propertyJSON['monthlyHoaFee'];
    return HOADetails
}

function getTaxHistoryZillow(propertyJSON) {
    const history = propertyJSON['taxHistory']
    return history
}
function getPriceHistoryZillow(propertyJSON) {
    const history = propertyJSON['priceHistory']
    return history
}
function getInsurance(propertyJSON){
    let insurance = 0;
    if (propertyJSON['annualHomeownersInsurance'] !== null && propertyJSON['annualHomeownersInsurance'] !== undefined){
    insurance = propertyJSON['annualHomeownersInsurance']
    }
    return insurance
}

function getLoanRate(propertyJSON){
    let loanRate = 1;
    if (propertyJSON['mortgageRates'] !== undefined && propertyJSON['mortgageRates']['thirtyYearFixedRate'] !== undefined ){
        loanRate = propertyJSON['mortgageRates']['thirtyYearFixedRate']
    }
    return loanRate
}

function getUnitDetailsZillow(propertyJSON) {
    return Boolean(propertyJSON['numberOfUnitsTotal']) ? propertyJSON['numberOfUnitsTotal'] : 1;
}

function parseZillow() {

    let record = {}
    let propertyPrice = 0
    let propertyDuration = 0
    let propertyStatus = null
    let propertyAddress = null
    let propertySewer = null
    let propertyTotalRooms = 0
    let propertySqFt = 0
    let propertyTotalBathrooms = 0
    let propertyFullBathrooms = 0
    let monthlyPaymentDetails = []
    let bedroomDetails = []
    let heatingDetails = []
    let poolSPADetails = []
    let landInfoDetails = []
    let garageParkingInfoDetails = []
    let HOADetails = []
    let schoolDetails = []
    let otherInfo = []
    let buildingConstructiionDetails = []
    let utilitiesDetails = []
    let propertyDescription = []
    let historicalPrices = []
    let forecastPrices = []
    let propertyHistory = []
    let agentDetails = []
    let mortgageDetails = []
    let propertyYearBuilt = 0
    let propertyType = ''
    let coolingDetails = null
    let parkingDetails = null
    let priceSqrtFt = 0
    let propertyMLS = 0
    let zestimateInfo = ''



    const propertyJSON = getPageJSONZillow()
    propertyAddress = getAddressZillow(propertyJSON)
    propertyCity = getZillowCity(propertyJSON)
    propertyState = getZillowState(propertyJSON)
    propertyLine = getZillowLine(propertyJSON)
    propertyZip = getZillowZip(propertyJSON)
    PropertyImage = getZillowImage(propertyJSON)
    propertyStatus = getPropertyStatusZillow(propertyJSON)
    bedroomDetails = getBedroomsZillow(propertyJSON)
    propertyPrice = getListingPriceZillow(propertyJSON)
    propertyFullBathrooms = getBathroomsZillow(propertyJSON)
    propertyYearBuilt = parseInt(getYearBuiltZillow(propertyJSON))
    propertyType = getPropertyTypeZillow(propertyJSON)
    HOADetails = getHOADetailsZillow(propertyJSON) !== null ? getHOADetailsZillow(propertyJSON) : 0;
    heatingDetails = getHeatingDetailsZillow(propertyJSON)
    coolingDetails = getCoolingDetailsZillow(propertyJSON)
    parkingDetails = getParkingDetailsZillow(propertyJSON)
    propertyDuration = getTimeOnSiteZillow(propertyJSON)
    priceSqrtFt = getPricePerSqrFtZillow(propertyJSON)
    propertyMLS = getMLSInfoZillow(propertyJSON)
    agentDetails = getAgentInfoZillow(propertyJSON)
    zestimateInfo = getZEstimateInfo(propertyJSON)
    propertySqFt = getSqFtZillow(propertyJSON)
    schoolDetails = getNearBySchoolsZillow(propertyJSON)
    propertyTaxHistory = getTaxHistoryZillow(propertyJSON)
    propertyPriceHistory = getPriceHistoryZillow(propertyJSON)
    propertyTax = ((parseFloat(getPropertyTaxRate(propertyJSON)) / 100) * propertyPrice) / 12;
    propertyInsuance = parseFloat(getInsurance(propertyJSON)) / 12
    propertyloanRate = parseFloat(getLoanRate(propertyJSON))
    units = parseFloat(getUnitDetailsZillow(propertyJSON))


    propertyDataObj = {
        'hoa': HOADetails,
        'price': propertyPrice,
        'address': propertyAddress,
        'city': propertyCity,
        'state': propertyState,
        'line': propertyLine,
        'image': PropertyImage,
        'status': propertyStatus.toUpperCase(),
        'bedrooms': bedroomDetails,
        'bathrooms': propertyFullBathrooms,
        'year_built': propertyYearBuilt,
        'property_type': propertyType,
        'heating': heatingDetails,
        'cooling': coolingDetails,
        'parking_details': parkingDetails,
        'duration': propertyDuration,
        'price_sqrt_ft': priceSqrtFt,
        'mls_info': propertyMLS,
        'agent_info': agentDetails,
        'estimates': zestimateInfo,
        'sqft': propertySqFt,
        'schools': schoolDetails,
        'tax_history':propertyTaxHistory,
        'property_tax':propertyTax,
        'price_history':propertyPriceHistory,
        'insurance': propertyInsuance,
        'loan_rate': propertyloanRate,
        'units': units
    }


    return propertyDataObj;
}
