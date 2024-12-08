# Property Investment Analysis Chrome Extension

## Overview

This Chrome extension provides real-time property investment analysis for listings on realtor.com and zillow.com. It calculates key financial metrics to help investors make informed decisions about potential real estate investments.

## Features

- Automatic data extraction from realtor.com and zillow.com property listings
- Custom input fields for financial assumptions
- Real-time calculations of important investment metrics:
  - Cap Rate
  - Levered Profit
  - Levered Multiple on Money (MoM)
  - Cash-on-Cash Return
  - Total Expenses
  - Net Operating Income (NOI)
- Session management for saving and loading previous calculations
- User authentication system
- Ability to post reports to a backend server

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Navigate to a property listing on realtor.com or zillow.com.
2. Click the extension icon to open the popup.
3. Log in or sign up for an account.
4. Input your financial assumptions or use the default values.
5. Click "Calculate" to generate the investment analysis.
6. Use the "Post" button to save the report to your account.

## Development

This extension is built using vanilla JavaScript, HTML, and CSS. The main files are:

- `popup.js`: Contains the core logic for the extension
- `popup.html`: The HTML structure for the extension popup
- `popup.css`: Styling for the popup
- Additional JavaScript files for specific functionalities

To contribute or modify the extension:

1. Make your changes in the relevant files.
2. Test the extension locally by reloading it in Chrome.
3. Submit a pull request with your changes.

## Backend Integration

The extension integrates with a backend server for user authentication and report storage. Ensure the backend server is running and properly configured for full functionality.


## Contact

info@esti-matecalculator.com
