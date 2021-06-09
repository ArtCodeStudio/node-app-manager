import { RegisterSSLLetsEncrypt } from './register-ssl-letsencrypt';

export interface RegisterSSL {
  key?: string;
  cert?: string;
  letsencrypt?: RegisterSSLLetsEncrypt;
}
