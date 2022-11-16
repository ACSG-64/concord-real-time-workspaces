/**
 * Converts a time unit to milliseconds.
 * @param {{
 * days: number, 
 * hours: number, 
 * minutes: number, 
 * seconds: number }} baseTime - A time unit to convert to milliseconds. Only one unit can be chosen
 * @returns The input time in milliseconds
 */
function toMilliseconds({ days, hours, minutes, seconds }) {
    if (seconds) return seconds * 1000;
    else if (minutes) return minutes * 60 * 1000;
    else if (hours) return hours * 60 * 60 * 1000;
    else if (days) return days * 24 * 60 * 60 * 100;
    throw new Error('Invalid input');
}

module.exports = toMilliseconds;