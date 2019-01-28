"use strict";
/* ----------------------------------------------------------------
* Session class
*/
function Session(canvasId) {
    var self = {
        canvas: document.getElementById(canvasId),
        // Time
        tick: 0,
        year: 0,
        fps: config.sim.fps.default,
        paused: false,
        // Size
        width: randint(config.map.widthMin, config.map.widthMax),
        height: randint(config.map.heightMin, config.map.heightMax),
        // View
        view: {x: 0, y:0, zoom: config.disp.zoom.default,
            mapMode: "tribePrefFruit"},
        // Noise seeds
        seeds: {
            fertility: random(0, 1),
            efficiency: random(0, 1),
            tempPref: random(0, 1),
            humdPref: random(0, 1),
            fruitType: random(0, 1),
        },
        // General
        tiles: [],
        tribes: [],
        pointedTile: NaN,
        selectedTribe: undefined,
    };

    self.construct = function() {
        noise.seed(random(0, 1));
        self.interface = Interface(self);
        self.climate = Climate(self);
        self.makeMap();
        self.makeTribes();
        self.addEventListeners();
    }

    self.startLoop = function() {
        self.bindButtonActions();
        document.getElementById("inputZoom").value = mapValue(
            self.view.zoom, config.disp.zoom.min, config.disp.zoom.max, 0, 100);
        self.interval = setInterval(self.update, int(1000/self.fps));
    }

    self.update = function() {
        if (!self.paused) {
            self.tick += 1;
            if (self.tick % config.sim.yearLength == 0) {self.year += 1;}
        }
        self.interface.update();
        if (!self.paused) {
            self.climate.update();
            self.climate.updateTiles();
            self.updateTiles();
            for (var tribe of self.tribes) {
                tribe.update();
                if (!tribe.alive) {
                    self.tribes.splice(indexOf(self.tribes, tribe), 1);
                }
            }
            if (self.tribes.length < config.tribe.amount.min) {
                self.addRandomTribe();
            }
        }
        self.updateScreen();
    }

    self.makeMap = function() {
        var cft = config.food.trait;
        var scale;
        // Fill tiles array
        for (var y = 0; y < self.height; y+= 1) {
            for (var x = 0; x < self.width; x+= 1) {
                // Fertility
                scale = config.tile.fertility.noiseScale;
                noise.seed(self.seeds.fertility);
                var fert = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -config.tile.fertility.baseAmp, config.tile.fertility.baseAmp) + config.tile.fertility.base;
                // Food Efficiency
                scale = cft.efficiency.noiseScale;
                noise.seed(self.seeds.efficiency);
                var efficiency = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.efficiency.baseAmp, cft.efficiency.baseAmp) + cft.efficiency.base;
                // Food Pref Temp
                scale = cft.tempPref.noiseScale;
                noise.seed(self.seeds.tempPref);
                var tempPref = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.tempPref.baseAmp, cft.tempPref.baseAmp) + cft.tempPref.base;
                // Food Pref Humd
                scale = cft.humdPref.noiseScale;
                noise.seed(self.seeds.humdPref);
                var humdPref = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.humdPref.baseAmp, cft.humdPref.baseAmp) + cft.humdPref.base;
                // Food Fruit Type
                scale = cft.fruitType.noiseScale;
                noise.seed(self.seeds.fruitType);
                var fruitType = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.fruitType.baseAmp, cft.fruitType.baseAmp) + cft.fruitType.base;
                // Create objects
                var food = Food(self, efficiency, tempPref, humdPref, fruitType);
                var tile = Tile(self, x, y, fert);
                tile.assignFood(food);
                self.tiles.push(tile);
            }
        }
    }

    self.makeTribes = function() {
        // Add Tribes
        for (var i = 0; i < config.tribe.amount.start; i ++) {
            var x = randint(0, self.width);
            var y = randint(0, self.height);
            var tile = self.tiles[getIndex(x, y, self.width)];
            self.tribes.push(Tribe(self, tile))
        }
    }

    self.addRandomTribe = function() {
        var tile = {isOccupied: true};
        while (!(!tile.isOccupied && tile.hasFood)) {
            var x = randint(0, self.width);
            var y = randint(0, self.height);
            var tile = self.tiles[getIndex(x, y, self.width)];
        }
        self.tribes.push(Tribe(self, tile));
    }

    self.updateTiles = function() {
        for (var tile of self.tiles) {
            tile.update();
        }
    }

    self.updateScreen = function() {
        self.showTiles();
    }

    self.showTiles = function() {
        var v = self.view;
        var tw = int(config.disp.elems.tile * v.zoom);
        var context = self.canvas.getContext("2d");
        for (var x = 0; x < self.width; x++) {
            for (var y = 0; y < self.height; y++) {
                var index = getIndex(x, y, self.width);
                var color = self.tiles[index].getColor(self.view.mapMode);
                context.fillStyle = color;
                context.fillRect(x*(tw+1)-v.x, y*(tw+1)-v.y, tw, tw);
            }
        }
    }

    self.requestTiles = function(indices) {
        var tiles = [];
        for (var index of indices) {
            tiles.push(self.tiles[index]);
        }
        return tiles;
    }

    self.resetZoom = function() {
        self.view.zoom = config.disp.zoom.default;
        document.getElementById("inputZoom").value = mapValue(self.view.zoom,
            config.disp.zoom.min, config.disp.zoom.max, 0, 100);
    }

    /* --------------------------------
    * Button actions
    */

    self.bindButtonActions = function() {

    }

    self.toggleMapMode = function(mapmode) {
        self.view.mapMode = mapmode;
    }

    self.changeSpeed = function(multiplier) {
        if (multiplier == false) {
            self.fps = config.sim.fps.default;
        }
        else {
            var amount = config.sim.fps.step * multiplier;
            self.fps += amount;
            if (self.fps > config.sim.fps.max) self.fps = config.sim.fps.max;
            else if (self.fps < config.sim.fps.step) self.fps = config.sim.fps.step;
        }
        clearInterval(self.interval);
        self.interval = setInterval(self.update, int(1000/self.fps));
    }

    self.togglePause = function() {
        self.paused = !self.paused;
    }

    /* --------------------------------
    * Canvas Event Handlers
    */

    self.addEventListeners = function() {
        // Setup event handlers
        self.canvas.addEventListener('mousemove', self.handlerMouseMove);
        self.canvas.addEventListener("mousedown", self.handlerMouseClick);
        self.canvas.addEventListener("mouseup", self.handlerMouseUnclick);
        self.canvas.addEventListener("mouseout", self.handlerMouseLeave);
        self.canvas.addEventListener("wheel", self.handlerMouseWheel);
    }

    self.handlerMouseMove = function(evt) {
        var tw = int(config.disp.elems.tile * self.view.zoom);
        var rect = self.canvas.getBoundingClientRect();
        var mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        var pointedTile = {x: int((mousePos.x+self.view.x)/(tw+1)),
            y: int((mousePos.y+self.view.y)/(tw+1))};
        self.pointedTile = getIndex(pointedTile.x, pointedTile.y, self.width);
        if (self.view.mouseIsClicked) { //Drag
            var delta = {x:mousePos.x-self.mousePos.x, y:mousePos.y-self.mousePos.y};
            self.view.x -= delta.x;
            self.view.y -= delta.y;
            self.mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
            self.view.isDragged = true;
        }
    }

    self.handlerMouseClick = function(evt) {
        var tw = int(config.disp.elems.tile * self.view.zoom);
        var rect = self.canvas.getBoundingClientRect();
        self.mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        self.view.mouseIsClicked = true;
        self.view.isDragged = false;
    }

    self.handlerMouseUnclick = function(evt) {
        var tw = int(config.disp.elems.tile * self.view.zoom);
        var rect = self.canvas.getBoundingClientRect();
        var mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        self.view.mouseIsClicked = false;
        if (! self.view.isDragged) { // Click
            var pointedTile = {x: int((mousePos.x+self.view.x)/(tw+1)),
                y: int((mousePos.y+self.view.y)/(tw+1))};
            var tileIndex = getIndex(pointedTile.x, pointedTile.y, self.width);
            var tile = self.tiles[tileIndex];
            if (tile.isOccupied) {
                self.selectedTribe = tile.occupiedBy; }
                else self.selectedTribe = undefined;
        }
    }

    self.handlerMouseLeave = function(evt) {
        self.pointedTile = NaN;
        self.view.isDragged = false;
        self.view.mouseIsClicked = false;
    }

    self.handlerMouseWheel = function(evt) {
        var current = document.getElementById("inputZoom").value;
        current = int(current) - evt.deltaY;
        document.getElementById("inputZoom").value = current;
    }

    self.construct();
    return self;
}
