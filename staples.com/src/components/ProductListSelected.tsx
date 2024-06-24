import { FunctionComponent, ReactElement } from 'react';
import { Avatar, Grid, ListItemAvatar, ListItemText } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

interface Product {
  product_name: string;
  star_rating: number;
  price: string;
  image_url: string;
}

const products: Product[] = [
  { product_name: 'Crayola Crayons 24-Pack', star_rating: 4.9, price: '$1.99', image_url: 'https://www.staples-3p.com/s7/is/image/Staples/F26DDEFF-4824-4895-BC070726A57B234D_sc7?wid=360&hei=360' },
  { product_name: 'BIC Round Stic Ballpoint Pens, 60/Pack', star_rating: 4.7, price: '$5.99', image_url: 'https://www.staples-3p.com/s7/is/image/Staples/73C341C6-995A-4A53-BF65624E901AD28A_sc7?wid=700&hei=700' },
  { product_name: 'Ticonderoga Pencils, 96/Pack', star_rating: 4.8, price: '$9.99', image_url: 'https://www.staples-3p.com/s7/is/image/Staples/F2DD1AC4-D7B7-416F-9230D16D44BEF6B0_sc7?wid=700&hei=700' },
  { product_name: 'Mead Spiral Notebooks, 10/Pack', star_rating: 4.5, price: '$17.49', image_url: 'https://www.staples-3p.com/s7/is/image/Staples/sp38165442_sc7?wid=700&hei=700' },
  { product_name: 'Fiskars Scissors, 2/Pack', star_rating: 4.8, price: '$4.99', image_url: 'https://www.staples-3p.com/s7/is/image/Staples/s1204433_sc7?wid=700&hei=700' },
  { product_name: 'Staples 1-Subject Notebooks, 6/Pack', star_rating: 4.5, price: '$6.49', image_url: 'https://www.staples-3p.com/s7/is/image/Staples/295D4ADA-B35F-4D91-A81E5828773DE0FF_sc7?wid=700&hei=700' },
];

const ProductListSelected: FunctionComponent = (): ReactElement => {
  return (
    <List sx={{ width: '100%', maxWidth: '360px',  }}>
      {products.map((product) => (
        <ListItem>
        <ListItemAvatar>
          <Avatar>
            <img src={product.image_url} alt={product.product_name} style={{ width: '100%' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={product.product_name} secondary={product.price} />
      </ListItem>
      ))}
    </List>
  );
};


export default ProductListSelected;
