"use strict";
/* ----------------------------------------------------------------
* Session class
*/
function Session(canvasId) {
    var self = {
        canvas: document.getElementById(canvasId),
        tick: 0,
        year: 0,
        fps: config.sim.fps,
        paused: false,
        tiles: [],
        foodSpieces: [],
        width: randint(config.map.widthMin, config.map.widthMax),
        height: randint(config.map.heightMin, config.map.heightMax),
        view: {x: config.disp.startViewX, y:config.disp.startViewY,
            zoom: config.disp.zoomDefault, mapMode: "foodPrefTemp"},
        barVisible: true,
        seeds: {
            fertility: random(0, 1),
            efficiency: random(0, 1),
            tempPref: random(0, 1),
            humdPref: random(0, 1),
        },
        pointedTile: -1, // TEMP
        clickedTiles: [] // TEMP
    };

    self.construct = function() {
        noise.seed(random(0, 1));
        self.climate = Climate(self);
        var cft = config.food.trait;
        // Fill tiles array
        for (var y = 0; y < self.height; y+= 1) {
            for (var x = 0; x < self.width; x+= 1) {
                // Fertility
                noise.seed(self.seeds.fertility);
                var fert = noise.perlin2(x/config.tile.fertNoise, y/config.tile.fertNoise);
                fert = mapValue(fert, -1, 1,
                    config.tile.baseFertilityMin, config.tile.baseFertilityMax);
                // Food
                var scale = cft.efficiency.noiseScale;
                noise.seed(self.seeds.efficiency);
                var efficiency = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.efficiency.strengthAmp, cft.efficiency.strengthAmp) + cft.efficiency.base;
                var scale = cft.tempPref.noiseScale;
                noise.seed(self.seeds.tempPref);
                var tempPref = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.tempPref.strengthAmp, cft.tempPref.strengthAmp) + cft.tempPref.base;
                var scale = cft.humdPref.noiseScale;
                noise.seed(self.seeds.humdPref);
                var humdPref = mapValue(noise.perlin2(x/scale, y/scale), -1, 1,
                    -cft.humdPref.strengthAmp, cft.humdPref.strengthAmp) + cft.humdPref.base;
                var food = Food(self, efficiency, tempPref, humdPref);
                // Create object
                var tile = Tile(self, x, y, fert);
                tile.assignFood(food);
                self.tiles.push(tile);
            }
        }
        // Setup event handlers
        self.canvas.addEventListener('mousemove', self.handlerMouseMove);
        self.canvas.addEventListener("mousedown", self.handlerMouseClick);
        self.canvas.addEventListener("mouseup", self.handlerMouseUnclick);
    }

    self.startLoop = function() {
        self.prepareStyleVariants();
        self.bindButtonActions();
        document.getElementById("controlZoom").value = mapValue(
            self.view.zoom, config.disp.zoomMin, config.disp.zoomMax, 0, 100);
        self.interval = setInterval(self.update, int(1000/self.fps));
    }

    self.toggleStyle = function() {
        var path;
        if (self.styleVariant == "h") {
            self.styleVariant = "v";
            path = "css/vertical.css";
        }
        else if (self.styleVariant == "v") {
            self.styleVariant = "h";
            path = "css/horizontal.css";
        }
        document.getElementById("styleVariant").setAttribute("href", path);
    }

    self.prepareStyleVariants = function() { // Prepares HTML
        var clientW = document.documentElement.clientWidth;
        var clientH = document.documentElement.clientHeight;
        if (clientW >= config.disp.toggleBarAtWidth) {
            self.styleVariant = "v";
            document.getElementById("styleVariant").setAttribute("href", "css/vertical.css");
        }
        else {
            self.styleVariant = "h";
            document.getElementById("styleVariant").setAttribute("href", "css/horizontal.css");
        }
        self.showSection("mapModes");
    }

    self.update = function() {
        if (!self.paused) {
            self.tick += 1;
            if (self.tick % config.sim.yearLength == 0) {self.year += 1;}
        }
        self.updateCanvasSize();
        self.readControls();
        self.updateControlsLabels();
        if (!self.paused) {
            self.climate.update();
            self.climate.updateTiles();
            self.updateTiles();
        }
        self.updateScreen();
    }

    self.updateCanvasSize = function() {
        var width, height;
        var clientW = document.documentElement.clientWidth;
        var clientH = document.documentElement.clientHeight;
        var st = config.disp.style;
        if (self.styleVariant == "v") {
            if (self.barVisible) {width = clientW * (st.percW/100) - st.borderX;}
            else {width = clientW - st.borderX - st.hiddenBarSize;}
            height = clientH - st.borderY;
        }
        else if (self.styleVariant == "h") {
            width = clientW - st.borderX;
            if (self.barVisible) {height = clientH * (st.percH/100) - st.borderY;}
            else {height = clientH - st.borderY - st.hiddenBarSize;}
        }
        self.canvas.setAttribute("width", width);
        self.canvas.setAttribute("height", height);
    }

    self.updateControlsLabels = function() {
        // Time elapsed
        document.getElementById("outputYear").innerHTML = self.year;
        var seasonIndex=0, seasonName;
        var yearTick = self.tick%config.sim.yearLength;
        var seasonLength = config.sim.yearLength / 4;
        while (yearTick > seasonLength) {seasonIndex += 1; yearTick -= seasonLength;}
        var seasonName = config.disp.season[seasonIndex];
        document.getElementById("outputSeason").innerHTML = seasonName;
        var humanizedZoom = int(self.view.zoom * 100);
        // View info
        document.getElementById("outputZoom").innerHTML = humanizedZoom;
        var pt = self.pointedTile;
        // Info
        document.getElementById("outputIndex").innerHTML = pt;
        if ((pt >= 0) && (pt < self.width*self.height)) {
            var tile = self.tiles[pt]
            // Tile
            document.getElementById("outputTemp").innerHTML = fRound(tile.temp);
            document.getElementById("outputHumd").innerHTML = fRound(tile.humd);
            document.getElementById("outputFert").innerHTML = fRound(tile.fertility);
            // Food
            document.getElementById("outputFoodStrength").innerHTML = fRound(tile.food.strength);
            document.getElementById("outputFoodTempPref").innerHTML = fRound(tile.food.tempPref);
            document.getElementById("outputFoodTempDelta").innerHTML = fRound(tile.food.tempPref - tile.temp);
            document.getElementById("outputFoodHumdPref").innerHTML = fRound(tile.food.humdPref);
            document.getElementById("outputFoodHumdDelta").innerHTML = fRound(tile.food.humdPref - tile.humd);
            document.getElementById("outputFoodIsPlaceholder").innerHTML = tile.food.isPlaceholder;
            document.getElementById("outputFoodAge").innerHTML = self.tick - tile.food.createTick;
        }
        else {
            // Tile
            document.getElementById("outputTemp").innerHTML = "";
            document.getElementById("outputHumd").innerHTML = "";
            document.getElementById("outputFert").innerHTML = "";
            // Food
            document.getElementById("outputFoodStrength").innerHTML = "";
            document.getElementById("outputFoodTempPref").innerHTML = "";
            document.getElementById("outputFoodTempDelta").innerHTML = "";
            document.getElementById("outputFoodHumdPref").innerHTML = "";
            document.getElementById("outputFoodHumdDelta").innerHTML = "";
            document.getElementById("outputFoodIsPlaceholder").innerHTML = "";
            document.getElementById("outputFoodAge").innerHTML = "";
        }
        // Simulation info
        document.getElementById("outputFps").innerHTML = self.fps;
    }

    self.readControls = function() {
        var zoom = document.getElementById("controlZoom").value;
        self.view.zoom = mapValue(zoom, 0, 99, config.disp.zoomMin, config.disp.zoomMax);
    }

    self.updateTiles = function() {
        for (var i = 0; i < self.tiles.length; i += 1) {
            self.tiles[i].update();
        }
    }

    self.updateScreen = function() {
        self.showTiles();
    }

    self.showTiles = function() {
        var v = self.view;
        var tw = int(config.disp.baseTileSize * v.zoom);
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
        for (var i = 0; i < indices.length; i += 1) {
            var index = indices[i];
            tiles.push(self.tiles[index]);
        }
        return tiles;
    }

    /* --------------------------------
    * Button actions
    */

    self.bindButtonActions = function() {
        // Toggle style (vertical / horizontal)
        document.getElementById("toggleStyle").onclick = self.toggleStyle
        // Show / Hide UI Bar
        document.getElementById("hideBar").onclick = function() {
            document.getElementById("uiBar").style.display = "none";
            document.getElementById("showBar").style.display = "block";
            self.barVisible = false;
        }
        document.getElementById("showBar").onclick = function() {
            document.getElementById("uiBar").style.display = "block";
            document.getElementById("showBar").style.display = "none";
            self.barVisible = true;
        }
        // Section choice buttons
        document.getElementById("vievMapModes").onclick = function(){self.showSection("mapModes");};
        document.getElementById("vievTileInfo").onclick = function(){self.showSection("tileInfo");};
        document.getElementById("vievFoodInfo").onclick = function(){self.showSection("foodInfo");};
        document.getElementById("vievSimSettings").onclick = function(){self.showSection("simSettings");};
        // Map mode choice buttons
        document.getElementById("mapModeTemp").onclick = function(){self.toggleMapMode("temp");};
        document.getElementById("mapModeHumd").onclick = function(){self.toggleMapMode("humd");};
        document.getElementById("mapModeFert").onclick = function(){self.toggleMapMode("fert");};
        document.getElementById("mapModeFoodPrefTemp").onclick =
            function(){self.toggleMapMode("foodPrefTemp");};
            document.getElementById("mapModeFoodPrefHumd").onclick =
                function(){self.toggleMapMode("foodPrefHumd");};
        // Simulation Speed
        document.getElementById("fpsIncrease").onclick = function(){self.changeSpeed(1);};
        document.getElementById("fpsDecrease").onclick = function(){self.changeSpeed(-1);};
        document.getElementById("fpsReset").onclick = function(){self.changeSpeed(false);};
        document.getElementById("fpsPause").onclick = function(){self.togglePause();};
    }

    self.showSection = function(section) {
        var sectMapModes = document.getElementById("sectionMapmodes");
        var secTileInfo = document.getElementById("sectionTileInfo");
        var secFoodInfo = document.getElementById("sectionFoodInfo");
        var secSimSettings = document.getElementById("sectionSettings");
        if (section == "mapModes") {
            sectMapModes.style.display = "block";
            secTileInfo.style.display = "none";
            secFoodInfo.style.display = "none";
            secSimSettings.style.display = "none";
        }
        else if (section == "tileInfo") {
            sectMapModes.style.display = "none";
            secTileInfo.style.display = "block";
            secFoodInfo.style.display = "none";
            secSimSettings.style.display = "none";
        }
        else if (section == "foodInfo") {
            sectMapModes.style.display = "none";
            secTileInfo.style.display = "none";
            secFoodInfo.style.display = "block";
            secSimSettings.style.display = "none";
        }
        else if (section == "simSettings") {
            sectMapModes.style.display = "none";
            secTileInfo.style.display = "none";
            secFoodInfo.style.display = "none";
            secSimSettings.style.display = "block";
        }
    }

    self.toggleMapMode = function(mapmode) {
        self.view.mapMode = mapmode;
    }

    self.changeSpeed = function(multiplier) {
        if (multiplier == false) {
            self.fps = config.sim.fps;
        }
        else {
            var amount = config.sim.changeSpeedStep * multiplier;
            self.fps += amount;
            if (self.fps > config.sim.maxAllowedFps) self.fps = config.sim.maxAllowedFps;
            else if (self.fps < config.sim.changeSpeedStep) self.fps = config.sim.changeSpeedStep;
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

    self.handlerMouseMove = function(evt) {
        var tw = int(config.disp.baseTileSize * self.view.zoom);
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
        var tw = int(config.disp.baseTileSize * self.view.zoom);
        var rect = self.canvas.getBoundingClientRect();
        self.mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        self.view.mouseIsClicked = true;
        self.view.isDragged = false;
    }

    self.handlerMouseUnclick = function(evt) {
        var tw = int(config.disp.baseTileSize * self.view.zoom);
        var rect = self.canvas.getBoundingClientRect();
        var mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        self.view.mouseIsClicked = false;
        if (! self.view.isDragged) { // Click
            var pointedTile = {x: int((mousePos.x+self.view.x)/(tw+1)),
                y: int((mousePos.y+self.view.y)/(tw+1))};
            var tileIndex = getIndex(pointedTile.x, pointedTile.y, self.width);
            var index = self.clickedTiles.indexOf(tileIndex);
            if (index > -1) { self.clickedTiles.splice(index, 1);}
            else {self.clickedTiles.push(tileIndex);}
        }
    }

    self.construct();
    return self;
}
