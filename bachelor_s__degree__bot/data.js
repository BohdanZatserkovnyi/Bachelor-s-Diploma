const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { dataFilePath } = require('./config');

function getDataFromFile() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return data.split('\n').filter(Boolean).map(line => {
            try {
                return JSON.parse(line);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null;
            }
        }).filter(Boolean);
    } catch (error) {
        console.error('Error reading data file:', error);
        return null;
    }
}

function aggregateData(data, parameter, interval) {
    const MINUTELY_THRESHOLD = 60;
    const aggregatedData = {};
    data.forEach(item => {
        const timestamp = new Date(item.timestamp);
        let key;
        if (interval === 'minutely' || (interval !== 'hourly' && data.length <= MINUTELY_THRESHOLD)) {
            key = moment(timestamp).format('YYYY-MM-DD HH:mm');
        } else if (interval === 'hourly') {
            key = moment(timestamp).format('YYYY-MM-DD HH');
        } else if (interval === 'daily') {
            key = moment(timestamp).format('YYYY-MM-DD');
        } else if (interval === 'monthly') {
            key = moment(timestamp).format('YYYY-MM');
        }
        if (!aggregatedData[key]) {
            aggregatedData[key] = { sum: 0, count: 0 };
        }
        aggregatedData[key].sum += item[parameter];
        aggregatedData[key].count++;
    });
    return Object.keys(aggregatedData).sort().map(key => {
        const avgValue = aggregatedData[key].sum / aggregatedData[key].count;
        return { label: key, avgValue };
    });
}

module.exports = {
    getDataFromFile,
    aggregateData
};
