"use strict";
/* ----------------------------------------------------------------
* Tribe class
*/
function Tribe(session, capitalTile) {
    var self = {
        session: session,
        capital: capitalTile,
        population: config.tribe.pops.start,
        tiles: [],
        accFood: config.tribe.food.startAcc,
    };

    self.construct = function() {
        var base = config.food.trait.fruitType.base;
        var spread = config.food.trait.fruitType.baseAmp;
        self.prefFruit = int(self.capital.food.trait.fruitType);
        if (self.prefFruit == NaN) {
            self.prefFruit = randint(0, 50); // TODO: Use references to config instead of constants
        }
        self.occupyTile(self.capital);
    }

    self.update = function() {
        // Check food income
        var income = 0;
        for (var tile of self.tiles) {
            if (tile.food.isPlaceholder) continue;
            var typeDelta = abs(self.prefFruit - tile.food.trait.fruitType);
            var strength = tile.food.strength;
            income += typeDelta/50 * strength/100 * config.tribe.food.incomeScale; // TODO: Use reference
                // to config instead of const 50
        }
        // Update accumulated food count
        self.accFood += income;
        // Feed population
        self.accFood -= config.tribe.food.foodPerPop * self.population;
        // Check if everyone was fed
        if (self.accFood < 0) {
            var unfedPops = abs(self.accFood / config.tribe.food.foodPerPop);
            self.population -= unfedPops;
            self.population = int(self.population);
            self.accFood = 0;
            // TODO: Update tile distribution of pops
        }
        // Basic checks
        if (self.population == 0) {
            self.die();
        }
    }

    self.occupyTile = function(tile) {
        tile.isOccupied = true;
        tile.occupiedBy = self;
        self.tiles.push(tile);
    }

    self.releaseTile = function(tile) {
        tile.isOccupied = false;
        tile.occupiedBy = undefined;
        self.tiles.splice(indexOf(self.tiles, tile), 1);
    }

    self.die = function() {
        self.session.tribes.splice(indexOf(self.session.tribes, self), 1);
        for (var tile of self.tiles) {
            self.releaseTile(tile);
        }
    }
    self.construct();
    return self;
}
