import { FunctionComponent, ReactElement } from 'react';
import Banner from '../components/Banner';
import Section from '../components/Section';
import ProductList from '../components/ProductList';
import { Product } from '../App';

interface HeaderProps {
  products: Product[];
}

const HomePage: FunctionComponent<HeaderProps> = ({ products }): ReactElement => {

  return (
    <div>
      <h1 className="welcome-text">Welcome to Staples</h1>
        
      <Banner />
      <Section title="Featured Products">
        <ProductList products={products} />
      </Section>
    </div>
  );
};

export default HomePage;
