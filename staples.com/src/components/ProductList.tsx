import { FunctionComponent, ReactElement } from 'react';
import { Grid } from '@mui/material';
import ProductCard from './ProductCard';
import { Product } from '../App';

interface ProductListProps {
  products: Product[];
}

const ProductList: FunctionComponent<ProductListProps> = ({ products }): ReactElement => {
  return (
    <Grid container spacing={2}>
      {products.map((product, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
