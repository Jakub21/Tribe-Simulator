"use strict";
/* ----------------------------------------------------------------
* FoodKind class
*/
function FoodKind(id, session) {
    var self = {
        id: id,
        session: session
    };
    self.construct = function() {
        var scale = 50;
        noise.seed(self.session.seeds.fkEfficiency);
        self.efficiency = mapValue(noise.perlin2(0, id/scale), -1, 1,
            config.food.kindEffMin, config.food.kindEffMax);
        /*noise.seed(self.session.seeds.fkTempPref);
        self.tempPref = mapValue(noise.perlin2(0, id/scale), -1, 1,
            config.food.kindTempPrefMin, config.food.kindTempPrefMax);
        noise.seed(self.session.seeds.fkTempTol);
        self.tempTol = mapValue(noise.perlin2(0, id/scale), -1, 1,
            config.food.kindTempTolrMin, config.food.kindTempTolrMax);*/
        noise.seed(self.session.seeds.fkHumdPref);
        self.humdPref = mapValue(noise.perlin2(0, id/scale), -1, 1,
            config.food.kindHumdPrefMin, config.food.kindHumdPrefMax);
        noise.seed(self.session.seeds.fkHumdTol);
        self.humdTol = mapValue(noise.perlin2(0, id/scale), -1, 1,
            config.food.kindHumdTolrMin, config.food.kindHumdTolrMax);

        self.tempPref = id/4; // TEMP
        self.tempTol = 12 // TEMP
    }
    self.construct();
    return self;
}
/* ----------------------------------------------------------------
* Food class
*/
function Food(session, foodKind) {
    var self = {
        kind: foodKind,
        session: session,
        strength: config.food.specific.startStrength
    };
    self.update = function() {
        var tileTemp = self.tile.temp;
        var tileHumd = self.tile.humd;
        var tempDelta = abs(self.kind.tempPref - self.tile.temp);
        var tempEff = (self.kind.tempTol-(tempDelta)**(1.2))/3;
        tempEff = tempEff * self.kind.tempTol / 100
        var growth = tempEff;
        growth *= self.kind.efficiency;
        if (growth > 0) growth *= self.tile.fertility;
        self.strength += growth;
        if (self.strength >= 100) self.strength = 100;
        if (self.strength <= 0) self.kill();
    }
    self.kill = function() {
        self.tile.ownFoodDied();
    }
    return self;
}
