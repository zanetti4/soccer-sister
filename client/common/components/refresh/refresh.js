// common/components/refresh/refresh.js
const util = require("../../../utils/util.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    newsListPage1: [],
    reqSuc: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //回顶部并且重新请求数据
    onBackTop(){
      if(wx.pageScrollTo){
        //基础库1.4.0开始支持
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 600
        });
      } else {
        //基础库版本过低
        wx.showModal({
          title: '主帅提示',
          content: '当前球员能力过低，无法完成该技术动作，请升级到最新微信版本后重试。'
        });
      }

      this.setData({reqSuc: 0});

      wx.showLoading({
        title: '思考人生……',
      });

      //获取首页新闻列表
      wx.request({
        url: 'https://soccer.hupu.com/home/latest-news?league=%E6%9C%80%E6%96%B0&page=1',
        success: ({ data }) => {
          let reqSuc = this.data.reqSuc + 1;

          this.setData({
            newsListPage1: data.result,
            reqSuc
          });

          if(reqSuc === 2){
            //新闻列表、比赛预告都获取到了
            wx.hideLoading();
          }

          this.triggerEvent('regainData', this.data.newsListPage1);
        }
      });

      //获取比赛预告
      wx.request({
        url: 'http://sportlive.suning.com/slsp-web/lms/list/v1218/hot.do?pageIndex=1&timeSort=1&version=1&app=ios&_source=pc&apptype=wap&appversion=1',
        success: ({ data }) => {
          let date = new Date();
          let todayDateStr = date.toLocaleDateString();
          let dateToday = util.transformDate(todayDateStr);
          let date1 = new Date();
          let tomorrow = date1.getDate() + 1;

          date1.setDate(tomorrow);

          let tomDateStr = date1.toLocaleDateString();
          let sTom = util.transformDate(tomDateStr);

          if (data.data) {
            //获取到数据
            //筛选足球
            let type1 = (date) => {
              let dayMatches = data.data.list[date];

              if (dayMatches) {
                //存在该数组
                let matchFilter = dayMatches.filter(item => {
                  return item.type === '1' && item.cataTitle !== 'WCBA' && item.cataTitle !== 'KHL' && item.cataTitle !== 'SRHL' && item.cataTitle !== 'NBL';
                });

                return matchFilter;
              }
            };

            let todayMatch1 = type1(dateToday);

            if (todayMatch1) {
              //返回了今天的比赛
              let futureMatches = todayMatch1.filter(item => {
                let dateString = item.matchInfo.matchDatetime.replace(' ', 'T');
                let matchStamp = new Date(dateString).getTime();

                return date.getTime() < matchStamp;
              });

              let futureLen = futureMatches.length;
              //添加相对日期
              let addRelativeDate = (list, relativeDate) => {
                list.forEach(item => {
                  item.relativeDate = relativeDate;
                });
              };

              if (futureLen < 2) {
                //今天的余下比赛不足两场
                let tomMatch1 = type1(sTom);

                if (futureLen === 0) {
                  //今天的余下比赛为零
                  if (tomMatch1.length) {
                    //明天有符合规则的比赛
                    let liveList = tomMatch1.slice(0, 2);

                    addRelativeDate(liveList, '明天');
                    this.triggerEvent('refreshLiveList', liveList);
                  }
                } else {
                  //今天的余下比赛为1场
                  if (tomMatch1.length === 0) {
                    //明天没有符合规则的比赛
                    futureMatches[0].relativeDate = '今天';
                    this.triggerEvent('refreshLiveList', futureMatches);
                  } else {
                    //明天有符合规则的比赛
                    let tomFirst = tomMatch1.slice(0, 1)[0];

                    futureMatches.push(tomFirst);
                    futureMatches[0].relativeDate = '今天';
                    futureMatches[1].relativeDate = '明天';
                    this.triggerEvent('refreshLiveList', futureMatches);
                  }
                }
              } else if (futureLen === 2) {
                //今天的余下比赛刚好两场
                addRelativeDate(futureMatches, '今天');
                this.triggerEvent('refreshLiveList', futureMatches);
              } else {
                //今天的余下比赛多于两场
                let liveList = futureMatches.slice(0, 2);

                addRelativeDate(liveList, '今天');
                this.triggerEvent('refreshLiveList', liveList);
              }

              let reqSuc = this.data.reqSuc + 1;

              this.setData({ reqSuc });

              if (reqSuc === 2) {
                //新闻列表、比赛预告都获取到了
                wx.hideLoading();
              }
            }
          }
        },
        fail: (error) => {
          console.log(error);
        }
      });
    }
  }
})