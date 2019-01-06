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
        fertility: baseFertility,
        foodKind: foodKind,
        erosion: 0
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
        if (hue > 110) hue += 20;
        return fromHsl(hue, config.disp.repr.tileSat, config.disp.repr.tileLum);
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
    }
    return self;
}
