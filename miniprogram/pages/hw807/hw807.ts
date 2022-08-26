import { convertIntToByte } from "../../utils/convert-utf"

let maxHr = 100
const app = getApp<IAppOption>()
Page({

    data: {
        hr: 0
    },

    onLoad() {

    },
    getMaxHr(e: WechatMiniprogram.Input) {
        maxHr = parseInt(e.detail.value)
        console.log(`input content ${maxHr}`);
    },
    setMaxHr() {
        app.globalData.headerNumber++
        wx.writeBLECharacteristicValue({
            deviceId: app.globalData.deviceId,
            serviceId: "0000FD00-0000-1000-8000-00805F9B34FB",
            characteristicId: "0000fd1a-0000-1000-8000-00805f9b34fb".toUpperCase(),
            value: packageSendCmd(app.globalData.headerNumber ,packageHeartRateMax(maxHr))[0]
        }).then((res) => {
            console.log(`write`, res);
        }).catch((res) => {
            console.error(res);
        })
    },
    displayHr() {
        
    }
})

let protocolVersion = 1

/** 设置最大心率 */
function packageHeartRateMax(maxHR: number) {
    let cmdId = 1;
    let version = protocolVersion * 16 + 0 * 8;
    let keyMark = 13; // TODO: what's this?
    let ackType = 1;
    let valueLong = 1;

    let data = new ArrayBuffer(6);
    let bufView = new Uint8Array(data);
    bufView[0] = convertIntToByte(cmdId);
    bufView[1] = convertIntToByte(version);
    bufView[2] = convertIntToByte(keyMark);
    bufView[3] = convertIntToByte(ackType);
    bufView[4] = convertIntToByte(valueLong);
    bufView[5] = convertIntToByte(maxHR);
    return data;
}


/**
* 封住发送的完整指令
*/
function packageSendCmd(headerNumber: number, data: ArrayBuffer) {
    let dataView = new Uint8Array(data);
    let buf = new ArrayBuffer(dataView.length + 2);
    let bufView = new Uint8Array(buf);

    // 前两位添加发送序号
    bufView[0] = convertIntToByte(headerNumber / 256);
    bufView[1] = convertIntToByte(headerNumber % 256);

    // 将 data 数据加入 buf
    for (var i = 0; i < dataView.length; i++) {
        bufView[2 + i] = dataView[i];
    }

    var cmdDataArray = [];
    if (bufView.length <= 16) { // 一次发送的大小只能20byte（0-19 octets），其中还要预留4byte空间，分别为前三位（0，1不知道干啥用的，2是确定长度的）和最后一位（用来循环冗余校验）
        let lenght = bufView.length + 4;
        let checkNum = 255 + lenght;
        let cmdData = new ArrayBuffer(lenght);
        let cmdView = new Uint8Array(cmdData);
        cmdView[0] = convertIntToByte(255);
        cmdView[1] = convertIntToByte(0);
        cmdView[2] = convertIntToByte(lenght);
        for (var i = 0; i < bufView.length; i++) {
            cmdView[3 + i] = bufView[i];
            checkNum = checkNum + bufView[i];
        }
        cmdView[lenght - 1] = convertIntToByte(checkNum % 256);
        cmdDataArray.push(cmdData);
    } else { // 大于16byte的需要拆包
        var cmdNum = bufView.length / 16;
        if (bufView.length % 16 != 0) {
            cmdNum = cmdNum + 1;
        }
        for (var i = 0; i < cmdNum; i++) {
            if (i == cmdNum - 1) {
                var mark = 128 + 64 + i;
                var lenght = bufView.length - i * 16 + 4;
                var checkNum = 255 + mark + lenght;
                var myCmd = new ArrayBuffer(lenght);
                var myCmdView = new Uint8Array(myCmd);
                myCmdView[0] = convertIntToByte(255);
                myCmdView[1] = convertIntToByte(mark);
                myCmdView[2] = convertIntToByte(lenght);
                for (var j = i * 16; j < bufView.length; j++) {
                    myCmdView[3 + j - (i * 16)] = bufView[j];
                    checkNum = checkNum + bufView[j];
                }
                myCmdView[lenght - 1] = convertIntToByte(checkNum % 256);
                cmdDataArray.push(myCmd);
            } else {
                var mark = 128 + i;
                var lenght = 20;
                var checkNum = 255 + mark + lenght;
                var myCmd = new ArrayBuffer(lenght);
                var myCmdView = new Uint8Array(myCmd);
                myCmdView[0] = convertIntToByte(255);
                myCmdView[1] = convertIntToByte(mark);
                myCmdView[2] = convertIntToByte(lenght);
                for (var j = i * 16; j < i * 16 + 16; j++) {
                    myCmdView[3 + j - (i * 16)] = bufView[j];
                    checkNum = checkNum + bufView[j];
                }
                myCmdView[lenght - 1] = convertIntToByte(checkNum % 256);
                cmdDataArray.push(myCmd);
            }
        }
    }
    return cmdDataArray;
}