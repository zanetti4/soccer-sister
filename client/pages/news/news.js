// client/pages/news/news.js
let wxparse = require("../../wxParse/wxParse.js");
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    author: '',
    time: '',
    content: '',
    isHtml: false,
    commentList: [],
    commentNum: '0',
    goodComs: [],
    canvasH: 0,
    cover: '',
    isShowShare: false,
    isFirstSaveImg: true,
    isDrawing: true,
    pageNo: 0,
    curComList: [],
    newsId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { author, title, time, content, newsId, commentNum, cover } = options;

    this.setData({ title, author, time, commentNum, cover, newsId });

    if(content[0] === '<'){
      //内容是 html
      content = util.recoverSymbol(content);
      
      //不支持 swf 文件
      /* let videoIndex = content.indexOf('[/MEMO]');

      if (videoIndex !== -1){
        //包含视频
        let videoId = content.substr(videoIndex - 8, 8);

        wx.request({
          url: `http://api2.v.pptv.com/api/openapi/channel.js?from=web&version=0&format=jsonp&id=${videoId}&playlink=1&upd_con=1&episode=9999`,
          success: ({data}) => {
            let json = data.replace('(', '').replace(');', '');
            let oVideo = JSON.parse(json).data;
            let video = `<video src="${oVideo.swf}" class="content-video"></video>`;
            let reMemo = /\[MEMO.*\[\/MEMO\]/;
            let rePBegin = /<p>(?=\[MEMO)/;
            let reMemoWordsCloseP = /(\[MEMO.*\[\/MEMO\].*?)<\/p>/;
            //去掉 memo 外包裹的 p 标签
            content = content.replace(rePBegin, '').replace(reMemoWordsCloseP, function (con, group){
              return group;
            });

            content = content.replace(reMemo, video);
            this.setData({content});
            wxparse.wxParse('content', 'html', this.data.content, this);
          }
        });
      }else{
        //不包含视频
        this.setData({ content });
        wxparse.wxParse('content', 'html', this.data.content, this);
      } */

      this.setData({ content });
      wxparse.wxParse('content', 'html', this.data.content, this);

      this.setData({isHtml: true});
    }else{
      //内容是纯文本
      this.setData({ content });
    }

    if (commentNum !== '0'){
      //有评论
      wx.showLoading({
        title: '思考人生……',
      });

      this.getAllCom(newsId);
    }
  },
  //获取精华评论
  getAllCom(newsId){
    let { pageNo } = this.data;
    let timeStamp = new Date().getTime();

    wx.request({
      url: `http://snsis.suning.com/snsis-web/client/comment/queryOfPage.jsonp?contentId=${newsId}&pageNo=${++pageNo}&pageSize=20&contentType=1&versionTimestamp=${timeStamp}`,
      success: ({ data }) => {
        let { commentList } = util.dealJson(data).data;

        this.data.commentList.push(...commentList);

        this.setData({
          commentList: this.data.commentList,
          curComList: commentList,
          pageNo
        });

        if (this.data.curComList.length === 20){
          //认为还有下一页
          this.getAllCom(newsId);
        }else{
          wx.hideLoading();

          let { commentList } = this.data;

          commentList.sort((com1, com2) => {
            return com2.likeNum - com1.likeNum;
          });

          let goodComs = commentList.slice(0, 3);

          util.parseCom(goodComs);
          this.setData({ goodComs });
        }
      }
    });
  },
  //生成分享图片
  onCreateSharePic(){
    this.setData({ isShowShare: true });

    const wxGetImageInfo = util.promisify(wx.getImageInfo);
    let {cover, title} = this.data;
    let that = this;

    Promise.all([
      wxGetImageInfo({ src: cover })
    ]).then(res => {
      this.setData({ isDrawing: true });

      const ctx = wx.createCanvasContext('shareCanvas');

      wx.createSelectorQuery().select('#shareCanvas').boundingClientRect(function (rect) {
        let dx = 20;
        let canvasW = rect.width;
        let imgW = canvasW - 2 * dx;
        let imgH = imgW / 1.5;
        let rows = Math.ceil(title.length / 19);
        let canvasH = 20 + imgH + rows * 28;
        let fillStyleBg = '#FAFAFA';

        if (ctx.font) {
          //基础库 1.9.90 开始支持
          ctx.fillStyle = fillStyleBg;
        } else {
          //基础库低于 1.9.90
          ctx.setFillStyle(fillStyleBg);
        }

        that.setData({ canvasH });
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.drawImage(res[0].path, 20, 20, imgW, imgH);
        ctx.beginPath();

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

        for (let i = 0; i < rows; i++) {
          let line = title.substr(19 * i, 19);
          //每行文字的纵坐标，行高按2倍计算
          let titleY = 20 + imgH + 20 + 21 * i;

          ctx.fillText(line, 20, titleY, imgW);
        };

        ctx.draw(false, () => {
          that.setData({ isDrawing: false });
        });
      }).exec();
    });
  },
  //取消生成分享图片
  onCancelSharePic(){
    this.setData({ isShowShare: false });
  },
  //将分享图片保存到相册
  onSaveInAlbum(){
    const wxCanvasToTempFilePath = util.promisify(wx.canvasToTempFilePath);
    const wxSaveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum);

    wxCanvasToTempFilePath({ canvasId: 'shareCanvas' }, this).then(res => {
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success: () => {
          wxSaveImageToPhotosAlbum({ filePath: res.tempFilePath });

          wx.showToast({
            title: '已保存',
            success: () => {
              this.setData({ isShowShare: false });
            }
          });
        },
        fail: error => {
          console.log(error);

          let { isFirstSaveImg } = this.data;

          if (error.errMsg === 'authorize:fail auth deny' && !isFirstSaveImg){
            //该授权被用户拒绝过
            wx.openSetting();
          }

          if(isFirstSaveImg){
            this.setData({isFirstSaveImg: false});
          }
        }
      });
    });
  },
  //跳转到单一评论页
  onToSingleCom(event){
    let {comId} = event.currentTarget.dataset;
    let { commentList } = this.data;
    let sComs = util.createSingleCom(commentList, comId);

    wx.navigateTo({
      url: `/pages/singleCom/singleCom?sComs=${sComs}`
    });
  },
  //跳转到全部评论页
  onToAllComs(){
    let sGoodComs = JSON.stringify(this.data.goodComs);

    sGoodComs = util.transformSymbol(sGoodComs);

    let { commentNum, newsId, commentList } = this.data;
    let sAllComs = JSON.stringify(commentList);

    sAllComs = util.transformSymbol(sAllComs);

    wx.navigateTo({
      url: `/pages/allComs/allComs?sGoodComs=${sGoodComs}&commentNum=${commentNum}&newsId=${newsId}&sAllComs=${sAllComs}`
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
    let shareObj = {
      //转发成功的回调
      success(){
        wx.showToast({
          title: '已助攻'
        });
      },
      //转发失败的回调
      fail(res){
        if (res.errMsg === 'shareAppMessage:fail'){
          // 转发失败，其中 detail message 为详细失败信息
          wx.showToast({
            title: '助攻失败',
            image: '../../common/img/fail.png'
          });

          console.log(res);
        }
      }
    };

    return shareObj;
  }
})