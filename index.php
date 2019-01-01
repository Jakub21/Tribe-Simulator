<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="utf-8"/>
        <link rel="stylesheet" href="css/master.css">
    </head>
    <?php
    # Creates script at refresh, loading
    $yaml = file_get_contents("config/simulation.yml");
    $file = 'var config = jsyaml.load(`' . $yaml . '`);';
    file_put_contents("js/loadConfig.js", $file);
    ?>
    <script src="js/lib/jquery.js"></script>
    <script src="js/lib/js-yaml.js"></script>
    <script src="js/lib/easyscript.js"></script>
    <script src="js/loadConfig.js"></script>
    <script src="js/foodKind.js"></script>
    <script src="js/mapTile.js"></script>
    <script src="js/climate.js"></script>
    <script src="js/session.js"></script>
    <body>
        <div id="config"></div>
        <canvas id="mainCanvas"></canvas>
        <div id="controls">
            <div class="controlGroup2">
                <p class="groupLabel onTop">Year & Season</p>
                Year <span id="yearNumber"></span>
                <span id="seasonName"></span>
                <p class="groupLabel">View controls</p>
                View Zoom (<span id="zoomSliderLabel"></span>%)
                <input type="range" min="0" max="99" id="viewZoomSlider">
                Mapmode<br>
                <input type="radio" name="mapModeRadio" value="currentTemp"> Temperature
                <input type="radio" name="mapModeRadio" value="currentHumd"> Humidity<br/>
                <input type="radio" name="mapModeRadio" value="tileFertility"> Fertility<br/>
            </div>
            <div class="controlGroup2">
                <p class="groupLabel onTop">Hovered Tile</p>
                Index<br/>
                <input type="text" id="hoveredTileIndex"><br/>
                Temperature<br/>
                <input type="text" id="hoveredTileTemp"><br/>
                Humidity<br/>
                <input type="text" id="hoveredTileHumd"><br/>
                Fertility<br/>
                <input type="text" id="hoveredTileFert"><br/>
                <p class="groupLabel">View position</p>
                <input type="text" id="viewShift"><br/>
            </div>
            <div class="cleaner"></div>
        </div>
        <script src="js/launch.js"></script>
    </body>
</html>
