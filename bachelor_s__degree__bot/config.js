const {join} = require("node:path");
const GET_CURRENT_DATA = "🚩 Get Current Data";
const GET_DATA_GRAPH = "📈 Get Data Graph";
const START_MESSAGE = "Hi, I'm the ESP8266 bot.";
const dataFilePath = join('C:', 'Users', 'alexa', 'Desktop', 'bachelor_s__degree__server', 'pythonProject', 'data.json');

module.exports = {
    GET_CURRENT_DATA,
    GET_DATA_GRAPH,
    START_MESSAGE,
    dataFilePath
};