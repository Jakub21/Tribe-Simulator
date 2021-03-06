"use strict";
/* ----------------------------------------------------------------
* Climate class
*/
function Climate(session) {
    var self = {
        session: session,
        season: 0,
        temp: config.climate.temp.base,
        humd: config.climate.humd.base,
        greenhouse: config.climate.greenhouse.base,
        termPatternSeed: random(0, 1),
        humdPatternSeed: random(0, 1),
        cloudVelocity: {x: 0, y: 0},
        cloudShift: {x: 0, y:0},
    };
    self.update = function() {
        self.season += 1;
        self.season %= config.sim.yearLength;
        self.seasonTemp = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.temp.seasonAmp;
        self.seasonHumd = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.humd.seasonAmp;
        self.updateCloudShifts()
    }
    self.updateTiles = function() {
        var cc = config.climate;
        var tileArray = self.session.tiles;
        var lngRatio = 0;
        for (var y = 0; y < self.session.height; y+= 1) {
            var lngTemp = (y/self.session.height - 0.5) * cc.temp.longitudeAmp;
            for (var x = 0; x < self.session.width; x+= 1) {
                var latHumd = (-x/self.session.width + 0.5) * cc.humd.latitudeAmp;
                var tile = tileArray[getIndex(x, y, self.session.width)];
                // Update tile temperature
                noise.seed(self.termPatternSeed);
                var tempNoise = noise.perlin2((x/cc.cloud.noiseScale) + self.cloudShift.x,
                    (y/cc.cloud.noiseScale) + self.cloudShift.y) * cc.temp.localAmp;
                tempNoise *= (self.greenhouse + 1) /2; // This gets multiplied gy GH twice
                tile.temp = (lngTemp + tempNoise + self.seasonTemp + cc.temp.base) * self.greenhouse;
                // Update tile humidity
                noise.seed(self.humdPatternSeed);
                var humdNoise = noise.perlin2((x/cc.cloud.noiseScale) + self.cloudShift.x,
                    (y/cc.cloud.noiseScale) + self.cloudShift.y) * cc.temp.localAmp;
                tile.humd = latHumd + humdNoise + self.seasonHumd + cc.humd.base;
                if (tile.humd < 0) tile.humd = 0;
                if (tile.humd > 100) tile.humd = 100;
            }
        }
    }
    self.updateCloudShifts = function() {
        var cloudConfig = config.climate.cloud;
        var maxVel = cloudConfig.vel.max;
        var xStep = random(-cloudConfig.vel.step*cloudConfig.vel.backwdFactor, cloudConfig.vel.step);
        var yStep = random(-cloudConfig.vel.step*cloudConfig.vel.backwdFactor, cloudConfig.vel.step);
        self.cloudVelocity.x += xStep;
        self.cloudVelocity.y += yStep;
        if (self.cloudVelocity.x > maxVel) self.cloudVelocity.x = maxVel;
        if (self.cloudVelocity.y > maxVel) self.cloudVelocity.y = maxVel;
        if (self.cloudVelocity.x < -maxVel) self.cloudVelocity.x = -maxVel;
        if (self.cloudVelocity.y < -maxVel) self.cloudVelocity.y = -maxVel;
        self.cloudShift.x += self.cloudVelocity.x;
        self.cloudShift.y += self.cloudVelocity.y;

    }
    return self;
}
