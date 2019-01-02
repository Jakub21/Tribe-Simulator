"use strict";
/* ----------------------------------------------------------------
* Tile class
*/
function Tile(session, x, y) {
    var tile = {
        x: x,
        y: y,
        session: session,
        temp: 10,
        humd: 50,
        tempDeviation: 0,
        humdDeviation: 0
    };
    tile.getColor = function(mapMode) {
        var hue;
        if (mapMode == "fert") {
            hue = mapValue(tile.fertility,
                config.disp.repr.fertMin, config.disp.repr.fertMax,
                config.disp.hueRed,config.disp.hueGreen);}
        else if (mapMode == "temp") {
            hue = mapValue(tile.temp,
                config.disp.repr.tempMax, config.disp.repr.tempMin,
                config.disp.hueRed, config.disp.hueGreen);}
        else if (mapMode == "humd") {
            hue = mapValue(tile.humd,
                config.disp.repr.humdMax, config.disp.repr.humdMin,
                config.disp.hueRed, config.disp.hueGreen);}
        else {return "#444"}
        return fromHsl(hue, config.disp.repr.tileSat, config.disp.repr.tileLum);
    }
    tile.randomizeDeviations = function() {
        tile.tempDeviation += random(-config.climate.localAmpIncrease,
            config.climate.localAmpIncrease);
        tile.humdDeviation += random(-config.climate.localAmpIncrease,
            config.climate.localAmpIncrease);
        if (tile.tempDeviation > config.climate.tempLocalAmp)
            tile.tempDeviation = config.climate.tempLocalAmp;
        else if (tile.tempDeviation < -config.climate.tempLocalAmp)
            tile.tempDeviation = -config.climate.tempLocalAmp;
        if (tile.humdDeviation > config.climate.humdLocalAmp)
            tile.humdDeviation = config.climate.humdLocalAmp;
        else if (tile.humdDeviation < -config.climate.humdLocalAmp)
            tile.humdDeviation = -config.climate.humdLocalAmp;
        // TODO: Replace this with what was described in docs and use values from config
    }
    tile.update = function() {
        var climTemp = tile.session.climate.getTemp(x, y);
        var climHumd = tile.session.climate.getHumd(x, y) + tile.baseHumd;
        tile.randomizeDeviations();
        tile.temp = climTemp + tile.tempDeviation;
        tile.humd = climHumd + tile.humdDeviation;
        if (tile.humd < 0) tile.humd = 0;
        if (tile.humd > 100) tile.humd = 100;
    }
    tile.fertility = random(config.tile.baseFertilityMin, config.tile.baseFertilityMax);
    tile.baseHumd = random(config.tile.baseHumdMin, config.tile.baseHumdMax);
    tile.lootRecoveryFactor = random(config.tile.lootRecoverydMin, config.tile.lootRecoveryMax);
    return tile;
}
