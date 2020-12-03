const axios = require('./axios.js')
var CronJob = require('cron').CronJob
const query = require('./mysql.js')
const fs = require('fs')

desc = "一切正常" // 签到文本


//接口
loginUrl = "https://api.moguding.net:9000/session/user/v1/login"
saveUrl = "https://api.moguding.net:9000/attendence/clock/v1/save"
planUrl = "https://api.moguding.net:9000/practice/plan/v1/getPlanByStu"
weekly = "https://api.moguding.net:9000/practice/paper/v1/getWeeks1"
weekSubmit = "https://api.moguding.net:9000/practice/paper/v1/save"

console.log('蘑菇丁自动签到已启动.....');


// 直接签到版
const name = '姓名-随便填';
const phone = '手机号';
const password = '蘑菇丁密码';
const state = 'START'; //START 上班     END 下班
const address = '签到地址';
const longitude = '签到地址经度'; // 天安门 经度:116.403963 维度:39.915119
const latitude = '签到地址维度'

main(name, phone, password, state, address, longitude, latitude);


// 上班签到  ------朝9晚5 数据库版--表结构已截图
// new CronJob('00 00 09 * * *', async() => {
//   console.log('上班签到')
//   const userInfo = await query('select * from Userinfo');
//   userInfo.forEach((item, i) => {
//     await main(item.name, item.phone, item.password, 'START', item.address, item.longitude, item.latitude);
//   })
//   console.log('签到结束')
// }, null, true);

// // 下班签退
// new CronJob('00 00 17 * * *', async() => {
//   console.log('下班签到')

//   const userInfo = await query('select * from Userinfo');
//   userInfo.forEach((item, i) => {
//     await main(item.name, item.phone, item.password, 'END', item.address, item.longitude, item.latitude);
//   })

//   console.log('签到结束')
// }, null, true);





//周报--weeks.JSON部分文章不足200
// ;
// (async() => {

//   const header = await getHeaders('手机号', '蘑菇丁密码')
//   const weeksJson = await getPostGetWeeksJson(header)
//   const { data } = await axios(weekly, header, JSON.stringify(weeksJson));
//   if (data.code !== 200) {
//     console.error('登录异常')
//     return
//   }

//   const result = data.data

//   //读取JSON周报
//   const weekStrList = await fs.readFileSync('./weeks.json')
//   const weekArr = JSON.parse(weekStrList)

//   for (let i = 1; i < result.length; i++) {
//     PostWeekJson = {
//       "yearmonth": "",
//       "address": "",
//       "title": `${result[i].weeks}的周报`,
//       "longitude": "0.0",
//       "latitude": "0.0",
//       "weeks": `${result[i].weeks}`,
//       "endTime": `${result[i].endTime}`,
//       "startTime": `${result[i].startTime}`,
//       "planId": await getPlanId(header),
//       "reportType": "week",
//       "content": weekArr[i - 1].content
//     }
//     const { data } = await axios(weekSubmit, header, JSON.stringify(PostWeekJson))
//     if (data.code === 200) {
//       console.log(`%c第${i}周周报提交成功`, `color:green`)
//     } else if (data.code === 500 && data.msg === '报此时间段已经写过周记') {
//       console.log(`%c第${i}周报${data.msg}`, `color:gray`)
//     } else if (data.code === 500 && data.msg === '周报的最小字数是200') {
//       console.log(`%c第${i}周报${data.msg}`, `color:yellow`)
//     } else {
//       console.log(`%c第${i}周报未知异常提交失败`, `color:red`)
//     }
//   }
// })()



// 获取token
async function getToken(phone, password) {
  const { data } = await axios(loginUrl, {
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; BLA-AL00 Build/HUAWEIBLA-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36"
  }, {
    password: password,
    loginType: "android",
    uuid: "",
    phone: phone
  })
  return data.data.token ? data.data.token : '用户名/密码错误'
}

//获取PlanId
async function getPlanId(headers) {
  data = { "state": "" }
  const result = await axios(planUrl, headers, data)
  return result.data.data[0].planId ? result.data.data[0].planId : '用户名/密码错误'
}

//主函数
async function main(name, phone, password, stateType, address, longitude, latitude) {

  const headers = await getHeaders(phone, password)

  data = {
    'device': 'Android',
    'address': address, // 签到地点名
    'description': desc, // 签到文本
    'country': '',
    'province': '',
    'city': '',
    'longitude': longitude, // 经度
    'latitude': latitude, // 维度
    'planId': await getPlanId(headers),
    'type': stateType, // START 上班 END 下班
  }

  const result = await axios(saveUrl, headers, data)
  if (!result.data.code || result.data.code !== 200) {
    console.info("%c" + name + "-be defeated", 'color:red')
  } else {
    console.log(`${name}-${result.data.msg}-${result.data.data.createTime}`)
  }
}

//返回请求头
async function getHeaders(phone, password) {
  return {
    'Content-Type': 'application/json; charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; BLA-AL00 Build/HUAWEIBLA-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36',
    'roleKey': 'student',
    'Authorization': await getToken(phone, password)
  }
}

//返回周报请求数据
async function getPostGetWeeksJson(headers) {
  return {
    "planId": await getPlanId(headers)
  }
}