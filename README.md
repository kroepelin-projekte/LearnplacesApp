# Learnplaces App 

**Table of Contents**

- [Introduction](#introduction)
- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [License](#license)

## Introduction

This app is a component of the ILIAS Learnplaces plugin.
It guides users to various learnplaces and provides detailed information about each location.
Additionally, the app allows users to store all data for offline access.
At each learnplace, users can scan a QR code to confirm their visit and get learning progress in ILIAS.

<img src="src/assets/screenshots/screenshot_1.png" alt="Screenshot" height="400"/>
<img src="src/assets/screenshots/screenshot_2.png" alt="Screenshot" height="200"/>


## Installation

### Prerequisites
- Node.js version 22.0.0 or higher
- npm (Node Package Manager, included with Node.js)


### Install Dependencies
```bash
npm install
```

## Development

### Development Server
For active development of SCSS or TSX files, use the development server:
```bash
npm run dev
```

**Note:** Caching and offline functionality are disabled in development mode.

### Preview Server
To test the app with all features (including caching and offline mode):
```bash
npm start
```

This command automatically executes:
1. Creates a production build (`npm run build`)
2. Starts a preview server (`npm run preview`)

## Deployment
1. Create a production build:
```bash
npm run build
```

2. Web Server Configuration:
    - Set the directory as the document root of your Apache or Nginx server `dist/`
    - Ensure all necessary permissions are properly set

## License

This project is licensed under the GNU General Public License v3.0 or later - see the [LICENSE](LICENSE.md) file for details.

Copyright (c) 2025 Kröpelin Projekt GmbH  
Website: https://kroepelin-projekt.de  
Contact: support@kroepelin-projekte.de
