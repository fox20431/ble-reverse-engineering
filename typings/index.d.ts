interface IAppOption {
  globalData: {
    deviceId: string,
    headerNumber: number
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}