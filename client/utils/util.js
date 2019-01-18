//补零
function addZero(num) {
  return num = num < 10 ? ('0' + num) : num;
};

//根据不同格式，格式化日期
function formatDate(dateString, separator){
  let aDate = dateString.split(separator);

  aDate[1] = addZero(aDate[1]);
  aDate[2] = addZero(aDate[2]);

  return aDate.join('');
};

//转换日期为('20190101')
function transformDate(dateString){
  let hasSlash = dateString.indexOf('/') !== -1;
  let hasConnector = dateString.indexOf('-') !== -1;

  if (hasSlash){
    //dateString 格式为 2019/1/1
    return formatDate(dateString, '/');
  }else if(hasConnector){
    //dateString 格式为 2019-1-1
    return formatDate(dateString, '-');
  }else{
    //dateString 格式为 Fri Jan 18 2019
    let year = dateString.slice(-4);
    let date = dateString.slice(-7, -5);
    let month = dateString.substr(4, 3);
    let numMonth = '';
    let aMonths = [
      {
        eng: 'Jan',
        num: '01'
      },
      {
        eng: 'Feb',
        num: '02'
      },
      {
        eng: 'Mar',
        num: '03'
      },
      {
        eng: 'Apr',
        num: '04'
      },
      {
        eng: 'May',
        num: '05'
      },
      {
        eng: 'Jun',
        num: '06'
      },
      {
        eng: 'Jul',
        num: '07'
      },
      {
        eng: 'Aug',
        num: '08'
      },
      {
        eng: 'Sep',
        num: '09'
      },
      {
        eng: 'Oct',
        num: '10'
      },
      {
        eng: 'Nov',
        num: '11'
      },
      {
        eng: 'Dec',
        num: '12'
      }
    ];

    let oneMonth = aMonths.find(mon => {
      return mon.eng === month;
    });

    if(oneMonth){
      //找到了那个月
      numMonth = oneMonth.num;
    }

    return year + numMonth + date;
  }
};

//处理 json 数据
function dealJson(jsonData){
  let reBracket = /\)$/;
  let noCb = jsonData.replace('callback(', '');
  let indexBracket = noCb.search(reBracket);
  let json = noCb.substring(0, indexBracket);

  return JSON.parse(json);
};

//promisify
function promisify(api){
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      const extras = {
        success: resolve,
        fail: reject
      };

      api({ ...options, ...extras }, ...params);
    });
  };
};

//将= ? &转换为大写字母
function transformSymbol(str){
  let reEqual = /=/g;
  let reQuestion = /\?/g;
  let reAnd = /&/g;
  let newStr = str.replace(reEqual, 'EQUAL').replace(reQuestion, 'QUESTION').replace(reAnd, 'AND');

  return newStr;
};

//恢复= ? &
function recoverSymbol(str){
  let reEqualWord = /EQUAL/g;
  let reQuestionWord = /QUESTION/g;
  let reAndWord = /AND/g;
  let newStr = str.replace(reEqualWord, '=').replace(reQuestionWord, '?').replace(reAndWord, '&');

  return newStr;
};

//解析评论的汉字
function parseCom(comList){
  let reEntity = /&#\d{5};/g;
  let reEllipsis = /&hellip;/g;

  comList.forEach(com => {
    let { commContent } = com;

    commContent = commContent.replace(reEllipsis, '...');

    let hasEntity = reEntity.test(commContent);

    if (hasEntity) {
      //包含 html 实体汉字
      let result = commContent.replace(reEntity, entity => {
        let num = entity.substr(2, 5);

        return String.fromCharCode(num);
      });

      com.commContent = result;
    }else{
      //不包含 html 实体汉字
      com.commContent = commContent;
    }
  });
};

//生成时间对应的时间戳
function createStamp(time){
  //time 的格式为"2019-01-01 14:17:33"
  let dateStr = time.replace(' ', 'T');
  let stamp = new Date(dateStr).getTime();

  return stamp;
};

//生成单一评论组成的数组，再处理为可传递到另一页面的查询参数
function createSingleCom(comList, comId){
  let comment = comList.find(com => {
    return com.commId === comId;
  });

  let comments = [];

  comments.push(comment);

  let repliesCom = comList.filter(com => {
    return com.parentCommId === comId;
  });

  comments.push(...repliesCom);

  let sComs = JSON.stringify(comments);

  sComs = transformSymbol(sComs);
  return sComs;
};

//生成当地日期字符串（2019-01-05）
function createLocaleDateStr(oDate) {
  let sDay = oDate.toLocaleDateString();
  let aDay = sDay.split('/');

  aDay[1] = addZero(aDay[1]);
  aDay[2] = addZero(aDay[2]);
  sDay = aDay.join('-');
  return sDay;
};

//判断相对天或星期
function relativeDay(time) {
  //time: '2018-12-20'
  let today = new Date();
  let yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  let tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  if (time === createLocaleDateStr(today)) {
    //今天
    return '今天';
  } else if (time === createLocaleDateStr(yesterday)) {
    //昨天
    return '昨天';
  } else if (time === createLocaleDateStr(tomorrow)) {
    //明天
    return '明天';
  } else {
    //判断星期
    let dateStr = `${time}T00:00:00`;
    let iWeek = new Date(dateStr).getDay();
    const week = ['日', '一', '二', '三', '四', '五', '六'];
    let weekChar = `周${week[iWeek]}`;

    return weekChar;
  }
};

//将小数转换为百分数
function toPercent(point, num = 0) {
  var fFixed = (point * 100).toFixed(num);

  fFixed += "%";
  return fFixed; //返回字符串
};

//封装请求
function sendRequest(url, method = 'GET', data = {}, header = {}){
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url,
      data: data,
      method: method,
      header: header,
      success: resolve,
      fail: reject
    })
  });

  return promise;
};

module.exports = {
  addZero,
  dealJson,
  promisify,
  transformDate,
  transformSymbol,
  recoverSymbol,
  parseCom,
  createStamp,
  createSingleCom,
  relativeDay,
  createLocaleDateStr,
  toPercent,
  sendRequest
}