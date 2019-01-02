"use strict";
/* ----------------------------------------------------------------
* Session class
*/
function Session(canvasId) {
    var session = {
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

    session.startLoop = function() {
        session.prepareDoc();
        session.interval = setInterval(session.update, int(1000/session.fps));
    }

    session.toggleStyle = function() {
        var path;
        if (session.styleVariant == "h") {
            session.styleVariant = "v";
            path = "css/vertical.css";
        }
        else if (session.styleVariant == "v") {
            session.styleVariant = "h";
            path = "css/horizontal.css";
        }
        document.getElementById("styleVariant").setAttribute("href", path);
    }

    session.prepareDoc = function() { // Prepares HTML
        var clientW = document.documentElement.clientWidth;
        var clientH = document.documentElement.clientHeight;
        if (clientW >= config.disp.toggleBarAtWidth) {
            session.styleVariant = "v";
            document.getElementById("styleVariant").setAttribute("href", "css/vertical.css");
        }
        else {
            session.styleVariant = "h";
            document.getElementById("styleVariant").setAttribute("href", "css/horizontal.css");
        }
        session.showSection("mapModes");
        document.getElementById("toggleStyle").onclick = session.toggleStyle
        // Show / Hide UI Bar
        document.getElementById("hideBar").onclick = function() {
            document.getElementById("uiBar").style.display = "none";
            document.getElementById("showBar").style.display = "block";
            session.barVisible = false;
        }
        document.getElementById("showBar").onclick = function() {
            document.getElementById("uiBar").style.display = "block";
            document.getElementById("showBar").style.display = "none";
            session.barVisible = true;
        }
        // Section buttons
        document.getElementById("vievMapModes").onclick = function(){session.showSection("mapModes");};
        document.getElementById("vievTileInfo").onclick = function(){session.showSection("tileInfo");};
        document.getElementById("vievSimSettings").onclick = function(){session.showSection("simSettings");};
        // Map mode buttons
        document.getElementById("mapModeTemp").onclick = function(){session.toggleMapMode("temp");};
        document.getElementById("mapModeHumd").onclick = function(){session.toggleMapMode("humd");};
        document.getElementById("mapModeFert").onclick = function(){session.toggleMapMode("fert");};
        var zoom = mapValue(config.disp.zoomDefault, config.disp.zoomMin, config.disp.zoomMax, 0, 100);
        document.getElementById("controlZoom").value = zoom;
    }

    session.showSection = function(section) {
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

    session.toggleMapMode = function(mapmode) {
        session.view.mapMode = mapmode;
    }

    session.update = function() {
        session.tick += 1;
        if (session.tick % config.sim.yearLength == 0) {session.year += 1;}
        session.updateCanvasSize();
        session.readControls();
        session.updateControlsLabels();
        session.climate.update();
        session.updateTiles();
        session.updateScreen();
    }

    session.updateCanvasSize = function() {
        var width, height;
        var clientW = document.documentElement.clientWidth;
        var clientH = document.documentElement.clientHeight;
        var st = config.disp.style;
        if (session.styleVariant == "v") {
            if (session.barVisible) {width = clientW * (st.percW/100) - st.borderX;}
            else {width = clientW - st.borderX - st.hiddenBarSize;}
            height = clientH - st.borderY;
        }
        else if (session.styleVariant == "h") {
            width = clientW - st.borderX;
            if (session.barVisible) {height = clientH * (st.percH/100) - st.borderY;}
            else {height = clientH - st.borderY - st.hiddenBarSize;}
        }
        session.canvas.setAttribute("width", width);
        session.canvas.setAttribute("height", height);
    }

    session.updateControlsLabels = function() {
        document.getElementById("outputYear").innerHTML = session.year;
        var seasonIndex=0, seasonName;
        var yearTick = session.tick%config.sim.yearLength;
        var seasonLength = config.sim.yearLength / 4;
        while (yearTick > seasonLength) {seasonIndex += 1; yearTick -= seasonLength;}
        var seasonName = config.disp.season[seasonIndex];
        document.getElementById("outputSeason").innerHTML = seasonName;
        var humanizedZoom = int(session.view.zoom * 100);
        document.getElementById("outputZoom").innerHTML = humanizedZoom;
        var pt = session.pointedTile;
        document.getElementById("outputIndex").innerHTML = pt;
        if ((pt >= 0) && (pt < session.width*session.height)) {
            document.getElementById("outputTemp").innerHTML = fRound(session.tiles[pt].temp);
            document.getElementById("outputHumd").innerHTML = fRound(session.tiles[pt].humd);
            document.getElementById("outputFert").innerHTML = fRound(session.tiles[pt].fertility);
            //document.getElementById("viewShift").value = `x = ${session.view.x}` +
            //`, y = ${session.view.y}`;
        }
        else {
            document.getElementById("outputTemp").innerHTML = "";
            document.getElementById("outputHumd").innerHTML = "";
            document.getElementById("outputFert").innerHTML = "";
        }
    }

    session.readControls = function() {
        var zoom = document.getElementById("controlZoom").value;
        session.view.zoom = mapValue(zoom, 0, 99, config.disp.zoomMin, config.disp.zoomMax);
    }

    session.updateTiles = function() {
        for (var i = 0; i < session.tiles.length; i += 1) {
            session.tiles[i].update();
        }
    }

    session.updateScreen = function() {
        session.showTiles();
    }

    session.showTiles = function() {
        var v = session.view;
        var tw = int(config.disp.baseTileSize * v.zoom);
        var context = session.canvas.getContext("2d");
        for (var x = 0; x < session.width; x++) {
            for (var y = 0; y < session.height; y++) {
                var index = getIndex(x, y, session.width);
                var color = session.tiles[index].getColor(session.view.mapMode);
                context.fillStyle = color;
                context.fillRect(x*(tw+1)-v.x, y*(tw+1)-v.y, tw, tw);
            }
        }
    }

    /* --------------------------------
    * Event Handlers
    */

    session.handlerMouseMove = function(evt) {
        var tw = int(config.disp.baseTileSize * session.view.zoom);
        var rect = session.canvas.getBoundingClientRect();
        var mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        var pointedTile = {x: int((mousePos.x+session.view.x)/(tw+1)),
            y: int((mousePos.y+session.view.y)/(tw+1))};
        session.pointedTile = getIndex(pointedTile.x, pointedTile.y, session.width);
        if (session.view.mouseIsClicked) { //Drag
            var delta = {x:mousePos.x-session.mousePos.x, y:mousePos.y-session.mousePos.y};
            session.view.x -= delta.x;
            session.view.y -= delta.y;
            session.mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
            session.view.isDragged = true;
        }
    }

    session.handlerMouseClick = function(evt) {
        var tw = int(config.disp.baseTileSize * session.view.zoom);
        var rect = session.canvas.getBoundingClientRect();
        session.mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        session.view.mouseIsClicked = true;
        session.view.isDragged = false;
    }

    session.handlerMouseUnclick = function(evt) {
        var tw = int(config.disp.baseTileSize * session.view.zoom);
        var rect = session.canvas.getBoundingClientRect();
        var mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        session.view.mouseIsClicked = false;
        if (! session.view.isDragged) { // Click
            var pointedTile = {x: int((mousePos.x+session.view.x)/(tw+1)),
                y: int((mousePos.y+session.view.y)/(tw+1))};
            var tileIndex = getIndex(pointedTile.x, pointedTile.y, session.width);
            var index = session.clickedTiles.indexOf(tileIndex);
            if (index > -1) { session.clickedTiles.splice(index, 1);}
            else {session.clickedTiles.push(tileIndex);}
        }
    }

    /* --------------------------------
    * Constructor
    */
    session.climate = Climate(session);
    // Fill foodKinds array
    for (var i = 0; i < config.food.kindsAmount; i+= 1) {
        session.foodKinds.push(FoodKind(session));
    }
    // Fill tiles array
    for (var y = 0; y < session.height; y+= 1) {
        for (var x = 0; x < session.width; x+= 1) {
            var foodIndex = randint(0, config.food.kindsAmount);
            session.tiles.push(Tile(session, x, y, session.foodKinds[foodIndex]));
        }
    }
    // Setup event handlers
    session.canvas.addEventListener('mousemove', session.handlerMouseMove);
    session.canvas.addEventListener("mousedown", session.handlerMouseClick);
    session.canvas.addEventListener("mouseup", session.handlerMouseUnclick);
    return session;
}
