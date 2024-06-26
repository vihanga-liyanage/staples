import axios from 'axios';

export const getToken = async (tokenUrl: string, clientId: string, clientSecret: string, scopes: string): Promise<string> => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', scopes);


  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching token', error);
    throw error;
  }
};
