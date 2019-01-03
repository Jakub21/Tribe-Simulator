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
    };
    self.update = function() {
        self.season += 1;
        self.season %= config.sim.yearLength;
        self.seasonTemp = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.tempSeasonAmp + config.climate.baseTemp;
        self.seasonHumd = Math.sin(self.season*2*Math.PI/config.sim.yearLength) *
            config.climate.humdSeasonAmp + config.climate.baseHumd;
    }
    self.getTemp = function(x, y) {
        var lngTemp = (y/self.session.height) * 40 - 10;
        return self.seasonTemp*0.7 + lngTemp*0.3;
    }
    self.getHumd = function(x, y) {
        var latHumd = (x/self.session.width) * 50 + 25;
        return self.seasonHumd*0.4 + latHumd*0.6;
    }
    return self;
}
