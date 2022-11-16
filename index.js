const weatherApi = require('./weather.js');
const configs = require("./config.json");
const utils = require("./util.js");
const request = require('./request');
const moment = require('moment');

const queryAccessToken = async (c) => {
    try {
        const res = await request.get(`${c.url}/cgi-bin/token?grant_type=client_credential&appid=${c.appid}&secret=${c.secret}`)
        if(res?.data?.access_token) {
            return res?.data?.access_token;
        } else {
            throw "无法获取access_token"
        }
    } catch(e) {
        console.log(e)
    }
}

const dispatchMessage = async (payload, c) => {
   try{
    const access_token = await queryAccessToken(c);
    const res = await request.post(`${c.url}/cgi-bin/message/template/send?access_token=${access_token}`, payload);
    console.log(res?.data)
   } catch(e){
    console.log(e);
   }
};

const genPayload = async (c) => {

    try {
        const weatherInfo = await weatherApi.queryWeather(c);
        const { tempMax , tempMin, textDay, tipText, clothLevel, clothText, suiLevel, suiText, weatherLink } = weatherInfo || {};
        const tip = tipText;

        const cLevel = `🕊️ ${clothLevel}: ${clothText}`;
        const sLevel = `✈️ ${suiLevel}: ${suiText}`;

        const birthday1 = utils.calcBirthDay(c.birthday1);
        const birthday2 = utils.calcBirthDay(c.birthday2);
        const jojo = utils.calcFromNowDay(c.jojo);
        const jojo_birthday = `${utils.calcFromNowDay(c.jojo_birthday)}天`;
        const love_day = utils.calcFromNowDay(c.love_day);
        const weather = textDay || "";
        const min_temperature = tempMin || 0;
        const max_temperature = tempMax || 0;
        const date = moment().format("YYYY-MM-DD") + utils.getWeek(moment());
        const city = c.city;

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

        if (tip) {
            dataObj[tip] = `⚡⚡ ${tip}`;
        }

        const data = Object.keys(dataObj).reduce((ret, k, idx) => {
            const v = dataObj[k];
            ret[k] = {
                value: v,
                color: utils.randomColor(idx)()
            }
            return ret;
        }, {});

        return {
            touser: c.openid,
            template_id: c.templateId,
            url: weatherLink,
            topcolor: "#FF0000",
            data,
        }
    } catch(e){
        console.log(e);
    }
};

module.exports = async () => {
    configs.forEach((config) => {
        genPayload(config).then(result => {
            dispatchMessage(JSON.stringify(result), config);
        });
    })
}