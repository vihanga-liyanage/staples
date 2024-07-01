import axios from 'axios';

const PASSWORD_RECOVERY_ENDPOINT = "/api/users/v2/recovery/password";

// Function to initialize password recovery
export const initPasswordRecovery = async (baseUrl: string, accessToken: string, identifier: string) => {

  try {
    const response = await axios.post(`${baseUrl}${PASSWORD_RECOVERY_ENDPOINT}/init`, {
      claims: [
        {
          uri: "http://wso2.org/claims/username",
          value: identifier
        },
        {
          uri: "http://wso2.org/claims/emailaddress",
          value: identifier
        }
      ],
      properties: [
        {
          key: "multiAttributeRecoveryEnabled",
          value: "true"
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error initializing password recovery', error);
    throw error;
  }
};

// Function to initialize password recovery
export const initPasswordRecoveryWithMobile = async (baseUrl: string, accessToken: string, mobile: string) => {
  try {
    const response = await axios.post(`${baseUrl}${PASSWORD_RECOVERY_ENDPOINT}/init`, {
      claims: [
        {
          uri: "http://wso2.org/claims/mobile",
          value: mobile
        }
      ],
      properties: [
        {
          key: "multiAttributeRecoveryEnabled",
          value: "true"
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error initializing password recovery', error);
    throw error;
  }
};

// Function to recover password
export const recoverPassword = async (baseUrl: string, accessToken: string, recoveryCode: string, channelId: string) => {
  try {
    const response = await axios.post(`${baseUrl}${PASSWORD_RECOVERY_ENDPOINT}/recover`, {
      recoveryCode,
      channelId
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error recovering password', error);
    throw error;
  }
};

// Function to confirm password recovery
export const confirmPasswordRecovery = async (baseUrl: string, accessToken: string, confirmationCode: string, otp: string) => {
  try {
    const response = await axios.post(`${baseUrl}${PASSWORD_RECOVERY_ENDPOINT}/confirm`, {
      confirmationCode,
      otp
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming password recovery', error);
    throw error;
  }
};

export const resendOTP = async (baseUrl: string, accessToken: string, resendCode: string) => {
  try {
    const response = await axios.post(`${baseUrl}${PASSWORD_RECOVERY_ENDPOINT}/resend`, {
      resendCode,
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP', error);
    throw error;
  }
};

// Function to reset password
export const resetPassword = async (baseUrl: string, accessToken: string, resetCode: string, flowConfirmationCode: string, newPassword: string) => {
  try {
    const response = await axios.post(`${baseUrl}${PASSWORD_RECOVERY_ENDPOINT}/reset`, {
      resetCode,
      flowConfirmationCode,
      password: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error resetting password', error);
    throw error;
  }
};
