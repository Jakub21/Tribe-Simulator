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
        greenhouse: config.climate.baseGreenhouse,
        termPatternSeed: random(0, 1),
        humdPatternSeed: random(0, 1),
        cloudVelocity: {x: 0, y: 0},
        cloudShift: {x: 0, y:0},
    };
    self.update = function() {
        self.season += 1;
        self.season %= config.sim.yearLength;
        self.seasonTemp = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.tempSeasonAmp;
        self.seasonHumd = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.humdSeasonAmp;
        self.updateCloudShifts()
    }
    self.updateCloudShifts = function() {
        var cc = config.climate;
        var maxVel = cc.maxCloudVel;
        var xStep = random(-cc.maxCloudAccl*cc.negShiftFactor, cc.maxCloudAccl);
        var yStep = random(-cc.maxCloudAccl*cc.negShiftFactor, cc.maxCloudAccl);
        self.cloudVelocity.x += xStep;
        self.cloudVelocity.y += yStep;
        if (self.cloudVelocity.x > maxVel) self.cloudVelocity.x = maxVel;
        if (self.cloudVelocity.y > maxVel) self.cloudVelocity.y = maxVel;
        if (self.cloudVelocity.x < -maxVel) self.cloudVelocity.x = -maxVel;
        if (self.cloudVelocity.y < -maxVel) self.cloudVelocity.y = -maxVel;
        self.cloudShift.x += self.cloudVelocity.x;
        self.cloudShift.y += self.cloudVelocity.y;

    }
    self.getTemp = function(x, y) {
        var cc = config.climate;
        var lngRatio = y/self.session.height;
        var lngTemp = lngRatio * cc.lngTempFactor;
        return (lngTemp + self.seasonTemp + cc.baseTemp) * self.greenhouse;

    }
    self.getHumd = function(x, y) {
        var cc = config.climate;
        var latRatio = (self.session.width-x)/self.session.width;
        var latHumd = latRatio * cc.latHumdFactor;
        return (latHumd + self.seasonHumd + cc.baseHumd) * self.greenhouse;
    }
    return self;
}
