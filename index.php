<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="utf-8"/>
        <link rel="stylesheet" href="css/master.css">
        <link rel="stylesheet" id="styleVariant">
    </head>
    <?php
    # Loads config file contents to textarea element
    # Element content is then read by loadConfig.js
    $yaml = file_get_contents("config/simulation.yml");
    echo '<textarea id="config" class="hidden">'.$yaml.'</textarea>';
    ?>
    <script src="js/lib/js-yaml.js"></script>
    <script src="js/lib/easyscript.js"></script>
    <script src="js/lib/perlinNoise.js"></script>
    <script src="js/loadConfig.js"></script>
    <script src="js/food.js"></script>
    <script src="js/mapTile.js"></script>
    <script src="js/climate.js"></script>
    <script src="js/tribe.js"></script>
    <script src="js/session.js"></script>
    <body>
        <canvas id="mainCanvas"></canvas>
        <div id="showBar"></div>
        <div id="uiBar">
            <button id="hideBar"> Hide </button>
            <div id="mainInfo">
                <span id="date">
                    Year <span id="outputYear" class="outputNoFS"></span>
                    <span id="outputSeason" class="outputNoFS"></span>
                </span><br/>
                <div>
                    <button id="toggleStyle">Toggle bar position</button>
                    <p class="subcat hInline">Map Zoom
                        <span id="outputZoom" class="output"></span>%</p>
                    <input type="range" id="controlZoom" min="0" max="99">
                </div>
            </div>
            <div class="cleaner"></div>
            <div id="sectionButtons">
                <p class="subcat">Sections</p>
                <button id="viewMapModes" class="dark menu">Map Modes</button>
                <button id="viewTileInfo" class="dark menu">Tile Info</button>
                <button id="viewFoodInfo" class="dark menu">Food Info</button>
                <button id="viewTribeInfo" class="dark menu">Tribe Info</button>
                <button id="viewSimSettings" class="dark menu">Simulation Settings</button>
            </div>

            <div id="sectionMapmodes" class="menuSection">
                <h3>Map Modes</h3>
                <p class="subcat">Tiles</p>
                <button id="mapModeTemp" class="menu">Temperature</button>
                <button id="mapModeHumd" class="menu">Humidity</button>
                <button id="mapModeFert" class="menu">Soil Fertility</button>
                <p class="subcat">Food</p>
                <button id="mapModeFoodFruitType" class="menu">Fruit Type</button>
                <button id="mapModeFoodPrefTemp" class="menu">Pref. Temperature</button>
                <button id="mapModeFoodPrefHumd" class="menu">Pref. Humidity</button>
                <p class="subcat">Tribe</p>
                <button id="mapModeTribePrefFruit" class="menu">Pref. Fruit</button>
            </div>

            <div id="sectionTileInfo" class="menuSection">
                <h3>Tile Info</h3>
                <p class="subcat">Index</p>
                <span id="outputIndex" class="output"></span>
                <p class="subcat">Is Occupied</p>
                <span id="outputTileOccupied" class="output"></span>
                <p class="subcat">Temperature</p>
                <span id="outputTileTemp" class="output"></span>
                <p class="subcat">Humidity</p>
                <span id="outputTileHumd" class="output"></span>
                <p class="subcat">Soil Fertility</p>
                <span id="outputTileFert" class="output"></span>
            </div>

            <div id="sectionFoodInfo" class="menuSection">
                <h3>Food Info</h3>
                <p class="subcat">Strength</p>
                <span id="outputFoodStrength" class="output"></span>
                <p class="subcat">Fruit Type</p>
                <span id="outputFoodFruit" class="output"></span>
                <br/><br/> <!--TODO-->
                <h3>Details</h3>
                <p class="subcat">Temp - Pref</p>
                <span id="outputFoodTempPref" class="output"></span>
                <p class="subcat">Temp - Delta</p>
                <span id="outputFoodTempDelta" class="output"></span>
                <p class="subcat">Humidity - Pref</p>
                <span id="outputFoodHumdPref" class="output"></span>
                <p class="subcat">Humidity - Delta</p>
                <span id="outputFoodHumdDelta" class="output"></span>
                <p class="subcat">Is Alive</p>
                <span id="outputFoodIsPlaceholder" class="output"></span>
                <p class="subcat">Food Age</p>
                <span id="outputFoodAge" class="output"></span>
            </div>

            <div id="sectionTribeInfo" class="menuSection">
                <h3>Tribe Info</h3>
                <p class="subcat">Name</p>
                <span id="outputTribeName" class="output"></span>
                <p class="subcat">Population</p>
                <span id="outputTribePops" class="output"></span>
                <p class="subcat">Is Settled</p>
                <span id="outputTribeIsSettled" class="output"></span>
                <p class="subcat">Num. of Tiles</p>
                <span id="outputTribeNumOfTiles" class="output"></span>
                <p class="subcat">Pref. Fruit</p>
                <span id="outputTribePrefFruit" class="output"></span>
                <p class="subcat">Accumulated Food</p>
                <span id="outputTribeAccFood" class="output"></span>
            </div>

            <div id="sectionSettings" class="menuSection">
                <h3>Simulation Settings</h3>
                <p class="subcat">Speed (FPS)</p>
                <span id="outputFps" class="output"></span>
                <button id="fpsIncrease" class="menu"> + </button>
                <button id="fpsDecrease" class="menu"> - </button>
                <button id="fpsReset" class="menu"> Reset </button>
                <button id="fpsPause" class="menu"> Pause </button>
            </div>
        <div class="cleaner"></div>
        <script src="js/launch.js"></script>
    </body>
</html>
