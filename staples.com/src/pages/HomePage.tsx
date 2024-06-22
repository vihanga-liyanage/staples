import { FunctionComponent, ReactElement } from 'react';
import Banner from '../components/Banner';
import Section from '../components/Section';
import ProductList from '../components/ProductList';

const HomePage: FunctionComponent = (): ReactElement => {

  return (
    <div>
      <h1 className="welcome-text">Welcome to Staples</h1>
        
      <Banner />
      <Section title="Featured Products">
        <ProductList />
      </Section>
    </div>
  );
};

export default HomePage;
