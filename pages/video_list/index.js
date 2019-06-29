const app = getApp()
var util = require('../../utils/util');
Page({
  data: {
    StatusBar: app.globalData.StatusBar, //顶部状态栏高度
    CustomBar: app.globalData.CustomBar, //顶部导航栏高度
    id: 0,
    title: '',
    video_list: [],
  },
  // 我的视频详情
  myVideoDetail: function (e) {
    wx.navigateTo({
      url: '../video/video?id=' + e.currentTarget.dataset.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: options.id,
        title: options.name + '的视频'
      })
      this.getVideoList()
    } else {
      let list = JSON.parse(options.list)
      for (let i = 0; i < list.length; i++) {
        this.getLikeVideoList(list[i].videoId)
      }
      this.setData({
        title: '我喜欢的视频'
      })
    }
  },
  //获取喜欢视频列表
  getLikeVideoList: function(id) {
    var that = this
    wx._request.request({
      url: '/videos/get_video',
      method: 'GET',
      data: {
        videoId: id,
      },
      success: (res) => {
        console.log(res.data)
        let list = that.data.video_list.concat(res.data)
        that.setData({
          video_list: list
        })
      }
    })
  },

  //获取自己视频列表
  getVideoList: function() {
    var that = this
    wx._request.request({
      url: '/videos/get_other_list',
      method: 'GET',
      data: {
        userId: this.data.id,
        pageNum: 1,
        pageSize: 100
      },
      success: (res) => {
        console.log(res)
        that.setData({
          video_list: res.data.list
        })
      }
    })
  },

})