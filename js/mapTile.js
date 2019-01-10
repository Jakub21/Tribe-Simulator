"use strict";
/* ----------------------------------------------------------------
* Tile class
*/
function Tile(session, x, y, fertility, foodSpiece) {
    var self = {
        x: x,
        y: y,
        session: session,
        temp: 10,
        humd: 50,
        fertility: fertility,
        erosion: 0,
        gotFoodTick: 0,
        lostFoodTick: 0,
        hasFood: false
    };
    self.getColor = function(mapMode) {
        var hue = NaN;
        var sat = config.disp.repr.tileSat;
        var lum = config.disp.repr.tileLum;
        if (mapMode == "fert") {
            hue = mapValue(self.fertility,
                config.disp.repr.fertMin, config.disp.repr.fertMax,
                config.disp.hueRed,config.disp.hueGreen);}
        else if (mapMode == "temp") {
            hue = mapValue(self.temp,
                config.disp.repr.tempMax, config.disp.repr.tempMin,
                config.disp.hueRed, config.disp.hueGreen);}
        else if (mapMode == "humd") {
            hue = mapValue(self.humd,
                config.disp.repr.humdMax, config.disp.repr.humdMin,
                config.disp.hueRed, config.disp.hueGreen);}
        else if (mapMode == "foodSpiece") {
            if (self.food.isPlaceholder) {hue = 0; sat = 0; lum = 30;}
            else {
                hue = mapValue(self.food.tempPref, 0, 30,
                    config.disp.hueGreen, config.disp.hueRed);
                lum = mapValue(self.food.strength, 0, 100, 0, 50);
            }
        }
        else {return "#444";}
        if (hue > 110) hue += 20;
        var color = fromHsl(hue, sat, lum);
        if (color == "#NaNNaNNaN") return "#000";
        return color;
    }
    self.assignFood = function(food) {
        food.assignTile(self);
        self.food = food;
        self.hasFood = true;
        self.gotFoodTick = self.session.tick;
    }
    self.getNewFood = function() {
        var indices = getNeighbourIndices(x, y, self.session.width, self.session.height);
        var otherTiles = self.session.requestTiles(indices);
        var otherFoods = [];
        for (var i = 0; i < otherTiles.length; i += 1) {
            var food = otherTiles[i].food;
            if (session.tick - food.createTick < config.food.cloneMinAge) continue;
            if ((!food.isPlaceholder) && (food.strength >= config.food.cloneStrength)) {
                otherFoods.push(otherTiles[i].food);
            }
        }
        //if (otherFoods.length < config.food.minCloneNeighbours) return;
        var food = averagedFood(otherFoods);
        if (food == false) return;
        food.mutate();
        self.assignFood(food);
    }
    self.tellFoodDied = function() {
        self.food = placeholderFood();
        self.hasFood = false;
        self.lostFoodTick = self.session.tick;
    }
    self.update = function() {
        if (!self.hasFood) {
            var mustWait = config.tile.foodDiedCooldown * config.sim.yearLength;
            var elapsed = self.session.tick - self.lostFoodTick;
            if (elapsed >= mustWait) {
                //if (random() <= config.tile.foodNewChance)
                self.getNewFood();
            }
        }
        self.food.update();
    }
    return self;
}
