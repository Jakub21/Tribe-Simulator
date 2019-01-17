"use strict";
/* ----------------------------------------------------------------
* Food class
*/
function Food(session, efficiency, tempPref, humdPref, fruitType) {
    var self = {
        session: session,
        isPlaceholder: false,
        createTick: session.tick,
        strength: config.food.strength.start,
        trait: {
            efficiency: efficiency,
            tempPref: tempPref,
            humdPref: humdPref,
            fruitType: fruitType,
        }
    };
    self.assignTile = function(tile) {
        self.tile = tile;
    }
    self.update = function() {
        // Some variable that can not be named yet (H of target range of mapValue)
        // Calculate temperature
        var tempRange = config.food.growth.temp.range;
        var tempDelta = abs(self.trait.tempPref - self.tile.temp);
        var tempScale = config.food.growth.temp.scale;
        var tempEff = config.food.growth.temp.efficiency**2;
        var tempFactor = tempEff - tempDelta**2;
        tempFactor = mapValue(tempFactor, tempEff, -tempEff, tempRange.max, tempRange.min);
        if (tempFactor < -1) tempFactor = -1;
        // Calculate humidity
        var humdRange = config.food.growth.temp.range;
        var humdDelta = abs(self.trait.humdPref - self.tile.humd);
        var humdScale = config.food.growth.humd.scale;
        var humdEff = config.food.growth.humd.efficiency;
        var humdFactor = humdEff - humdDelta;
        humdFactor = mapValue(humdFactor, humdEff, -humdEff, humdRange.max, humdRange.min);
        if (humdFactor < -1) humdFactor = -1;
        // Apply change
        var change = tempFactor * tempScale + humdFactor * humdScale;
        if (change > 0) {
            change *= self.tile.fertility * self.trait.efficiency;}
        else {
            change *= config.food.growth.loseMultiplier; }
        change *= config.food.growth.base;
        self.strength += change;
        if (self.strength > config.food.strength.max) self.strength = config.food.strength.max;
        if (self.strength <= 0) self.die();
    }
    self.mutate = function() {
        var cft = config.food.trait;
        var amp = cft.efficiency.mutateAmp;
        self.trait.efficiency += random(-amp, amp);
        var amp = cft.tempPref.mutateAmp;
        self.trait.tempPref += random(-amp, amp);
        var amp = cft.humdPref.mutateAmp;
        self.trait.humdPref += random(-amp, amp);
        var amp = cft.fruitType.mutateAmp;
        self.trait.fruitType += random(-amp, amp);
    }
    self.die = function() {
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
    var fruitType = 0;
    for (var index = 0; index < foodArray.length; index+= 1) {
        var food = foodArray[index];
        efficiency += food.trait.efficiency;
        tempPref += food.trait.tempPref;
        humdPref += food.trait.humdPref;
        fruitType += food.trait.fruitType;
    }
    efficiency /= foodArray.length;
    tempPref /= foodArray.length;
    humdPref /= foodArray.length;
    fruitType /= foodArray.length;
    return Food(session, efficiency, tempPref, humdPref, fruitType);
}
/* ----------------------------------------------------------------
* Food Generator: Food-like placeholder
*/
function placeholderFood(session) {
    self = {
        session: session,
        trait: {
            efficiency: NaN,
            tempPref: NaN,
            humdPref: NaN,
            fruitType: NaN,
        },
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
