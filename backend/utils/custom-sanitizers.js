/**
 * Removes extra spaces (tabs, spaces, etc.) for a single space in a string
 * @param {string} str - Input string
 * @returns {string} The formatted string
 */
function removeExtraSpaces(str) {
	return str.replace(/\s\s+/g, ' ');
}

module.exports = {
	removeExtraSpaces
};