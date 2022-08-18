let maxHr = 100
Page({

    data: {
    },

    onLoad() {

    },
    getMaxHr(e: WechatMiniprogram.Input) {
        maxHr = parseInt(e.detail.value)
        console.log(`input content ${maxHr}`);
    },
    setMaxHr() {
        wx.writeBLECharacteristicValue({
            deviceId
        })
    }
})