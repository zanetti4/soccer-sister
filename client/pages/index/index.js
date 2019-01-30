//index.js
//引入数据监听插件
const watch = require("../../utils/watch.js");
const util = require("../../utils/util.js");

Page({
  data: {
    ads: [],
    liveList: [],
    newsList: [],
    curNewsList: [],
    page: 1,
    infinity: '热身中……',
    isShowInfinity: false,
    reqSuc: 0
  },
  watch: {
    reqSuc: function (newVal, oldVal) {
      if(newVal === 3){
        //所有请求都成功了
        wx.hideLoading();
      }
    }
  },
  onLoad(){
    wx.showLoading({
      title: '思考人生……',
    });

    watch.setWatcher(this);
    //获取焦点图
    let urlSlides = 'http://snsis.suning.com/snsis-web/client/pcHotChannelInfoRefresh/1.htm';
    let that = this;

    util.sendRequest(urlSlides).then(function({data}){
      if (data.data) {
        //获取到了数据
        let ads = data.data.comContinueAdvertiseList;

        if (ads.length > 5) {
          //焦点图大于5个
          ads = ads.slice(0, 5);
        }

        let reqSuc = that.data.reqSuc + 1;

        that.setData({
          ads,
          reqSuc
        });
      }
    }, function(error){
      console.log(error);
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

        if (data.data){
          //获取到数据
          //筛选足球
          let type1 = (date) => {
            let dayMatches = data.data.list[date];

            if (dayMatches){
              //存在该数组
              let matchFilter = dayMatches.filter(item => {
                return item.type === '1' && item.cataTitle !== 'WCBA' && item.cataTitle !== 'KHL' && item.cataTitle !== 'SRHL' && item.cataTitle !== 'NBL' && item.cataTitle !== 'CWHL';
              });

              return matchFilter;
            }
          };

          let todayMatch1 = type1(dateToday);

          if (todayMatch1){
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
                if (tomMatch1.length){
                  //明天有符合规则的比赛
                  let liveList = tomMatch1.slice(0, 2);

                  addRelativeDate(liveList, '明天');
                  this.setData({ liveList });
                }
              } else {
                //今天的余下比赛为1场
                if (tomMatch1.length === 0) {
                  //明天没有符合规则的比赛
                  futureMatches[0].relativeDate = '今天';
                  this.setData({ liveList: futureMatches });
                } else {
                  //明天有符合规则的比赛
                  let tomFirst = tomMatch1.slice(0, 1)[0];

                  futureMatches.push(tomFirst);
                  futureMatches[0].relativeDate = '今天';
                  futureMatches[1].relativeDate = '明天';
                  this.setData({ liveList: futureMatches });
                }
              }
            } else if (futureLen === 2) {
              //今天的余下比赛刚好两场
              addRelativeDate(futureMatches, '今天');
              this.setData({ liveList: futureMatches });
            } else {
              //今天的余下比赛多于两场
              let liveList = futureMatches.slice(0, 2);

              addRelativeDate(liveList, '今天');
              this.setData({ liveList });
            }

            let reqSuc = this.data.reqSuc + 1;

            this.setData({ reqSuc });
          }
        }
      },
      fail: (error) => {
        console.log(error);
      }
    });
    //获取首页新闻列表
    wx.request({
      url: 'https://soccer.hupu.com/home/latest-news?league=%E6%9C%80%E6%96%B0&page=1',
      success: ({ data }) => {
        let newsList = data.result;
        let reqSuc = this.data.reqSuc + 1;

        this.setData({
          newsList,
          curNewsList: newsList,
          reqSuc
        });
      }
    });
  },
  //无限加载
  onReachBottom(){
    if (this.data.curNewsList.length === 20){
      //认为后面还有数据，无限加载新闻列表
      this.setData({ isShowInfinity: true });

      let { page } = this.data;

      this.setData({ page: ++page });

      wx.request({
        url: `https://soccer.hupu.com/home/latest-news?league=%E6%9C%80%E6%96%B0&page=${this.data.page}`,
        success: ({ data }) => {
          let curNewsList = data.result;
          let { newsList } = this.data;

          newsList.push(...curNewsList);

          this.setData({
            curNewsList,
            newsList
          });

          if (curNewsList.length === 20) {
            //认为后面还有数据
            this.setData({
              isShowInfinity: false
            });
          } else {
            //当前为最后一页
            this.setData({
              infinity: '没人可换了……'
            });
          }
        }
      });
    }
  },
  //刷新新闻列表数据
  onRegain(ev){
    let {detail} = ev;

    this.setData({
      newsList: detail,
      curNewsList: detail
    });
  },
  //刷新比赛预告
  onRegainLive(ev){
    let { detail } = ev;

    this.setData({liveList: detail});
  },
  //到比赛预告页
  onToMatch(event){
    let { sectionId, title, matchId } = event.currentTarget.dataset;
    
    title = title.split(' ')[0];

    wx.navigateTo({
      url: `/pages/match/match?sectionId=${sectionId}&title=${title}&matchId=${matchId}`
    });
  }
})