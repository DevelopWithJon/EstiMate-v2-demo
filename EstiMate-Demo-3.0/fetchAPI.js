///                     ///
///  Get MortgageRates  ///
///                     ///


function getMortgageRates (retries = 2, delay = 1000) {
  return new Promise((resolve, reject) => {
    let [today, weekAgo] = getDate()
    const API_KEY = '600f4c6e14418ed1524f7668f71794a9'
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&observation_start=${weekAgo}&observation_end=${today}&api_key=${API_KEY}&sort_order=desc&limit=1&file_type=json`

    function attempt (attemptsLeft) {
      chrome.runtime.sendMessage(
        { action: 'fetchMortgageRates', url: url },
        response => {
          if (response.success) {
            if (
              response.data &&
              response.data.observations &&
              response.data.observations.length > 0
            ) {
              resolve(response.data.observations[0].value)
            } else {
              retry(attemptsLeft, new Error('No mortgage rate data found'))
            }
          } else {
            retry(attemptsLeft, new Error(response.error))
          }
        }
      )
    }

    function retry (attemptsLeft, error) {
      if (attemptsLeft <= 1) {
        reject(error)
        return
      }

      setTimeout(() => attempt(attemptsLeft - 1), delay)
    }

    attempt(retries)
  })
}

///                 ///
///  Estimate Rent  ///
///                 ///

function estimateRent (result) {
  const API_KEY = 'e77fcb99abcd4932a85570654c850305'

  let {
    address,
    squareFootage,
    propertyType,
    daysOld,
    bathrooms,
    bedrooms,
    units
  } = formatRentData(result)


  units =
    units === undefined || units === '' || units < 1 ? unitsValue.value : units // FIXME : Think about how to make this more full proof
  squareFootage = Math.floor(squareFootage / units) // FIXME : Think about how to make this more full proof
  bathrooms = Math.floor(bathrooms / units) // FIXME : Think about how to make this more full proof
  bedrooms = Math.floor(bedrooms / units) // FIXME : Think about how to make this more full proof

  const url = `https://api.rentcast.io/v1/avm/rent/long-term?address=${address}&squareFootage=${squareFootage}&propertyType=${propertyType}&daysOld=${daysOld}&bathrooms=${bathrooms}&bedrooms=${bedrooms}`
  const headers = {
    'X-Api-Key': API_KEY
  }
  let numOfRetries = 3;
  const response = fetchData(url, headers, numOfRetries);
  return response;
}

function comparables(result){
  const API_KEY = 'e77fcb99abcd4932a85570654c850305'

  let {
    address,
    squareFootage,
    propertyType,
    daysOld,
    bathrooms,
    bedrooms,
    units
  } = formatRentData(result)
  let compCount=5

  if ((Boolean(units)) && (bedrooms === null || bedrooms === undefined)){ // if no bedroom data is available, we assume all units are 1BD 1 BA
    bedrooms = units
    bathrooms = units
  }

  let url = `https://api.rentcast.io/v1/avm/value?address=${address}&squareFootage=${squareFootage}&propertyType=${propertyType}&daysOld=${daysOld}&bathrooms=${bathrooms}&bedrooms=${bedrooms}&compCount=${compCount}`;
  const headers = {
    'X-Api-Key': API_KEY
  }
  let numOfRetries = 3
  const response = fetchData(url, headers, numOfRetries)
  return response;
}
function fetchData (url, headers, retries) {
  return fetch(url, {
    method: 'GET',
    headers: headers
  })
    .then(response => {
      if (response.status === 429 || response.status === 500) {
        if (retries <= 0) {
          alert('Too many retries')
          throw new Error('Too many retries')
        }
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(fetchData(url, headers, retries - 1))
          }, 1000)
        })
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      } else {
        return response.json()
      }
    })
    .then(data => data)
    .catch(error => {
      console.error('Error:--->>>', error)
      throw error
    })
}

function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function determineUnits (description, unitMap, loop, propertyType) {
  if (propertyType != 'Multi-Family') {
    return 1
  }
  if (description === 1) {
    // FIX ME need to handle zillow and realtor requests differently
    return description
  }
  if (unitMap !== undefined && 'Number of Units' in unitMap) {
    return unitMap['Number of Units']
  } else if (unitMap !== undefined && 'Units' in unitMap) {
    return unitMap['Units']
  } else if (description !== undefined && 'units' in description) {
    return description['units']
  } else {
    return loop
  }
}

function formatRentData (result) {
  let { address, description } = result
  let squareFootage = 1000
  let propertyType = 'Single Family'
  let daysOld = 1

  let bathrooms = Math.max(
    1,
    description?.['baths'] || 1,
    description?.['baths_3qtr'] || 1,
    description?.['baths_consolidated'] || 1,
    description?.['baths_full'] || 1,
    description?.['baths_half'] || 1,
    description?.['baths_max'] || 1,
    description?.['baths_min'] || 1,
    description?.['baths_total'] || 1,
    result?.['bathrooms'] || 1
  )

  let bedrooms = Math.max(
    1,
    description?.['beds'] || 1,
    description?.['beds_max'] || 1,
    description?.['beds_min'] || 1,
    result?.['bedrooms'] || 1
  )

  if (description?.['type'] === 'multi_family') propertyType = 'Multi-Family'

  let loop = 0
  const unitMap = {}
  let units = 0


  if ('units_details' in result) {
    result['units_details'].forEach(item => {
      const [key, value] = item.split(':').map(str => str.trim())
      unitMap[key] = value
    })
  }

  for (let i = 1; i <= 4; i++) {
    // Generate the key based on the loop index
    const unitBedKey = `Bedrooms in Unit-${i}`
    const unitBathKey = `Bathrooms in Unit-${i}`

    // Check if the key exists in the hashmap
    if (unitBedKey in unitMap && unitBathKey in unitMap) {
      unitBed = unitMap[unitBedKey]
      unitBath = unitMap[unitBathKey]
      loop = Boolean(i > 1) ? i - 1 : 0
    }
  }

  units = determineUnits(description, unitMap, loop, propertyType)

  if ('units' in result) {
    units = result['units']
  }

  units = Math.max(units, 1)

  squareFootage = Math.max(
    1000,
    description?.['sqft'] || 1000,
    description?.['sqft_max'] || 1000,
    description?.['sqft_min'] || 1000,
    result['sqft'] || 1000
  )

  if (description?.['year_built']) {
    const currentYear = new Date().getFullYear()
    daysOld =
      (parseInt(currentYear) - parseInt(description?.['year_built'])) * 365
  } else if (result['year_built']) {
    const currentYear = new Date().getFullYear()
    daysOld = (parseInt(currentYear) - parseInt(result['year_built'])) * 365
  }

  return {
    address,
    squareFootage,
    propertyType,
    daysOld,
    bathrooms,
    bedrooms,
    units
  }
}

const getDate = () => {
  var end = new Date()
  var start = new Date()
  start.setDate(end.getDate() - 7)

  var tdd = String(end.getDate()).padStart(2, '0')
  var tmm = String(end.getMonth() + 1).padStart(2, '0') //January is 0!
  var tyyyy = end.getFullYear()

  var wdd = String(start.getDate()).padStart(2, '0')
  var wmm = String(start.getMonth() + 1).padStart(2, '0') //January is 0!
  var wyyyy = start.getFullYear()

  const endString = tyyyy + '-' + tmm + '-' + tdd
  const startString = wyyyy + '-' + wmm + '-' + wdd

  return [endString, startString]
}
