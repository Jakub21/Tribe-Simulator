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
    <script src="js/foodKind.js"></script>
    <script src="js/mapTile.js"></script>
    <script src="js/climate.js"></script>
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
                <p class="subcat">Menus</p>
                <button id="vievMapModes" class="dark menu">Map Modes</button>
                <button id="vievTileInfo" class="dark menu">Tile Info</button>
                <button id="vievSimSettings" class="dark menu">Simulation Settings</button>
            </div>

            <div id="sectionMapmodes" class="menuSection">
                <h3>Map Modes</h3>
                <p class="subcat">Tiles</p>
                <button id="mapModeTemp" class="menu">Temperature</button>
                <button id="mapModeHumd" class="menu">Humidity</button>
                <button id="mapModeFert" class="menu">Soil Fertility</button>
                <p class="subcat">Foods</p>
                <button id="mapModefoodKind" class="menu">Food Kind</button>
            </div>

            <div id="sectionTileInfo" class="menuSection">
                <h3>Tile Info</h3>
                <p class="subcat">Index</p>
                <span id="outputIndex" class="output"></span>
                <p class="subcat">Temperature</p>
                <span id="outputTemp" class="output"></span>
                <p class="subcat">Humidity</p>
                <span id="outputHumd" class="output"></span>
                <p class="subcat">Soil Fertility</p>
                <span id="outputFert" class="output"></span>
                <p class="subcat">Food Kind</p>
                <span id="outputFoodIndex" class="output"></span>
                <p class="subcat">Pref Temp</p>
                <span id="outputFoodPrefTemp" class="output"></span>
                <p class="subcat">Strength</p>
                <span id="outputFoodStrength" class="output"></span>
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
