import "./App.css";
import {
  SignIn,
  SignedIn,
  SignOutButton,
  useAuthentication,
} from "@asgardeo/react";
import Header from "./components/Header";
import { Container } from '@mui/material';
import HomePage from "./pages/HomePage";
import Impersonation from "./components/Impersonation";

function App() {
  const { user } = useAuthentication();

  console.log(user);
  
  return (
    <>
      <Header />
      <Container>
        <div className="signInContainer">
          <SignIn 
            showSignUp={true}
            showFooter={false}
          />
          <SignedIn>
            <h5>Welcome, {user?.userName}</h5>
            <SignOutButton />
          </SignedIn>
        </div>
        <Impersonation />
        <HomePage />
      </Container>
    </>
  );
}

export default App;
