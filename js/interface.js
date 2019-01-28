"use strict";
function Interface(session) {
    var self = {
        session: session,
        topbarVisible: true,
    };
    self.construct = function() {
        self.bindButtons();
        self.togglePause();
        self.toggleTopbar();
    }
    self.bindButtons = function() {
        var s = self.session;
        // Topbar buttons
        docGetById('buttonCollapse').onclick = self.toggleTopbar;
        docGetById('buttPause').onclick = self.togglePause;
        docGetById('buttResetZoom').onclick = self.session.resetZoom;
        // Mapmodes
        docGetById('mmButtTileTemp').onclick = function(){s.toggleMapMode('temp');};
        docGetById('mmButtTileHumd').onclick = function(){s.toggleMapMode('humd');};
        docGetById('mmButtTileFert').onclick = function(){s.toggleMapMode('fert');};
        docGetById('mmButtFoodTemp').onclick = function(){s.toggleMapMode('foodPrefTemp');};
        docGetById('mmButtFoodHumd').onclick = function(){s.toggleMapMode('foodPrefHumd');};
        docGetById('mmButtFoodFruit').onclick = function(){s.toggleMapMode('foodFruitType');};
        docGetById('mmButtTribeFruit').onclick = function(){s.toggleMapMode('tribePrefFruit');};
        // Sidebar - Settings
        docGetById('bttSpeedIncrease').onclick = function() {self.session.changeSpeed(1)}
        docGetById('bttSpeedDecrease').onclick = function() {self.session.changeSpeed(-1)}
        docGetById('bttSpeedDefault').onclick = function() {self.session.changeSpeed(false)}
    }
    self.update = function() {
        self.updateTopbar();
        self.updateSidebar();
        self.readZoom();
        self.updateCanvasSize();
    }
    self.updateCanvasSize = function() {
        var cnv = self.session.canvas;
        var width = cnv.parentNode.clientWidth;
        var height = cnv.parentNode.clientHeight;
        cnv.setAttribute("width", width);
        cnv.setAttribute("height", height);
    }
    self.readZoom = function() {
        var zoom = document.getElementById("inputZoom").value;
        self.session.view.zoom = mapValue(
            zoom, 0, 99, config.disp.zoom.min, config.disp.zoom.max);
    }
    self.updateTopbar = function() {
        var s = self.session;
        docWrite('outputYear', s.year);
        docWrite('outputSeason', self.getSeasonName(s.tick));
        var z = int(s.view.zoom*100).toString();
        if (z.length < 3) z = '0' + z;
        docWrite('outputZoom', z+'%');
    }
    self.updateSidebar = function() {
        var year = config.sim.yearLength;
        var s = self.session;
        var t;
        var tileDefined = false;
        if (!isNaN(s.pointedTile)) {
            t = s.tiles[s.pointedTile];
            if (t != undefined) tileDefined = true;
        }

        // SELECTION
        docWrite('outputHoverTileX', s.pointedTile % s.width);
        docWrite('outputHoverTileY', int(s.pointedTile / s.width));

        // TILE
        if (tileDefined) {
            docWrite('outputTileTemp', fRound(t.temp));
            docWrite('outputTileHumd', fRound(t.humd));
            docWrite('outputTileHasFood', t.hasFood);
            docWrite('outputTileOccupied', t.isOccupied);
            // Soil
            docWrite('outputTileSoilFert', fRound(t.fertility));
            docClear('outputTileSoilErosion'); // TODO
        }
        else {
            for (var id of ['outputHoverTileX', 'outputHoverTileY', 'outputTileTemp',
                    'outputTileHumd', 'outputTileHasFood', 'outputTileOccupied',
                    'outputTileSoilFert', 'outputTileSoilErosion']) {
                docClear(id); } }

        // FRUITS
        if (tileDefined && t.hasFood) {
            var f = t.food;
            docWrite('outputFoodStrength', fRound(f.strength));
            docWrite('outputFoodFruit', fRound(f.trait.fruitType));
            docWrite('outputFoodAge', self.getAgeStr(f.createTick));
            // Pref. Conditions
            docWrite('outputFoodPrefTemp', fRound(f.trait.tempPref));
            docWrite('outputFoodPrefHumd', fRound(f.trait.humdPref));
            // Conditions Diff.
            docWrite('outputFoodDiffTemp', fRound(f.trait.tempPref - t.temp));
            docWrite('outputFoodDiffHumd', fRound(f.trait.humdPref - t.humd));
            // Last Year Strength
            docWrite('outputFoodStrMin', fRound(f.getYearMinStrength()));
            docWrite('outputFoodStrMax', fRound(f.getYearMaxStrength()));
        }
        else {
            for (var id of ['outputFoodStrength', 'outputFoodFruit', 'outputFoodAge',
                    'outputFoodPrefTemp', 'outputFoodPrefHumd', 'outputFoodDiffTemp', 'outputFoodDiffHumd', 'outputFoodStrMin', 'outputFoodStrMax']) {
                docClear(id); } }

        // TRIBE
        if (s.selectedTribe) {
            var tr = s.selectedTribe;
            docWrite('outputTribeName', tr.name);
            docWrite('outputTribeSections', tr.sections.length);
            docWrite('outputTribeAge', self.getAgeStr(tr.createTick));
            docWrite('outputTribeFruit', tr.prefFruit);
            docWrite('outputTribeSettled', tr.isSettled);
            // Population
            docWrite('outputTribePopsCount', tr.current.population);
            docClear('outputTribePopsUnity'); // TODO
            docWrite('outputTribePopsYear', tr.getPopsDelta(year-1));
            docWrite('outputTribePopsSeason', tr.getPopsDelta(int(year/4)));
            docWrite('outputTribePopsMonth', tr.getPopsDelta(int(year/12)));
            // Food
            docWrite('outputTribeStorageCurrent', fRound(tr.economy.stored));
            docWrite('outputTribeStorageCapacity', fRound(tr.current.capacity));
            docWrite('outputTribeEcoCurrInc', fRound(tr.economy.rawIncome));
            docWrite('outputTribeEcoCurrExp', fRound(tr.economy.rawExpenses));
            docWrite('outputTribeEcoCurrBil', fRound(tr.economy.bilance));
            docWrite('outputTribeEcoYearInc', fRound(tr.economy.getYearIncome()));
            docWrite('outputTribeEcoYearExp', fRound(tr.economy.getYearExpenses()));
            docWrite('outputTribeEcoYearBil', fRound(tr.economy.getYearBilance()));
        }
        else {
            for (var id of ['outputTribeName', 'outputTribeSections', 'outputTribeAge',
                    'outputTribeFruit', 'outputTribeSettled', 'outputTribePopsCount',
                    'outputTribePopsUnity', 'outputTribePopsYear', 'outputTribePopsSeason',
                    'outputTribePopsMonth', 'outputTribeStorageCurrent',
                    'outputTribeStorageCapacity', 'outputTribeEcoCurrInc',
                    'outputTribeEcoCurrExp', 'outputTribeEcoCurrBil', 'outputTribeEcoYearInc',
                    'outputTribeEcoYearExp', 'outputTribeEcoYearBil']) {
                docClear(id); } }

        // SETTINGS
        docWrite('outputSettingsSpeed', s.fps);
        docClear('outputSettingsTemprSensit'); // TODO
        docClear('outputSettingsHumidSensit'); // TODO
        docClear('outputSettingsIncomeMult'); // TODO

    }
    self.getAgeStr = function(tick) {
        var age = self.session.tick - tick;
        var year = config.sim.yearLength;
        return int(age/year)+' yrs, '+ age%year;
    }
    self.getSeasonName = function(tick) {
        var seasonIndex = 0;
        var yearLength = config.sim.yearLength;
        var yearTick = tick % yearLength;
        var seasonLength = yearLength / 4;
        while (yearTick > seasonLength) {seasonIndex += 1; yearTick -= seasonLength;}
        return config.disp.season[seasonIndex];
    }
    self.togglePause = function() {
        self.session.paused = !self.session.paused;
        var button = docGetById('buttPause');
        button.classList.toggle('running');
        button.classList.toggle('paused');
        if (self.session.paused) docWrite('buttPause', 'Paused');
        else docWrite('buttPause', 'Running');
    }
    self.toggleTopbar = function() {
        self.session.canvas.parentNode.classList.toggle('ccLarge');
        self.session.canvas.parentNode.classList.toggle('ccSmall');
        self.topbarVisible = !self.topbarVisible;
        var d;
        if (self.topbarVisible) {
            docWrite('buttonCollapse', 'v');
            d = 'none';
        }
        else {
            docWrite('buttonCollapse', '^');
            d = 'block';
        }
        for (var el of docGetByClass('topSection')) {
            el.style.display = d; }
    }
    self.construct();
    return self;
}
