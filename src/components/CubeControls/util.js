const CubeCommand = Object.freeze({
  RESET: { type: 'REQUEST_RESET' },
  HARDWARE: { type: 'REQUEST_HARDWARE' },
  FACELETS: { type: 'REQUEST_FACELETS' },
  BATTERY: { type: 'REQUEST_BATTERY' },
});

const CubeEventType = Object.freeze({
  FACELETS: 'FACELETS',
  MOVE: 'MOVE',
  GYRO: 'GYRO',
  BATTERY: 'BATTERY',
  HARDWARE: 'HARDWARE',
});

const customMacAddressProvider = async (device, isFallbackCall) => {
  if (isFallbackCall) {
    return prompt(
      'Unable do determine cube MAC address!\nPlease enter MAC address manually:',
    );
  } else {
    const savedMac = localStorage.getItem('cubeMacAddress') || '';
    return typeof device.watchAdvertisements == 'function'
      ? null
      : prompt(
        'Seems like your browser does not support Web Bluetooth watchAdvertisements() API. Enable following flag in Chrome:\n\nchrome://flags/#enable-experimental-web-platform-features\n\nor enter cube MAC address manually:',
        savedMac
      );
  }
};

export { customMacAddressProvider, CubeCommand, CubeEventType };


/**
 * Сравнивает две строки, игнорируя символы '*' в строке-шаблоне.
 * @param {string} faceletString - Текущее состояние куба в виде строки из 54 символов.
 * @param {string} patternString - Шаблон для проверки, где '*' - любой символ.
 * @returns {boolean} - Возвращает true, если состояние соответствует шаблону.
 */
export function matchesPattern(faceletString, patternString) {
  if (faceletString.length !== patternString.length) {
    return false;
  }

  for (let i = 0; i < patternString.length; i++) {
    const patternChar = patternString[i];

    if (patternChar !== '*' && patternChar !== faceletString[i]) {
      return false;
    }
  }

  return true;
}
