// common/components/comImg/comImg.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    comList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //预览图片
    onPreviewPic(event) {
      let { index } = event.currentTarget.dataset;

      let urls = this.data.comList.map(img => {
        return img.imgUrl;
      });

      wx.previewImage({
        urls,
        current: urls[index]
      });
    }
  }
})
