import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Alert } from '@mui/material';
import { initPasswordRecovery, recoverPassword, confirmPasswordRecovery, resetPassword, initPasswordRecoveryWithMobile } from './../Services/recoveryService';
import { getToken } from './../Services/tokenservice'; 
import staplesBackground from '../assets/images/staples-background.png'; // Add a suitable background image

interface PasswordRecoveryContainerProps {
  baseUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  onClose: () => void;
}

const PasswordRecoveryContainer: React.FC<PasswordRecoveryContainerProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [otp, setOtp] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [flowConfirmationCode, setFlowConfirmationCode] = useState('');
  const [channelId, setChannelId] = useState('2'); // Assuming default channelId for mobile
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const baseUrl = "https://sandbox.play.picdemo.cloud/";
  const tokenEndpoint = "https://sandbox.play.picdemo.cloud/oauth2/token";
  const backEndClientSecret = "xeg4fdDVPQMdrmqJvZO1KffiMNYwjXj6eXlL7g9ymr4a";
  const backEndClientID = "R2UeUiX3c29moVEeLJN8DcMSmLsa";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken(tokenEndpoint, backEndClientID, backEndClientSecret, "openid internal_user_recovery_create");
        setAccessToken(token);
        console.log('Access token fetched successfully:', token);
      } catch (error) {
        console.error('Error fetching token', error);
        setErrorMessage('Error fetching token');
        setStep(1);
      }
    };
    fetchToken();
  }, [tokenEndpoint, backEndClientID, backEndClientSecret]);

  const handleForgetPassword = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery initiation');
      const response = await initPasswordRecovery(baseUrl, accessToken, username);
      console.log('Response from initPasswordRecovery:', response);

      if (response.status === 202) {
        console.log("Ambiguity in finding account");
        setErrorMessage('We are unable to uniquely identify you based on the provided email or username. Please provide your mobile number instead.');
        setStep(1.5); // New step for mobile number input
      } else if (response.status === 200) {
        console.log("Account found, proceeding with recovery");
        const data = response.data;
        setFlowConfirmationCode(data[0].flowConfirmationCode);
        setRecoveryCode(data[0].channelInfo.recoveryCode);
        handleRecover(data[0].channelInfo.recoveryCode); // Trigger the recovery method directly after finding the account
      }
    } catch (error: any) {
      console.error('Error initializing password recovery', error);
      if (error.response && (error.response.status >= 400 && error.response.status < 600)) {
        setErrorMessage('Error initializing password recovery. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleRecoverWithMobile = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery with mobile number');
      const response = await initPasswordRecoveryWithMobile(baseUrl, accessToken, mobileNumber);
      console.log('Response from initPasswordRecoveryWithMobile:', response);

      if (response.status === 200) {
        setErrorMessage(null);
        const data = response.data;
        setFlowConfirmationCode(data[0].flowConfirmationCode);
        setRecoveryCode(data[0].channelInfo.recoveryCode);
        handleRecover(data[0].channelInfo.recoveryCode); // Trigger the recovery method directly after providing the mobile number
      }
    } catch (error: any) {
      console.error('Error initializing password recovery with mobile number', error);
      if (error.response && (error.response.status >= 400 && error.response.status < 600)) {
        setErrorMessage('Error initializing password recovery with mobile number. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleRecover = async (recoveryCodeUpdated: string) => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery confirmation');
      const data = await recoverPassword(baseUrl, accessToken, recoveryCodeUpdated, channelId);
      console.log('Response from recoverPassword:', data);

      if (data.flowConfirmationCode) {
        setConfirmationCode(data.flowConfirmationCode);
        setStep(2); // Move to step 2 to validate OTP
      }
    } catch (error: any) {
      console.error('Error recovering password', error);
      if (error.response && (error.response.status >= 400 && error.response.status < 600)) {
        setErrorMessage('Error recovering password. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleConfirm = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password recovery confirmation with OTP');
      const data = await confirmPasswordRecovery(baseUrl, accessToken, confirmationCode, otp);
      console.log('Response from confirmPasswordRecovery:', data);

      if (data.resetCode) {
        setResetCode(data.resetCode);
        setStep(3); // Move to step 3 to reset the password
      }
    } catch (error: any) {
      console.error('Error confirming password recovery', error);
      if (error.response && (error.response.status >= 400 && error.response.status < 600)) {
        setErrorMessage('Error confirming password recovery. Please try again later.');
        setStep(1); // Reset to the initial step
      }
    }
  };

  const handleReset = async () => {
    if (!accessToken) return;

    try {
      console.log('Starting password reset');
      const response = await resetPassword(baseUrl, accessToken, resetCode, confirmationCode, newPassword);

      if (response.status === 200) {
        setStep(4); // Move to step 4 to show success message
      }
    } catch (error: any) {
      console.error('Error resetting password', error);
      if (error.response && (error.response.status >= 400 && error.response.status < 600)) {
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

  const handleRestart = () => {
    setStep(1);
    setUsername('');
    setRecoveryCode('');
    setConfirmationCode('');
    setOtp('');
    setResetCode('');
    setNewPassword('');
    setFlowConfirmationCode('');
    setChannelId('2');
    setErrorMessage(null);
    setMobileNumber('');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundImage: `url(${staplesBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        {step === 1 && (
          <div>
            <Typography variant="h4" color="textSecondary" gutterBottom>
              Forgot Password ?
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
              This happens. Please provide your email or username to proceed with resetting your password.
            </Typography>
            <TextField
              label="Username or Email"
              placeholder="Type your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
            />
            {errorMessage && <Alert severity="error" style={{ marginTop: '10px' }}>{errorMessage}</Alert>}
            <Button onClick={handleForgetPassword} variant="contained" color="secondary" style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}>
              INITIATE RESET
            </Button>
          </div>
        )}
        {step === 1.5 && (
          <div>
            <Typography variant="h4" color="textSecondary" gutterBottom>
              Provide Mobile Number
            </Typography>
            <TextField
              label="Mobile Number"
              placeholder="Type your mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              fullWidth
              margin="normal"
            />
            {errorMessage && <Alert severity="error" style={{ marginTop: '10px' }}>{errorMessage}</Alert>}
            <Button onClick={handleRecoverWithMobile} variant="contained" color="secondary" style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}>
              SEND RESET
            </Button>
          </div>
        )}
        {step === 2 && (
          <div>
            <Typography variant="h4" color="textSecondary" gutterBottom>
              Recover Password
            </Typography>
            <p>An OTP has been sent to your mobile. Please enter the OTP below to proceed resetting your password.</p>
            <TextField 
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button onClick={handleConfirm} variant="contained" color="secondary" style={{ backgroundColor: 'red', color: 'white' }}>
              CONFIRM OTP
            </Button>
          </div>
        )}
        {step === 3 && (
          <div>
            <Typography variant="h4" color="textSecondary" gutterBottom>
              Reset Your Password
            </Typography>
            <TextField
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button onClick={handleReset} variant="contained" color="secondary" style={{ backgroundColor: 'red', color: 'white' }}>
              RESET PASSWORD
            </Button>
          </div>
        )}
        {step === 4 && (
          <div>
            <Typography variant="h4" color="textSecondary" gutterBottom>
              Password Reset Successful
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
              Your password has been reset successfully. You can now log in with your new password.
            </Typography>
            <Button onClick={handleLoginRedirect} variant="contained" color="secondary" style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}>
              GO TO LOGIN
            </Button>
          </div>
        )}
        {errorMessage && step !== 1 && step !== 1.5 && (
          <div>
            <Alert severity="error" style={{ marginTop: '10px' }}>{errorMessage}</Alert>
          </div>
        )}
        {step !== 1 && step !== 4 && (
          <Button onClick={handleRestart} variant="outlined" color="secondary" style={{ marginTop: '10px' }}>
            Restart Password Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default PasswordRecoveryContainer;
