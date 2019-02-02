# Configuration details

## Meta
**Creation date** January 2019  
**Latest update** February 2019  
**Author** Jakub21  
**GitHub** https://github.com/Jakub21  
**Repository**: https://github.com/Jakub21/Tribe-Simulator  
**License**: MIT license  
**Document Version**: 0.1

## Simulation section
`sim`  
Simulation general info
- `yearLength` - How much ticks it takes for year to pass. Affects rate of seasons change, displayed age of foods and tribes and amount of entries used to calculate recent changes (etc. total income in last year)

#### Framerate
`sim.fps`  
Specifies framerate of simulation
- `max` - Framerate cap. User can not set more.
- `default` - Framerate applied when program starts.
- `step` - Frames added / subtracted from current when button is pressed. Also minimum user can set.

## Display section
`disp`  
Display, UI, colours etc

#### Zoom subsection
`disp.zoom`  
Zoom configuration. Zoom is multiplier of map elements size.
- `max` - Maximum zoom multiplier
- `min` - Minimum zoom multiplier
- `default` - Zoom applied when program starts

#### Elements subsection
`disp.elems`  
Specifies size of various objects. Values expressed in pixels.
- `tile` - Size of tile

#### Range subsection
`disp.range`  
Ranges are used to map values to colours. All ranges are mapped to colour hue. Range of `strength` is an exception, it is mapped to colour luminosity.

#### Colours subsections
`disp.color`  
Defines colours.
- `sat` - Colour saturation
    - `default` - Default value
    - `foodTribeScale` - How much less saturated is food in map modes where both food and tribes are visible.
- `lum` - Colour luminosity
    - `max` - Maximum luminosity
    - `min` - Minimum luminosity
    - `default` - Default luminosity
    - `placeholder` - Luminosity of tiles with dead food
    - `foodTribe` - Range of luminosity in map modes where both food and tribes are visible
- `hue` - Colour hue range

#### Season
`disp.season` **ARRAY**  
Contains names of year seasons

## Map section
`map`  
Contains definitions of map size
- `width`
- `height`

## Food section
`food`  
Specifies food-related constants

#### Strength subsection
`food.strength`  
Defines strength values
- `max` - Maximum possible food strength
- `start` - Strength of food when it is spawned

#### Growth subsection
`food.growth`  
Constants affecting growth rate
- `base` - Base growth multiplier
- `loseMultiplier` - How much faster food loses strength than gains
- `temp` - Temperature's effect on growth
    - `scale` - Effect scale
    - `efficiency` - At what difference(current, preferred) efficiency falls to zero
    - `range` - Value mapping range
- `humd` - Humidity's effect on growth
    - `scale` - Effect scale
    - `efficiency` - At what difference(current, preferred) efficiency falls to zero
    - `range` - Value mapping range

#### Cloning subsection
`food.clone`  
Defines clone requirements for tiles and foods.
- `minStrength` - Minimum strength of food for it to be counted as alive neighbour
- `minAge` - Minimum age of food for it to be counted as alive neighbour
- `minNeighbours` - Minimum amount of neighbours with alive foods tile needs for it to be able to generate new food.

#### Traits subsection
`food.trait`  
Food traits definitions. All traits conform to this template.
- **TEMPLATE**
    - `base` - Used at start. Noise central value.
    - `baseAmp` - Used at start. Amplitude of noise.
    - `mutateAmp` - Used when new food is generated. Amplitude of random mutations.
    - `noiseScale` - Used at start. Scale of noise size.

List of traits:
- `efficiency` - Food's efficiency factor. Calculated growth rate is multiplied by this value
- `tempPref` - Food's preferred temperature
- `humdPref` - Food's preferred humidity
- `fruitType` - Generated fruit type.

## Tiles section
`tile`  
Contains tile configuration

#### Fertility subsection
`tile.fertility`  
Defines fertility values
- `base` - Base tile fertility
- `baseAmp` - Amplitude of fertility noise
- `noiseScale` - Factor of noise size

#### Own food subsection
`tile.ownedFood`  
Regulates tile - food relation
- `diedCooldown` - How much time must pass after food died before new one can be generated. Expressed in years.
- `newChance` - Change of getting new food when one is not present.

## Climate section
`climate`  
Defines climate

#### Variable definitions
`climate.temp` `climate.humd`  
Defines ranges and values of temperature and humidity. Both subsections match this template.
- **TEMPLATE**
    - `base` - Average base value
    - `seasonAmp` - How much value increases and decreases during the year
    - `longitudeAmp` - How much value in one map extreme differs from value on opposite extreme
    - `localAmp` - Amplitude of cloud changes.

#### Greenhouse subsection
`climate.greenhouse`  
Contains greenhouse related constants
- `base` - Starting value of greenhouse effect

#### Clouds subsection
`climate.cloud`  
Clouds configuration
- `noiseScale` - Size of noise
- `vel` - Velocity definition
    - `max` - Maximum clouds velocity
    - `step` - Maximum absolute velocity step. Randomized each tick
    - `backwdFactor` - Probability of slowing down

## Tribes section
`tribe`  
Defines tribes related constants

#### Tribes amount subsection
`tribe.amount`  
Defines amount of tribes in the simulation
- `start` - Amount of tribes at start of the program
- `min` - If number of alive tribes falls below this, new one is added

#### Population subsection
`tribe.pops`  
Population constants
- `start` - Starting tribe population
- `max` - Maximum population per section

#### Economy subsection
`tribe.eco`  
Defines food economy
- `incomeMultiplier` - Food income is multiplied by this value
- `fruitEfficiency` - If fruit difference reaches this value, tribe can not get any value out of it
- `shortageSeverityFactor` - When tribe has not enough food, the shortage severity is multiplied by this value
- `foodPerPop` - Amount of food each member of population eats per tick
- `capacity` - Defines storage capacity
    - `base` - Base capacity
    - `perPop` - Capacity added, per population

#### Migration subsection
Migration is in development
