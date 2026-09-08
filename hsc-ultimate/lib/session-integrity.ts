export interface CurrentAccountState {
  isBanned: boolean;
  authVersion: number;
}

export function isSessionRevoked(
  sessionAuthVersion: number,
  current: CurrentAccountState | null | undefined
) {
  return !current || current.isBanned || current.authVersion !== sessionAuthVersion;
}
