/* ----------------------------------------------------------------
* Tile class
*/
Tile = function(session) {
    tile = {
        session: session
    };
    tile.baseFertility = random(config.tile.baseFertilityMin, config.tile.baseFertilityMax);
    tile.baseHumd = random(config.tile.baseHumdMin, config.tile.baseHumdMax);
    tile.lootRecoveryFactor = random(config.tile.lootRecoverydMin, config.tile.lootRecoveryMax);
    return tile;
}
