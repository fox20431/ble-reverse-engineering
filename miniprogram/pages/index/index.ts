const app = getApp<IAppOption>()
interface Data {
  scanneddDevices: Array<any>;
  connected: boolean
}
interface Custom {
  scan: Function;
  stopScanning: Function;
  terminate: Function;

  connect: Function;
  getServAndChar: Function;
  readAndNotifyAllChar: Function;
  listenCharValue: Function;
  stopListeningCharValue: Function;
  disconnect: Function;
}
let currentPage: WechatMiniprogram.Page.Instance<Data, Custom>
let deviceId: string = ""
Page({
  data: {
    scanneddDevices: [],
    connected: false
  },
  onLoad() {
    currentPage = this;
  },
  scan() {
    wx.openBluetoothAdapter({
      // mode: 'central',
    }).then((res) => {
      console.log(`wx.openBluetoothAdapter`, res);
      // 开始搜索附近的蓝牙外围设备
      return wx.startBluetoothDevicesDiscovery({})
    }).then((res) => {
      console.log(res);
      wx.onBluetoothDeviceFound(filterSpecifiedDevice)
    }).catch((res) => {
      console.error(`bluetooth`, res);
      wx.onBluetoothAdapterStateChange((res) => {
        console.log("bluetooth adapter state changed", res);
      })
      switch (res.errCode) {
        case 10001:
          wx.showToast({
            title: '蓝牙不可用',
            icon: 'error',
            duration: 2000
          })
      }
    })
  },
  stopScanning() {
    wx.stopBluetoothDevicesDiscovery().then((res) => {
      console.log(`stop bluetooth device discovery`, res);
    })
  },
  terminate() {
    wx.closeBluetoothAdapter().then((res) => {
      console.log(`close bluetooth adapter`, res);
    })
  },

  connect(e: WechatMiniprogram.TouchEvent) {
    deviceId = e.currentTarget.dataset.deviceId;
    wx.createBLEConnection({
      deviceId: deviceId
    }).then((res) => {
      console.log(`create ble connect`, res);
      currentPage.setData({
        connected: true,
      })
      return wx.getBLEDeviceServices({ deviceId: deviceId })
    }).catch((res) => {
      console.error(res);
    })
  },
  getServAndChar() {
    wx.getBLEDeviceServices({
      deviceId: deviceId
    }).then((res) => {
      console.log(`services from device ${deviceId}`, res);
      res.services.forEach((service) => {
        if (service.isPrimary) {
          wx.getBLEDeviceCharacteristics({
            deviceId: deviceId,
            serviceId: service.uuid,
          }).then((result) => {
            console.log(`characteristics from service ${service.uuid}`, result)
          }).catch((result) => {
            console.error(`characteristics from service ${service.uuid}`, result);
          })
        }
      })
    })
  },
  readAndNotifyAllChar() {
    wx.getBLEDeviceServices({
      deviceId: deviceId
    }).then((res) => {
      res.services.forEach((service) => {
        if (service.isPrimary) {
          wx.getBLEDeviceCharacteristics({
            deviceId: deviceId,
            serviceId: service.uuid,
          }).then((result) => {
            result.characteristics.forEach((characteristic) => {
              if (characteristic.properties.read) {
                console.log(`has read characteristic ${characteristic.uuid}`);
                wx.readBLECharacteristicValue({
                  deviceId: deviceId,
                  serviceId: service.uuid,
                  characteristicId: characteristic.uuid,
                });
              }
              if (characteristic.properties.notify) {
                console.log(`has notified characteristic ${characteristic.uuid}`);
                wx.notifyBLECharacteristicValueChange({
                  deviceId: deviceId,
                  serviceId: service.uuid,
                  characteristicId: characteristic.uuid,
                  state: true,
                })
              }
            })
          }).catch((result) => {
            console.error(`characteristics from service ${service.uuid}`, result);
          })
        }
      })
    })
  },
  listenCharValue() {
    wx.onBLECharacteristicValueChange(listenCharValueCallback)
  },
  stopListeningCharValue() {
    wx.offBLECharacteristicValueChange(listenCharValueCallback)
  },
  disconnect() {
    wx.closeBLEConnection({
      deviceId: deviceId
    }).then((res) => {
      console.log(`close ble connect`, res);
    })
  }
})

function listenCharValueCallback(res: any) {
  console.log('characteristic value comed:', res);
}


function filterSpecifiedDevice(res: any) {
  let tempDevices: Array<any> = []
  res.devices.forEach((device: any) => {
    console.log('bluetooth device found', device)
    if (device.name.startsWith("HW")) {
      tempDevices.push({
        name: device.name,
        deviceId: device.deviceId,
        rssi: device.RSSI,
        advertisData: device.advertisData,
      })
      currentPage.setData({
        scanneddDevices: tempDevices
      })
    }
  })
  console.log();
}
