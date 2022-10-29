// client/pages/match/match.js
import { radar } from '../../common/components/radar/radar';

const util = require("../../utils/util.js");
//引入数据监听插件
const watch = require("../../utils/watch.js");

Page({
  radar,
  /**
   * 页面的初始数据
   */
  data: {
    isFirstMD: true,
    isFirstDC: true,
    matchData: {},
    title: '',
    day: '00',
    hour: '00',
    minute: '00',
    second: '00',
    reqSuc: 0,
    status: '0',
    homeShoot: '',
    homeKing: [],
    guestKing: [],
    isShowKing: true,
    history: {},
    currentTab: 0,
    swiperHeight1: 150,
    heights: [],
    matchId: '',
    relativeNews: [],
    isFirstRela: true,
    goalHome: [],
    goalGuest: [],
    assistHome: [],
    assistGuest: [],
    stealHome: [],
    stealGuest: [],
    isShowDataC: true,
    statProgress: [],
    liveScore: null,
    timerDataContrast: null,
    isShowSub: false,
    formation: {
      homeFirst: [],
      guestFirst: []
    },
    firstGoal: true,
    audioCtx: {},
    hasGoalSound: true
  },
  watch: {
    reqSuc: function (newVal, oldVal) {
      if (this.data.status !== '0'){
        //比赛正在进行和已结束
        if (newVal === 4) {
          //所有请求都成功了
          wx.hideLoading();
        }
      }else{
        //比赛未开始
        if (newVal === 3) {
          //所有请求都成功了
          wx.hideLoading();
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /* wx.showLoading({
      title: '思考人生……',
    }); */

    watch.setWatcher(this);

    let { matchId } = options;

    this.setData({matchId});
    //获取比赛数据
    // this.getMatchData(sectionId);
    //获取球队对比-数据王
    wx.request({
      url: `http://m.ppsport.com/pc/pclive/getPlayerAndTeamStat.htm?matchId=${matchId}`,
      success: ({ data }) => {
        let reqSuc = this.data.reqSuc + 1;
        let { bastShooter } = data.data.home;
        let { guest } = data.data;
        let { homeKing, guestKing } = this.data;

        if (bastShooter){
          //bastShooter 字段存在
          let { bastAssists, bastSteals } = data.data.home;

          homeKing.push(bastShooter, bastAssists, bastSteals);

          let isEmptyHK = homeKing.every(best => {
            return best.playerId === undefined;
          });

          let bastShooter2 = guest.bastShooter;
          let bastAssists2 = guest.bastAssists;
          let bastSteals2 = guest.bastSteals;

          guestKing.push(bastShooter2, bastAssists2, bastSteals2);

          let isEmptyGK = guestKing.every(best => {
            return best.playerId === undefined;
          });

          if(isEmptyHK && isEmptyGK){
            //两队数据王都为空
            this.setData({isShowKing: false});
          }
        }

        this.setData({ 
          reqSuc,
          homeKing,
          guestKing
        });

        let { shoot } = data.data.home;

        if(shoot){
          //存在 shoot 字段
          this.setData({ homeShoot: shoot });

          let { round } = Math;
          let { plugging, corner, season, scoreGoals, ballcontrolrate } = data.data.home;

          let homeShoot = round(shoot / 4);
          let homePlug = round(plugging);
          let homeCorner = round(corner / 2);
          let homeSeason = round(parseFloat(season) / 10);
          let homeScore = round(scoreGoals);
          let homeBall = round(ballcontrolrate / 10);

          let shoot2 = guest.shoot;
          let plugging2 = guest.plugging;
          let corner2 = guest.corner;
          let season2 = guest.season;
          let scoreGoals2 = guest.scoreGoals;
          let ballcontrolrate2 = guest.ballcontrolrate;

          let guestShoot = round(shoot2 / 4);
          let guestPlug = round(plugging2);
          let guestCorner = round(corner2 / 2);
          let guestSeason = round(parseFloat(season2) / 10);
          let guestScore = round(scoreGoals2);
          let guestBall = round(ballcontrolrate2 / 10);

          //调用雷达图组件
          this.radar.draw([homeShoot, homePlug, homeCorner, homeSeason, homeScore, homeBall], [guestShoot, guestPlug, guestCorner, guestSeason, guestScore, guestBall]);
        }
      }
    });

    this.getHeights('.top');
    this.getHeights('.tab');
    this.setConH();
  },
  //载入数据对比头像错误
  onPortraitError(event){
    if(event.type === 'error'){
      //图片载入出错了
      let {index, stat} = event.currentTarget.dataset;

      stat[index].playerpic = '../../common/img/portrait.png';

      let { mark } = stat[index];

      switch(mark){
        case 'goalHome':
          this.setData({goalHome: stat});
          break;
        case 'goalGuest':
          this.setData({ goalGuest: stat });
          break;
        case 'assistHome':
          this.setData({ assistHome: stat });
          break;
        case 'assistGuest':
          this.setData({ assistGuest: stat });
          break;
        case 'stealHome':
          this.setData({ stealHome: stat });
          break;
        case 'stealGuest':
          this.setData({ stealGuest: stat });
          break;
      };
    }
  },
  //给数据对比的数组增加属性
  addStatProp(statistics, prop){
    if(statistics.length){
      //不是空数组
      statistics.forEach(player => {
        player.mark = prop;
      });
    }

    return statistics;
  },
  //获取比赛数据
  getMatchData(sectionId){
    let that = this;

    wx.request({
      url: `http://sportlive.suning.com/slsp-web/cms/matchData/BASEINFO,MATCH_PLAYERS,STATISTICS/${sectionId}.do`,
      success: ({ data }) => {
        let matchData = data.data;

        if(that.data.isFirstMD){
          //第一次获取比赛数据
          let reqSuc = that.data.reqSuc + 1;

          that.setData({ reqSuc });
        }

        that.setData({ matchData });

        let status = matchData.baseinfo.status;

        if (status === '0') {
          //比赛未开始
          //指定比赛时间
          let { startTime } = matchData.baseinfo;
          let futureTime = util.createStamp(startTime);
          //现在时间
          let now = new Date();
          let nowTime = now.getTime();
          let journey = (futureTime - nowTime) / 1000; //单位：s
          let d = util.addZero(parseInt(journey / 86400));
          let h = util.addZero(parseInt(journey % 86400 / 3600));
          let m = util.addZero(parseInt(journey % 86400 % 3600 / 60));
          let s = util.addZero(parseInt(journey % 60));

          that.setData({
            day: d,
            hour: h,
            minute: m,
            second: s
          });

          let countDown = setInterval(() => {
            //最新时间
            let cur = new Date();
            let curTime = cur.getTime();
            let journeyCur = (futureTime - curTime) / 1000; //单位：s

            if (journeyCur > 0) {
              //比赛未开始
              let d1 = util.addZero(parseInt(journeyCur / 86400));
              let h1 = util.addZero(parseInt(journeyCur % 86400 / 3600));
              let m1 = util.addZero(parseInt(journeyCur % 86400 % 3600 / 60));
              let s1 = util.addZero(parseInt(journeyCur % 60));

              if (d !== d1) {
                //天变了
                that.setData({ day: d1 });
              }

              if (h !== h1) {
                //小时变了
                that.setData({ hour: h1 });
              }

              if (m !== m1) {
                //分钟变了
                that.setData({ minute: m1 });
              }

              if (s !== s1) {
                //秒变了
                that.setData({ second: s1 });
              }
            } else {
              //比赛开始了
              clearInterval(countDown);
              that.setData({ isFirstMD: false });
              that.getMatchData(sectionId);
            }
          }, 1000);
        } else {
          //比赛进行中或已结束
          that.setData({ status });

          if (status === '1') {
            //比赛进行中，每分钟请求一次比赛数据
            let { liveScore, timerDataContrast } = that.data;

            liveScore = setInterval(() => {
              wx.request({
                url: `http://sportlive.suning.com/slsp-web/cms/matchData/BASEINFO,MATCH_PLAYERS,STATISTICS/${sectionId}.do`,
                success: ({ data }) => {
                  let matchData = data.data;
                  let { baseinfo } = that.data.matchData;
                  let oldHomeScore = baseinfo.home.score;
                  let newHomeScore = matchData.baseinfo.home.score;
                  let oldGuestScore = baseinfo.guest.score;
                  let newGuestScore = matchData.baseinfo.guest.score;
                  let {hasGoalSound} = that.data;
                  let hasGoal = newHomeScore > oldHomeScore || newGuestScore > oldGuestScore;

                  if (hasGoal && hasGoalSound){
                    //有进球且开启了提示音
                    if (that.data.firstGoal){
                      //第一次检测到进球
                      if (wx.createInnerAudioContext){
                        //基础库 1.6.0 开始支持
                        let audioCtx = wx.createInnerAudioContext();

                        audioCtx.src = 'https://img.tukuppt.com/newpreview_music/00/10/98/5d819f83b7e2061542.mp3';
                        audioCtx.autoplay = true;
                        that.setData({ audioCtx });
                      }else{
                        //基础库低于 1.6.0
                        let audioCtx = wx.createAudioContext('goal');

                        audioCtx.play();
                        that.setData({ audioCtx });
                      }
                      
                      that.setData({ firstGoal: false });
                    }else{
                      //又有进球
                      that.data.audioCtx.play();
                    }
                  }

                  that.setData({ matchData });
                  that.dealStat();

                  let curStatus = matchData.baseinfo.status;

                  if (curStatus === '2') {
                    //比赛结束了
                    clearInterval(liveScore);
                    clearInterval(timerDataContrast);
                    that.setData({ status: '2' });
                  }
                }
              })
            }, 60000);

            that.setData({liveScore});
            //每分钟请求一次数据对比
            timerDataContrast = setInterval(() => {
              wx.showLoading({
                title: '思考人生……',
              });

              that.getDataContrast();
            }, 60000);

            that.setData({ timerDataContrast });
          }

          that.getDataContrast();
          that.dealStat();
          that.positionColor();
        }
      }
    });
  },
  //播放进球提示音错误
  onAudioError(event){
    console.log(event);
  },
  //根据首发球员位置，设置文字颜色
  positionColor(){
    let { first } = this.data.matchData.matchPlayers.home;
    let guestFirst = this.data.matchData.matchPlayers.guest.first;

    this.addColor(first);
    this.addColor(guestFirst);

    let formation = {};

    formation.homeFirst = first;
    formation.guestFirst = guestFirst;
    this.setData({formation});
  },
  //给数组做循环，添加 color 属性
  addColor(first){
    first.forEach(player => {
      let encodePosi = encodeURIComponent(player.positionName);

      switch (encodePosi) {
        case '%E5%89%8D%E9%94%8B': //前锋
          player.color = '#FD4440';
          break;
        case '%E4%B8%AD%E5%9C%BA': //中场
          player.color = '#00BB24';
          break;
        case '%E5%90%8E%E5%8D%AB': //后卫
          player.color = '#3F5A93';
          break;
        default: //门将
          player.color = '#BBB33E';
      }
    });

    return first;
  },
  //切换阵容
  onFormation(event){
    let {value} = event.detail;

    this.setData({isShowSub: value});
  },
  //进球提示音开关
  onSound(event){
    let { value } = event.detail;

    this.setData({ hasGoalSound: value });
  },
  //处理技术统计数据
  dealStat(){
    let { statistics } = this.data.matchData;

    if (statistics.length) {
      //有技术统计
      let guestControl = statistics[0].guest;
      let numPi = guestControl / 50;
      let { PI } = Math;

      this.circleControl((numPi - 0.5) * PI);

      let noControl = statistics.slice(1);

      noControl.forEach(item => {
        let iHome = parseInt(item.home);
        let iGuest = parseInt(item.guest);
        let fHome = item.home / (iHome + iGuest);

        item.homePercent = util.toPercent(fHome);

        let fGuest = item.guest / (iHome + iGuest);

        item.guestPercent = util.toPercent(fGuest);

        if (iHome > iGuest) {
          //主队多
          item.homeMore = true;
        } else if (iHome < iGuest) {
          //客队多
          item.guestMore = true;
        }
      });

      this.setData({ statProgress: noControl });
    }
  },
  //画控球率圆环
  circleControl(eAngle) {
    const ctx = wx.createCanvasContext('control');
    let lineWidth = 4;
    let lineCap = 'round';
    //画主队
    let strokeStyle = 'black';
    let { PI } = Math;

    if (ctx.lineWidth) {
      //基础库 1.9.90 开始支持
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.lineCap = lineCap;
    } else {
      //低版本
      ctx.setLineWidth(lineWidth);
      ctx.setStrokeStyle(strokeStyle);
      ctx.setLineCap(lineCap);
    }

    ctx.arc(43, 43, 34, 0, 2 * PI, false);
    ctx.stroke();
    //画客队
    ctx.beginPath();
    strokeStyle = 'rgb(213, 204, 77)';
    lineWidth = 6;

    if (ctx.lineWidth) {
      //基础库 1.9.90 开始支持
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
    } else {
      //低版本
      ctx.setStrokeStyle(strokeStyle);
      ctx.setLineWidth(lineWidth);
    }

    ctx.arc(43, 43, 34, -0.5 * PI, eAngle, false);
    ctx.stroke();

    let fillStyle = '#333';

    if (ctx.font) {
      //基础库 1.9.90 开始支持
      ctx.font = '14px 微软雅黑';
      ctx.fillStyle = fillStyle;
    } else {
      //基础库低于 1.9.90
      ctx.setFontSize(14);
      ctx.setFillStyle(fillStyle);
    }

    ctx.fillText('控球率', 20, 50);
    ctx.draw();
  },
  //获取数据对比
  getDataContrast(){
    let { matchId } = this.data;

    wx.request({
      url: `http://m.ppsport.com/pc/pclive/getMatchStat.htm?matchId=${matchId}`,
      success: ({ data }) => {
        if (this.data.isFirstDC) {
          //第一次获取数据对比
          let reqSuc = this.data.reqSuc + 1;

          this.setData({ 
            reqSuc,
            isFirstDC: false
          });
        }else{
          //不是第一次获取数据对比
          wx.hideLoading();
        }

        let { home, guest } = data.data.goal;
        let assistHome = data.data.assists.home;
        let assistGuest = data.data.assists.guest;
        let stealHome = data.data.steals.home;
        let stealGuest = data.data.steals.guest;

        if (!home.length && !guest.length && !assistHome.length && !assistGuest.length && !stealHome.length && !stealGuest.length){
          //进球、助攻、抢断都没有数据
          this.setData({isShowDataC: false});
        }else{
          //进球、助攻、抢断有数据
          this.addStatProp(home, 'goalHome');
          this.addStatProp(guest, 'goalGuest');
          this.addStatProp(assistHome, 'assistHome');
          this.addStatProp(assistGuest, 'assistGuest');
          this.addStatProp(stealHome, 'stealHome');
          this.addStatProp(stealGuest, 'stealGuest');

          this.setData({
            goalHome: home,
            goalGuest: guest,
            assistHome,
            assistGuest,
            stealHome,
            stealGuest
          });
        }
      }
    });
  },
  
  //点击选项卡
  clickTab(e){
    let {current} = e.currentTarget.dataset;
    let { currentTab, isFirstRela } = this.data;

    if (currentTab === current) {
      return false;
    } else {
      this.setData({
        currentTab: current
      });

      if (current === 1 && isFirstRela){
        //首次浏览相关资讯
        this.getRelativeNews();
        this.setData({isFirstRela: false});
      }
    }
  },
  //获取相关资讯
  getRelativeNews(){
    let { matchId } = this.data;

    wx.request({
      url: `http://snsis.suning.com/snsis-web/client/LivePC/news/relevantNews.jsonp?labelId=${matchId}&labelType=7`,
      success: ({ data }) => {
        let relativeNews = util.dealJson(data).result.list;

        this.setData({ relativeNews });
      }
    });
  },
  //滑动切换
  swiperTab(e){
    let { current } = e.detail;

    this.setData({ currentTab: current });

    if (current === 1 && this.data.isFirstRela) {
      //首次浏览相关资讯
      this.getRelativeNews();
      this.setData({ isFirstRela: false });
    }
  },
  //计算选项卡内容高度
  setConH(){
    let that = this;

    wx.getSystemInfo({
      success: function(res) {
        let {windowHeight} = res;

        that.data.heights.forEach(item => {
          windowHeight -= item;
        });

        that.setData({swiperHeight1: windowHeight});
      },
    });
  },
  //获取顶部和选项卡标题高度
  getHeights(selector){
    let that = this;

    wx.createSelectorQuery().select(selector).boundingClientRect(function (rect) {
      if(rect){
        //rect 存在
        that.data.heights.push(rect.height);

        that.setData({
          heights: that.data.heights
        });
      }
    }).exec();
  },
  //跳转到新闻页
  onToNews(event){
    let { author, title, time, content, newsId, commentNum, cover } = event.currentTarget.dataset;

    if (content[0] === '<'){
      //内容是 html
      content = util.transformSymbol(content);
    }

    wx.navigateTo({
      url: `/pages/news/news?title=${title}&author=${author}&time=${time}&content=${content}&newsId=${newsId}&commentNum=${commentNum}&cover=${cover}`
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let { liveScore, timerDataContrast } = this.data;

    if(liveScore){
      //比赛进行中才有请求比赛数据、数据对比的定时器
      clearInterval(liveScore);
      clearInterval(timerDataContrast);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})