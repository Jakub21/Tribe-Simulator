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
        lastExpand: 0,
        isSettled: false,
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
        self.updateFood();
        if (random() >= config.tribe.birth.chance)
            self.expandPopulation();
        // Basic checks
        if (self.population <= 0) {
            self.die();
        }
        if (self.isSettled) { // Migration
            if (random() >= config.tribe.expand.chance)
                self.checkExpansions();
        }
        else { // Expansion
            self.checkBestMigration();
            self.checkSettle();
        }
    }

    self.updateFood = function() {
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
    }

    self.expandPopulation = function() {
        // Check if can expand pops
        var desiredPop = self.tiles.length * config.tribe.pops.desiredPerTile;
        var maxPopChange = ceil(self.population * config.tribe.birth.maxPerPop);
        if (self.population < desiredPop) {
            var canSpend = self.accumFood - config.tribe.food.desiredAccum;
            if (canSpend > 0) {
                var popChange = int(canSpend / config.tribe.birth.foodCost);
                if (popChange > maxPopChange) popChange = maxPopChange;
                var changeRatio = random(config.tribe.birth.batch.min, config.tribe.birth.batch.max);
                popChange *= changeRatio;
                self.population += popChange;
                self.accumFood -= popChange * config.tribe.birth.foodCost;
            }
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
        for (var tile of self.tiles) {
            self.releaseTile(tile);
        }
        self.session.tribes.splice(indexOf(self.session.tribes, self), 1);
    }

    // Not settled

    self.checkBestMigration = function() {
        var nbs = getNeighbourIndices(self.capital.x, self.capital.y, self.session.width, self.session.height);
        nbs = self.session.requestTiles(nbs);
        if (nbs.length == 0) return;
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
        if (tile.isOccupied) return;
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

    // Settled

    self.checkExpansions = function() {
        // Check if can expand
        if (!self.isSettled) return;
        // Check tiles
        var nbs = [];
        for (var tile of self.tiles) {
            var indices = getNeighbourIndices(tile.x, tile.y, self.session.width, self.session.height);
            for (var i of indices) {
                if (!nbs.includes(i)) nbs.push(i);
            }
        }
        nbs = self.session.requestTiles(nbs);
        if (nbs.length == 0) return;
        var bestChoice = {tile: self.capital, fruitDelta: Infinity};
        for (var nb of nbs) {
            if (nb.isOccupied) continue;
            if (nb.food.isPlaceholder) continue;
            var nbFruitDelta = self.prefFruit - nb.food.trait.fruitType;
            if (nbFruitDelta < bestChoice.fruitDelta) {
                bestChoice.tile = nb;
                bestChoice.fruitDelta = nbFruitDelta;
            }
        }
        if (bestChoice.tile != self.capital) {
            self.expand(bestChoice.tile); }
    }

    self.expand = function(tile) {
        var cooldown = config.tribe.expand.cooldown.base * config.sim.yearLength;
        cooldown -= self.tiles.length * config.tribe.expand.cooldown.decrease * config.sim.yearLength;
        var min = config.tribe.expand.cooldown.min * config.sim.yearLength;
        if (cooldown < min) cooldown = min;
        var elapsed = self.session.tick - self.lastExpand;
        if (cooldown > elapsed) return;
        if (tile.food.isPlaceholder) return;
        if (self.population < config.tribe.expand.minPops) return;
        self.accumFood -= config.tribe.expand.foodCost;
        self.occupyTile(tile);
        self.lastExpand = self.session.tick;
    }

    self.construct();
    return self;
}
