const request = require('./request');

const config = {
    key: "25594661a90e40bbbb8b3b1f142b98d5"
}

const queryLocation = async (cityName = "宁德") => {
    try {
      let res = await request.get(`https://geoapi.qweather.com/v2/city/lookup?location=${cityName}&key=${config.key}`);
      res = res.data
      if(res.code === "200"){
        return res.location?.[0]?.id;
      } else {
        return "101230301"
      }
    } catch(e) {
      return "101230301"
    };
};

const queryWeather = async (c) => {
    try {
       const locationId = await queryLocation(c.city);

       const warningTip = await request.get(`https://devapi.qweather.com/v7/warning/now?location=${locationId}&lang=en&key=${config.key}`);
       const { text: tipText } = warningTip.data?.warning?.[0] || { text: "" };

       const levelInfo = await request.get(`https://devapi.qweather.com/v7/indices/3d?type=3,8&location=${locationId}&key=${config.key}`);
       const [{ name: clothLevel, text: clothText }, { name: suiLevel, text: suiText }] = levelInfo.data?.daily?.slice(2) || [{}, {}]
       let weatherLink = levelInfo.data?.fxLink || "";

       let res = await request.get(`https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${config.key}`);

       res = res.data;
       if (res.code === "200") {
            return { ...res.daily?.[1], tipText, clothLevel, clothText, suiLevel, suiText, weatherLink } || {};
       } else {
            return {};
       }
    } catch(e) {
        return {};
    }
};

module.exports = {
    queryWeather
}


