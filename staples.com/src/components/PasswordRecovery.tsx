import React, { useState } from 'react';
import { initPasswordRecovery, recoverPassword, confirmPasswordRecovery, resetPassword } from './services/scimService';

interface PasswordRecoveryProps {
  baseUrl: string;
  accessToken: string;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ baseUrl, accessToken }) => {
  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [otp, setOtp] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [flowConfirmationCode, setFlowConfirmationCode] = useState('');
  const [channelId, setChannelId] = useState('1'); // Assuming default channelId for email

  const handleForgetPassword = async () => {
    try {
      const data = await initPasswordRecovery(baseUrl, accessToken, username, username);
      setFlowConfirmationCode(data[0].flowConfirmationCode);
      setRecoveryCode(data[0].channelInfo.recoveryCode);
      setStep(2);
    } catch (error) {
      console.error('Error initializing password recovery', error);
    }
  };

  const handleRecover = async () => {
    try {
      const data = await recoverPassword(baseUrl, accessToken, recoveryCode, channelId);
      setConfirmationCode(data.flowConfirmationCode);
      setStep(3);
    } catch (error) {
      console.error('Error recovering password', error);
    }
  };

  const handleConfirm = async () => {
    try {
      const data = await confirmPasswordRecovery(baseUrl, accessToken, confirmationCode, otp);
      setResetCode(data.resetCode);
      setStep(4);
    } catch (error) {
      console.error('Error confirming password recovery', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetPassword(baseUrl, accessToken, resetCode, confirmationCode, newPassword);
      alert('Password has been reset successfully');
      setStep(1);
    } catch (error) {
      console.error('Error resetting password', error);
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Forget Password</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleForgetPassword}>Forget Password</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Step 2: Recover Password</h2>
          <p>A recovery code has been sent to your email. Please enter the code and choose your recovery method.</p>
          <button onClick={handleRecover}>Recover</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Step 3: Confirm Password Recovery</h2>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2>Step 4: Reset Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleReset}>Reset Password</button>
        </div>
      )}
    </div>
  );
};

export default PasswordRecovery;
