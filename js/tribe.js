"use strict";
/* ----------------------------------------------------------------
* Tribe class
*/
function Tribe(session, capitalTile) {
    var self = {
        session: session,
        capital: capitalTile,
        population: config.tribe.pops.start,
        tiles: [],
        accumFood: config.tribe.food.startAccum,
        lastMigration: 0,
        isSettled: false
    };

    self.construct = function() {
        var base = config.food.trait.fruitType.base;
        var spread = config.food.trait.fruitType.baseAmp;
        self.prefFruit = int(self.capital.food.trait.fruitType);
        if (self.prefFruit == NaN) {
            self.prefFruit = randint(0, 50); // TODO: Use references to config instead of constants
        }
        self.occupyTile(self.capital);
    }

    self.update = function() {
        // Check food income
        var income = 0;
        for (var tile of self.tiles) {
            if (tile.food.isPlaceholder) continue;
            var typeDelta = abs(self.prefFruit - tile.food.trait.fruitType);
            var strength = tile.food.strength;
            income += typeDelta/50 * strength/100 * config.tribe.food.incomeScale; // TODO: Use reference
                // to config instead of const 50
        }
        // Update accumulated food count
        self.accumFood += income;
        // Feed population
        self.accumFood -= config.tribe.food.foodPerPop * self.population;
        // Check if everyone was fed
        if (self.accumFood < 0) {
            var unfedPops = abs(self.accumFood / config.tribe.food.foodPerPop);
            self.population -= unfedPops;
            self.population = int(self.population);
            self.accumFood = 0;
            // TODO: Update tile distribution of pops
        }
        // Check if can expand pops
        var desiredPop = self.tiles.length * config.tribe.pops.desiredPerTile;
        var maxPopChange = self.population * config.tribe.pops.maxBirthsPerPop;
        if (self.population < desiredPop) {
            var canSpend = self.accumFood - config.tribe.food.desiredAccum;
            if (canSpend > 0) {
                var popChange = int(canSpend / config.tribe.pops.birthCost);
                if (popChange > maxPopChange) popChange = maxPopChange;
                self.population += popChange;
                self.accumFood -= popChange * config.tribe.pops.birthCost;
            }
        }
        // Basic checks
        if (self.population <= 0) {
            self.die();
        }
        // Expansion / Migration
        if (self.isSettled) {
            self.checkExpansions();
        }
        else {
            self.checkBestMigration();
            self.checkSettle();
        }
    }

    self.occupyTile = function(tile) {
        tile.isOccupied = true;
        tile.occupiedBy = self;
        self.tiles.push(tile);
    }

    self.releaseTile = function(tile) {
        tile.isOccupied = false;
        tile.occupiedBy = undefined;
        self.tiles.splice(indexOf(self.tiles, tile), 1);
    }

    self.die = function() {
        self.session.tribes.splice(indexOf(self.session.tribes, self), 1);
        for (var tile of self.tiles) {
            self.releaseTile(tile);
        }
    }

    // Not settled

    self.checkBestMigration = function() {
        var nbs = getNeighbourIndices(self.capital.x, self.capital.y, self.session.width, self.session.height);
        nbs = self.session.requestTiles(nbs);
        var currFood = self.capital.food;
        var currFruitDelta = self.prefFruit - currFood.trait.fruitType;
        var currStrength = currFood.strength;
        if (currFood.isPlaceholder) {
            currFruitDelta = Infinity;
            currStrength = 0;
        }
        currStrength *= config.tribe.migrate.strengthRatio;
        var onlyPlaceholders = true;
        var bestChoice = {tile: self.capital,
            strength: currStrength, fruitDelta: currFruitDelta};
        for (var nb of nbs) {
            if (nb.isOccupied) continue;
            if (!nb.food.isPlaceholder) onlyPlaceholders = false;
            var nbFruitDelta = self.prefFruit - nb.food.trait.fruitType;
            var nbStrength = nb.food.strength;
            if (nbStrength >= bestChoice.strength && nbFruitDelta < bestChoice.fruitDelta) {
                bestChoice.tile = nb;
                bestChoice.strength = nbStrength;
                bestChoice.fruitDelta = nbFruitDelta;
            }
        }
        // Random migration (tribe is far from food it likes)
        if (bestChoice.fruitDelta > config.tribe.migrate.randomAtdelta || onlyPlaceholders) {
            self.migrate(randChoice(nbs)); }
        // Normal migration
        if (bestChoice.tile != self.capital) {
            self.migrate(bestChoice.tile); }
    }

    self.migrate = function(tile) {
        if (self.isSettled) return;
        var cd = config.tribe.migrationCooldown * config.sim.yearLength;
        var elapsed = self.session.tick - self.lastMigration;
        if (elapsed < cd) return;
        self.lastMigration = self.session.tick;
        self.releaseTile(self.capital);
        self.capital = tile;
        self.occupyTile(self.capital);
    }

    self.checkSettle = function() {
        var mustNotMigrate = config.tribe.settle.minNotMigrated * config.sim.yearLength;
        var notMigrated = self.session.tick - self.lastMigration;
        if (notMigrated < mustNotMigrate) return false;
        var fruitDelta = abs(self.capital.food.trait.fruitType - self.prefFruit);
        if (fruitDelta > config.tribe.settle.maxFruitDelta) return false;
        // After all this was checked...
        self.settle();
    }

    self.settle = function() {
        var cost = config.tribe.settle.foodCost;
        if (self.accumFood < cost) return;
        self.isSettled = true;
        self.accumFood -= cost;
    }

    // Settling

    // Settled

    self.checkExpansions = function() {
        // Check if can expand
        if (!self.isSettled) return;
        // Check tiles
        var nbs = getNeighbourIndices(self.capital.x, self.capital.y, self.session.width, self.session.height);
        nbs = self.session.requestTiles(nbs);
        var bestChoice = {tile: self.capital,
            strength: 0, fruitDelta: Infinity};
        for (var nb of nbs) {
            if (nb.isOccupied) continue;
            if (nb.food.isPlaceholder) continue;
            var nbFruitDelta = self.prefFruit - nb.food.trait.fruitType;
            var nbStrength = nb.food.strength;
            if (nbStrength >= bestChoice.strength && nbFruitDelta < bestChoice.fruitDelta) {
                bestChoice.tile = nb;
                bestChoice.strength = nbStrength;
                bestChoice.fruitDelta = nbFruitDelta;
            }
        }
    }

    self.expand = function(tile) {
        self.tiles.push(tile);
        self.occupyTile(tile);
    }

    self.construct();
    return self;
}
