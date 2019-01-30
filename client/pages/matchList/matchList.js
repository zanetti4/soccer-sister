//matchList.js
const util = require("../../utils/util.js");

Page({
  data: {
    matchList: [],
    heights: [],
    numLoop: 0,
    numOver: 0,
    isLoad: true,
    liveScore: null,
    isShowPage: true,
    hasPlaying: false,
    hasGoalSound: true,
    audioCtx: {},
    firstGoal: true,
    soundHeight: '0'
  },
  onLoad: function () {},
  onShow: function(){
    this.setData({isShowPage: true});

    let { liveScore } = this.data;

    if (!liveScore){
      //页面没开启定时器
      this.setData({ isLoad: true });
      this.initial();
    }
  },
  onHide: function(){
    this.setData({ isShowPage: false });
    
    let {hasGoalSound, liveScore} = this.data;

    if(!hasGoalSound && liveScore){
      //关闭了进球提示音且开启了定时器，那么没必要每分钟发请求了
      clearInterval(liveScore);
      this.setData({ liveScore: null });
    }
  },
  //设置页面初始化位置
  setLoca(selector) {
    let that = this;

    wx.createSelectorQuery().select(selector).boundingClientRect(function (rect) {
      let { heights, hasPlaying } = that.data;

      heights.push(rect.height);
      that.setData({heights});

      if (heights.length === 2) {
        //日期标题和单场比赛的高度都获取到了
        let { numLoop, numOver } = that.data;
        let scrollTop = heights[0] * numLoop + heights[1] * numOver;

        wx.pageScrollTo({
          scrollTop,
          duration: 0
        });
      }
    }).exec();
  },
  //进球提示音开关
  onSound(event) {
    let { value } = event.detail;

    this.setData({ hasGoalSound: value });
  },
  //播放进球提示音错误
  onAudioError(event) {
    console.log(event);
  },
  //请求直播列表并处理数据进行渲染
  initial(){
    let {isShowPage} = this.data;
    
    if(isShowPage){
      //正在浏览比赛列表页面
      wx.showLoading({
        title: '思考人生……',
      });
    }
    
    //获取比赛直播列表
    wx.request({
      url: 'http://sportlive.suning.com/slsp-web/lms/list/v1218/hot.do?pageIndex=1&timeSort=1&version=1&app=ios&_source=pc&apptype=wap&appversion=1',
      success: ({ data }) => {
        let { list } = data.data;
        //筛选足球
        for (let date in list) {
          list[date] = list[date].filter(item => {
            return item.type === '1' && item.cataTitle !== 'WCBA' && item.cataTitle !== 'KHL' && item.cataTitle !== 'SRHL' && item.cataTitle !== 'NBL' && item.cataTitle !== 'CWHL';
          });
        };
        //添加日期标题、每场比赛的标题
        for (let date in list) {
          if (list[date][0]){
            //这天有比赛，从最后一场比赛获取日期，因为第一场比赛可能是昨天开始的
            let indexLast = list[date].length - 1;
            let { matchDatetime } = list[date][indexLast].matchInfo;

            if(matchDatetime){
              //matchDatetime 存在
              let relativeDate = matchDatetime.substr(0, 11);
              let time = matchDatetime.substr(0, 10);
              let relativeChar = util.relativeDay(time);

              list[date][0].matchInfo.relativeDate = relativeDate + relativeChar;
            }

            list[date].forEach(match => {
              match.sectionInfo.matchTit = match.sectionInfo.title.split(' ')[0];
            });
          }
        };

        //查看是否有正在进行的比赛
        let today = new Date().toLocaleDateString();

        today = util.transformDate(today);

        //昨天最晚的比赛也可能正在进行
        let yesterday = new Date();
        
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday = yesterday.toLocaleDateString();
        yesterday = util.transformDate(yesterday);

        let hasPlayingToday = list[today].some(match => {
          return match.matchInfo.status === '1';
        });

        let hasPlayingYester = list[yesterday].some(match => {
          return match.matchInfo.status === '1';
        });

        let { isLoad, liveScore, matchList } = this.data;

        if (hasPlayingToday || hasPlayingYester) {
          //有正在进行的比赛
          console.log('有正在进行的比赛');
          this.setData({hasPlaying: true});
          //进球提示
          let oldPlayings = [];
          let oldMatches2 = matchList.slice(0, 2);

          this.filterPlayings(oldMatches2, oldPlayings);

          let newPlayings = [];
          let newMatches2 = [list[yesterday], list[today]];

          this.filterPlayings(newMatches2, newPlayings);

          let matchIdsGoal = [];

          newPlayings.forEach(match => {
            let newMatchId = match.matchInfo.matchId;

            let oldMatch = oldPlayings.find(oldMat => {
              return oldMat.matchInfo.matchId === newMatchId;
            });

            if(oldMatch){
              //新旧数据中都有这场比赛，则进行比分对比
              let oldHomeS = Number(oldMatch.matchInfo.homeTeam.score);
              let newHomeS = Number(match.matchInfo.homeTeam.score);
              let oldGuestS = Number(oldMatch.matchInfo.guestTeam.score);
              let newGuestS = Number(match.matchInfo.guestTeam.score);

              if(newHomeS > oldHomeS || newGuestS > oldGuestS){
                //有进球
                console.log('有进球');
                
                let { hasGoalSound, firstGoal } = this.data;

                if(hasGoalSound){
                  //开启了提示音
                  if (firstGoal) {
                    //第一次检测到进球
                    if (wx.createInnerAudioContext) {
                      //基础库 1.6.0 开始支持
                      let audioCtx = wx.createInnerAudioContext();

                      audioCtx.src = 'http://fjlt.sc.chinaz.com/Files/DownLoad/sound1/201507/6161.wav';
                      audioCtx.autoplay = true;
                      this.setData({ audioCtx });
                    } else {
                      //基础库低于 1.6.0
                      let audioCtx = wx.createAudioContext('goal');

                      audioCtx.play();
                      this.setData({ audioCtx });
                    }

                    this.setData({ firstGoal: false });
                  } else {
                    //又有进球
                    this.data.audioCtx.play();
                  }
                }

                matchIdsGoal.push(match.matchInfo.matchId);
              }
            }
          });
          //昨天和今天的比赛有可能正在进行，从这两天的比赛中查找有进球的，并设置样式
          this.addGoalProp(list[yesterday], matchIdsGoal);
          this.addGoalProp(list[today], matchIdsGoal);

          if (isLoad) {
            //首次载入页面
            liveScore = setInterval(() => {
              this.setData({isLoad: false});
              this.initial();
            }, 60000);

            this.setData({ liveScore });
            this.getHeightSound();
          }
        } else {
          //没有正在进行的比赛了
          console.log('没有正在进行的比赛了');

          if(liveScore){
            //开启了定时器
            clearInterval(liveScore);

            this.setData({liveScore: null});
          }

          this.setData({hasPlaying: false});
        }

        if (isLoad){
          //首次载入页面才定位页面
          //定位未结束的比赛
          let numOver = 0;
          let numLoop = 0;

          for (let date in list) {
            numLoop++;

            let indexLoca = list[date].findIndex(match => {
              return match.matchInfo.status !== '2';
            });

            if (indexLoca !== -1) {
              //找到了未结束的比赛
              numOver += indexLoca;
              this.setData({ numLoop, numOver });
              break;
            } else {
              //那天比赛都结束了
              numOver += list[date].length;
            }
          };

          let matchList = Object.values(list);

          this.setData({ matchList });

          if (wx.pageScrollTo) {
            //基础库1.4.0开始支持
            this.setData({ heights: [] });
            this.setLoca('.date');
            this.setLoca('.top-con');
          }
        }else{
          //不是首次载入页面，只获取数据，不进行定位
          let matchList = Object.values(list);

          this.setData({ matchList });
        }

        if(isShowPage){
          //正在浏览比赛列表页面
          wx.hideLoading();
        }
      },
      fail: (error) => {
        console.log(error);
      }
    });
  },
  //为有进球的比赛增加属性
  addGoalProp(listDate, matchIdsGoal){
    listDate.forEach(match => {
      let index = matchIdsGoal.indexOf(match.matchInfo.matchId);

      if (index !== -1) {
        //这是进球的比赛
        match.matchInfo.goal = true;
      }
    });
  },
  //筛选正在进行的比赛
  filterPlayings(list, arr){
    //list: [[], []]，arr 是空数组，用来存放正在进行的比赛
    list.forEach(day => {
      let dayPlayings = day.filter(match => {
        return match.matchInfo.status === '1';
      });

      arr.push(...dayPlayings);
    });

    return arr;
  },
  //刷新组件通知页面，开启定时器
  onStartTimer(ev){
    let { detail } = ev;

    if(detail){
      //开启定时器
      let liveScore = setInterval(() => {
        this.setData({ isLoad: false });
        this.initial();
      }, 60000);

      this.setData({ 
        liveScore,
        hasPlaying: detail
      });

      this.getHeightSound();
    }else{
      //如果开着定时器则关闭
      let {liveScore} = this.data;

      if(liveScore){
        //开启了定时器
        clearInterval(liveScore);

        this.setData({ 
          liveScore: null,
          hasPlaying: detail
        });
      }
    }
  },
  //点击刷新按钮，传过来的数据
  onRefreshMatchList(ev){
    let { detail } = ev;

    this.setData({matchList: detail});
  },
  //获取顶部进球提示音的高度
  getHeightSound(){
    let that = this;

    wx.createSelectorQuery().select('.sound').boundingClientRect(function(rect){
      let soundHeight = `${rect.height}px`;

      that.setData({soundHeight});
    }).exec();
  },
  //到比赛页
  onToMatch(event) {
    let { sectionId, title, matchId } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/match/match?sectionId=${sectionId}&title=${title}&matchId=${matchId}`
    });
  }
});