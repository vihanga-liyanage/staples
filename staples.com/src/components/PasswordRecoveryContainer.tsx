import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  initPasswordRecovery,
  recoverPassword,
  confirmPasswordRecovery,
  resetPassword,
  initPasswordRecoveryWithMobile,
  resendOTP
} from './../Services/recoveryService';
import { getToken } from './../Services/tokenservice';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

interface PasswordRecoveryContainerProps {
  onClose: () => void;
}

const envVariables = import.meta.env;

const PasswordRecoveryContainer: React.FC<PasswordRecoveryContainerProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [otp, setOtp] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resendCode, setResendCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const tokenEndpoint = `${envVariables.VITE_BASE_URL}/oauth2/token`;
  const channelId = '2';

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken(
          tokenEndpoint,
          envVariables.VITE_CLIENT_ID,
          envVariables.VITE_CLIENT_SECRET,
          "openid internal_user_recovery_create"
        );
        setAccessToken(token);
        console.log('Access token fetched successfully:', token);
      } catch (error) {
        console.error('Error fetching token', error);
        setErrorMessage('Error fetching token');
        setStep(1);
      }
    };
    fetchToken();
  }, [tokenEndpoint, envVariables.VITE_CLIENT_ID, envVariables.VITE_CLIENT_SECRET]);

  const handleForgetPassword = async () => {
    if (!accessToken) return;

    try {
      setErrorMessage(null);
      console.log('Starting password recovery initiation');
      const response = await initPasswordRecovery(envVariables.VITE_BASE_URL, accessToken, username);
      console.log('Response from initPasswordRecovery:', response);

      if (response.status === 202) {
        console.log("Ambiguity in finding account");
        setErrorMessage(
          'We are unable to uniquely identify you based on the provided email or username. Please provide your mobile number instead.'
        );
        setStep(1.5); // New step for mobile number input
      } else if (response.status === 200) {
        console.log("Account found, proceeding with recovery");
        const data = response.data;
        handleRecover(data[0].channelInfo.recoveryCode); // Trigger the recovery method directly after finding the account
      }
    } catch (error: any) {
      console.error('Error initializing password recovery', error);
      if (error.response && error.response.status >= 400 && error.response.status < 600) {
        setErrorMessage('Error initializing password recovery. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleRecoverWithMobile = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery with mobile number');
      const response = await initPasswordRecoveryWithMobile(envVariables.VITE_BASE_URL, accessToken, mobileNumber);
      console.log('Response from initPasswordRecoveryWithMobile:', response);

      if (response.status === 200) {
        setErrorMessage(null);
        const data = response.data;
        handleRecover(data[0].channelInfo.recoveryCode); // Trigger the recovery method directly after providing the mobile number
      }
    } catch (error: any) {
      console.error('Error initializing password recovery with mobile number', error);
      if (error.response && error.response.status >= 400 && error.response.status < 600) {
        setErrorMessage('Error initializing password recovery with mobile number. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleRecover = async (recoveryCodeUpdated: string) => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery confirmation');
      const data = await recoverPassword(envVariables.VITE_BASE_URL, accessToken, recoveryCodeUpdated, channelId);
      console.log('Response from recoverPassword:', data);

      if (data.flowConfirmationCode) {
        setConfirmationCode(data.flowConfirmationCode);
        setStep(2); // Move to step 2 to validate OTP
      }

      if (data.resendCode) {
        setResendCode(data.resendCode);
      }
    } catch (error: any) {
      console.error('Error recovering password', error);
      if (error.response && error.response.status >= 400 && error.response.status < 600) {
        setErrorMessage('Error recovering password. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleConfirm = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery confirmation with OTP');
      const data = await confirmPasswordRecovery(envVariables.VITE_BASE_URL, accessToken, confirmationCode, otp);
      console.log('Response from confirmPasswordRecovery:', data);

      if (data.resetCode) {
        setResetCode(data.resetCode);
        setStep(3); // Move to step 3 to reset the password
      }
    } catch (error: any) {
      console.error('Error confirming password recovery', error);
      if (error.response && error.response.status >= 400 && error.response.status < 600) {
        setErrorMessage('OTP confirmation has failed. Please try again.');
        setStep(2.5); // Move to step 2.5 for resending OTP
      }
    }
  };

  const handleResendOtp = async () => {
    if (!accessToken) return;

    try {
      console.log('Resending OTP');
      const data = await resendOTP(envVariables.VITE_BASE_URL, accessToken, resendCode, channelId);
      console.log('Response from recoverPassword (resend):', data);

      if (data.flowConfirmationCode) {
        setConfirmationCode(data.flowConfirmationCode);
        setErrorMessage(null);
        setStep(2); // Move back to step 2 to enter the new OTP
      }
    } catch (error: any) {
      console.error('Error resending OTP', error);
      if (error.response && error.response.status >= 400 && error.response.status < 600) {
        setErrorMessage('Error resending OTP. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleReset = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password reset');
      const response = await resetPassword(envVariables.VITE_BASE_URL, accessToken, resetCode, confirmationCode, newPassword);

      if (response.status === 200) {
        setStep(4); // Move to step 4 to show success message
      }
    } catch (error: any) {
      console.error('Error resetting password', error);
      if (error.response && error.response.status >= 400 && error.response.status < 600) {
        setErrorMessage('Error resetting password. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleLoginRedirect = () => {
    // Implement the logic to redirect to the login page
    console.log('Redirecting to login page...');
    onClose();
  };

  const resolveTitle = () => {
    switch (step) {
      case 1:
        return 'Forgot password?';
      case 1.5:
        return 'Provide Mobile Number';
      case 2:
        return 'Recover Password';
      case 2.5:
          return 'OTP Validation failed.';
      case 3:
        return 'Reset Your Password';
      case 4:
        return 'Password Reset Successful';
      default:
        return 'Forgot password?';
    }
  };

  const resolveDescription = () => {
    switch (step) {
      case 1:
        return 'It happens. Don\'t worry. Please provide your email or username and we\'ll help you resetting your password.';
      case 1.5:
        return 'Please provide your mobile number to proceed with password recovery.';
      case 2:
        return 'An OTP has been sent to your mobile. Please enter the OTP below to proceed resetting your password.';
      case 2.5:
        return 'Please check the OTP sent to your mobile and try again. Ensure you have entered the correct code.';
      case 3:
        return 'Enter your new password below to reset your password.';
      case 4:
        return 'Your password has been reset successfully. You can now log in with your new password.';
      default:
        return 'It happens. Don\'t worry. Please provide your email or username and we\'ll help you resetting your password.';
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className='sign-up-box-container'>
      <h5 className='sign-up-title'>{resolveTitle()}</h5>
      <div className='back-to-sign-in-container' onClick={() => onClose()}>
        <ArrowBackOutlinedIcon />
        <Typography variant='body2'>  Back to Sign in</Typography>
      </div>
      <Typography
        variant="body2"
        color="textSecondary"
        style={{ marginTop: '20px', marginBottom: '10px' }}
      >
        {resolveDescription()}
      </Typography>
      {step === 1 && (
        <>
          <label htmlFor="username">Username or Email</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username or email"
          />
          {errorMessage && <Alert severity="error" style={{ marginTop: '10px' }}>{errorMessage}</Alert>}
          <div className='button-container'>
            <a href="#" style={{ color: "black" }} onClick={() => onClose()}>
              Cancel
            </a>
            <Button
              variant='outlined'
              className='form-primary-button'
              onClick={() => { handleForgetPassword(); }}
            >
              Submit
            </Button>
          </div>
        </>
      )}
      {step === 1.5 && (
        <>
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
            placeholder="Enter your mobile number"
          />
          {errorMessage && <Alert severity="warning" style={{ marginTop: '20px' }}>{errorMessage}</Alert>}
          <div className='button-container'>
            <a href="#" style={{ color: "black" }} onClick={() => onClose()}>
              Cancel
            </a>
            <Button
              variant='outlined'
              className='form-primary-button'
              onClick={() => { handleRecoverWithMobile(); }}
            >
              Submit
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <label htmlFor="otp">OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter your OTP"
          />
          <div className='button-container'>
            <a href="#" style={{ color: "black" }} onClick={() => onClose()}>
              Cancel
            </a>
            <Button
              variant='outlined'
              className='form-primary-button'
              onClick={() => { handleConfirm(); }}
            >
              Confirm OTP
            </Button>
          </div>
        </>
      )}
      {step === 2.5 && (
        <>
          {errorMessage && <Alert severity="error" style={{ marginTop: '20px' }}>{errorMessage}</Alert>}
          <div className='button-container'>
            <a href="#" style={{ color: "black" }} onClick={() => onClose()}>
              Cancel
            </a>
            <Button
              variant='outlined'
              className='form-primary-button'
              onClick={() => { handleResendOtp(); }}
            >
              Resend OTP
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <TextField
            type={showPassword ? "text" : "password"}
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <div className='button-container'>
            <a href="#" style={{ color: "black" }} onClick={() => onClose()}>
              Cancel
            </a>
            <Button
              variant='outlined'
              className='form-primary-button'
              onClick={() => { handleReset(); }}
            >
              Reset password
            </Button>
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <Button
            variant='outlined'
            className='form-primary-button'
            onClick={() => { handleLoginRedirect(); }}
          >
            Go to login
          </Button>
        </>
      )}
    </div>
  );
};

export default PasswordRecoveryContainer;
