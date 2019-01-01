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
                <p class="groupLabel onTop">View controls</p>
                View Zoom (<span id="zoomSliderLabel"></span>%)
                <input type="range" min="0" max="99" id="viewZoomSlider">
                Mapmode<br>
                <input type="radio" name="mapModeRadio" value="tileFertility"> Fertility
                <input type="radio" name="mapModeRadio" value="currentTemp"> Temperature
                <input type="radio" name="mapModeRadio" value="currentHumd"> Humidity<br/>
            </div>
            <div class="controlGroup2">
                <p class="groupLabel onTop">Output</p>
                Hovered Tile<br/>
                <input type="text" id="hoveredTileIndex"><br/>
                View shift<br/>
                <input type="text" id="viewShift"><br/>
            </div>
            <div class="cleaner"></div>
        </div>
        <script src="js/launch.js"></script>
    </body>
</html>
