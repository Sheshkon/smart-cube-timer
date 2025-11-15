import AndroidNotification from 'src/components/InfoPanel/notification/AndroidNotification.jsx';
import IsIosNotSupportedNotification from 'src/components/InfoPanel/notification/IosNotSupportedNotification.jsx';
import UnsupportedNotification from 'src/components/InfoPanel/notification/UnsupportedNotification.jsx';

export const notifications = [
  {
    id: 'ios-warning',
    type: 'warning',
    content: <IsIosNotSupportedNotification />,
    shouldShow: () => {
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isBluefy = /Bluefy/i.test(navigator.userAgent);

      return isIOS && !isBluefy;
    },
  },

  {
    id: 'unsupported-warning',
    type: 'warning',
    content: <UnsupportedNotification />,
    shouldShow: () => {
      const isSupported =
        typeof BluetoothDevice !== 'undefined' &&
        'watchAdvertisements' in BluetoothDevice.prototype;
      return !isSupported;
    },
  },

  {
    id: 'android-success',
    type: 'success',
    content: <AndroidNotification />,
    shouldShow: () => {
      if (typeof window === 'undefined') return false;
      return /Android/.test(navigator.userAgent);
    },
  },
].filter((notification) => notification.shouldShow());
