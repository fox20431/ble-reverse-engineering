// app.ts
App<IAppOption>({
  globalData: {
    deviceId: ""
  },
  onLaunch() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
  });
  },
})