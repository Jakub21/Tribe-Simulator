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
        income: 0,
        expenses: 0,
        bilance: 0,
    };
    self.construct = function() {
        self.tile.occupy(self.tribe);
    }
    self.getIncome = function() {
        var food = self.tile.food;
        if (food.isPlaceholder) return 0;
        var pref = self.tribe.prefFruit;
        var efficiency = config.tribe.eco.fruitEfficiency;
        var diff = abs(food.trait.fruitType - pref);
        var income = (food.strength / config.food.strength.max) * (efficiency **2 - diff **2);
        income *= config.tribe.eco.incomeMultiplier;
        self.income = income;
        return income;
    }
    self.getExpenses = function() {
        var expenses = 0;
        expenses += self.population * config.tribe.eco.foodPerPop;
        self.expenses = expenses;
        self.bilance = self.income - expenses;
        return expenses;
    }
    self.shortage = function(lacksFood) {
        var ct = config.tribe;
        var starvingAmount = ceil(lacksFood / ct.eco.foodPerPop);
        self.population -= starvingAmount;
        if (self.population <= 0) self.die();
    }
    self.expandPops = function(amount) {
        self.population += amount;
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
        self.tribe.tellSectionDied(self);
    }
    self.construct();
    return self;
}
