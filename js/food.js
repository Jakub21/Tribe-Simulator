"use strict";
/* ----------------------------------------------------------------
* Food class
*/
function Food(session, efficiency, tempPref, humdPref) {
    var self = {
        createTick: session.tick,
        session: session,
        efficiency: efficiency,
        tempPref: tempPref,
        humdPref: humdPref,
        strength: config.food.strength.start,
        isPlaceholder: false,
    };
    self.assignTile = function(tile) {
        self.tile = tile;
    }
    self.update = function() {
        var tempDelta = abs(self.tempPref - self.tile.temp);
        var humdDelta = abs(self.humdPref - self.tile.humd);
        var tempFactor = config.food.tempEfficiency - tempDelta;
        var humdFactor = config.food.humdEfficiency - humdDelta;
        var tempImportance = config.food.tempImportance;
        var humdImportance = config.food.humdImportance;
        var change = (tempFactor*tempImportance + humdFactor*humdImportance) * self.efficiency *
            config.food.growth.base;
        if (change > 0) change *= self.tile.fertility;
        else change *= config.food.growth.loseMultiplier;
        self.strength += change;
        if (self.strength > config.food.strength.max) self.strength = config.food.strength.max;
        if (self.strength <= 0) self.kill();
    }
    self.mutate = function() {
        var cft = config.food.trait;
        var amp = cft.efficiency.mutateAmp;
        self.efficiency += random(-amp, amp);
        var amp = cft.tempPref.mutateAmp;
        self.tempPref += random(-amp, amp);
        var amp = cft.humdPref.mutateAmp;
        self.humdPref += random(-amp, amp);
    }
    self.kill = function() {
        self.tile.tellFoodDied();
    }
    return self
}
/* ----------------------------------------------------------------
* Food Generator: Average traits of Foods from supplied array
*/
function averagedFood(foodArray) {
    if (foodArray.length == 0) {
        return false;
    }
    var session = foodArray[0].session;
    var efficiency = 0;
    var tempPref = 0;
    var humdPref = 0;
    for (var index = 0; index < foodArray.length; index+= 1) {
        var food = foodArray[index];
        efficiency += food.efficiency;
        tempPref += food.tempPref;
        humdPref += food.humdPref;
    }
    efficiency /= foodArray.length;
    tempPref /= foodArray.length;
    humdPref /= foodArray.length;
    return Food(session, efficiency, tempPref, humdPref);
}
/* ----------------------------------------------------------------
* Food Generator: Food-like placeholder
*/
function placeholderFood(session) {
    self = {
        session: session,
        efficiency: NaN,
        tempPref: NaN,
        humdPref: NaN,
        isPlaceholder: true,
        createTick: 0,
        tile: {
            temp: 0, humd: 0,
            tellFoodDied: function() {},
        },
        update: function() {},
        mutate: function() {},
    };
    return self;
}
