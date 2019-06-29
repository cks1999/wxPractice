const app = getApp()
var util = require('../../utils/util');
Page({
  data: {
    StatusBar: app.globalData.StatusBar, //顶部状态栏高度
    CustomBar: app.globalData.CustomBar, //顶部导航栏高度
    id: null,
    userId: wx.getStorageSync("userId"),
    video_info: [],
    reply_flag: false,
    comment_input: '',
    reply_content_num: 0,
    avatarUrl: wx.getStorageSync("avatar")
  },

  // 回复&发表评论
  switchReply: function(e) {
    if (this.data.reply_flag == true) {
      this.setData({
        reply_flag: false
      })
      console.log("关闭")
    } else {
      this.setData({
        reply_flag: true
      })
      console.log("打开")
    }
  },

  // 获取视频一级评论 
  get_parents_comments: function() {
    let id = this.data.id
    let that = this
    wx._request.request({
      url: '/comments/get_parents_comments',
      method: 'GET',
      data: {
        videoId: id,
        pageSize: 50
      },
      success: (res) => {
        if (res.status == 0) {
          console.log(res)
          let tmp = res.data.list
          for (var i = 0; i < tmp.length; i++) {
            var stamp = tmp[i].updateTime
            tmp[i].updateTime = util.formatTime(stamp, 'Y-M-D h:m:s')
          }
          that.setData({
            cur_comment_list: tmp
          })
        }
      }
    })
  },
  // 输入评论
  comment_input: function(e) {
    this.setData({
      comment_input: e.detail.value,
      reply_content_num: e.detail.value.length
    })
    console.log('输入评论', e.detail.value, e.detail.value.length)
  },
  //添加父级评论
  add_comments: function(e) {
    let id = this.data.id
    let that = this
    if (that.data.comment_input.length > 1) {
      wx._request.request({
        url: '/comments/add_comments',
        method: 'POST',
        data: {
          videoId: id,
          toUserId: wx.getStorageSync("userId"),
          fromUserId: wx.getStorageSync("userId"),
          comment: that.data.comment_input,
        },
        success: (res) => {
          that.switchReply()
          wx.showToast({
            title: res.msg,
            icon: 'success',
            duration: 2000
          })
          that.get_parents_comments()
        }
      })
    } else {
      wx.showToast({
        title: '请输入评论',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 生命周期函数
  onLoad: function(e) {
    this.setData({
      id: e.id,
    })
    this.get_video()
    this.get_parents_comments()
    console.log(this.data.userId,)
  },

  // 刪除視頻
  delete_video: function() {
    let that = this
    wx._request.request({
      url: '/videos/delete_videos',
      method: 'POST',
      data: {
        videoId: that.data.id
      },
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '刪除成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function() {
          wx.navigateBack({})
        }, 2000)
      }
    })
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