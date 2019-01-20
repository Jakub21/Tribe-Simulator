"use strict";
/* ----------------------------------------------------------------
* Tribe class
*/
function Tribe(session, startTile) {
    var self = {
        session: session,
        startTile: startTile,
        sections: [],
        isSettled: false,
        alive: true,
        food: {
            accum: config.tribe.food.startAccum,
            bilance: 0,
            rawIncome: 0,
            prevBilances: [],
        },
        last: { // Stores session tick
            migration: 0,
            expansion: 0,
        },
        // Attributes defined in construct method
        name: '',
        createTick: -1,
        capital: undefined,
        migrCooldown: Infinity,
    };
    self.construct = function() {
        self.name = randomName();
        self.prefFruit = int(self.startTile.food.trait.fruitType);
        self.createTick = self.session.tick
        // Migration cooldown
        var base = config.tribe.migrate.cooldown.base;
        var amp = config.tribe.migrate.cooldown.amp;
        self.migrCooldown = (base + random(-amp, amp)) * config.sim.yearLength;
        // Sections
        self.capital = Section(self, startTile, true);
        self.capital.population = config.tribe.pops.start;
        self.sections.push(self.capital);
    }
    self.update = function() {
        self.updateFood();
        if (random() <= config.tribe.birthChance)
            self.expandPops();
        if (self.getPopulation() < config.tribe.pops.min) {
            self.die(); }
        if (self.isSettled) {
            // Expansion
        }
        else {
            self.checkMigration();
        }
    }
    self.updateFood = function() {
        var prev = self.food.accum;
        self.food.rawIncome = 0;
        for (var section of self.sections) {
            var bilance = section.getBilance();
            self.food.rawIncome += section.rawIncome;
            if (bilance < 0) {
                var amount = abs(bilance);
                if (amount < self.food.accum) {
                    section.donate(amount);
                    self.food.accum -= amount; }
            }
            else {
                self.food.accum += bilance; }
            section.feedPops();
        }
        self.food.bilance = self.food.accum - prev;
        self.food.prevBilances.push(self.food.bilance);
        if (self.food.prevBilances.length > config.sim.yearLength) {
            self.food.prevBilances.shift();}
        var maxAccum = self.getCapacity();
        if (self.food.accum > maxAccum) self.food.accum = maxAccum;
        if (self.food.accum < 0) self.food.accum = 0; // TODO
    }
    self.getPopulation = function() {
        var pops = 0;
        for (var section of self.sections) {
            pops += section.population; }
        return pops;
    }
    self.getCapacity = function() {
        return self.getPopulation() * config.tribe.food.maxAccumPerPop;
    }
    self.getYearBilance = function() {
        function sum(total, num) {return total + num;}
        return self.food.prevBilances.reduce(sum);
    }
    self.die = function() {
        for (var section of self.sections) {
            section.die(); }
        self.alive = false;
    }

    // EXPANSION

    self.checkExpansion = function() {
        if (!self.isSettled) return;
        // Check tiles
        var nbs = [];
        for (var section of self.sections) {
            var tile = section.tile;
            var indices = getNeighbourIndices(tile.x, tile.y,
                self.session.width, self.session.height);
            for (var i of indices) {
                if (!nbs.includes(i)) nbs.push(i);
            }
        }
        nbs = self.session.requestTiles(nbs);
        if (nbs.length == 0) return;
        var bestChoice = {tile: capitalTile, delta: currentDelta};
        for (var nb of nbs) {
            if (nb.isOccupied) continue;
            if (!nb.food.isPlaceholder) onlyDead = false;
            var nbDelta = self.prefFruit - nb.food.trait.fruitType;
            if (nbDelta < bestChoice.delta) {
                bestChoice.tile = nb;
                bestChoice.delta = nbDelta;
            }
        }
        if (bestChoice.tile != 1) {}
    }

    // SETTLEMENT

    self.isSettlementViable = function() {
        var result = true;
        // Check if has enough food
        if (self.accumFood < config.tribe.settle.cost) result = false;
        // Check if enough time has elapsed
        var mustWait = config.tribe.settle.minNotMigrated * config.sim.yearLength;
        var notMigrated = self.session.tick - self.last.migration;
        if (notMigrated < mustWait) result = false;
        // NOTE: Tile attributes are not checked
        return result;
    }
    self.settle = function() {
        if (!self.isSettlementViable) return;
        self.isSettled = true;
        self.food.accum -= config.tribe.settle.cost;
    }
    self.checkSettle = function() {
        if (!self.isSettlementViable) return;
        var delta = abs(self.capital.tile.food.trait.fruitType - self.prefFruit);
        if (delta > config.tribe.settle.maxFruitDelta) return;
        self.settle();
    }

    // MIGRATION

    self.migrate = function(tile) {
        if (self.isSettled) return;
        if (tile.isOccupied) return;
        if (tile == self.capital.tile) return;
        var elapsed = self.session.tick - self.last.migration;
        if (elapsed < self.migrCooldown) return;
        self.last.migration = self.session.tick;
        self.food.accum -= config.tribe.migrate.cost;
        self.capital.migrate(tile);
    }
    self.checkMigration = function() {
        var capitalTile = self.capital.tile;
        var nbs = getNeighbourIndices(capitalTile.x, capitalTile.y,
            self.session.width, self.session.height);
        nbs = self.session.requestTiles(nbs);
        if (nbs.length == 0) return;
        var currentFood = capitalTile.food;
        var currentDelta = self.prefFruit - currentFood.trait.fruitType;
        if (currentFood.isPlaceholder) {
            currentDelta = Infinity; }
        var onlyDead = true;
        // Check neighbouring tiles
        var bestChoice = {tile: capitalTile, delta: currentDelta};
        for (var nb of nbs) {
            if (nb.isOccupied) continue;
            if (!nb.food.isPlaceholder) onlyDead = false;
            var nbDelta = self.prefFruit - nb.food.trait.fruitType;
            if (nbDelta < bestChoice.delta) {
                bestChoice.tile = nb;
                bestChoice.delta = nbDelta;
            }
        }
        // Random migration
        // var canSettleTile = bestChoice.delta > config.tribe.settle.maxFruitDelta;
        // var settleViable = self.isSettlementViable();
        // if (bestChoice.fruitDelta > config.tribe.migrate.randomAtDelta
        //         || onlyDead || (settleViable && canSettleTile)) {
        //     self.migrate(randChoice(nbs));
        // }
        // Rational migration
        if (bestChoice.tile != self.capital) {
            self.migrate(bestChoice.tile); }
    }

    self.construct();
    return self;
}
