<!DOCTYPE html>
<html lang="en">

<?php
# Loads config file contents to textarea element
# Element content is then read by loadConfig.js
$yaml = file_get_contents("config/simulation.yml");
echo '<textarea id="config" class="hidden">'.$yaml.'</textarea>';
?>

<head>
    <meta charset="utf-8">
    <title>Tribes Simulator</title>
    <link rel="stylesheet" href="css/master.css">
    <link rel="stylesheet" href="css/wide.css">

    <script src="js/lib/js-yaml.js"></script>
    <script src="js/lib/easyscript.js"></script>
    <script src="js/lib/perlinNoise.js"></script>

    <script src="js/loadConfig.js"></script>
    <script src="js/doc.js"></script>
    <script src="js/food.js"></script>
    <script src="js/mapTile.js"></script>
    <script src="js/climate.js"></script>
    <script src="js/tribe.js"></script>
    <script src="js/section.js"></script>
    <script src="js/brain.js"></script>
    <script src="js/economy.js"></script>
    <script src="js/interface.js"></script>
    <script src="js/session.js"></script>
    <script src="js/launch.js"></script>

</head>
<body onload="launch();">
<header>
    <div id="topInfo">
        Year
        <span id="outputYear" class="output"></span>
        <span id="outputSeason" class="output"></span>
        <div class="floaterLeft">
            <button id="buttonCollapse">
                ^</button>
        </div>
        <div class="floaterRight">
            <button id="buttPause" class="running">
                Paused</button>
        </div>
    </div>
    <div class="topSection">
        <h3>Zoom
        <span id="outputZoom" class="output"></span></h3>
        <input type="range" id="inputZoom" min="0" max="99" title="Zoom">
        <button id="buttResetZoom" title="Reset Zoom" class="menu">
            Reset</button>
    </div>
    <div class="topSection">
        <h3>Mapmodes</h3>
        <button id="mmButtTileTemp" class="menu" title="Tile Temperature">
            <img src="img/tileTemp.png" alt="Tile Temperature"
                width="35" height="35">
        </button>
        <button id="mmButtTileHumd" class="menu" title="Tile Humidity">
            <img src="img/tileHumd.png" alt="Tile Humidity"
                width="35" height="35">
        </button>
        <button id="mmButtTileFert" class="menu" title="Tile Soil Fertility">
            <img src="img/tileFert.png" alt="Tile Soil Fertility"
                width="35" height="35">
        </button>

        <button id="mmButtFoodTemp" class="menu" title="Food Pref. Temperature">
            <img src="img/foodTemp.png" alt="Food Pref. Temperature"
                width="35" height="35">
        </button>
        <button id="mmButtFoodHumd" class="menu" title="Food Pref. Humidity">
            <img src="img/foodHumd.png" alt="Food Pref. Humidity"
                width="35" height="35">
        </button>
        <button id="mmButtFoodFruit" class="menu" title="Food Fruit Type">
            <img src="img/foodFruit.png" alt="Food Fruit Type"
                width="35" height="35">
        </button>
        <!--
        <button id="mmButtTribePops" class="menu" title="Tribe Population">
            <img src="img/tribePops.png" alt="Tribe Population"
                width="35" height="35">
        </button>
        -->
        <button id="mmButtTribeFruit" class="menu" title="Tribe Pref. Fruit">
            <img src="img/tribeFruit.png" alt="Tribe Pref. Fruit"
                width="35" height="35">
        </button>
    </div>
</header>
<div id="sidebar">
    <h4 id="tglSectHover">Selection</h4>
    <div id="sectionHover" class="section">
        <div class="pair">
            <span class="left">X</span>
            <span id="outputHoverTileX" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Y</span>
            <span id="outputHoverTileY" class="output right"></span>
            <div class="cleaner"></div>
        </div>
    </div>

    <h4 id="tglSectTiles">Tile</h4>
    <div id="sectionTiles" class="section">
        <div class="pair">
            <span class="left">Temperature</span>
            <span id="outputTileTemp" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Humidity</span>
            <span id="outputTileHumd" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="separator"></div>
        <div class="pair">
            <span class="left">Has Food</span>
            <span id="outputTileHasFood" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Occupied</span>
            <span id="outputTileOccupied" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <h5 id="tglSubsectTileSoil">Soil</h5>
        <div id="subsectTileSoil" class="subSection">
            <div class="pair">
                <span class="left">Fertility</span>
                <span id="outputTileSoilFert" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <div class="pair">
                <span class="left">Erosion</span>
                <span id="outputTileSoilErosion" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>
    </div>

    <h4 id="tglSectFruits">Fruits</h4>
    <div id="sectionFruits" class="section">
        <div class="pair">
            <span class="left">Strength</span>
            <span id="outputFoodStrength" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Fruit Type</span>
            <span id="outputFoodFruit" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Age</span>
            <span id="outputFoodAge" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <h5 id="tglSubsectFoodPref">Preferred conditions</h5>
        <div id="subsectFoodPref" class="subSection">
            <div class="pair">
                <span class="left">Temperature</span>
                <span id="outputFoodPrefTemp" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <div class="pair">
                <span class="left">Humidity</span>
                <span id="outputFoodPrefHumd" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>
        <h5 id="tglSubsectFoodDiff">Conditions difference</h5>
        <div id="subsectFoodDiff" class="subSection">
            <div class="pair">
                <span class="left">Temperature</span>
                <span id="outputFoodDiffTemp" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <div class="pair">
                <span class="left">Humidity</span>
                <span id="outputFoodDiffHumd" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>
        <h5 id="tglSubsectFoodLastStrength">Last year strength</h5>
        <div id="subsectFoodLastStrength" class="subSection">
            <div class="pair">
                <span class="left">Min</span>
                <span id="outputFoodStrMin" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <div class="pair">
                <span class="left">Max</span>
                <span id="outputFoodStrMax" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>
    </div>

    <h4 id="tglSectTribes">Tribe</h4>
    <div id="sectionTribes" class="section">
        <div class="pair">
            <span class="left">Name</span>
            <span id="outputTribeName" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Sections Count</span>
            <span id="outputTribeSections" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Age</span>
            <span id="outputTribeAge" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="separator"></div>
        <div class="pair">
            <span class="left">Preferred Fruit</span>
            <span id="outputTribeFruit" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <div class="pair">
            <span class="left">Is Settled</span>
            <span id="outputTribeSettled" class="output right"></span>
            <div class="cleaner"></div>
        </div>
        <h5 id="tglSubsectTribePopulation">Population</h5>
        <div id="subsectTribePopulation" class="subSection">
            <div class="pair">
                <span class="left">Count</span>
                <span id="outputTribePopsCount" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <div class="pair">
                <span class="left">Unity</span>
                <span id="outputTribePopsUnity" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <h5 id="tglSubsectTribePopsCount">Count Changes</h5>
            <div id="subsectTribePopsCount" class="subSection">
                <div class="pair">
                    <span class="left">Year</span>
                    <span id="outputTribePopsYear" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Season</span>
                    <span id="outputTribePopsSeason" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Month</span>
                    <span id="outputTribePopsMonth" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
            </div>
        </div>
        <h5 id="tglSubsectTribeFood">Food</h5>
        <div id="subsectTribeFood" class="subSection">
            <h5 id="tglSubsectTribeFoodStorage">Storage</h5>
            <div id="subsectTribeStorage" class="subSection">
                <div class="pair">
                    <span class="left">Current</span>
                    <span id="outputTribeStorageCurrent" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Capacity</span>
                    <span id="outputTribeStorageCapacity" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
            </div>
            <h5 id="tglSubsectTribeFoodEco">Current Economy</h5>
            <div id="subsectTribeFoodEco" class="subSection">
                <div class="pair">
                    <span class="left">Income</span>
                    <span id="outputTribeEcoCurrInc" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Expenses</span>
                    <span id="outputTribeEcoCurrExp" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Bilance</span>
                    <span id="outputTribeEcoCurrBil" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
            </div>
            <h5 id="tglSubsectTribeFoodYearEco">Year Economy</h5>
            <div id="subsectTribeFoodYearEco" class="subSection">
                <div class="pair">
                    <span class="left">Income</span>
                    <span id="outputTribeEcoYearInc" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Expenses</span>
                    <span id="outputTribeEcoYearExp" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
                <div class="pair">
                    <span class="left">Bilance</span>
                    <span id="outputTribeEcoYearBil" class="output right"></span>
                    <div class="cleaner"></div>
                </div>
            </div>
        </div>
    </div>

    <h4 id="tglSectSettings">Settings</h4>
    <div id="sectionSettings" class="section">
        <h5 id="tglSubsectSettingsSpeed">Speed</h5>
        <div id="subsectSettingsSpeed" class="subSection">
            <div class="pair">
                <span class="left">Set</span>
                <span id="outputSettingsSpeed" class="output right"></span>
                <div class="cleaner"></div>
            </div>
            <button id="bttSpeedIncrease" class="side"> Increase </button>
            <button id="bttSpeedDecrease" class="side"> Decrease </button>
            <button id="bttSpeedDefault" class="side"> Default </button>
        </div>
        <h5 id="tglSubsectSettingsTemprSensit">Food tempr. sensit.</h5>
        <div id="subsectSettingsTemprSensit" class="subSection">
            <div class="pair">
                <span class="left">Set</span>
                <span id="outputSettingsTemprSensit" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>
        <h5 id="tglSubsectSettingsHumidSensit">Food hum. sensitivity</h5>
        <div id="subsectSettingsHumidSensit" class="subSection">
            <div class="pair">
                <span class="left">Set</span>
                <span id="outputSettingsHumidSensit" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>
        <h5 id="tglSubsectSettingsIncome">Income Multiplier</h5>
        <div id="subsectSettingsIncome" class="subSection">
            <div class="pair">
                <span class="left">Set</span>
                <span id="outputSettingsIncomeMult" class="output right"></span>
                <div class="cleaner"></div>
            </div>
        </div>

    </div>

</div>
<div id="canvasContainer" class="ccLarge">
    <canvas id="mainCanvas"></canvas>
</div>
<div class="cleaner"></div>
</body>
</html>
