import { packageWriteValue } from "../../utils/ble-tool"

let maxHr = 0
const app = getApp<IAppOption>()
Page({
    data: {
        hr: 0
    },
    onLoad() {

    },
    getMaxHr(e: WechatMiniprogram.Input) {
        maxHr = parseInt(e.detail.value)
        // console.log(`input content ${maxHr}`);
    },
    setMaxHr() {
        app.globalData.headerNumber++
        wx.writeBLECharacteristicValue({
            deviceId: app.globalData.deviceId,
            serviceId: "0000FD00-0000-1000-8000-00805F9B34FB",
            characteristicId: "0000fd1a-0000-1000-8000-00805f9b34fb".toUpperCase(),
            value: packageWriteValue(app.globalData.headerNumber, packageHeartRateMax(maxHr))[0]
        }).then((res) => {
            console.log(`write`, res);
        }).catch((res) => {
            console.error(res);
        })
    },
    showHr() {
        wx.notifyBLECharacteristicValueChange({
            state: true,
            deviceId: app.globalData.deviceId,
            serviceId: "",
            characteristicId: ""
        }).then((res) => {

        })
    },
    hideHr() {

    }
})

/** 设置最大心率 */
function packageHeartRateMax(maxHR: number) {
    let cmdId = 1;
    let protocolVersion = 1
    let version = protocolVersion * 16 + 0 * 8;
    let keyMark = 13; // TODO: what's this?
    let ackType = 1;
    let valueLong = 1;
    let data = new ArrayBuffer(6);
    let bufView = new Uint8Array(data);
    bufView[0] = cmdId;
    bufView[1] = version;
    bufView[2] = keyMark;
    bufView[3] = ackType;
    bufView[4] = valueLong;
    bufView[5] = maxHR;
    return data;
}

function sendAckCmd(cmdBuf: ArrayBuffer) {
    wx.writeBLECharacteristicValue({
        deviceId: app.globalData.deviceId,
        serviceId: "0000FD00-0000-1000-8000-00805F9B34FB",
        characteristicId: "0000fd1a-0000-1000-8000-00805f9b34fb".toUpperCase(),
        value: cmdBuf,
        success: (res) => {
            console.log('write sucess', res);
        },
        fail: (res) => {
            console.error('write fail', res);
        }
    })
}

/** 
 * 回复命令
 */
function getAckCmdValue(sortNumber: number) {
    let checkNumber = 255 + 32 + 6 + (sortNumber / 256) + (sortNumber % 256);
    let buf = new ArrayBuffer(6);
    let bufView = new Uint8Array(buf);
    bufView[0] = 255;
    bufView[1] = 32;
    bufView[2] = 6;
    bufView[3] = Math.floor(sortNumber / 256);
    bufView[4] = sortNumber % 256;
    bufView[5] = checkNumber % 256;
    return buf;
}