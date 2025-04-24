import { DEFAULT_SHOW_BLOCK_PAGE_IP, ShowBlockPageMethod } from './constants'

export function smellShowBLockPageMethod(
  isSSLBlockPageEnabled: boolean,
  ipAddress: string
): ShowBlockPageMethod {
  if (!isSSLBlockPageEnabled) {
    return ShowBlockPageMethod.ONLY_HTTP
  }

  if (ipAddress === DEFAULT_SHOW_BLOCK_PAGE_IP) {
    return ShowBlockPageMethod.HTTP_HTTPS
  }

  return ShowBlockPageMethod.CUSTOM_IP
}
