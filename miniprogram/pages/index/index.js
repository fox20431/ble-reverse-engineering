Page({
  scan() {
    wx.openBluetoothAdapter({
      // mode: 'central',
    }).then((res) => {
      console.log(`wx.openBluetoothAdapter`, res);
      // 开始搜索附近的蓝牙外围设备
      return wx.startBluetoothDevicesDiscovery()
    }).then((res) => {
      console.log(res);
      wx.onBluetoothDeviceFound(filterSpecifiedDevice)
    }).catch((res) => {
      console.error(`bluetooth`,res);
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
      Promise.reject() // stop promise
    }
    )
  }
})

function filterSpecifiedDevice(res) {
  res.devices.forEach((device) => {
    console.log('bluetooth device found', device)
  })
  console.log();
}