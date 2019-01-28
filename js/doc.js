"use strict";

// Collapse / Extend function
function tglCollapse(header, section) {
    header.classList.toggle('collapsed');
    if (section.style.display == 'none') {
        section.style.display = 'block';
    }
    else {
        section.style.display = 'none';
    }
}
// Alias for function binding
function bindTglCollapse(header, section) {
    section = docGetById(section);
    header = docGetById(header);
    header.onclick = function(){tglCollapse(header, section);};
}

// Prepare document
function docInit() {
    // Bind side-bar sections headers to collapse / extend function
    bindTglCollapse('tglSectHover', 'sectionHover');
    bindTglCollapse('tglSectTiles', 'sectionTiles');
    bindTglCollapse('tglSectFruits', 'sectionFruits');
    bindTglCollapse('tglSectTribes', 'sectionTribes');
    bindTglCollapse('tglSectSettings', 'sectionSettings');
    // Same thing for sub-sections | Tile
    bindTglCollapse('tglSubsectTileSoil', 'subsectTileSoil');
    // Food
    bindTglCollapse('tglSubsectFoodPref', 'subsectFoodPref');
    bindTglCollapse('tglSubsectFoodDiff', 'subsectFoodDiff');
    bindTglCollapse('tglSubsectFoodLastStrength', 'subsectFoodLastStrength');
    // Tribe
    bindTglCollapse('tglSubsectTribePopulation', 'subsectTribePopulation');
    bindTglCollapse('tglSubsectTribePopsCount', 'subsectTribePopsCount');
    bindTglCollapse('tglSubsectTribeFood', 'subsectTribeFood');
    bindTglCollapse('tglSubsectTribeFoodStorage', 'subsectTribeStorage');
    bindTglCollapse('tglSubsectTribeFoodEco', 'subsectTribeFoodEco');
    bindTglCollapse('tglSubsectTribeFoodYearEco', 'subsectTribeFoodYearEco');
    // Settings
    bindTglCollapse('tglSubsectSettingsSpeed', 'subsectSettingsSpeed');
    bindTglCollapse('tglSubsectSettingsTemprSensit', 'subsectSettingsTemprSensit');
    bindTglCollapse('tglSubsectSettingsHumidSensit', 'subsectSettingsHumidSensit');
    bindTglCollapse('tglSubsectSettingsIncome', 'subsectSettingsIncome');

    // Collapse subsections that have subsections of their own
    tglCollapse(docGetById('tglSubsectTribePopulation'), docGetById('subsectTribePopulation'));
    tglCollapse(docGetById('tglSubsectTribeFood'), docGetById('subsectTribeFood'));
}
