export interface RegisterSSLLetsEncrypt {
  /**
   *  Domain owner/admin email
   */
  email: string;
  /**
   *  WARNING: Only use this flag when the proxy is verified to work correctly to avoid being banned!
   */
  production: boolean;
}
