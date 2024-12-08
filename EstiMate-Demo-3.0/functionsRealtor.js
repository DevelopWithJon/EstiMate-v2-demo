function getListingPrice (propertyJSON) {
  let price = 0

  if ('list_price' in propertyJSON) {
    price = parseInt(propertyJSON['list_price'])
  }
  return price
}

function getTimeOnSite () {
  let durationInDays = 0
  const timeOnSiteElement = $(
    '#__next > div > div.main-container > div.Box__StyledBox-rui__sc-16jloov-0.diyPVt.Flex__StyledFlex-rui__sc-19d2399-0.fMFHoW.styles__PageContainer-sc-enoj1h-0.cmWdds > div.FlexLayoutstyles__StyledFlexLayout-rui__sc-9o9njn-0.bqSzhJ.styles__ColumnContainer-sc-enoj1h-5.iAraLR > div.FlexLayoutMain__StyledFlexLayoutMain-rui__y13a2g-0.kkOHGx.styles__MainContentContainer-sc-enoj1h-7.gbpvHv > div.LDPListingSummarystyles__ListingSummaryContainer-sc-6zw8z5-0.TxcCV > div:nth-child(4) > div.Box__StyledBox-rui__sc-16jloov-0.eQUfKK.Flex__StyledFlex-rui__sc-19d2399-0.fMFHoW.styles__MainFactsColumn-sc-enoj1h-11.kYfDxz > div.LDPHighlightedFactsstyles__HighlightedFactsContainer-sc-ogf6te-1.gPRgBF > ul > li:nth-child(2) > div > div.base__StyledType-rui__sc-108xfm0-0.iNkwaK.listing-key-fact-item__value'
  )
  if (timeOnSiteElement.length > 0) {
    durationInDays = timeOnSiteElement.text().replace('days', '').trim()
    durationInDays = parseInt(durationInDays)
  }
  return durationInDays
}

function getPropertyStatus (propertyJSON) {
  let status = null
  if ('status' in propertyJSON) {
    status = propertyJSON['status']
  }
  return status
}

function getAddress (propertyJSON) {
  let address = null
  let city = null
  let line = null
  let zip = null
  let state = null

  if ('location' in propertyJSON) {
    const location = propertyJSON['location']

    if ('address' in location) {
      const addresSection = location['address']
      if ('city' in addresSection) {
        city = addresSection['city']
      }

      if ('line' in addresSection) {
        line = addresSection['line']
      }

      if ('postal_code' in addresSection) {
        zip = addresSection['postal_code']
      }
      if ('state_code' in addresSection) {
        state = addresSection['state_code']
      }
      address = `${line},${city},${state},${zip}`
    }
  }
  return {address, city, line, zip, state}
}

function getPropertyDescriptionDetails (propertyJSON) {
  const description = propertyJSON['description']
  return description
}
function getSqrFt (propertyJSON) {
  let sqtFt = 0
  sqtFt = propertyJSON.description.sqft
  return sqtFt
}

function getBedrooms (propertyJSONDetails) {
  let bedrooms = 0
  bedrooms = propertyJSONDetails['beds']
  return bedrooms
}

function getPageJSON () {
  const scriptElement = $('script#__NEXT_DATA__')
  let jsonData = null;

  // Check if the script element exists
  if (scriptElement.length > 0) {
    // Get the HTML content of the script element
    let scriptContent = scriptElement.html();

    // Extract JSON data between <script> tags
    jsonData = JSON.parse(scriptContent);
    try {
      jsonData =
        jsonData['props']['pageProps']['initialReduxState']['propertyDetails'];
    } catch (error) {
      window.location.reload();
    }
  } else {
    console.error('Script element with id "__NEXT_DATA__" not found.')
  }
  return jsonData;
}

function getPropertyFeatureDetails (propertyJSON) {
  let propertyFeatureDetails = null
  if ('details' in propertyJSON) {
    propertyFeatureDetails = propertyJSON['details'];
  }
  return propertyFeatureDetails
}

function getSewer (propertyJSONDetails) {
  let sewer = null
  
  const utilitiesRecord = propertyJSONDetails.find(
    record => record.category === 'Utilities'
  )
  if (typeof utilitiesRecord != 'undefined') {
    const sewerInfo = utilitiesRecord['text']
    const sewerElements = sewerInfo.filter(element => element.includes('Sewer'))

    if (sewerElements.length > 0) {
      sewer = sewerElements.join('; ')
    }
  }
  return sewer
}

function getTotalRooms (propertyJSONDetails) {
  let totalRooms = 0
  
  const roomsRecord = propertyJSONDetails.find(record => record.category === 'Other Rooms')
  if (typeof roomsRecord != 'undefined') {
    const roomsInfo = roomsRecord['text']
    const roomElements = roomsInfo.filter(element =>
      element.includes('Total Rooms')
    )

    if (roomElements.length > 0) {
      totalRooms = roomElements[0].replace('Total Rooms:', '')
      totalRooms = parseInt(totalRooms)
    }
  }

  return totalRooms
}

function getTotalFullBathrooms (propertyJSONDetails) {
  let totalBathrooms = 0,
    fullBathrooms = 0 // Declare variables separately for clarity
  const bathroomRecord = propertyJSONDetails.find(record => record.category === 'Bathrooms')

  if (bathroomRecord) {
    const bathroomsInfo = bathroomRecord['text']
    // Ensure bathroomsInfo is an array and contains the expected strings before proceeding
    if (Array.isArray(bathroomsInfo)) {
      const bathroomElements = bathroomsInfo.filter(element =>
        element.includes('Bathrooms')
      )

      if (bathroomElements.length == 2) {
        let bathroomText = bathroomElements
          .join('; ')
          .replace('Total Bathrooms:', '')
          .replace('Full Bathrooms:', '')
          .trim()
        let splitBathrooms = bathroomText.split(';').map(text => text.trim()) // Trim each split part to remove leading/trailing whitespace

        if (splitBathrooms.length >= 2) {
          totalBathrooms = parseInt(splitBathrooms[0], 10) // Use parseInt safely with base 10
          fullBathrooms = parseInt(splitBathrooms[1], 10)
        }
      }
    }
  }

  return [totalBathrooms, fullBathrooms]
}

function getMonthlyPaymentDetails (propertyJSON) {
  // Function to remove fields with names "type" and "__typename"
  function removeFields (obj) {
    for (let prop in obj) {
      if (prop === 'type' || prop === '__typename') {
        delete obj[prop]
      } else if (typeof obj[prop] === 'object') {
        removeFields(obj[prop]) // Recursively remove fields from nested objects
      }
    }
  }
  const estimate = propertyJSON['estimate']
  removeFields(estimate)
  return estimate
}

function getBedRoomdetails (propertyJSONDetails) {
  let bedroomElements = []
  
  const bedroomRecord = propertyJSONDetails.find(record => record.category === 'Bedrooms')

  if (typeof bedroomRecord != 'undefined') {
    const bedroomsInfo = bedroomRecord['text']
    bedroomElements = bedroomsInfo.filter(element =>
      element.includes('Bedroom')
    )
  }
  return bedroomElements
}

function getUnitDetails (propertyJSONDetails) {
  let unitElements = []
  
  const unitRecord = propertyJSONDetails.find(
    record => record.category === 'Multi-Unit Info'
  )

  if (typeof unitRecord != 'undefined') {
    const unitInfo = unitRecord['text']
    unitElements = unitInfo.filter(element => element.includes('Unit'))
  }
  return unitElements
}

function getHeatingDetails (propertyJSONDetails) {
  let elements = []
  
  const record = propertyJSONDetails.find(
    record => record.category === 'Heating and Cooling'
  )

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getPoolSPADetails (propertyJSONDetails) {
  let elements = []
  
  const record = propertyJSONDetails.find(record => record.category === 'Pool and Spa')

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getLandInformation (propertyJSONDetails) {
  let elements = []
  
  const record = propertyJSONDetails.find(record => record.category === 'Land Info')

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getGarageParkingInformation (propertyJSONDetails) {
  let elements = []
  
  const record = propertyJSONDetails.find(
    record => record.category === 'Garage and Parking'
  )

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getHOADetails (propertyJSONDetails) {
  let elements = []
  
  const record = propertyJSONDetails.find(
    record => record.category === 'Homeowners Association'
  )

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getSchooletails (propertyJSONDetails) {
  let elements = []

  const record = propertyJSONDetails.find(
    record => record.category === 'School Information'
  )

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getOtherInfo (propertyJSONDetails) {
  let elements = []
  const record = propertyJSONDetails.find(
    record => record.category === 'Other Property Info'
  )

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getBuildingConstructionDetails (propertyJSONDetails) {
  let elements = []
  const record = propertyJSONDetails.find(
    record => record.category === 'Building and Construction'
  )

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}

function getUtilitiesDetails (propertyJSONDetails) {
  let elements = []
  const record = propertyJSONDetails.find(record => record.category === 'Utilities')

  if (typeof record != 'undefined') {
    const info = record['text']
    elements = info.filter(element => element.includes(''))
  }
  return elements
}


function getPropertyHistory (propertyJSON) {
  const history = propertyJSON.property_history
  return history
}

function getTaxHistory (propertyJSON) {
  const history = propertyJSON.tax_history
  return history
}

function getPropertyAgentDetails (propertyJSON) {
  const agentDetails = propertyJSON.source.agents
  return agentDetails
}
function getClosingCost (propertyJSON) {
  if (propertyJSON.mortgage !== undefined && propertyJSON.mortgage !== null) {
    const closingCost = propertyJSON.mortgage.closing_cost_rate
    return closingCost
  } else {
    return 0
  }
}
function getImageURL (propertyJSON){
  const imageURL = propertyJSON.primary_photo.href
  return imageURL
}
function getYearBuilt (propertyJSON){
  const yearBuilt = propertyJSON.description.year_built
  return yearBuilt
}
function getMortgageDetails (propertyJSON) {
  const details = propertyJSON['mortgage']
  function removeFields (obj) {
    for (let prop in obj) {
      if (prop === 'type' || prop === '__typename' || prop === 'source') {
        delete obj[prop]
      } else if (typeof obj[prop] === 'object') {
        removeFields(obj[prop]) // Recursively remove fields from nested objects
      }
    }
  }
  removeFields(details)
  return details
}
function parseRealtor () {
  let record = {}

  const propertyJSON = getPageJSON();
  const propertyJSONDetail = getPropertyFeatureDetails(propertyJSON);
  record.description = getPropertyDescriptionDetails(propertyJSON);

  record.image = getImageURL(propertyJSON);

  record.price = getListingPrice(propertyJSON);
  record.duration_in_days = getTimeOnSite();
  const {address, city, line, zip, state} = getAddress(propertyJSON);
  record.address = address
  record.city = city
  record.line = line
  record.zip = zip
  record.state = state
  record.status = getPropertyStatus(propertyJSON);
  record.sewer = getSewer(propertyJSONDetail);
  record.sqft = record.description['sqft']
  record.year_built = record.description['year_built']
  record.bedrooms = record.description['beds']
  record.bathrooms = record.description['baths']
  record.total_rooms = getTotalRooms(propertyJSONDetail);

  const bathroomsCount = getTotalFullBathrooms(propertyJSONDetail);
  record.total_bathrooms = bathroomsCount[0];
  record.full_bathrooms = bathroomsCount[1];
  record.monthly_payment_details = getMonthlyPaymentDetails(propertyJSON);
  record.closing_cost = getClosingCost(propertyJSON);

  record.bedroom_details = getBedRoomdetails(propertyJSONDetail);
  record.heating_details = getHeatingDetails(propertyJSONDetail);
  record.pools_spa_details = getPoolSPADetails(propertyJSONDetail);
  record.land_info_details = getLandInformation(propertyJSONDetail);
  record.garage_parking_details = getGarageParkingInformation(propertyJSONDetail);
  record.HOA_details = getHOADetails(propertyJSONDetail);
  record.units_details = getUnitDetails(propertyJSONDetail);
  record.school_details = getSchooletails(propertyJSONDetail);
  record.other_info = getOtherInfo(propertyJSONDetail);
  record.building_construction = getBuildingConstructionDetails(propertyJSONDetail);
  record.utilities = getUtilitiesDetails(propertyJSONDetail);
  record.property_sub_type = record.description['type'];
  record.property_history = getPropertyHistory(propertyJSON);
  record.tax_history = getTaxHistory(propertyJSON);
  record.agents = getPropertyAgentDetails(propertyJSON);
  record.mortgage_details = getMortgageDetails(propertyJSON);

  return record;
}
