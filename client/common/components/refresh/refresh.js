// common/components/refresh/refresh.js
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
    newsListPage1: []
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

      wx.showLoading({
        title: '思考人生……',
      });

      //获取首页新闻列表
      wx.request({
        url: 'https://soccer.hupu.com/home/latest-news?league=%E6%9C%80%E6%96%B0&page=1',
        success: ({ data }) => {
          this.setData({
            newsListPage1: data.result
          });

          wx.hideLoading();
          this.triggerEvent('regainData', this.data.newsListPage1);
        }
      });
    }
  }
})
