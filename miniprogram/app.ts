// app.ts
App<IAppOption>({
  globalData: {
    deviceId: "",
    headerNumber: 0,
  },
  onLaunch() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
  });
  },
})