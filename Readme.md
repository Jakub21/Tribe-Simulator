# Tribes Simulator

## Meta
**Creation date** December 2018  
**Latest update** February 2019  
**Author** Jakub21  
**GitHub** https://github.com/Jakub21  
**Repository**: https://github.com/Jakub21/Tribe-Simulator  
**License**: MIT license  
**Document Version**: 0.2

Detailed definitions of configuration keys are listed in `docs/Config.md`.

## General Description
This program simulates tribes behaviour on tile-based map. Simulator features dynamic climate, differing crop types and food economy.

## Setup

##### Running on a server
To run the simulator on a server copy repository root directory contents to any sub-directory of your server's equivalent of `HTDOCS`. Then open your URL in web browser. If you run this locally, the URL is probably `localhost`.

##### Running with out a server
To run simulator with-out a server some changes in code are required. They all are listed here.
- Open `index.php` and delete all PHP code (between `<?php` and `?>` tags)
- Rename `index.php` to `index.html`
- Open `js/loadConfig.js` and replace `document.getElementById('config').value` with contents of `config/simulation.yml`. Remember to enclose pasted contents with grave characters `` ` ``
- Open `index.html` in your browser.

## Simulator mechanics

#### Climate
Climate controls temperature and humidity variables of every tile. Temperatures are tweaked to resemble northern hemisphere (higher in the South). Additionally, humidity is higher in the West. Climate variables are also subject to yearly seasons and smooth noise that constantly moves through the map.

#### Tiles
Each tile has soil - related variables that affect how food grows on it.
- Soil Fertility - Specifies how fertile the soil is. This is generated when simulation starts and can not change. Food growth is multiplied by this.
- Erosion - Specifies level of soil erosion. Erosion starts at zero and can increase if tile's soil is exploited too much.

#### Food
Food is the main resource for the tribes. How fast it grows depends on climate and on tile it lives on. How efficiently tribes can use food, depends on fruit type food generates and fruit type tribe accepts.

Attributes of food (different for food living on each tile)
- Preferred Temperature - Temperature the food grows most efficiently in
- Preferred Humidity - Humidity the food grows most efficiently in
- Fruit type - Type of generated fruit
- Strength - If food lives in environment it likes, the strength increases, otherwise it decreases. If strength falls to zero, the food dies and tile is inhabitable until food is regenerated. Strength also affects amount of fruit tribe can gather.

## Tribes
More will be added soon
