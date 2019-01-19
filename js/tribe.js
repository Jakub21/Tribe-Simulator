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
        self.name = randomName();
        // Pref. Fruit Type
        //var base = config.food.trait.fruitType.base; // TODO
        //var amp = config.food.trait.fruitType.baseAmp;
        self.prefFruit = int(self.capital.food.trait.fruitType);
        if (self.prefFruit == NaN) {
            self.prefFruit = randint(0, 50); // TODO: Use references to config instead of constants
        }
        // Traits
        var base = config.tribe.migrate.cooldown.base;
        var amp = config.tribe.migrate.cooldown.amp;
        self.migrationCooldown = (base + random(-amp, amp)) * config.sim.yearLength;
        // Tile
        self.occupyTile(self.capital);
        self.tiles = [];
        self.tiles.push(self.capital);
    }

    self.update = function() {
        self.updateFood();
        if (random() >= config.tribe.birth.chance)
            self.expandPopulation();
        // Basic checks
        if (self.population <= config.tribe.pops.min) {
            self.die();
        }
        if (self.isSettled) { // Expansion
            if (random() >= config.tribe.expand.chance)
                self.checkExpansions();
        }
        else { // Migration
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
        var desiredPop = self.tiles.length * config.tribe.pops.desired;
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
    }

    self.releaseTile = function(tile) {
        tile.isOccupied = false;
        tile.occupiedBy = undefined;
    }

    self.die = function() {
        for (var tile of self.tiles) {
            tile.isOccupied = false;
            tile.occupiedBy = undefined;
        }
        self.capital.isOccupied = false;
        self.capital.occupiedBy = undefined;
        var prevLen = self.session.tribes.length;
        var i = indexOf(self.session.tribes, self);
        self.session.tribes.splice(i, 1);
    }

    // Not settled

    self.checkBestMigration = function() {
        var nbs = getNeighbourIndices(self.capital.x, self.capital.y, self.session.width, self.session.height);
        nbs = self.session.requestTiles(nbs);
        if (nbs.length == 0) return;
        var currFood = self.capital.food;
        var currFruitDelta = self.prefFruit - currFood.trait.fruitType;
        if (currFood.isPlaceholder) {
            currFruitDelta = Infinity;
        }
        var onlyPlaceholders = true;
        var bestChoice = {tile: self.capital,
            fruitDelta: currFruitDelta};
        for (var nb of nbs) {
            if (nb.isOccupied) continue;
            if (!nb.food.isPlaceholder) onlyPlaceholders = false;
            var nbFruitDelta = self.prefFruit - nb.food.trait.fruitType;
            if (nbFruitDelta < bestChoice.fruitDelta) {
                bestChoice.tile = nb;
                bestChoice.fruitDelta = nbFruitDelta;
            }
        }
        // Random migration (tribe is far from food it likes)
        var couldSettle = self.checkSettlementViable();
        if (bestChoice.fruitDelta > config.tribe.migrate.randomAtDelta
                || onlyPlaceholders
                || (couldSettle && bestChoice.fruitDelta > config.tribe.settle.maxFruitDelta)) {
            self.migrate(randChoice(nbs)); }
        // Normal migration
        if (bestChoice.tile != self.capital) {
            self.migrate(bestChoice.tile); }
    }

    self.migrate = function(tile) {
        if (self.isSettled) return;
        if (tile.isOccupied) return;
        var cd = self.migrationCooldown * config.sim.yearLength;
        var elapsed = self.session.tick - self.lastMigration;
        if (elapsed < cd) return;
        self.lastMigration = self.session.tick;
        self.releaseTile(self.capital);
        self.capital = tile;
        self.tiles = [];
        self.occupyTile(self.capital);
        self.tiles.push(tile);
        self.accumFood -= config.tribe.migrate.foodCost;
    }

    self.checkSettlementViable = function() {
        var result = true;
        // Check if has enough food
        if (self.accumFood < config.tribe.settle.foodCost) result = false;
        // Check if has enough pops
        if (self.population < config.tribe.settle.minPops) result = false;
        // Check if enough time has elapsed
        var mustNotMigrate = config.tribe.settle.minNotMigrated * config.sim.yearLength;
        var notMigrated = self.session.tick - self.lastMigration;
        if (notMigrated < mustNotMigrate) result = false;
        // NOTE: Tile - specific attributes are not checked here
        return result
    }

    self.checkSettle = function() {
        if (!self.checkSettlementViable()) return;
        var fruitDelta = abs(self.capital.food.trait.fruitType - self.prefFruit);
        if (fruitDelta > config.tribe.settle.maxFruitDelta) return;
        self.settle();
    }

    self.settle = function() {
        if (!self.checkSettlementViable()) return;
        self.isSettled = true;
        self.accumFood -= config.tribe.settle.foodCost;
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
            if (nbFruitDelta > config.tribe.expand.maxFruitDelta) continue;
            if (nbFruitDelta < bestChoice.fruitDelta) {
                bestChoice.tile = nb;
                bestChoice.fruitDelta = nbFruitDelta;
            }
        }
        if (bestChoice.tile != self.capital) {
            self.expand(bestChoice.tile); }
    }

    self.expand = function(tile) {
        // Cooldown
        var cooldown = config.tribe.expand.cooldown.base * config.sim.yearLength;
        cooldown -= self.tiles.length * config.tribe.expand.cooldown.decrease * config.sim.yearLength;
        var min = config.tribe.expand.cooldown.min * config.sim.yearLength;
        if (cooldown < min) cooldown = min;
        var elapsed = self.session.tick - self.lastExpand;
        if (cooldown > elapsed) return;
        self.lastExpand = self.session.tick;
        // Check food
        var fruitDelta = self.prefFruit - tile.food.trait.fruitType;
        if (fruitDelta > config.tribe.expand.maxFruitDelta) return;
        if (tile.food.isPlaceholder) return;
        // Check pops
        if (self.population < config.tribe.expand.minPops * self.tiles.length) return;
        self.accumFood -= config.tribe.expand.foodCost;
        // Apply
        self.occupyTile(tile);
        self.tiles.push(tile);
    }

    self.construct();
    return self;
}
