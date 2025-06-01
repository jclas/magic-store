# Magic Store Inventory

## Overview
The Magic Store is a web application designed to manage an inventory of magical items, primarily focusing on healing potions and spell scrolls. The application allows users to view, add, and remove items based on customer purchases and supplier stock.

## Project Structure
```
magic-store
├── bootstrap
│   ├── bootstrap.min.css
│   └── bootstrap.min.js
├── magic-store.html
├── magic-store.css
├── magic-store.js
├── magic-store-inventory.json
└── README.md
```

## Files Description

- **magic-store.html**: Contains the HTML structure of the magic store website, including a button labeled "Today's Updates" that triggers a popup for inventory updates.

- **magic-store.css**: Defines the styles for the magic store website, including the layout and appearance of elements, such as the popup.

- **magic-store.js**: Contains the JavaScript logic for managing the inventory of magic items. It includes functions to add and remove items based on random customer purchases and supplier stock, as well as functionality to display the popup and save updates to the JSON file.

- **magic-store-inventory.json**: Stores the inventory data for magic items, including healing potions and spell scrolls, along with their prices in gold pieces (gp).

- **bootstrap/bootstrap.min.css**: Minified CSS for Bootstrap, providing responsive design and styling for the website.

- **bootstrap/bootstrap.min.js**: Minified JavaScript for Bootstrap, enabling interactive components and features.

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `magic-store` directory in your preferred web browser.
3. Ensure that you have a local server running to handle JSON file operations, as direct file access may not work in some browsers.

## Features
- View current inventory of magic items.
- Add and remove items based on random customer purchases.
- Display inventory updates in a popup.
- Save inventory updates to the `magic-store-inventory.json` file.

## Usage Guidelines
- Click the "Today's Updates" button to view the latest inventory changes.
- Use the provided functionality to manage the inventory as needed.
- Ensure to save any updates to maintain the current state of the inventory.