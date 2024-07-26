const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const { aggregateData } = require('./data');

function createGraph(data, parameter) {
    const minutelyData = aggregateData(data, parameter, 'minutely');
    const hourlyData = aggregateData(data, parameter, 'hourly');
    const dailyData = aggregateData(data, parameter, 'daily');
    const monthlyData = aggregateData(data, parameter, 'monthly');

    let labels, values;
    if (data.length <= 60) {
        labels = minutelyData.map(item => item.label);
        values = minutelyData.map(item => item.avgValue);
    } else if (data.length <= 60 * 24) {
        labels = hourlyData.map(item => item.label);
        values = hourlyData.map(item => item.avgValue);
    } else if (data.length <= 60 * 24 * 30) {
        labels = dailyData.map(item => item.label);
        values = dailyData.map(item => item.avgValue);
    } else {
        labels = monthlyData.map(item => item.label);
        values = monthlyData.map(item => item.avgValue);
    }

    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: parameter,
                data: values,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: parameter
                    }
                }
            }
        }
    });

    const filePath = path.join("graphs", `${parameter}_graph.png`);
    fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
    return filePath;
}

module.exports = {
    createGraph
};
