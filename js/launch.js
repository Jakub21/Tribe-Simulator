"use strict";
var session;

function launch() {
    var canvasId = "mainCanvas";
    docInit(canvasId);
    console.log('Launch');
    session = Session(canvasId);
    session.startLoop();
}
