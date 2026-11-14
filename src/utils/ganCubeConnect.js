import { connectGanCube } from 'gan-web-bluetooth';

export const LAST_CUBE_DEVICE_ID_KEY = 'cubeBluetoothDeviceId';
export const LAST_CUBE_DEVICE_NAME_KEY = 'cubeDeviceName';

const GAN_NAME_PREFIXES = ['GAN', 'MG', 'AiCube'];

const isGanCubeName = (name = '') => GAN_NAME_PREFIXES.some((prefix) => name.startsWith(prefix));

export const canUseSilentBluetoothReconnect = () =>
  typeof navigator.bluetooth?.getDevices === 'function';

export const getStoredCubeIdentity = () => ({
  deviceId: localStorage.getItem(LAST_CUBE_DEVICE_ID_KEY) || '',
  deviceName: localStorage.getItem(LAST_CUBE_DEVICE_NAME_KEY) || '',
});

export const rememberCubeIdentity = ({ deviceId, deviceName } = {}) => {
  if (deviceId) localStorage.setItem(LAST_CUBE_DEVICE_ID_KEY, deviceId);
  if (deviceName) localStorage.setItem(LAST_CUBE_DEVICE_NAME_KEY, deviceName);
};

export async function getPermittedGanCubes() {
  if (!canUseSilentBluetoothReconnect()) return [];
  try {
    const devices = await navigator.bluetooth.getDevices();
    return devices.filter((device) => isGanCubeName(device.name || ''));
  } catch (error) {
    console.warn('Unable to list permitted Bluetooth devices', error);
    return [];
  }
}

export async function findPermittedCube({ deviceId, deviceName } = {}) {
  const devices = await getPermittedGanCubes();
  if (devices.length === 0) return null;

  const stored = getStoredCubeIdentity();
  const id = deviceId || stored.deviceId;
  const name = deviceName || stored.deviceName;

  return (
    (id && devices.find((device) => device.id === id)) ||
    (name && devices.find((device) => device.name === name)) ||
    devices[0] ||
    null
  );
}

export async function connectGanCubeToDevice(device, macAddressProvider) {
  if (!device) {
    return connectGanCube(macAddressProvider);
  }

  const bluetooth = navigator.bluetooth;
  const originalRequestDevice = bluetooth.requestDevice.bind(bluetooth);
  bluetooth.requestDevice = async () => device;

  try {
    return await connectGanCube(macAddressProvider);
  } finally {
    bluetooth.requestDevice = originalRequestDevice;
  }
}

export async function rememberConnectedCube(connection, bluetoothDevice) {
  if (bluetoothDevice?.id) {
    rememberCubeIdentity({
      deviceId: bluetoothDevice.id,
      deviceName: bluetoothDevice.name || connection?.deviceName || '',
    });
    return;
  }

  const match = await findPermittedCube({ deviceName: connection?.deviceName });
  if (match) {
    rememberCubeIdentity({
      deviceId: match.id,
      deviceName: match.name || connection?.deviceName || '',
    });
  } else if (connection?.deviceName) {
    rememberCubeIdentity({ deviceName: connection.deviceName });
  }
}
