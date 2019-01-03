"use strict";
/* ----------------------------------------------------------------
* FoodKind class
*/
function FoodKind(session) {
    var self = {
        session: session
    };
    self.getEfficiency = function(temp, humd) {
        return 1; // TODO
    }
    self.efficiency = random(config.food.kindEffMin, config.food.kindEffMax);
    self.tempPref = random(config.food.kindTempPrefMin, config.food.kindTempPrefMax);
    self.tempTol = random(config.food.kindTempTolrMin, config.food.kindTempTolrMax);
    self.humdPref = random(config.food.kindHumdPrefMin, config.food.kindHumdPrefMax);
    self.humdTol = random(config.food.kindHumdTolrMin, config.food.kindHumdTolrMax);
    return self;
}
