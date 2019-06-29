const app = getApp()
var util = require('../../utils/util');
Page({
  data: {
    danmu: [{
        text: '第一个', //弹幕内容
        color: '#ff0000', //弹幕颜色
        time: ~~(Math.random() * 3) //弹幕播放的时间s 必须是整数
      },
      {
        text: '这是一条弹幕',
        color: '#00f',
        time: ~~(Math.random() * 3)
      },
      {
        text: '这是一条弹幕',
        color: '#0f0',
        time: ~~(Math.random() * 3)
      }, {
        text: '第一个', //弹幕内容
        color: '#ff0000', //弹幕颜色
        time: ~~(Math.random() * 3) //弹幕播放的时间s 必须是整数
      }
    ],
    StatusBar: app.globalData.StatusBar, //顶部状态栏高度
    CustomBar: app.globalData.CustomBar, //顶部导航栏高度
    navList: ['我的', '消息', '视频'], //导航栏
    userInfo: {}, //个人信息
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    TabCur: 0,
    scrollLeft: 0,
    none_avatarUrl: 'https://gitee.com/TianYuanXiaoCaiZi/miscellaneous/raw/master/none.png', //匿名头像url
    pageNum: 1, //视频页数
    pageSize: 10, //每次获取视频数量
    allVideoList: [], //获取视频总列表、用于翻上一页
    curVideoList: [], //当前显示视频列表，大小为pageSize
    begin_index: 0, //用于获取上一页
    endIndex: 10, //用于获取上一页
    pre_index: 0, //视频翻页时，上一页下标
    my_release: [], //我的发布视频列表
    clientHeight: wx.getSystemInfoSync().screenHeight, //获取当前手机屏幕的高度
    message_flag: false, //视频评论是否打开
    reply_flag: false, //回复框打开flag
    comment_input: '', //回复输入信息
    cur_comment_list: [], //回复列表
    reply_content_num: 0 //当前评论数量
  },

  //生命周期函数
  onLoad: function() {
    this.login(); //登陆
    this.getMyVideoList() //获取我的视频
    this.getVideoList() //获取视频列表
  },
  //刷新我的视频
  my_Release_Refresh: function() {
    this.getMyVideoList()
  },
  // 每次返回主頁面，刷新我的發佈視頻列表
  onShow: function() {
    this.getMyVideoList()
  },
  //获取自己视频列表
  getMyVideoList: function() {
    var that = this
    wx._request.request({
      url: '/videos/get_personal_list',
      method: 'GET',
      data: {
        pageNum: 1,
        pageSize: 100
      },
      success: (res) => {
        console.log('我的视频列表', res.data.list)
        that.setData({
          my_release: res.data.list
        })
      }
    })
  },

  //获取视频列表，每次10条
  getVideoList: function() {
    var that = this
    wx._request.request({
      url: '/videos/list',
      method: 'GET',
      data: {
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize
      },
      success: (res) => {
        let data = res.data.list
        data = that.data.allVideoList.concat(data)
        console.log('all', data)
        console.log('cur', res.data.list)
        that.setData({
          pageNum: that.data.pageNum + 1,
          curVideoList: res.data.list,
          allVideoList: data,
          begin_index: that.data.begin_index + 10,
          endIndex: that.data.endIndex + 10
        })
      }
    })
  },

  setCurData: function() {
    let data = this.data.allVideoList.slice(this.data.begin_index, this.data.endIndex)
    this.setData({
      begin_index: this.data.begin_index + 10,
      endIndex: this.data.endIndex + 10,
      curVideoList: data
    })
  },

  /**
   * 切换视频触发的事件
   */
  video_switchTab: function(event) {
    console.log(event.detail.current)
    let cur = event.detail.current
    let pause = this.data.pre_index
    if (cur - pause == -9) { //翻页
      pause = (cur - 1 + 10) % 10
      this.getVideoList()
    } else if (cur - pause == 9) { //上一页数据，如果为第一页数据则下一条循环
      this.setData({
        beginIndex: this.data.beginIndex - 10,
        endIndex: this.data.endIndex - 10,
      })
      this.setCurData()
    } else if (cur > pause) { //顺序查看下一个
      pause = (cur - 1 + 10) % 10
    }
    // console.log("当前停止第" + (pause + 1) + "视频");
    wx.createVideoContext("video" + pause).pause(); //停止视频
    wx.createVideoContext("video" + pause).seek(0); //回到0秒的状态
    // console.log("当前播放第" + (cur + 1) + "个视频");
    wx.createVideoContext("video" + cur).play(); //控制第几个视频播放
    this.setData({
      pre_index: cur
    })
  },

  //打开评论时锁定组件滑动
  catchTouchMove: function(res) {
    return true
  },

  switchTab: function(event) {
    let cur = event.detail.current
    // console.log(cur)
    this.setData({
      TabCur: cur
    })
  },

  load_error: function() {
    console.log('当前视频加载失败')
  },

  // 随机获取颜色
  getRandomColor: function() {
    let rgb = []
    for (let i = 0; i < 3; ++i) {
      let color = Math.floor(Math.random() * 256).toString(16)
      color = color.length == 1 ? '0' + color : color
      rgb.push(color)
    }
    return '#' + rgb.join('')
  },

  // scroll-view选择
  tabSelect(e) {
    console.log(e)
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },

  // 选择上传视频
  selectVideo: function() {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function(res) {
        if (res.size > 3 * 1024 * 1024) {
          console.log('视频过大')
          wx.showToast({
            title: '请选择小于10M视频',
            icon: 'none',
            duration: 2000,
            mask: true
          })
          return false
        } else {
          wx.navigateTo({
            url: '../upload_videos/index?src=' + res.tempFilePath + '&size=' + res.size,
          })
        }
      }
    })
  },

  // 授权
  login: function() {
    let that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.login({
            success: function(res) {
              var code = res.code; //1.登录凭证
              if (code) { //2、调用获取用户信息接口
                wx.getUserInfo({
                  success: function(res) {
                    console.log({
                      encryptedData: res.encryptedData,
                      iv: res.iv,
                      code: code
                    })
                    that.setData({
                      userInfo: res.userInfo,
                      hasUserInfo: true
                    })
                    console.log(res.userInfo)
                    //3.请求自己的服务器，解密用户信息 获取unionId等加密信息
                    wx.request({
                      // url: 'http://172.20.10.2:8080/user/login',
                      url: 'https://www.hcfyww.net/tiktok/user/login', //自己的服务接口地址
                      method: 'post',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded'
                      },
                      data: {
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                        code: code
                      },
                      success: function(data) {
                        console.log('sss', data.data.data.id)
                        //4.解密成功后 获取自己服务器返回的结果
                        if (data.data.status == 0) {
                          //设置sessionId,之后可以通过该get函数得到session
                          wx.setStorageSync("sessionId", data.data.msg)
                          wx.setStorageSync("userId", data.data.data.id)
                          wx.setStorageSync("avatar", data.data.data.avatarUrl)
                          wx.setStorageSync("nickname", data.data.data.nickname)
                        } else {
                          console.log('解密失败')
                        }
                      },
                      fail: function() {
                        console.log('系统错误')
                      }
                    })
                  },
                })
              }
            },
            fail: function() {
              console.log('登陆失败')
            }
          })
        }
      }
    })
  },
  bindGetUserInfo: function(e) {
    console.log(e)
    if (e.detail.userInfo) {
      this.login()
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法正常使用小程序，请授权之后再使用!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },

  myVideoDetail: function(e) {
    wx.navigateTo({
      url: '../video/video?id=' + e.currentTarget.dataset.id,
    })
  },

  // 判断是否喜欢该视频
  isLike: function(id) {
    wx._request.request({
      url: '/users_like/is_like',
      method: 'GET',
      data: {
        videoId: id
      },
      success: (res) => {
        console.log(res.status)
        return res.status
      }
    })
  },

  // 取消喜欢
  cancel_like: function(e) {
    let that = this
    let id = e.target.dataset.id
    let index = e.target.dataset.index
    wx._request.request({
      url: '/users_like/cancel_like',
      method: 'POST',
      data: {
        videoId: id
      },
      success: (res) => {
        console.log(res)
        var tmp_isLike = 'curVideoList[' + index + '].isLike'
        var tmp_likeCount = 'curVideoList[' + index + '].likeCount'
        var likeCount = that.data.curVideoList[index].likeCount
        that.setData({
          [tmp_isLike]: 0,
          [tmp_likeCount]: likeCount - 1
        })
      }
    })
  },

  // 添加喜欢
  add_like: function(e) {
    let id = e.target.dataset.id
    let index = e.target.dataset.index
    let that = this
    wx._request.request({
      url: '/users_like/add_like',
      method: 'POST',
      data: {
        videoId: id
      },
      success: (res) => {
        console.log(res)
        var tmp_isLike = 'curVideoList[' + index + '].isLike'
        var tmp_likeCount = 'curVideoList[' + index + '].likeCount'
        var likeCount = that.data.curVideoList[index].likeCount
        that.setData({
          [tmp_isLike]: 1,
          [tmp_likeCount]: likeCount + 1
        })
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
    let id = e.target.dataset.id
    let index = e.target.dataset.index
    let that = this
    let toUserId = that.data.curVideoList[index].userId
    if (that.data.comment_input.length > 1) {
      wx._request.request({
        url: '/comments/add_comments',
        method: 'POST',
        data: {
          videoId: id,
          toUserId: toUserId,
          fromUserId: wx.getStorageSync("userId"),
          // parentCommentId: '',
          comment: that.data.comment_input,
        },
        success: (res) => {
          that.switchReply()
          wx.showToast({
            title: res.msg,
            icon: 'success',
            duration: 2000,
            mask: true
          })
          var commentCount = 'curVideoList[' + index + '].commentCount'
          var tmp_commentCount = that.data.curVideoList[index].commentCount + 1
          console.log(tmp_commentCount)
          that.setData({
            [commentCount]: tmp_commentCount
          })
          that.get_parents_comments(id, index)
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

  // 点击喜欢
  // bindLike: function(e) {
  //   let id = e.target.dataset.id
  //   let index = e.target.dataset.index
  //   console.log(id, index)
  //   this.add_like(id, index)
  //   // this.get_parents_comments(id)
  // },

  // 打开或关闭评论栏
  switchMessage: function(e) {
    let id = e.target.dataset.id
    let index = e.target.dataset.index
    if (this.data.message_flag == true) {
      this.setData({
        message_flag: false,
        cur_comment_list: []
      })

      console.log("关闭")
    } else {
      this.setData({
        message_flag: true
      })
      this.get_parents_comments(id, index)
      console.log("打开")
    }
  },
  // 获取视频一级评论 
  refresh_parents_comments: function(e) {
    let id = e.target.dataset.id
    let index = e.target.dataset.index
    let that = this
    wx._request.request({
      url: '/comments/get_parents_comments',
      method: 'GET',
      data: {
        videoId: id,
        pageSize: 50
      },
      success: (res) => {
        console.log(res.data.list)
        let tmp = res.data.list
        for (var i = 0; i < tmp.length; i++) {
          var stamp = tmp[i].updateTime
          tmp[i].updateTime = util.formatTime(stamp, 'Y-M-D h:m:s')
        }
        that.setData({
          cur_comment_list: tmp
        })
      }
    })
  },
  // 获取视频一级评论 
  get_parents_comments: function(id, index) {
    let that = this
    wx._request.request({
      url: '/comments/get_parents_comments',
      method: 'GET',
      data: {
        videoId: id,
        pageSize: 50
      },
      success: (res) => {
        console.log(res.data.list)
        let tmp = res.data.list
        for (var i = 0; i < tmp.length; i++) {
          var stamp = tmp[i].updateTime
          tmp[i].updateTime = util.formatTime(stamp, 'Y-M-D h:m:s')
        }
        that.setData({
          cur_comment_list: tmp
        })
      }
    })
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
  }
})