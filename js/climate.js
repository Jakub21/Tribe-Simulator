"use strict";
/* ----------------------------------------------------------------
* Climate class
*/
function Climate(session) {
    var self = {
        session: session,
        season: 0,
        temp: config.climate.baseTemp,
        humd: config.climate.baseHumd,
        greenhouse: config.climate.baseGhg,
        termPatternSeed: random(0, 1),
        humdPatternSeed: random(0, 1),
        dvtVelocity: {x: 0, y: 0},
        dvtShift: {x: 0, y:0},
    };
    self.update = function() {
        self.season += 1;
        self.season %= config.sim.yearLength;
        self.seasonTemp = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.tempSeasonAmp;
        self.seasonHumd = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.humdSeasonAmp;
        self.updateDvtShifts()
    }
    self.updateDvtShifts = function() {
        var cc = config.climate;
        var maxVel = cc.maxDvtVel;
        var xStep = random(-cc.maxDvtShiftStep*cc.negShiftFactor, cc.maxDvtShiftStep);
        var yStep = random(-cc.maxDvtShiftStep*cc.negShiftFactor, cc.maxDvtShiftStep);
        self.dvtVelocity.x += xStep;
        self.dvtVelocity.y += yStep;
        if (self.dvtVelocity.x > maxVel) self.dvtVelocity.x = maxVel;
        if (self.dvtVelocity.y > maxVel) self.dvtVelocity.y = maxVel;
        if (self.dvtVelocity.x < -maxVel) self.dvtVelocity.x = -maxVel;
        if (self.dvtVelocity.y < -maxVel) self.dvtVelocity.y = -maxVel;
        self.dvtShift.x += self.dvtVelocity.x;
        self.dvtShift.y += self.dvtVelocity.y;

    }
    self.getTemp = function(x, y) {
        var cc = config.climate;
        var lngRatio = y/self.session.height;
        var lngTemp = lngRatio * cc.lngTempFactor;
        return lngTemp + self.seasonTemp + cc.baseTemp;

    }
    self.getHumd = function(x, y) {
        var cc = config.climate;
        var latRatio = x/self.session.width;
        var latHumd = latRatio * cc.latHumdFactor;
        return latHumd + self.seasonHumd + cc.baseHumd;
    }
    return self;
}
