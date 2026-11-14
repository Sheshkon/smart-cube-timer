import db from 'src/db/db.js';

const UNKNOWN_MAC = 'unknown';

const cubeKey = (mac) => (mac && String(mac).trim() !== '' ? String(mac).trim() : UNKNOWN_MAC);

export const formatDuration = (milliseconds, { ongoing = false } = {}) => {
  if (milliseconds == null || Number.isNaN(milliseconds) || milliseconds < 0) {
    return ongoing ? '0s' : '—';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const sessionDurationMs = (session, now = Date.now()) => {
  if (session.durationMs != null) return session.durationMs;
  if (!session.connectedAt) return null;
  const end = session.disconnectedAt || now;
  return Math.max(0, end - session.connectedAt);
};

export const cubeHistoryService = {
  async startSession({ deviceMAC, deviceName, hardwareName, hardwareVersion, softwareVersion, gyroSupported } = {}) {
    const connectedAt = Date.now();
    const id = await db.cubeConnectionSessions.add({
      deviceMAC: cubeKey(deviceMAC),
      deviceName: deviceName || '',
      hardwareName: hardwareName || '',
      hardwareVersion: hardwareVersion || '',
      softwareVersion: softwareVersion || '',
      gyroSupported: gyroSupported || '',
      connectedAt,
      disconnectedAt: null,
      durationMs: null,
      endedBy: null,
    });
    return id;
  },

  async updateSession(id, patch) {
    if (!id) return;
    const existing = await db.cubeConnectionSessions.get(id);
    if (!existing || existing.disconnectedAt) return;
    await db.cubeConnectionSessions.update(id, patch);
  },

  async endSession(id, endedBy = 'user') {
    if (!id) return;
    const existing = await db.cubeConnectionSessions.get(id);
    if (!existing || existing.disconnectedAt) return;

    const disconnectedAt = Date.now();
    await db.cubeConnectionSessions.update(id, {
      disconnectedAt,
      durationMs: Math.max(0, disconnectedAt - existing.connectedAt),
      endedBy,
    });
  },

  async closeDanglingSessions({ before = Date.now(), excludeId } = {}) {
    const openSessions = await db.cubeConnectionSessions
      .filter(
        (session) =>
          !session.disconnectedAt &&
          session.connectedAt < before &&
          session.id !== excludeId
      )
      .toArray();
    await Promise.all(
      openSessions.map((session) =>
        db.cubeConnectionSessions.update(session.id, {
          disconnectedAt: session.connectedAt,
          durationMs: 0,
          endedBy: 'interrupted',
        })
      )
    );
  },

  async getRecentSessions(limit = 100) {
    return db.cubeConnectionSessions.orderBy('connectedAt').reverse().limit(limit).toArray();
  },

  async getCubeSummaries(now = Date.now()) {
    const sessions = await db.cubeConnectionSessions.orderBy('connectedAt').reverse().toArray();
    const byMac = new Map();

    sessions.forEach((session) => {
      const mac = cubeKey(session.deviceMAC);
      const current = byMac.get(mac) || {
        deviceMAC: mac,
        deviceName: session.deviceName,
        hardwareName: session.hardwareName,
        hardwareVersion: session.hardwareVersion,
        softwareVersion: session.softwareVersion,
        gyroSupported: session.gyroSupported,
        sessionCount: 0,
        totalDurationMs: 0,
        lastConnectedAt: session.connectedAt,
        lastDisconnectedAt: session.disconnectedAt,
        live: false,
      };

      current.sessionCount += 1;
      current.totalDurationMs += sessionDurationMs(session, now) || 0;
      if (!current.deviceName && session.deviceName) current.deviceName = session.deviceName;
      if (!current.hardwareName && session.hardwareName) current.hardwareName = session.hardwareName;
      if (session.connectedAt >= current.lastConnectedAt) {
        current.lastConnectedAt = session.connectedAt;
        current.lastDisconnectedAt = session.disconnectedAt;
        current.live = !session.disconnectedAt;
        current.deviceName = session.deviceName || current.deviceName;
        current.hardwareName = session.hardwareName || current.hardwareName;
        current.hardwareVersion = session.hardwareVersion || current.hardwareVersion;
        current.softwareVersion = session.softwareVersion || current.softwareVersion;
        current.gyroSupported = session.gyroSupported || current.gyroSupported;
      }

      byMac.set(mac, current);
    });

    return [...byMac.values()];
  },

  async deleteAll() {
    return db.cubeConnectionSessions.clear();
  },

  sessionDurationMs,
};
