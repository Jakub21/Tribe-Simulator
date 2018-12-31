/* ----------------------------------------------------------------
* Climate class
*/
Climate = function(session) {
    climate = {
        session: session,
        temp: config.climate.baseTemp,
        humd: config.climate.baseHumd,
        greenhouse: config.climate.baseGhg,
    };
    return climate;
}
