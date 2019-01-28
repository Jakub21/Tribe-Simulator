"use strict";
/* ----------------------------------------------------------------
* Tribe's Economy
*/
function Economy(tribe) {
    var self = {
        tribe: tribe,
        session: tribe.session,
        stored: 0,
        size: 1, // Economy size factor, affects various costs
        rawIncome: 0,
        rawExpenses: 0,
        bilance: 0,
        prevIncome: [],
        prevExpenses: [],
        prevBilance: [],
    };
    self.update = function() {
        // Calculate income
        var income = 0;
        for (var section of self.tribe.sections) {
            income += section.getIncome();
        }
        self.rawIncome = income;
        self.prevIncome.push(income);
        if (self.prevIncome.length > config.sim.yearLength) {
            self.prevIncome.shift(); }
        // Calculate expenses
        var expenses = 0;
        for (var section of self.tribe.sections) {
            expenses += section.getExpenses();
        }
        self.rawExpenses = expenses;
        self.prevExpenses.push(expenses);
        if (self.prevExpenses.length > config.sim.yearLength) {
            self.prevExpenses.shift(); }
        // Calculate Bilance
        var bilance = income - expenses;
        self.bilance = bilance;
        self.prevBilance.push(bilance);
        if (self.prevBilance.length > config.sim.yearLength) {
            self.prevBilance.shift(); }
        // Store the Surplus / Drain the storage
        self.stored += bilance;
        // Check
        if (bilance < 0 && self.stored < abs(bilance)) {
            var severity = -bilance * config.tribe.eco.shortageSeverityFactor;
            self.tribe.shortage(severity);
        }
        // Storage capacity limit
        if (self.stored > self.tribe.current.capacity) {
            self.stored = self.tribe.current.capacity;
        }
    }
    self.getYearIncome = function() {
        if (self.prevIncome.length == 0) return 0;
        return self.prevIncome.reduce(arrSum);
    }
    self.getYearExpenses = function() {
        if (self.prevExpenses.length == 0) return 0;
        return self.prevExpenses.reduce(arrSum);
    }
    self.getYearBilance = function() {
        if (self.prevBilance.length == 0) return 0;
        return self.prevBilance.reduce(arrSum);
    }
    return self;
}
