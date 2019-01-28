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
        popsHistory: [],
        last: { // Stores session tick
            migration: 0,
            expansion: 0,
        },
        current: {}, // Stores calculated variables for current tick
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
        // Sub objects
        self.brain = Brain(self);
        self.economy = Economy(self);
    }
    self.update = function() {
        self.updateVars();
        self.economy.update();
        self.brain.update();
        if (self.getPopulation() < config.tribe.pops.min) {
            self.die(); }
    }
    self.die = function() {
        for (var section of self.sections) {
            section.die(); }
        self.alive = false;
        if (self.session.selectedTribe == self)
            self.session.selectedTribe = undefined;
    }
    self.tellSectionDied = function(section) {
        var index = indexOf(self.sections, section);
        self.sections.splice(index, 1);
        if (self.sections.length == 0) self.die();
    }

    self.updateVars = function() {
        // NOTE
        // Save those values so functions dont have to be called multiple times
        // Also performs some checks
        self.current.population = self.getPopulation();
        self.popsHistory.push(self.current.population);
        if (self.popsHistory.length > config.sim.yearLength)
            self.popsHistory.shift();
        // Tile, local foods
        self.current.onDeadTile = self.capital.tile.food.isPlaceholder;
        // Foods
        self.current.capacity = self.current.population * config.tribe.eco.capacity.perPop;
    }

    self.shortage = function(severity) {
        var sum = 0;
        var sections = [];
        for (var section of self.sections) {
            if (section.bilance < 0) {
                sum += section.bilance;
                sections.push(section);
            }
        }
        sum = -sum;
        for (var section of sections) {
            section.shortage( -section.bilance / sum); }
    }

    self.getPopulation = function() {
        var pops = 0;
        for (var section of self.sections) {
            pops += section.population; }
        return pops;
    }
    self.getPopsDelta = function(ticks) {
        if (ticks > self.popsHistory.length) return undefined;
        return self.current.population - self.popsHistory[self.popsHistory.length-ticks];
    }

    self.canExpand = function() {
        return false; // TODO
    }
    self.canSettle = function() {
        return false; // TODO
    }
    self.canMigrate = function() {
        return false; // TODO
    }

    self.canExpandHere = function(tile) {
        if (!self.canExpand()) return false;
        // TODO
    }
    self.canSettleHere = function(tile) {
        if (!self.canSettle()) return false;
        // TODO
    }
    self.canMigrateHere = function(tile) {
        if (!self.canMigrate()) return false;
        // TODO
    }

    // ACTIONS

    self.expand = function(tile) {
        // TODO
    }
    self.settle = function() {
        // TODO
    }
    self.migrate = function(tile) {
        // TODO
    }

    self.construct();
    return self;
}
