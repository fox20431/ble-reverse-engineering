interface IAppOption {
  globalData: {
    deviceId: string,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}