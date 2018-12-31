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
    var perc = value / origScope;
    return perc * targetScope + targetMin;
}
