# Magic Store Inventory

## Overview
The Magic Store is a comprehensive web application designed to manage an inventory of magical items, including magic items, spell scrolls, and various D&D 5e equipment. The application features dynamic inventory management, likability systems, supplier settings, and comprehensive item databases.

## Project Structure
```
magic-store/
├── bootstrap/
│   ├── bootstrap.min.css
│   └── bootstrap.min.js
├── footer.js
├── likability.js
├── magic-items.json
├── magic-store.css
├── magic-store.html
├── magic-store.js
├── navbar.js
├── spell-scrolls.json
├── spells-phb2024-xge-tce.json
├── supplier-settings.html
├── supplier-settings.txt
├── update-magic-item-likability.js
├── update-scroll-likability.js
├── variant-items.js
└── README.md
```

## Files Description

### Core Application Files

- **magic-store.html**: Main HTML structure of the magic store website with navigation, inventory display, and interactive elements.

- **magic-store.css**: Comprehensive styles for the magic store website, including responsive design, layouts, and visual themes.

- **magic-store.js**: Core JavaScript logic for managing inventory, handling user interactions, and coordinating with other modules.

- **navbar.js**: Navigation bar component with dynamic menu functionality and responsive design.

- **footer.js**: Footer component with additional site information and links.

### Data Files

- **magic-items.json**: Complete database of magic items with properties including name, rarity, category, likability scores, and pricing.

- **spell-scrolls.json**: Comprehensive collection of spell scrolls with metadata including spell names, rarity levels, and source references.

- **spells-phb2024-xge-tce.json**: Detailed spell database from Player's Handbook 2024, Xanathar's Guide to Everything, and Tasha's Cauldron of Everything.

### Functionality Modules

- **likability.js**: System for managing item popularity and customer preference algorithms.

- **update-magic-item-likability.js**: Utility script for updating likability scores for magic items.

- **update-scroll-likability.js**: Utility script for updating likability scores for spell scrolls.

- **variant-items.js**: Module for handling item variations and alternate versions.

### Configuration Files

- **supplier-settings.html**: Web interface for configuring supplier preferences and inventory management settings.

- **supplier-settings.txt**: Notes.

### External Libraries

- **bootstrap/bootstrap.min.css**: Minified CSS for Bootstrap framework, providing responsive design and styling components.

- **bootstrap/bootstrap.min.js**: Minified JavaScript for Bootstrap framework, enabling interactive components and responsive features.

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the `magic-store` directory.
3. Open `magic-store.html` in your preferred web browser.
4. For full functionality, serve the files through a local web server (e.g., using Python's `python -m http.server` or Node.js `npx serve`).
5. Access supplier settings through `supplier-settings.html` to configure inventory parameters.

## Features
- **Comprehensive Item Database**: Extensive collection of D&D 5e magic items and spell scrolls
- **Dynamic Inventory Management**: Real-time inventory updates based on customer preferences and supplier stock
- **Likability System**: Advanced algorithm for tracking item popularity and customer preferences
- **Supplier Configuration**: Customizable supplier settings and inventory parameters
- **Responsive Design**: Mobile-friendly interface using Bootstrap framework
- **Modular Architecture**: Component-based design for easy maintenance and extensibility
- **Reference Integration**: Built-in access to official D&D 5e source material and pricing

## Data Management
- **Magic Items**: Categorized by rarity, type, and source material
- **Spell Scrolls**: Organized by spell level, school, and source book
- **Likability Tracking**: Dynamic scoring system for item popularity
- **Variant Handling**: Support for item variations and alternate versions

## Technical Features
- **JSON-based Data Storage**: Efficient data management using JSON files
- **Modular JavaScript**: Component-based architecture for maintainability
- **Bootstrap Integration**: Professional styling and responsive design
- **Cross-reference System**: Integrated pricing and component cost tracking