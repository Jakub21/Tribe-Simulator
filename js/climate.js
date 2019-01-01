/* ----------------------------------------------------------------
* Climate class
*/
Climate = function(session) {
    var climate = {
        session: session,
        temp: config.climate.baseTemp,
        humd: config.climate.baseHumd,
        greenhouse: config.climate.baseGhg,
    };
    climate.getTemp = function(x, y) {
        var yRatio = y/30;
        return yRatio * 40 - 10;
        // TODO
    }
    climate.getHumd = function(x, y) {
        var yRatio = y/30;
        return yRatio * 50 + 25;
        // TODO
    }
    return climate;
}
