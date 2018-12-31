/* ----------------------------------------------------------------
* Session class
*/
Session = function(canvasId) {
    session = {
        canvas: document.getElementById(canvasId),
        tick: 0,
        fps: config.sim.fps,
        tiles: [],
        foodKinds: [],
        climate: Climate(),
        width: randint(config.map.widthMin, config.map.widthMax),
        height: randint(config.map.heightMin, config.map.heightMax),
        view: {x: 0, y:0, zoom:1},
        pointedTile: -1, // TEMP
        clickedTiles: [] // TEMP
    };

    session.startLoop = function() {
        session.prepareDoc();
        session.interval = setInterval(session.update, int(1000/session.fps));
    }

    session.prepareDoc = function() {
        // Prepares HTML
        document.getElementById("hoveredTileIndex").disabled = true;
    }

    session.update = function() {
        session.tick += 1;
        session.readControls();
        session.updateControlsLabels();
        session.updateShow();
        //console.log(`Update ${session.tick}`);
    }

    session.updateControlsLabels = function() {
        var sanitizedZoom = int(session.view.zoom * 100);
        document.getElementById("zoomSliderLabel").innerHTML = sanitizedZoom;
        document.getElementById("hoveredTileIndex").value = session.pointedTile;
    }

    session.readControls = function() {
        var zoom = document.getElementById("vievZoomSlider").value;
        session.view.zoom = mapValue(zoom, 1, 100, config.disp.zoomMin, config.disp.zoomMax);
    }

    session.updateShow = function() {
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
                context.fillStyle = "#648";
                if (index == session.pointedTile) {
                    context.fillStyle = "#c9f";
                }
                if (session.clickedTiles.includes(index)) {
                    context.fillStyle = "#f9c";
                }
                context.fillRect(x*(tw+1), y*(tw+1), tw, tw);
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
        var pointedTile = {x: int(mousePos.x/(tw+1)), y: int(mousePos.y/(tw+1))};
        session.pointedTile = getIndex(pointedTile.x, pointedTile.y, session.width);
    }

    session.handlerMouseClick = function(evt) {
        var tw = int(config.disp.baseTileSize * session.view.zoom);
        var rect = session.canvas.getBoundingClientRect();
        var mousePos = {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
        var pointedTile = {x: int(mousePos.x/(tw+1)), y: int(mousePos.y/(tw+1))};
        var tileIndex = getIndex(pointedTile.x, pointedTile.y, session.width);
        var index = session.clickedTiles.indexOf(tileIndex);
        if (index > -1) { session.clickedTiles.splice(index, 1);}
        else {session.clickedTiles.push(tileIndex);}
    }

    /* --------------------------------
    * Constructor
    */

    // Fill foodKinds array
    for (var i = 0; i < config.food.kindsAmount; i+= 1) {
        session.foodKinds.push(FoodKind(session));
    }
    // Fill tiles array
    for (var y = 0; y < session.height; y+= 1) {
        for (var x = 0; x < session.width; x+= 1) {
            session.tiles.push(Tile(session));
        }
    }
    // Setup event handlers
    session.canvas.addEventListener('mousemove', session.handlerMouseMove);
    session.canvas.addEventListener("mousedown", session.handlerMouseClick);
    return session;
}
