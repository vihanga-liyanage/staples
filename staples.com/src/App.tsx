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

function App() {
  const { user } = useAuthentication();

  console.log(user);
  
  return (
    <>
      <Header />
      <Container>
        <HomePage />
        <SignIn 
          showSignUp={true}
        />

        <SignedIn>
          <h5>Welcome, {user?.userName}</h5>
          <SignOutButton />
        </SignedIn>
      </Container>
    </>
  );
}

export default App;
