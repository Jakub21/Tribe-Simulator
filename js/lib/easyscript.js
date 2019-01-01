/* ----------------------------------------------------------------
* Wrappers for Math functions
*/

// Random float greater than $from and less than $to
function random(from, to) {
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
