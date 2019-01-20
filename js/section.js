"use strict";
/* ----------------------------------------------------------------
* Tribe Section
*/
function Section(tribe, tile, isCapital) {
    var self = {
        tribe: tribe,
        tile: tile,
        isCapital: isCapital,
        population: 0,
        food: 0,
        rawIncome: 0,
    };
    self.construct = function() {
        self.tile.occupy(self.tribe);
    }
    self.gatherFood = function() {
        var food = self.tile.food;
        if (food.isPlaceholder) return 0;
        var pref = self.tribe.prefFruit;
        var efficiency = config.tribe.food.diffEfficiency;
        var diff = abs(food.trait.fruitType - pref);
        var income = (food.strength / 100) * (efficiency **2 - diff **2);
        income *= config.tribe.food.incomeScale;
        self.rawIncome = income;
        self.food = income; // It is not +=
        return income;
    }
    self.calculateExpenses = function() {
        var expenses = 0;
        expenses += self.population * config.tribe.food.perPop;
        return expenses;
    }
    self.getBilance = function() {
        var income = self.gatherFood();
        var expenses = self.calculateExpenses();
        self.bilance = income - expenses;
        return self.bilance;
    }
    self.donate = function(donation) {
        if (donation > 0) self.food += donation;
    }
    self.feedPops = function() {
        var needed = self.population * config.tribe.food.perPop;
        self.food -= needed;
        if (self.food < 0) {
            self.starve(abs(self.food));
            self.food = 0;
        }
    }
    self.starve = function(lacksFood) {
        var ct = config.tribe;
        var starvingAmount = ceil(lacksFood / ct.food.perPop * ct.pops.unfedRatio);
        self.population -= starvingAmount;
    }
    self.abandonPop = function() {
        // Abandon section with out rescuing population
    }
    self.abandonTile = function() {
        // Abandon section and move population to other sections
        self.tile.release();
    }
    self.migrate = function(target) {
        if (target.isOccupied) return;
        if (!self.tribe.alive) return;
        self.tile.release();
        self.tile = target;
        self.tile.occupy(self.tribe);
    }
    self.die = function() {
        self.tile.release();
    }
    self.construct();
    return self;
}
