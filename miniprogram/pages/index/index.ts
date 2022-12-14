const app = getApp<IAppOption>()
interface Data {
  scanneddDevices: Array<any>;
  connected: boolean
}
interface Custom {
  scan: () => void;
  stopScanning: () => void;
  terminate: () => void;

  connect: (e: WechatMiniprogram.TouchEvent) => void;
  getServAndChar: () => void;
  readAndNotifyAllChar: () => void;
  listenCharValue: () => void;
  stopListeningCharValue: () => void;
  disconnect: () => void;
}
let currentPage: WechatMiniprogram.Page.Instance<Data, Custom>
Page({
  data: {
    scanneddDevices: [],
    connected: false
  },
  onLoad() {
    currentPage = this;
    wx.onBluetoothAdapterStateChange((res) => {
      console.log("bluetooth adapter state changed", res);
    })
    wx.onBLEConnectionStateChange((res) => {
      console.log("ble connect state change", res)
    })
  },
  scan() {
    wx.openBluetoothAdapter({
      // mode: 'central',
    }).then((res) => {
      console.log(`wx.openBluetoothAdapter`, res);
      // 开始搜索附近的蓝牙外围设备
      return wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true
      })
    }).then((res) => {
      console.log(res);
      wx.onBluetoothDeviceFound(filterSpecifiedDevice)
    }).catch((res) => {
      console.error(`bluetooth`, res);
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
      currentPage.setData({
        connected: false
      })
    })
  },

  connect(e: WechatMiniprogram.TouchEvent) {
    app.globalData.deviceId = e.currentTarget.dataset.deviceId;
    wx.createBLEConnection({
      deviceId: app.globalData.deviceId
    }).then((res) => {
      console.log(`create ble connect`, res);
      currentPage.setData({
        connected: true,
        scanneddDevices: [],
      })
      return wx.getBLEDeviceServices({ deviceId: app.globalData.deviceId })
    }).catch((res) => {
      console.error(res);
    })
  },
  getServAndChar() {
    wx.getBLEDeviceServices({
      deviceId: app.globalData.deviceId
    }).then((res) => {
      console.log(`services from device ${app.globalData.deviceId}`, res);
      res.services.forEach((service) => {
        if (service.isPrimary) {
          wx.getBLEDeviceCharacteristics({
            deviceId: app.globalData.deviceId,
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
  findReadableChar() {
    handleWithCharProperties(
      (res) => {
        console.log(`readable`, res);
      },
      () => { },
      () => { }
    )
  },
  findNotifiableChar() {
    handleWithCharProperties(
      () => { },
      (res) => {
        console.log(`notifiable`, res);
      },
      () => { }
    )

  },
  findWritableChar() {
    handleWithCharProperties(
      () => { },
      () => { },
      (res) => {
        console.log(`writable`, res);
      },
    )
  },
  readAndNotifyAllChar() {
    wx.getBLEDeviceServices({
      deviceId: app.globalData.deviceId
    }).then((res) => {
      res.services.forEach((service) => {
        if (service.isPrimary) {
          wx.getBLEDeviceCharacteristics({
            deviceId: app.globalData.deviceId,
            serviceId: service.uuid,
          }).then((result) => {
            result.characteristics.forEach((characteristic) => {
              if (characteristic.properties.read) {
                console.log(`has read characteristic ${characteristic.uuid}`);
                wx.readBLECharacteristicValue({
                  deviceId: app.globalData.deviceId,
                  serviceId: service.uuid,
                  characteristicId: characteristic.uuid,
                });
              }
              if (characteristic.properties.notify) {
                console.log(`has notified characteristic ${characteristic.uuid}`);
                wx.notifyBLECharacteristicValueChange({
                  deviceId: app.globalData.deviceId,
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
  navToHw807() {
    wx.navigateTo({
      url: "/pages/hw807/hw807"
    }).then()
  },
  disconnect() {
    wx.closeBLEConnection({
      deviceId: app.globalData.deviceId
    }).then((res) => {
      console.log(`close ble connect`, res);
      currentPage.setData({
        connected: false
      })
    })
  }
})

function listenCharValueCallback(res: any) {
  console.log('characteristic value comed:', res);
}


function filterSpecifiedDevice(res: any) { // 不用担心push内容重复，每一轮discovery都会调用该函数，该函数调用的时候已经初始化`tempDevices`
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

function handleWithCharProperties(readableCallback: (res: any) => void, notifiableCallback: (res: any) => void, writableCallback: (res: any) => void) {
  wx.getBLEDeviceServices({
    deviceId: app.globalData.deviceId
  }).then((res) => {
    console.log(`services from device ${app.globalData.deviceId}`, res);
    res.services.forEach((service) => {
      if (service.isPrimary) {
        wx.getBLEDeviceCharacteristics({
          deviceId: app.globalData.deviceId,
          serviceId: service.uuid,
        }).then((result) => {
          result.characteristics.forEach((item) => {
            if (item.properties.read) {
              readableCallback(item)
            }
            if (item.properties.notify) {
              notifiableCallback(item)
            }
            if (item.properties.write) {
              writableCallback(item)
            }
          })
        }).catch((result) => {
          console.error(`characteristics from service ${service.uuid}`, result);
        })
      }
    })
  })
}

export { }