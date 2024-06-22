// src/services/authService.ts

import { default as authConfig } from "../config.json";
import axios from 'axios';

const TOKEN_EXCHANGE_URL = `${authConfig.baseUrl}/oauth2/token`;

interface TokenExchangeParams {
  subjectToken: string;
  idToken: string;
}

export const generateAuthUrl = (
  selectedUserId: string,
  otherRequiredScopes: string,
  nonce: string = "asdfwe34",
  state: string = "sample_state"
): string => {
  const baseUrl = `${authConfig.PICURL}/oauth2/authorize`;
  const params = new URLSearchParams({
    response_type: "id_token subject_token",
    redirect_uri: authConfig.staplesB2CAppPath,
    client_id: authConfig.staplesB2CClientID,
    state: state,
    scope: `internal_user_impersonate openid ${otherRequiredScopes}`,
    requested_subject: selectedUserId,
    nonce: nonce,
    fidp: 'staplesCorporateIDP'
  });
    
  return `${baseUrl}?${params.toString()}`;
};

export const exchangeToken = async (jwtToken: string) => {
  const clientId = authConfig.tokenExchangeAppClientID;
  const clientSecret = authConfig.tokenExchangeAppClientSecret;
  const base64Credentials = btoa(`${clientId}:${clientSecret}`);
  
  const url = `${authConfig.PICURL}/oauth2/token`;
  const data = new URLSearchParams();
  data.append('subject_token', jwtToken);
  data.append('subject_token_type', 'urn:ietf:params:oauth:token-type:jwt');
  data.append('requested_token_type', 'urn:ietf:params:oauth:token-type:access_token');
  data.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
  data.append('scope', 'internal_user_mgt_list');

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Credentials}`,
      },
    });

    return response.data.access_token;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.error_description || err.message);
    } else {
      console.log('An unexpected error occurred');
    }
  }
};
