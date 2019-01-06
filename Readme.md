# Tribes Simulator

## Meta
**Creation Date**: December 2018  
**Latest Update**: January 2019  
**Author**: Jakub21  
**GitHub**: https://github.com/Jakub21  
**Repository**: https://github.com/Jakub21/Tribe-Simulator  
**License**: MIT license  
**Doc Version**: Markdown 0.1.4  

**Note** that on this stage of project this document describes ideas that were not implemented yet.

Text marked as `inline code` indicates reference to configuration keys. This makes this document useful for users that want modify the simulator.

**Table of contents**  
TODO

## General Description
This program simulates tribes behaviour on tile-based map.
Simulator features seasons, location-depended temperature and humidity, food mechanics with many variables, tribes mechanics (morale, culture, unity etc.), tribes interactions and many more

### Setup

##### Running on a server
To run the simulator copy project root folder to any sub-directory of your server's equivalent of `HTDOCS` and open your URL in web browser (if run locally, the URL probably is `localhost`).

##### Running with out a server
To run simulator with-out a server some changes in code are required. They all are listed here.
- Open `index.php` and delete all PHP code (between `<?php` and `?>` tags).
- Rename `index.php` to `index.html`
- Open `js/loadConfig.js` and replace `document.getElementById('config').value` with contents of `config/simulation.yml`. Remember to enclose pasted contents with grave characters. `` ` ``

### Time Scale
Year length (expressed in ticks) is specified in `sim.yearLength`. Ticks per second on standard speed is specified in `sim.fps`. Note that in current version the year starts with summers.

## Simulator Mechanics

### Food Mechanics
`references in this section are to food namespace`

Food is the most important resource in this simulator. How it affects tribes depends on attributes listed below. Note that the amount of food a tribe receives also depends on attributes of tribes and of tiles the food is grown on.

Food is divided into kinds (crops). Crops differ from each other. Tribes have their preferred crop and if they find different crop they can not use it efficiently.

**Food attributes**:
- Base efficiency `baseEff`: How efficiently food grows, ignoring conditions. Expressed in food units per tick

**Food-kind attributes**:
- Food kind's efficiency `kindEff`: How efficiently kind of food grows.
- Food kind's preferred temperature `kindTempPref`: Food will grow most efficiently in tiles with temperature close to this setting. Different for each crop kind.
- Food kind's temperature tolerance `kindTempTolr`: Defines how much temperature change affects food efficiency. Different for each crop kind.
- Food kind's preferred humidity `kindHumdPref`: Crop's preferred humidity. Different for each crop kind.
- Food kind's humidity tolerance `kindHumdTolr`: Defines how much humidity change affects food efficiency. Different for each crop kind.

**Note** that those attributes are random. To specify value range change attributes with `Min` and `Max` suffixes.

### Tile Mechanics
`references in this section are to tile namespace`

**Global tile attributes**
- Erosion per population `erosionPerThousand`: How much tile erodes per tick per thousand people.
- General loot recovery `baseLootRecovery`: Amount of loot subtracted every tick.
- Fertility noise size scale `fertNoise`: Scale of fertility noise (higher = smoother).

**Tile-specific attributes**:
- Base fertility `baseFertility`: How efficiently food will grow on this tile.

**Note** that this attribute is random. To specify value range change attributes with `Min` and `Max` suffixes.

**Tile variables**:
- Temperature `temp`: Current tile's temperature.
- Humidity `humd`: Current tile's humidity.
- Population `population`: Current population of a tile.
- Looted `lootFactor`: If tile was looted it will grow less food.
- Erosion `erosion`: If tile is exploited too much it will grow less food and support less population.

### Climate Mechanics
`references in this section are to climate namespace`

Climate controls temperature and humidity variables of every tile. Temperature and humidity are subject to yearly seasons and smooth noise that constantly moves on the map. Noise is also referred to as `cloud`. Additionally there are location-depended changes. Temperature is higher in the South and humidity is higher in the West.

**Climate attributes**:
- Base temperature `baseTemp`: Constant added when calculating tile temperature.
- Season temperature amplitude `tempSeasonAmp`: Amplitude of yearly temperature changes.
- Local temperature amplitude `tempLocalAmp`: Amplitude of noise temperature changes.
- Base humidity `baseHumd`: Constant added when calculating tile humidity.
- Season humidity amplitude `humdSeasonAmp`: Amplitude of yearly humidity changes.
- Local humidity amplitude `humdLocalAmp`: Amplitude of noise humidity changes.
- Greenhouse multiplier `ghgFactor`: How much greenhouse gases affect global temperatures.

**Climate variables**:
- Current season `season`: Current season (expressed in amount of ticks from year start).
- Current greenhouse `greenhouse`: Current amount of greenhouse gases in atmosphere. Standardized to values in range 0 - 2. Any temperature is multiplied by this amount.

**Noise attributes**
- Noise size scale `climNoise`: Scale of humidity and temperature noise (higher = smoother).
- Max clouds velocity `maxCloudVel`: Maximum velocity of the noise.
- Max clouds acceleration `maxCloudAccl`: Maximum change of velocity per tick.
- Clouds backwards chance `negShiftFactor`: Chance of clouds deaccelerating and of going backwards.

**Climate noise variables**
- Temperature seed `termPatternSeed`: Seed for noise function when asked for temperature.
- Humidity seed `termPatternSeed`: Seed for noise function when asked for humidity.
- Clouds shift `cloudShift`: Current clouds shift.
- Clouds velocity `cloudVelocity`: Current clouds velocity.

**Climate events**  
Every quarter there is a small chance that an event will occur. Events can be local or global. List of events and their effects.

- Global drought `event.globalDrought`: Globally decreases humidity.
- Volcanic winter `event.globalVolcano`: Globally decreases temperature.
- Greenhouse gases increase `event.ghgIncrease`: Increase amount of Greenhouse gases
- Greenhouse gases decrease `event.ghgIncrease`: Increase amount of Greenhouse gases
- Local drought  `event.localDrought`: Locally decreases humidity.

**Climate event attributes**  
- Minimum interval `event.EVENT_KEY.minInterval`: Time that must pass for event to be re-triggered. Prevents events from being triggered too often. Expressed in ticks.
- chance `event.EVENT_KEY.chance`: Chance that this event will be triggered. Expressed as percent. Tested every quarter.
- Minimum delay `event.EVENT_KEY.delayMin`: How long event is delayed after it was triggered. Makes events take place not only on quarter starts.
- Maximum delay `event.EVENT_KEY.delayMax`: How long event can be delayed.

## Tribes

Attributes, variables, actions

## Modding
Simulation attributes are in file `config/simulation.yml`. You can change them as you like. Formulas for simulation variables are hard-coded. To change them some knowledge of Object Oriented JavaScript is required.
