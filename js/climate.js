"use strict";
/* ----------------------------------------------------------------
* Climate class
*/
function Climate(session) {
    var climate = {
        session: session,
        season: 0,
        temp: config.climate.baseTemp,
        humd: config.climate.baseHumd,
        greenhouse: config.climate.baseGhg,
    };
    climate.update = function() {
        climate.season += 1;
        climate.season %= config.sim.yearLength;
        climate.seasonTemp = Math.sin(climate.season*2*Math.PI/config.sim.yearLength) *
            config.climate.tempSeasonAmp + config.climate.baseTemp;
        climate.seasonHumd = Math.sin(climate.season*2*Math.PI/config.sim.yearLength) *
            config.climate.humdSeasonAmp + config.climate.baseHumd;
    }
    climate.getTemp = function(x, y) {
        var lngTemp = (y/climate.session.height) * 40 - 10;
        return climate.seasonTemp*0.7 + lngTemp*0.3;
    }
    climate.getHumd = function(x, y) {
        var latHumd = (x/climate.session.width) * 50 + 25;
        return climate.seasonHumd*0.4 + latHumd*0.6;
    }
    return climate;
}
