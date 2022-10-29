// common/components/onlyRefresh/onlyRefresh.js
const util = require("../../../utils/util.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageTimer: {
      type: null,
      value: null
    },
    hasGoalSound: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animation: {},
    n: 0,
    matchList: [],
    firstGoal: true,
    audioCtx: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //刷新页面、获取数据
    onRefresh(){
      this.initial();
    },
    //请求直播列表并处理数据
    initial() {
      //获取比赛直播列表
      this.animation = wx.createAnimation({});

      let { n } = this.data;

      n++;
      this.circle(n);
      this.setData({ n });

      let timerLoading = setInterval(() => {
        n++;
        this.circle(n);
        this.setData({ n });
      }, 400);

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
            if (list[date][0]) {
              //每天的第一场比赛存在
              let { matchDatetime } = list[date][0].matchInfo;
              let relativeDate = matchDatetime.substr(0, 11);
              let time = matchDatetime.substr(0, 10);
              let relativeChar = util.relativeDay(time);

              list[date][0].matchInfo.relativeDate = relativeDate + relativeChar;

              list[date].forEach(match => {
                const head = match.matchInfo.head;

                match.matchInfo.matchTit = head.h1 + head.h2;
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

          let { matchList } = this.data;

          if (hasPlayingToday || hasPlayingYester) {
            //有正在进行的比赛
            console.log('点击刷新图标：有正在进行的比赛');
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

              if (oldMatch) {
                //新旧数据中都有这场比赛，则进行比分对比
                let oldHomeS = Number(oldMatch.matchInfo.homeTeam.score);
                let newHomeS = Number(match.matchInfo.homeTeam.score);
                let oldGuestS = Number(oldMatch.matchInfo.guestTeam.score);
                let newGuestS = Number(match.matchInfo.guestTeam.score);

                if (newHomeS > oldHomeS || newGuestS > oldGuestS) {
                  //有进球
                  console.log('刷新组件：有进球');

                  let { hasGoalSound, firstGoal } = this.data;

                  if (hasGoalSound) {
                    //开启了提示音
                    if (firstGoal) {
                      //第一次检测到进球
                      if (wx.createInnerAudioContext) {
                        //基础库 1.6.0 开始支持
                        let audioCtx = wx.createInnerAudioContext();

                        audioCtx.src = 'https://img.tukuppt.com/newpreview_music/00/10/98/5d819f83b7e2061542.mp3';
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

            if (!this.data.pageTimer) {
              //页面没有开过定时器
              console.log('通知页面开启定时器');
              this.triggerEvent('startTimer', true);
            }
          } else {
            //没有正在进行的比赛了
            console.log('点击刷新组件，没有正在进行的比赛了');
            this.triggerEvent('startTimer', false);
          }

          matchList = Object.values(list);
          this.setData({ matchList });
          this.triggerEvent('regainMatchList', matchList);
          clearInterval(timerLoading);
        }
      });
    },
    //筛选正在进行的比赛
    filterPlayings(list, arr) {
      //list: [[], []]，arr 是空数组，用来存放正在进行的比赛
      list.forEach(day => {
        let dayPlayings = day.filter(match => {
          return match.matchInfo.status === '1';
        });

        arr.push(...dayPlayings);
      });

      return arr;
    },
    //播放进球提示音错误
    onAudioError(event) {
      console.log(event);
    },
    //为有进球的比赛增加属性
    addGoalProp(listDate, matchIdsGoal) {
      listDate.forEach(match => {
        let index = matchIdsGoal.indexOf(match.matchInfo.matchId);

        if (index !== -1) {
          //这是进球的比赛
          match.matchInfo.goal = true;
        }
      });
    },
    //图标转一圈
    circle(n){
      this.animation.rotate(360 * n).step();
      this.setData({ animation: this.animation.export() });
    }
  },
  detached(){
    console.log('刷新组件实例被从页面节点树移除');
  }
})
