"use strict";
/* ----------------------------------------------------------------
* Tile class
*/
function Tile(session, x, y, fertility, foodKind) {
    var self = {
        x: x,
        y: y,
        session: session,
        temp: 10,
        humd: 50,
        fertility: fertility,
        erosion: 0,
        gotFoodTick: 0,
        lostFoodTick: -1,
        prevFoodKindIndex: -1,
        hasFood: false
    };
    self.getColor = function(mapMode) {
        var hue;
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
        else if (mapMode == "foodKind") {
            var id = self.food.kind.id;
            if (isNaN(id)) id = 0;
            hue = mapValue(id,
                0, config.food.kindsAmount,
                config.disp.hueGreen, config.disp.hueRed);
            lum = mapValue(self.food.strength, 0, 400,
                config.disp.hueRed, config.disp.hueGreen);
            if (self.food.id == -1) {sat = 0; lum = 30;}
        }
        else {return "#444"}
        if (hue > 110) hue += 20;
        return fromHsl(hue, sat, lum);
    }
    self.assignFood = function(food, index) {
        self.food = food;
        self.food.tile = self;
        self.food.id = getIndex(self.x, self.y, self.session.width);
        self.gotFoodTick = self.session.tick;
        self.hasFood = true;
        self.prevFoodKindIndex = index;
    }
    self.ownFoodDied = function() {
        // Used when food died
        self.food = {};
        self.food.id = -1;
        self.food.kind = {};
        self.food.update = function() {}
        self.lostFoodTick = self.session.tick;
        self.gotFoodTick = 0;
        self.hasFood = false;
    }
    self.getNewFood = function() {
        // Used to generate new food (not at sim start but after previous died)
        var nbhIndices = [];
        var pushedPrev = false;
        //if (self.prevFoodKindIndex != -1) {
        //    nbhIndices.push(self.prevFoodKindIndex);
        //    pushedPrev = true;
        //}
        var chance = random(0, 1);
        if (chance <= 0.5) return;
        var mapArea = self.session.width * self.session.height;
        for (var x = self.x-1; x <= self.x+1; x++) {
            for (var y = self.y-1; y <= self.y+1; y++) {
                if ((x == self.x) && (y == self.y)) continue;
                var index = getIndex(x, y, self.session.width);
                if (index < 0) continue;
                if (index >= mapArea) continue;
                var selectedTile = self.session.tiles[index];
                if ((self.session.tick - selectedTile.gotFoodTick) < (config.sim.yearLength*2/3)) {
                    continue; }
                var id = selectedTile.food.kind.id;
                if ((typeof id == "number") && (!isNaN(id)) && (id != -1)) {
                    nbhIndices.push(id);
                }
            }
        }
        if (nbhIndices.length == 0) return;
        if ((pushedPrev) && (nbhIndices.length == 1)) return;
        var sum = nbhIndices.reduce((a, b) => a + b, 0);
        var average = int(sum / nbhIndices.length);
        average += randint(-5, 5);
        if (average < 0) average = 0;
        if (average >= config.food.kindsAmount) average = config.food.kindsAmount-1;
        var fk = self.session.foodKinds[average];
        self.assignFood(Food(self.session, fk), average);
    }
    self.update = function() {
        var x = self.x;
        var y = self.y;
        var cc = config.climate;
        var cl = self.session.climate;
        var climTemp = cl.getTemp(x, y);
        var climHumd = cl.getHumd(x, y);
        noise.seed(cl.termPatternSeed);
        var tempNoise = noise.perlin2((x/cc.climNoise) + cl.cloudShift.x,
            (y/cc.climNoise) + cl.cloudShift.y) * cc.tempLocalAmp;
        self.temp = climTemp + tempNoise;
        noise.seed(cl.humdPatternSeed);
        var humdNoise = noise.perlin2((x/cc.climNoise) + cl.cloudShift.x,
            (y/cc.climNoise) + cl.cloudShift.y) * cc.humdLocalAmp;
        self.humd = climHumd + humdNoise;
        if (self.humd < 0) self.humd = 0;
        if (self.humd > 100) self.humd = 100;
        if ((!self.hasFood) && (self.session.tick - self.lostFoodTick > config.sim.yearLength)) {
            self.getNewFood();
        }
        self.food.update();
    }
    return self;
}
