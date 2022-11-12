const weatherApi = require('./weather.js');
const config = require("./config.json");
const utils = require("./util.js");
const request = require('./request');
const moment = require('moment');

const queryAccessToken = async () => {
    try {
        const res = await request.get(`${config.url}/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.secret}`)
        if(res?.data?.access_token) {
            return res?.data?.access_token;
        } else {
            throw "无法获取access_token"
        }
    } catch(e) {
        console.log(e)
    }
}

const dispatchMessage = async (payload) => {
   try{
    const access_token = await queryAccessToken();
    const res = await request.post(`${config.url}/cgi-bin/message/template/send?access_token=${access_token}`, payload);
    console.log(res?.data)
   } catch(e){
    console.log(e);
   }
};

const genPayload = async () => {

    const weatherInfo = await weatherApi.queryWeather();
    const { tempMax , tempMin, textDay, tipText, clothLevel, clothText, suiLevel, suiText, weatherLink } = weatherInfo || {};
    const tip = tipText;

    const cLevel = `🕊️ ${clothLevel}: ${clothText}`;
    const sLevel = `✈️ ${suiLevel}: ${suiText}`;

    const birthday1 = utils.calcBirthDay(config.birthday1);
    const birthday2 = utils.calcBirthDay(config.birthday2);
    const jojo = utils.calcFromNowDay(config.jojo);
    const jojo_birthday = `${utils.calcFromNowDay(config.jojo_birthday)}天`;
    const love_day = utils.calcFromNowDay(config.love_day);
    const weather = textDay || "";
    const min_temperature = tempMin || 0;
    const max_temperature = tempMax || 0;
    const date = moment().format("YYYY-MM-DD") + utils.getWeek(moment());
    const city = config.city;

    const dataObj = {
        date,
        city,
        weather,
        min_temperature,
        max_temperature,
        cLevel,
        sLevel,
        suiLevel,
        love_day,
        birthday1,
        birthday2,
        jojo,
        jojo_birthday,
    }

    if(tip) {
      dataObj[tip] = `⚡⚡ ${tip}`;
    }

    const data = Object.keys(dataObj).reduce((ret, k) => {
        const v = dataObj[k];
        ret[k] = {
            value: v,
            color: utils.randomColor()
        }
        return ret;
    }, {});

    return {
        touser:"oGBbq5ymBQB5r-pZzgSkncG9zR50",
        template_id: config.templateId,
        url: weatherLink,
        topcolor: "#FF0000",
        data,
    }
};

module.exports = async () => {
    const result = await genPayload();
    dispatchMessage(JSON.stringify(result));
}