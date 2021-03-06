"use strict";
/* ----------------------------------------------------------------
* Helper functions and wrappers
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

// Function for array reducing - sum of values
function arrSum(total, current) {
    return total + current;
}

// Function for array reducing - minimum value
function arrMinimum(prev, current) {
    if (current < prev) return current; else return prev;
}

// Function for array reducing - maximum value
function arrMaximum(prev, current) {
    if (current > prev) return current; else return prev;
}

// Get index of instance in array
function indexOf(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return i; }
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
    if (arr.length == 0) return;
    var index = randint(0, arr.length-1);
    return arr[index];
}

// Generate random name
function randomName() {
    var minLen = 5;
    var maxLen = 9;
    var vs = ['e', 'y', 'u', 'i', 'o', 'a'];
    var cs = ['q', 'w', 'r', 't', 'p', 's', 'd', 'f', 'g', 'h',
        'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
    var all = vs.concat(cs);
    var type = [];
    var result = '';
    for (var index = 0; index < randint(minLen, maxLen); index++) {
        if (index == 0) {
            var l = randChoice(all);
            if (vs.includes(l)) {
                type.push('v');
                vs.splice(indexOf(vs, l), 1); }
            else {
                type.push('c');
                cs.splice(indexOf(cs, l), 1); }
            result += l.toUpperCase(); }
        else {
            if (type[type.length-1] == 'c') {
                var l = randChoice(vs);
                result += l;
                vs.splice(indexOf(vs, l), 1);
                type.push('v'); }
            else {
                var l = randChoice(cs);
                result += l;
                cs.splice(indexOf(cs, l), 1);
                type.push('c'); } }
    }
    return result;
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

// Wrapper for HTML manipulation
function docGetById(id) {
    return document.getElementById(id);
}
function docGetByClass(cls) {
    return document.getElementsByClassName(cls);
}
function docWrite(id, content) {
    docGetById(id).innerHTML = content;
}
function docClear(id) {
    docGetById(id).innerHTML = '-';
}
