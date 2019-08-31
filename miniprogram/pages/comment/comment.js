// pages/comment/comment.js
const db = wx.cloud.database() //初始化数据库

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    content: '',//评价的内容
    star: 5,
    images: [],
    fileIds: [],
    movieId: -1
  },
  onContentChange: function(event) {
    console.log(event)
    this.setData({
      content: event.detail
    })
  },
  onStarChange: function(event) {
    this.setData({
      star: event.detail
    })
  },
  submit: function() {
    wx.showLoading({
      title: '评价中',
    })
    let promiseArr = []
    for (let i = 0; i < this.data.images.length; i++) {
      promiseArr.push(new Promise((resolve, reject) => {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0] //返回文件扩展名
        //多张图片传到云存储
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix,
          filePath: item,
          success: res => {
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            })
            resolve()
          },
          fail: err => {
            console.error(err)
          }
        })
      }))
    }
    //多张图片上传到云存储成功后，再把评价信息传到数据库
    Promise.all(promiseArr).then(res => {
      db.collection('comment').add({
        data: {
          movieId: this.data.movieId,
          content: this.data.content,
          star: this.data.star,
          fileIds: this.data.fileIds
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评价成功',
        })
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '评价失败',
        })
      })
    })
  },
  uploadImg: function() {
    wx.chooseImage({
      count: 9, //最多为9张
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      movieId: options.movieid
    })
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      console.log(res)
      this.setData({
        detail: JSON.parse(res.result)
      })
    }).catch(err => {
      console.error(err)
    })
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

  }
})