"use strict";
/* ----------------------------------------------------------------
* Session class
*/
function Session(canvasId) {
    var session = {
        canvas: document.getElementById(canvasId),
        tick: 0,
        year: 1,
        fps: config.sim.fps,
        tiles: [],
        foodKinds: [],
        width: randint(config.map.widthMin, config.map.widthMax),
        height: randint(config.map.heightMin, config.map.heightMax),
        view: {x: config.disp.startViewX, y:config.disp.startViewY, zoom:1, mapMode: ""},
        brokenLoop: false,
        pointedTile: -1, // TEMP
        clickedTiles: [] // TEMP
    };

    session.startLoop = function() {
        session.prepareDoc();
        session.interval = setInterval(session.update, int(1000/session.fps));
    }

    session.prepareDoc = function() { // Prepares HTML
        document.getElementById("hoveredTileIndex").disabled = true;
        document.getElementById("viewShift").disabled = true;
        document.getElementById("hoveredTileTemp").disabled = true;
        document.getElementById("hoveredTileHumd").disabled = true;
        document.getElementById("hoveredTileFert").disabled = true;
        var zoom = mapValue(config.disp.zoomDefault, 0, config.disp.zoomMax, 0, 100);
        document.getElementById("viewZoomSlider").value = zoom;
    }

    session.update = function() {
        if (session.brokenLoop) {clearInterval(session.interval); return;}
        session.tick += 1;
        if (session.tick % config.sim.yearLength == 0) {session.year += 1;}
        session.readControls();
        session.updateControlsLabels();
        session.climate.update();
        session.updateTiles();
        session.updateScreen();
    }

    session.updateControlsLabels = function() {
        document.getElementById("yearNumber").innerHTML = session.year;
        var seasonIndex=0, seasonName;
        var yearTick = session.tick%config.sim.yearLength;
        var seasonLength = config.sim.yearLength / 4;
        while (yearTick > seasonLength) {seasonIndex += 1; yearTick -= seasonLength;}
        var seasonName = config.disp.season[seasonIndex];
        document.getElementById("seasonName").innerHTML = seasonName;
        var humanizedZoom = int(session.view.zoom * 100);
        document.getElementById("zoomSliderLabel").innerHTML = humanizedZoom;
        var pt = session.pointedTile;
        document.getElementById("hoveredTileIndex").value = pt;
        if ((pt >= 0) && (pt < session.width*session.height)) {
            document.getElementById("hoveredTileTemp").value = fRound(session.tiles[pt].temp);
            document.getElementById("hoveredTileHumd").value = fRound(session.tiles[pt].humd);
            document.getElementById("hoveredTileFert").value = fRound(session.tiles[pt].fertility);
            document.getElementById("viewShift").value = `x = ${session.view.x}` +
            `, y = ${session.view.y}`;
        }
        else {
            document.getElementById("hoveredTileTemp").value = "";
            document.getElementById("hoveredTileHumd").value = "";
            document.getElementById("hoveredTileFert").value = "";
        }
    }

    session.readControls = function() {
        var zoom = document.getElementById("viewZoomSlider").value;
        session.view.zoom = mapValue(zoom, 0, 99, config.disp.zoomMin, config.disp.zoomMax);
        var radios = document.getElementsByName("mapModeRadio");
        for (var i = 0; i < radios.length; i+= 1) {
            if (radios[i].checked) {session.view.mapMode=radios[i].value; break;}
        }
    }

    session.updateTiles = function() {
        for (var i = 0; i < session.tiles.length; i += 1) {
            session.tiles[i].update();
        }
    }

    session.updateScreen = function() {
        // Update canvas size (in case window size changed, this is necessary)
        session.canvas.setAttribute("width", document.documentElement.clientWidth-config.disp.subtrW);
        session.canvas.setAttribute("height", document.documentElement.clientHeight-config.disp.subtrH);
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
