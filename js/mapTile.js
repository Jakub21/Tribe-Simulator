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
        hasFood: false,
        isOccupied: false,
        occupiedBy: undefined,
    };
    self.getColor = function(mapMode) {
        var hue = NaN;
        var sat = config.disp.color.sat.default;
        var lum = config.disp.color.lum.default;
        if (mapMode == "fert") {
            hue = mapValue(self.fertility,
                config.disp.range.fert.min, config.disp.range.fert.max,
                config.disp.color.hue.min,config.disp.color.hue.max);}
        else if (mapMode == "temp") {
            hue = mapValue(self.temp,
                config.disp.range.temp.max, config.disp.range.temp.min,
                config.disp.color.hue.min, config.disp.color.hue.max);}
        else if (mapMode == "humd") {
            hue = mapValue(self.humd,
                config.disp.range.humd.max, config.disp.range.humd.min,
                config.disp.color.hue.min, config.disp.color.hue.max);}
        else if (mapMode == "foodPrefTemp") {
            if (self.food.isPlaceholder) {hue = 0; sat = 0; lum = 30;}
            else {
                hue = mapValue(self.food.trait.tempPref,
                    config.disp.range.temp.max, config.disp.range.temp.min,
                    config.disp.color.hue.min, config.disp.color.hue.max);
                lum = mapValue(self.food.strength,
                    config.disp.range.strength.min, config.disp.range.strength.max,
                    config.disp.color.lum.min, config.disp.color.lum.max);
            }
        }
        else if (mapMode == "foodPrefHumd") {
            if (self.food.isPlaceholder) {hue = 0; sat = 0; lum = 30;}
            else {
                hue = mapValue(self.food.trait.humdPref,
                    config.disp.range.humd.max, config.disp.range.humd.min,
                    config.disp.color.hue.min, config.disp.color.hue.max);
                lum = mapValue(self.food.strength,
                    config.disp.range.strength.min, config.disp.range.strength.max,
                    config.disp.color.lum.min, config.disp.color.lum.max);
            }
        }
        else if (mapMode == "foodFruitType") {
            if (self.food.isPlaceholder) {hue = 0; sat = 0; lum = 30;}
            else {
                hue = mapValue(self.food.trait.fruitType,
                    config.disp.range.fruit.min, config.disp.range.fruit.max,
                    config.disp.color.hue.min, config.disp.color.hue.max);
                lum = mapValue(self.food.strength,
                    config.disp.range.strength.min, config.disp.range.strength.max,
                    config.disp.color.lum.min, config.disp.color.lum.max);
            }
        }
        else if (mapMode == "tribePrefFruit") {
            if (self.isOccupied) {
                hue = mapValue(self.occupiedBy.prefFruit,
                    config.disp.range.fruit.min, config.disp.range.fruit.max,
                    config.disp.color.hue.min, config.disp.color.hue.max);
            }
            else { // Show tile's food fruit type in low sat
                if (self.food.isPlaceholder) {hue = 0; sat = 0; lum = 30;}
                else {
                    hue = mapValue(self.food.trait.fruitType,
                        config.disp.range.fruit.min, config.disp.range.fruit.max,
                        config.disp.color.hue.min, config.disp.color.hue.max);
                    lum = mapValue(self.food.strength,
                        config.disp.range.strength.min, config.disp.range.strength.max,
                        config.disp.color.lum.min, config.disp.color.lum.max);
                }
                sat /= config.disp.color.sat.foodTribeScale;
                lum = mapValue(lum, config.disp.color.lum.min, config.disp.color.lum.max,
                    config.disp.color.lum.foodTribe.min, config.disp.color.lum.foodTribe.max);
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
            if ((!food.isPlaceholder) && (food.strength >= config.food.clone.minStrength)) {
                otherFoods.push(otherTiles[i].food);
            }
        }
        //if (otherFoods.length < config.food.clone.minNeighbours) return;
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
            var mustWait = config.tile.ownedFood.diedCooldown * config.sim.yearLength;
            var elapsed = self.session.tick - self.lostFoodTick;
            if (elapsed >= mustWait) {
                if (random() <= config.tile.ownedFood.newChance)
                self.getNewFood();
            }
        }
        self.food.update();
    }
    return self;
}
