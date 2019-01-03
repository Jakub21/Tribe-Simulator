"use strict";
/* ----------------------------------------------------------------
* Tile class
*/
function Tile(session, x, y, baseFertility, foodKind) {
    var self = {
        x: x,
        y: y,
        session: session,
        temp: 10,
        humd: 50,
        tempDeviation: 0,
        humdDeviation: 0,
        fertility: baseFertility,
        foodKind: foodKind
    };
    self.getColor = function(mapMode) {
        var hue;
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
        else {return "#444"}
        return fromHsl(hue, config.disp.repr.tileSat, config.disp.repr.tileLum);
    }
    self.randomizeDeviations = function() {
        self.tempDeviation += random(-config.climate.localAmpIncrease,
            config.climate.localAmpIncrease);
        self.humdDeviation += random(-config.climate.localAmpIncrease,
            config.climate.localAmpIncrease);
        if (self.tempDeviation > config.climate.tempLocalAmp)
            self.tempDeviation = config.climate.tempLocalAmp;
        else if (self.tempDeviation < -config.climate.tempLocalAmp)
            self.tempDeviation = -config.climate.tempLocalAmp;
        if (self.humdDeviation > config.climate.humdLocalAmp)
            self.humdDeviation = config.climate.humdLocalAmp;
        else if (self.humdDeviation < -config.climate.humdLocalAmp)
            self.humdDeviation = -config.climate.humdLocalAmp;
        // TODO: Replace this with what was described in docs and use values from config
    }
    self.update = function() {
        var climTemp = self.session.climate.getTemp(x, y);
        var climHumd = self.session.climate.getHumd(x, y) + self.baseHumd;
        self.randomizeDeviations();
        self.temp = climTemp + self.tempDeviation;
        self.humd = climHumd + self.humdDeviation;
        if (self.humd < 0) self.humd = 0;
        if (self.humd > 100) self.humd = 100;
    }
    self.lootRecoveryFactor = random(config.tile.lootRecoverydMin, config.tile.lootRecoveryMax);
    return self;
}
