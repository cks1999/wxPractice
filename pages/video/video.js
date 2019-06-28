const app = getApp()
Page({
  data: {
    StatusBar: app.globalData.StatusBar, //顶部状态栏高度
    CustomBar: app.globalData.CustomBar, //顶部导航栏高度
    id: null,
    video_info: []
  },

  // 生命周期函数
  onLoad: function(e) {
    this.setData({
      id: e.id,
    })
    this.get_video()
  },

  // 获取视频信息
  get_video: function() {
    let that = this
    wx._request.request({
      url: '/videos/get_video',
      method: 'GET',
      data: {
        videoId: that.data.id
      },
      success: (res) => {
        console.log(res.data)
        that.setData({
          video_info: res.data
        })
      }
    })
  },
})