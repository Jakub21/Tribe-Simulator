/* ----------------------------------------------------------------
* FoodKind class
*/
FoodKind = function(session) {
    foodKind = {
        session: session
    };
    foodKind.getEfficiency = function(temp, humd) {
        return 1; // TODO
    }
    foodKind.efficiency = random(config.food.kindEffMin, config.food.kindEffMax);
    foodKind.tempPref = random(config.food.kindTempPrefMin, config.food.kindTempPrefMax);
    foodKind.tempTol = random(config.food.kindTempTolrMin, config.food.kindTempTolrMax);
    foodKind.humdPref = random(config.food.kindHumdPrefMin, config.food.kindHumdPrefMax);
    foodKind.humdTol = random(config.food.kindHumdTolrMin, config.food.kindHumdTolrMax);
    return foodKind;
}
