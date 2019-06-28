const app = getApp()
Page({
  data: {
    StatusBar: app.globalData.StatusBar, //顶部状态栏高度
    CustomBar: app.globalData.CustomBar, //顶部导航栏高度
    src: '', //视频暂存路径
    text_count: 0, //字数
    content: '', //描述内容
    submit_flag: false, //阅读规范锁
    coverPath: null, //封面路径
    videoPath: null, //视频上传路径
  },
  // 生命周期函数
  onLoad: function(e) {
    this.setData({
      src: e.src,
      size: e.size
    })
    this.upload() //获取后上传视频
  },

  //上传视频
  upload: function() {
    let that = this
    console.log('开始上传')
    wx.uploadFile({
      url: 'https://www.hcfyww.net/tiktok/videos/video_upload',
      filePath: this.data.src,
      name: 'upload_file',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'JSESSIONID=' + wx.getStorageSync("sessionId")
      },
      success(res) {
        console.log('上传成功')
        let data = JSON.parse(res.data).data
        that.setData({
          coverPath: data.coverPath,
          videoPath: data.videoPath
        })
      }
    })
  },

  //保存视频信息
  save: function(e) {
    wx._request.request({
      url: '/videos/save',
      data: {
        coverPath: this.data.coverPath,
        videoPath: this.data.videoPath,
        videoDesc: this.data.content,
      },
      method: 'POST',
      success(res) {
        console.log(res)
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000,
          mask: true
        })
        setTimeout(function() {
          wx.navigateBack({})
        }, 2000)
      }
    })
  },
  //上传事件
  uploadvideo: function() {
    let that = this
    let content = that.data.content
    let src = that.data.src
    if (content.length < 1) {
      wx.showToast({
        title: '请填写描述信息',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return false
    }
    if (that.data.videoPath == null) {
      wx.showLoading({
        title: '上传中。。。',
      })
      setTimeout(function() {
        if (that.data.videoPath != null) {
          console.log('上传完')
          wx.hideLoading()
          that.save()
        }
      }, 4000)
      if (that.data.videoPath != null) {
        setTimeout(function() {
          console.log('上传完')
          wx.hideLoading()
          that.save()
        }, 4000)
      }
    } else {
      that.save()
    }
  },


  /**文本输入 */
  contentInput: function(e) {
    this.setData({
      content: e.detail.value.trim(),
      text_count: e.detail.value.trim().length
    })
    console.log(e.detail.value.trim())
  },

  // 规则阅读状态
  setReading: function(e) {
    this.setData({
      submit_flag: e.detail.value
    })
  }
})