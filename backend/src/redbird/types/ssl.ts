export interface RedbirdSSL {
  http2?: boolean;
  redirect?: boolean;
  key?: string;
  cert?: string;
  /**
   * SSL port used to serve registered https routes with LetsEncrypt certificate.
   */
  port: number;
  letsencrypt?: {
    path: string;
    port: number;
  };
}
