/**
 * 封装通过write发送的完整的值（命令）
 */
export function packageWriteValue(headerNumber: number, data: ArrayBuffer) {
    let dataView = new Uint8Array(data);
    let buf = new ArrayBuffer(dataView.length + 2);
    let bufView = new Uint8Array(buf);

    // 前两位添加发送序号
    bufView[0] = headerNumber / 256;
    bufView[1] = headerNumber % 256;

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
        cmdView[0] = 255;
        cmdView[1] = 0;
        cmdView[2] = lenght;
        for (var i = 0; i < bufView.length; i++) {
            cmdView[3 + i] = bufView[i];
            checkNum = checkNum + bufView[i];
        }
        cmdView[lenght - 1] = checkNum % 256;
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
                myCmdView[0] = 255;
                myCmdView[1] = mark;
                myCmdView[2] = lenght;
                for (var j = i * 16; j < bufView.length; j++) {
                    myCmdView[3 + j - (i * 16)] = bufView[j];
                    checkNum = checkNum + bufView[j];
                }
                myCmdView[lenght - 1] = checkNum % 256;
                cmdDataArray.push(myCmd);
            } else {
                var mark = 128 + i;
                var lenght = 20;
                var checkNum = 255 + mark + lenght;
                var myCmd = new ArrayBuffer(lenght);
                var myCmdView = new Uint8Array(myCmd);
                myCmdView[0] = 255;
                myCmdView[1] = mark;
                myCmdView[2] = lenght;
                for (var j = i * 16; j < i * 16 + 16; j++) {
                    myCmdView[3 + j - (i * 16)] = bufView[j];
                    checkNum = checkNum + bufView[j];
                }
                myCmdView[lenght - 1] = checkNum % 256;
                cmdDataArray.push(myCmd);
            }
        }
    }
    return cmdDataArray;
}