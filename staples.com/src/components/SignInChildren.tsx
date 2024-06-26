import { Alert, Checkbox, FormControlLabel, Typography } from "@mui/material";
import Button from "@mui/material/Button";

interface SignInChildrenProps {
  setForgotPasswordOpen: (arg0: boolean) => void;
  showNonUniqueUsernameError: boolean;
};

const SignInChildren: React.FC<SignInChildrenProps> = ({setForgotPasswordOpen, showNonUniqueUsernameError}) => {

  return (
    <div className="sign-in-children-container">
        { showNonUniqueUsernameError && (
          <Alert severity="error">
            Email or username used as login identifier leads to an ambiguity. 
            Please provide your mobile number as a login identifier.
          </Alert>
        )}
        <Button 
          onClick={ () => setForgotPasswordOpen(true) }
          sx={{
            textTransform: 'none',
            color: '#000'
          }}
        >
            <Typography variant="body2">
                Forgot <a href="#" style={{ color: "black" }}>Password</a>?
            </Typography>
        </Button>
        <FormControlLabel
            control={<Checkbox />}
            label={
                <Typography variant="body2">Keep me signed in <a href="#" style={{ color: "black" }}>Learn More</a></Typography>
            }
        />
    </div>
);
}

export default SignInChildren;
