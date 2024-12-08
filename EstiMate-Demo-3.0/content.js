async function main(callback) {
  const reload = checkReload();
  if (reload) {
    chrome.runtime.sendMessage({
      from: "reload",
      reload: true,
    });
  }

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { from, propertyID, form, website, id } = obj;
    let result = {};


    if (
      from === "pop-up-form" &&
      website === "realtor.com" &&
      form["Strategy"] === "rental"
    ) {
      result = parseRealtor();

      callback(result, form);
      calculateData(form, result)
        .then((calculationResults) => {
          const allCalculations = calculationResults.allCalcs;
          allCalculations.website = website;
          response({
            result: result,
            displayCalculations: calculationResults.displayCalcs,
            allCalculations: allCalculations,
          });
        })
        .catch((error) => {
          console.error("Calculation error:", error);
          response({ error: error.toString() });
        });

      return true; // Keeps the message channel open for async response
    } else if (
      from === "pop-up-form" &&
      website === "zillow.com" &&
      form["Strategy"] === "rental"
    ) {
      result = parseZillow();
      callback(result, form);
      calculateData(form, result)
        .then((calculationResults) => {
          const allCalculations = calculationResults.allCalcs;
          allCalculations.website = website;
          response({
            result: result,
            displayCalculations: calculationResults.displayCalcs,
            allCalculations: allCalculations,
          });
        })
        .catch((error) => {
          console.error("Calculation error:", error);
          response({ error: error.toString() });
        });

      return true; // Keeps the message channel open for async response
    }
  });
}

main((result, form) => {});

function checkReload() {
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    console.info("This page is reloaded");
    return true;
  } else {
    console.info("This page is not reloaded");
    return false;
  }
}
