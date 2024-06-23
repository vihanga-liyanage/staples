import "./App.css";
import Header from "./components/Header";
import { Container } from '@mui/material';
import HomePage from "./pages/HomePage";
import Impersonation from "./components/Impersonation";
import Footer from "./components/Footer";

function App() {
    
  return (
    <>
      <Header />
      <Container>
        <Impersonation />
        <HomePage />
      </Container>
      <Footer />
    </>
  );
}

export default App;
