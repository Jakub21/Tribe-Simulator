"use strict";
/* ----------------------------------------------------------------
* Wrappers for Math functions
*/

// Random float greater than $from and less than $to
function random(from=0, to=1) {
    var spread = to-from;
    return Math.random()*spread + from;
}

// Random int greater than $from and less than $to
function randint(from, to) {
    return Math.floor(random(from, to));
}

// INT alias for FLOOR function
function int(float) {
    return Math.floor(float);
}

// Rounds float to 3 decimal places
function fRound(number) {
    return Math.round(number * 1000 + 0.0001) / 1000
}

// Get index for flattened 2D array
function getIndex(x, y, width) {
    return y*width + x;
}

// Maps value from one scope to another
function mapValue(value, origMin, origMax, targetMin, targetMax) {
    var origScope = origMax - origMin;
    var targetScope = targetMax - targetMin;
    var perc = (value - origMin) / origScope;
    return perc * targetScope + targetMin;
}

// Absolute value
function abs(number) {
    return Math.abs(number);
}

// Absolute value
function ceil(number) {
    return Math.ceil(number);
}

// Get index of instance in array
function indexOf(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return i;
    }
}

// Get neighbouring indices
function getNeighbourIndices(x, y, width, height) {
    var indices = [];
    var xx, yy;
    // Left
    xx = x-1; yy = y;
    if (xx >= 0) indices.push(getIndex(xx, yy, width));
    // Right
    xx = x+1; yy = y;
    if (xx < width) indices.push(getIndex(xx, yy, width));
    // Top
    xx = x; yy = y-1;
    if (yy >= 0) indices.push(getIndex(xx, yy, width));
    // Bottom
    xx = x; yy = y+1;
    if (yy < height) indices.push(getIndex(xx, yy, width));
    return indices;
}

// Choose random element from array
function randChoice(arr) {
    var index = randint(0, arr.length);
    if (arr[index] == undefined) {
        console.log('Choosen undefined');
    }
    return arr[index];
}

// Converts HSL to Hex RGB
// Copied from StackOverflow
// https://stackoverflow.com/a/44134328
function fromHsl(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
