const axios = require('axios');
const { Bot, Keyboard, InlineKeyboard } = require("grammy");
const { GET_CURRENT_DATA, GET_DATA_GRAPH, START_MESSAGE } = require('./config');
const { getDataFromFile } = require('./data');
const { createGraph } = require('./graph');
const {createReadStream} = require("node:fs");

const bot = new Bot(process.env.BOT_API_KEY);

function sendGraphToTelegram(filePath, ctx) {
    const url = `https://api.telegram.org/bot${process.env.BOT_API_KEY}/sendPhoto`;
    const formData = {
        chat_id: ctx.chat.id,
        photo: createReadStream(filePath)
    };

    axios.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        console.log('Graph sent successfully:', response.data);
    }).catch(error => {
        console.error('Error sending graph:', error);
    });
}

bot.api.setMyCommands([
    {
        command: "start",
        description: "start the bot",
    },
]);

bot.command("start", async (ctx) => {
    const keyboard = new Keyboard()
        .text(GET_CURRENT_DATA)
        .text(GET_DATA_GRAPH)
        .resized();
    await ctx.reply(START_MESSAGE, {reply_markup: keyboard});
});

bot.hears(GET_CURRENT_DATA, async (ctx) => {
    await ctx.reply("Loading current data...");
    setTimeout(() => {
        const data = getDataFromFile();
        if (data) {
            const latestData = data[data.length - 1];
            ctx.reply(`\nLight: ${latestData.light} LDR\nTemperature: ${latestData.temperature} °С\nHumidity: ${latestData.humidity} %\n\nTimestamp: ${latestData.timestamp}`);
        } else {
            ctx.reply('No data available.');
        }
    }, 1000);
});

bot.hears(GET_DATA_GRAPH, async (ctx) => {
    const inlineKeyboard = new InlineKeyboard()
        .text("Temperature", "temperature-button")
        .text("Humidity", "humidity-button")
        .text("Light", "light-button");

    await ctx.reply("Choose the data:", {reply_markup: inlineKeyboard});
});

async function handleDataRequest(ctx, dataType) {
    await ctx.answerCallbackQuery();
    await ctx.reply(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} graphs are loading...`);
    const data = getDataFromFile();
    if (data) {
        const filePath = createGraph(data, dataType);
        sendGraphToTelegram(filePath, ctx);
    } else {
        await ctx.reply('No data available.');
    }
}

bot.callbackQuery("temperature-button", (ctx) => handleDataRequest(ctx, 'temperature'));
bot.callbackQuery("humidity-button", (ctx) => handleDataRequest(ctx, 'humidity'));
bot.callbackQuery("light-button", (ctx) => handleDataRequest(ctx, 'light'));

module.exports = {
    bot
};