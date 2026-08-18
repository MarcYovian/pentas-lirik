/**
 * Utility functions for detecting whether PentasLirik is running
 * in a Local Environment (Venue/Offline) or Cloud VPS.
 */

export type EnvironmentType = 'local' | 'cloud';

export interface EnvironmentInfo {
  type: EnvironmentType;
  label: string;
  hostname: string;
  isLocal: boolean;
  description: string;
}

/**
 * Determine if current host is running locally (localhost, loopback, private LAN) or on a Cloud VPS.
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'local',
      label: 'LOCAL MODE',
      hostname: 'localhost',
      isLocal: true,
      description: 'Server lokal PentasLirik',
    };
  }

  const hostname = window.location.hostname;

  // Local detection patterns:
  // - 'localhost' or '127.0.0.1' or '0.0.0.0'
  // - '.local' mDNS domain
  // - Private IP ranges: 192.168.x.x, 10.x.x.x, 172.16.x.x - 172.31.x.x
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  if (isLocal) {
    return {
      type: 'local',
      label: 'LOCAL MODE',
      hostname,
      isLocal: true,
      description: `Berjalan di server lokal venue (${hostname})`,
    };
  }

  return {
    type: 'cloud',
    label: 'CLOUD VPS',
    hostname,
    isLocal: false,
    description: `Terhubung ke server online VPS (${hostname})`,
  };
}

export function isLocalEnvironment(): boolean {
  return getEnvironmentInfo().isLocal;
}
