export {
	getIntBit,
	str2ascii,
	str2byte,
	ab2hex,
	str2ab,
	inArray,
	byte2hexStr,
	hex2str
}
/**
 * 获取bit字节
 */
function getIntBit(dataNumber, startBit, endBit) {
	if (startBit < 0 || startBit > 15) {
		return 0;
	}
	if (endBit < 0 || endBit > 15) {
		return 0;
	}
	if (startBit > endBit) {
		return 0;
	}
	return (dataNumber & (0xFFFF >> (15 - endBit))) >> startBit;
}
/**
 * 字符串转ascii码
 */
function str2ascii(str) {
	var ascii = "";
	for (i = 0; i < str.length; i++) {
		ascii += str[i].charCodeAt();
	}
	return ascii;
}

export function convertIntToByte(num) {
	var b = num & 0xFF;
	var c = 0;
	if (b >= 128) {
		c = b % 128;
		c = -1 * (128 - c);
	} else {
		c = b;
	}
	return c;
}
//字符串转byte数组
function str2byte(str) {
	var bytes = new Array();
	var len, c;
	len = str.length;
	for (var i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if (c >= 0x010000 && c <= 0x10FFFF) {
			bytes.push(((c >> 18) & 0x07) | 0xF0);
			bytes.push(((c >> 12) & 0x3F) | 0x80);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if (c >= 0x000800 && c <= 0x00FFFF) {
			bytes.push(((c >> 12) & 0x0F) | 0xE0);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if (c >= 0x000080 && c <= 0x0007FF) {
			bytes.push(((c >> 6) & 0x1F) | 0xC0);
			bytes.push((c & 0x3F) | 0x80);
		} else {
			bytes.push(c & 0xFF);
		}
	}
	return bytes;
}
/**
 * unicode string to utf-8
 * @param text 字符串
 * @returns {*} utf-8编码
 */
function toBytes(text) {
	var result = [],
		i = 0;
	text = encodeURI(text);
	while (i < text.length) {
		var c = text.charCodeAt(i++);

		// if it is a % sign, encode the following 2 bytes as a hex value
		if (c === 37) {
			result.push(parseInt(text.substr(i, 2), 16))
			i += 2;

			// otherwise, just the actual byte
		} else {
			result.push(c)
		}
	}
	return coerceArray(result);
}
/**
 * utf8 byte to unicode string
 * @param utf8Bytes
 * @returns {string}
 */
function utf8ByteToUnicodeStr(utf8Bytes) {
	var unicodeStr = "";
	for (var pos = 0; pos < utf8Bytes.length;) {
		var flag = utf8Bytes[pos];
		var unicode = 0;
		if ((flag >>> 7) === 0) {
			unicodeStr += String.fromCharCode(utf8Bytes[pos]);
			pos += 1;
		} else if ((flag & 0xFC) === 0xFC) {
			unicode = (utf8Bytes[pos] & 0x3) << 30;
			unicode |= (utf8Bytes[pos + 1] & 0x3F) << 24;
			unicode |= (utf8Bytes[pos + 2] & 0x3F) << 18;
			unicode |= (utf8Bytes[pos + 3] & 0x3F) << 12;
			unicode |= (utf8Bytes[pos + 4] & 0x3F) << 6;
			unicode |= (utf8Bytes[pos + 5] & 0x3F);
			unicodeStr += String.fromCodePoint(unicode);
			pos += 6;
		} else if ((flag & 0xF8) === 0xF8) {
			unicode = (utf8Bytes[pos] & 0x7) << 24;
			unicode |= (utf8Bytes[pos + 1] & 0x3F) << 18;
			unicode |= (utf8Bytes[pos + 2] & 0x3F) << 12;
			unicode |= (utf8Bytes[pos + 3] & 0x3F) << 6;
			unicode |= (utf8Bytes[pos + 4] & 0x3F);
			unicodeStr += String.fromCodePoint(unicode);
			pos += 5;
		} else if ((flag & 0xF0) === 0xF0) {
			unicode = (utf8Bytes[pos] & 0xF) << 18;
			unicode |= (utf8Bytes[pos + 1] & 0x3F) << 12;
			unicode |= (utf8Bytes[pos + 2] & 0x3F) << 6;
			unicode |= (utf8Bytes[pos + 3] & 0x3F);
			unicodeStr += String.fromCodePoint(unicode);
			pos += 4;
		} else if ((flag & 0xE0) === 0xE0) {
			unicode = (utf8Bytes[pos] & 0x1F) << 12;;
			unicode |= (utf8Bytes[pos + 1] & 0x3F) << 6;
			unicode |= (utf8Bytes[pos + 2] & 0x3F);
			unicodeStr += String.fromCharCode(unicode);
			pos += 3;
		} else if ((flag & 0xC0) === 0xC0) { //110
			unicode = (utf8Bytes[pos] & 0x3F) << 6;
			unicode |= (utf8Bytes[pos + 1] & 0x3F);
			unicodeStr += String.fromCharCode(unicode);
			pos += 2;
		} else {
			unicodeStr += String.fromCharCode(utf8Bytes[pos]);
			pos += 1;
		}
	}
	return unicodeStr;
}
/**
 * 检查是否为数字
 */
function checkInt(value) {
	return (parseInt(value) === value);
}

function checkInts(arrayish) {
	if (!checkInt(arrayish.length)) {
		return false;
	}

	for (var i = 0; i < arrayish.length; i++) {
		if (!checkInt(arrayish[i]) || arrayish[i] < 0 || arrayish[i] > 255) {
			return false;
		}
	}
	return true;
}

function coerceArray(arg, copy) {
	// ArrayBuffer view
	if (arg.buffer && arg.name === 'Uint8Array') {
		if (copy) {
			if (arg.slice) {
				arg = arg.slice();
			} else {
				arg = Array.prototype.slice.call(arg);
			}
		}
		return arg;
	}
	// It's an array; check it is a valid representation of a byte
	if (Array.isArray(arg)) {
		if (!checkInts(arg)) {
			throw new Error('Array contains invalid value: ' + arg);
		}
		return new Uint8Array(arg);
	}
	// Something else, but behaves like an array (maybe a Buffer? Arguments?)
	if (checkInt(arg.length) && checkInts(arg)) {
		return new Uint8Array(arg);
	}
	throw new Error('unsupported array-like object');
}

/**
 * byte转16进制字符
 */
function byte2hexStr(byteBuffer) {
	var str = "";
	var arrBytes = new Uint8Array(byteBuffer);
	for (var i = 0; i < arrBytes.length; i++) {
		var tmp;
		var num = arrBytes[i];
		if (num < 0) {
			//此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
			tmp = (255 + num + 1).toString(16);
		} else {
			tmp = num.toString(16);
		}
		if (tmp.length == 1) {
			tmp = "0" + tmp;
		}
		if (i > 0) {
			str += ":" + tmp;
		} else {
			str += tmp;
		}
	}
	return str;
}
/**
 * 检查array是否包含某个值
 */
function inArray(arr, key, val) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i][key] === val) {
			return i;
		}
	}
	return -1;
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function (bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join('');
}

function str2ab(str) {
	var buf = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i)
	}
	return buf
}

/** bufferArray hex -> str */
function hex2str(hex) {
	var hexStr = "";
	for (var i = 0; i < hex.length; i++) {
		hexStr += String.fromCharCode(hex[i]);
	}
	return hexStr;
}