// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
  });
  },
})