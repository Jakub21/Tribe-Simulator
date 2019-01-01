# Tribes Simulator

## Meta
**Creation Date**: December 2018  
**Author**: Jakub21  
**GitHub**: https://github.com/Jakub21  
**Repository**: https://github.com/Jakub21  (not published yet)  
**License**: MIT license  
**Doc Version**: Markdown 0.1.1  

Text marked as `inline code` indicates reference to configuration keys. This makes this document useful for users that want modify the simulator.

**Table of contents**

## Fast notes
**Stuff added during implementation**

```
map:
size arguments for randint function (map NS)
mapMinWidth, mapMaxWidth, mapMinHeight, mapMaxHeight

food:
efficiency / temperature function should be quadratic
in function $$ y = (x^2)/(-A) $$ food temp tolerance is A
humidity is absolute
humidity is expressed in points (normalized to range 0-100)
efficiency / humidity function should be linear

```

## General Description
This program simulates tribes behaviour on tile-based map.
Simulator features seasons, location-depended temperature and humidity, food mechanics with many variables, tribes mechanics (morale, culture, unity etc.), tribes interactions and many more

### Setup
To run the simulator copy project root folder and paste it in any sub-directory of your server's `HTDOCS`, and open `localhost` or whatever your host's URL is.

### Time Scale
Year length (expressed in ticks) is specified in `sim.yearLength`. Ticks per second on standard (x1) speed is specified in `sim.fps`. Currently those values are 100 and 30, respectively. Note that year starts with summers (This may change soon).

On standard speed simulator runs at 30 ticks per second.

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

**Note** that those attributes are random. To specify value range change attributes with `Max` and `Spread` suffixes.

Check **formulas section** to learn how much food tribe will actually receive.

### Tile Mechanics
`references in this section are to tile namespace`

**Global tile attributes**
- Erosion per population `erosionPerThousand`: How much tile erodes per tick per thousand people.
- General loot recovery `baseLootRecovery`: Amount of loot subtracted every tick.

**Tile-specific attributes**:
- Base fertility `baseFertility`: How efficiently food will grow on this tile.
- Base humidity `baseHumd`: Constant added to humidity calculated from climate. Rationale: rivers and other water bodies increase humidity.
- Loot recovery modifier `lootRecoveryFactor`: Modifies how fast tile can recover after it was looted.

**Note** that those attributes are random. To specify value range change attributes with `Max` and `Spread` suffixes.

Check **formulas section** to learn how current tile temperature and humidity is calculated.

**Food-related variables**:
- Temperature `currentTemp`: Current tile's temperature.
- Humidity `currentHumd`: Current tile's humidity (base humidity included).
- Soil erosion `currentErosion`: How much soil has eroded.

**Tribes-related variables** (when occupied by a tribe):
- Population `population`: Current population of a tile.
- Looted `lootFactor`: If tile was looted it will grow less food.
- Erosion `erosion`: If tile is exploited too much it will grow less food and support less population.

### Climate Mechanics
`references in this section are to climate namespace`

Climate controls temperature and humidity variables of every tile. Climate changes in time (see climate variables).

**Climate attributes**:
- Base temperature `baseTemp`: Average temperature on map
- Season temperature amplitude `tempSeasonAmp`: How much temperature increases in summer and decreases in winter.
- Base humidity `baseHumd`: Average humidity on map
- Season humidity amplitude `humdSeasonAmp`: How much humidity increases in summer and decreases in winter.
- Local temperature amplitude `tempLocalAmp`: How much temperature can change from season average.
- Local humidity amplitude `humdLocalAmp`: How much humidity can change from season average.
- Greenhouse multiplier `ghgFactor`: How much greenhouse gases affect global temperatures.

**Climate variables**:
- Current season `season`: Current season (expressed in amount of ticks from year start).
- Current greenhouse `greenhouse`: Current amount of greenhouse gases in atmosphere. Standardized to values in range 0 - 2. Any temperature is multiplied by this amount.

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

## Formulas

### Food
##### Amount of food tribe receives from tile

### Tiles
##### Base supported population

### Tribes
##### Tile's population support multipier


## Modding
Simulation attributes are in file `config/simulation.yml`. To change formulas for simulation variables knowledge of JavaScript is required as formulas are hard-coded.
