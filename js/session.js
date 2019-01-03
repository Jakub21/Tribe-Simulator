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
        tiles: [],
        foodKinds: [],
        width: randint(config.map.widthMin, config.map.widthMax),
        height: randint(config.map.heightMin, config.map.heightMax),
        view: {x: config.disp.startViewX, y:config.disp.startViewY, zoom:1, mapMode: ""},
        barVisible: true,
        pointedTile: -1, // TEMP
        clickedTiles: [] // TEMP
    };

    self.startLoop = function() {
        self.prepareDoc();
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

    self.prepareDoc = function() { // Prepares HTML
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
        // Section buttons
        document.getElementById("vievMapModes").onclick = function(){self.showSection("mapModes");};
        document.getElementById("vievTileInfo").onclick = function(){self.showSection("tileInfo");};
        document.getElementById("vievSimSettings").onclick = function(){self.showSection("simSettings");};
        // Map mode buttons
        document.getElementById("mapModeTemp").onclick = function(){self.toggleMapMode("temp");};
        document.getElementById("mapModeHumd").onclick = function(){self.toggleMapMode("humd");};
        document.getElementById("mapModeFert").onclick = function(){self.toggleMapMode("fert");};
        var zoom = mapValue(config.disp.zoomDefault, config.disp.zoomMin, config.disp.zoomMax, 0, 100);
        document.getElementById("controlZoom").value = zoom;
    }

    self.showSection = function(section) {
        var sectMapModes = document.getElementById("sectionMapmodes");
        var secTileInfo = document.getElementById("sectionTileInfo");
        var secSimSettings = document.getElementById("sectionSettings");
        if (section == "mapModes") {
            sectMapModes.style.display = "block";
            secTileInfo.style.display = "none";
            secSimSettings.style.display = "none";
        }
        else if (section == "tileInfo") {
            sectMapModes.style.display = "none";
            secTileInfo.style.display = "block";
            secSimSettings.style.display = "none";
        }
        else if (section == "simSettings") {
            sectMapModes.style.display = "none";
            secTileInfo.style.display = "none";
            secSimSettings.style.display = "block";
        }
    }

    self.toggleMapMode = function(mapmode) {
        self.view.mapMode = mapmode;
    }

    self.update = function() {
        self.tick += 1;
        if (self.tick % config.sim.yearLength == 0) {self.year += 1;}
        self.updateCanvasSize();
        self.readControls();
        self.updateControlsLabels();
        self.climate.update();
        self.updateTiles();
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
        document.getElementById("outputYear").innerHTML = self.year;
        var seasonIndex=0, seasonName;
        var yearTick = self.tick%config.sim.yearLength;
        var seasonLength = config.sim.yearLength / 4;
        while (yearTick > seasonLength) {seasonIndex += 1; yearTick -= seasonLength;}
        var seasonName = config.disp.season[seasonIndex];
        document.getElementById("outputSeason").innerHTML = seasonName;
        var humanizedZoom = int(self.view.zoom * 100);
        document.getElementById("outputZoom").innerHTML = humanizedZoom;
        var pt = self.pointedTile;
        document.getElementById("outputIndex").innerHTML = pt;
        if ((pt >= 0) && (pt < self.width*self.height)) {
            document.getElementById("outputTemp").innerHTML = fRound(self.tiles[pt].temp);
            document.getElementById("outputHumd").innerHTML = fRound(self.tiles[pt].humd);
            document.getElementById("outputFert").innerHTML = fRound(self.tiles[pt].fertility);
            //document.getElementById("viewShift").value = `x = ${self.view.x}` +
            //`, y = ${self.view.y}`;
        }
        else {
            document.getElementById("outputTemp").innerHTML = "";
            document.getElementById("outputHumd").innerHTML = "";
            document.getElementById("outputFert").innerHTML = "";
        }
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

    /* --------------------------------
    * Event Handlers
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

    /* --------------------------------
    * Constructor
    */
    self.climate = Climate(self);
    // Fill foodKinds array
    for (var i = 0; i < config.food.kindsAmount; i+= 1) {
        self.foodKinds.push(FoodKind(self));
    }
    // Fill tiles array
    for (var y = 0; y < self.height; y+= 1) {
        for (var x = 0; x < self.width; x+= 1) {
            var foodIndex = randint(0, config.food.kindsAmount);
            self.tiles.push(Tile(self, x, y, self.foodKinds[foodIndex]));
        }
    }
    // Setup event handlers
    self.canvas.addEventListener('mousemove', self.handlerMouseMove);
    self.canvas.addEventListener("mousedown", self.handlerMouseClick);
    self.canvas.addEventListener("mouseup", self.handlerMouseUnclick);
    return self;
}
