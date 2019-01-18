// client/pages/allComs/allComs.js
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodComs: [],
    commentNum: '0',
    commentList: [], //无限加载的评论
    curComList: [],
    infinity: '热身中……',
    isShowInfinity: false,
    newsId: '',
    page: 1,
    allComs: [] //全部评论
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { sGoodComs, commentNum, newsId, sAllComs } = options;

    sGoodComs = util.recoverSymbol(sGoodComs);
    sAllComs = util.recoverSymbol(sAllComs);

    let goodComs = JSON.parse(sGoodComs);
    let allComs = JSON.parse(sAllComs);

    this.setData({ goodComs, commentNum, newsId, allComs });

    let timeStamp = new Date().getTime();

    wx.showLoading({
      title: '思考人生……',
    });
    //获取首页评论
    wx.request({
      url: `http://snsis.suning.com/snsis-web/client/comment/queryOfPage.jsonp?contentId=${newsId}&pageNo=1&pageSize=20&contentType=1&versionTimestamp=${timeStamp}`,
      success: ({data}) => {
        let { commentList } = util.dealJson(data).data;

        util.parseCom(commentList);

        this.setData({
          commentList,
          curComList: commentList
        });

        wx.hideLoading();
      }
    });
  },
  //跳转到单一评论页
  onToSingleCom(event) {
    let { comId } = event.currentTarget.dataset;
    let { allComs } = this.data;
    let sComs = util.createSingleCom(allComs, comId);

    wx.navigateTo({
      url: `/pages/singleCom/singleCom?sComs=${sComs}`
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
    if (this.data.curComList.length === 20){
      //认为后面还有数据，无限加载新闻列表
      this.setData({ isShowInfinity: true });

      let { page, newsId } = this.data;
      let timeStamp = new Date().getTime();

      this.setData({ page: ++page });
      //获取下一页评论
      wx.request({
        url: `http://snsis.suning.com/snsis-web/client/comment/queryOfPage.jsonp?contentId=${newsId}&pageNo=${this.data.page}&pageSize=20&contentType=1&versionTimestamp=${timeStamp}`,
        success: ({ data }) => {
          let curComList = util.dealJson(data).data.commentList;

          util.parseCom(curComList);

          let { commentList } = this.data;

          commentList.push(...curComList);

          this.setData({
            commentList,
            curComList
          });

          if (curComList.length === 20) {
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
    }else{
      //如果评论只有一页，最后也能显示提示
      this.setData({ 
        isShowInfinity: true,
        infinity: '没人可换了……'
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})