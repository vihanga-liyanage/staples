import { FunctionComponent, ReactElement, useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Product } from '../App';
import { addUserProduct } from '../Services/scimService';

interface ProductCardProps {
  product: Product;
}

const envVariables = import.meta.env;

const ProductCard: FunctionComponent<ProductCardProps> = ({ product }): ReactElement => {

  const [showAnimation, setShowAnimation] = useState(false);

  const handleProductAdd = async (product: Product) => {

    const accessToken = localStorage.getItem('userAccessToken');
    if (accessToken) {
      const isSuccess = await addUserProduct(envVariables.VITE_BASE_URL, accessToken, product.product_id);
      if (isSuccess === true) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 3000);
        
      } else {
        console.log('Product add failed');
        
      }
    } else {
      console.log("Couldn't find access token!");
    }
  }

  const renderStars = (rating: number): ReactElement[] => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating ? (
          <StarIcon key={i} style={{ color: '#FFD700', fontSize: '20px' }} />
        ) : (
          <StarBorderIcon key={i} style={{ color: '#FFD700', fontSize: '20px' }} />
        )
      );
    }
    return stars;
  };

  return (
    <Card style={{ border: '1px solid #ddd', boxShadow: 'none' }}>
      <CardMedia component="img" height="200" image={product.image_url} alt={product.product_name} />
      <CardContent style={{ height: '70px' }}>
        <Typography variant="body1" component="div" className="product-name">
          {product.product_name}
        </Typography>
        <div>{renderStars(Math.round(product.star_rating))}</div>
        <Typography variant="h6" component="div" color="textPrimary">
          {product.price}
        </Typography>
      </CardContent>
      <Button variant="contained" 
        style={{ backgroundColor: '#c00', color: '#fff', margin: '33px' }} 
        onClick={() => { handleProductAdd(product); }}
      >
        Add to Favourites
      </Button>
      {showAnimation && <div className="success-animation">✔️ Product Added Successfully!</div>}

    </Card>
  );
};

export default ProductCard;
