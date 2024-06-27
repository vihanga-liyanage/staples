import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { Avatar, ListItemAvatar, ListItemText } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Product } from '../App';
import { getUserProductIds } from '../Services/scimService';

const envVariables = import.meta.env;

interface UserProductListProps {
  products: Product[];
}

const UserProductList: FunctionComponent<UserProductListProps> = ({ products }): ReactElement => {

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [userProductIDs, setUserProductIDs] = useState<number[]>([]);
  const [noProducts, setNoProducts] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function populateUserProducts(accessToken: string|null) {
    if (accessToken != null)
      setUserProductIDs(await getUserProductIds(envVariables.VITE_BASE_URL, accessToken));
  }

  useEffect(() => {
    // Get accessToken from local storage
    if (localStorage.getItem('userAccessToken')) {
      const accessToken = localStorage.getItem('userAccessToken');
      populateUserProducts(accessToken);
    } else {
      console.log("Access token couldn't be found");
    }
  }, [])
  
  useEffect(() => {
    if (userProductIDs.length > 0 && filteredProducts.length == 0) {
      const filtered = products.filter(product => userProductIDs.includes(product.product_id));
      setFilteredProducts(filtered);
      if (filtered.length > 0) {
        setNoProducts(false);
      } 
    }
    setIsLoading(false);
  }, [userProductIDs])

  return (
    <List sx={{ width: '100%', maxWidth: '360px',  }}>
      { !isLoading && noProducts &&
        <span>No Favourites yet.</span>
      }
      { !isLoading && filteredProducts.map((product) => (
        <ListItem key={product.product_id}>
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


export default UserProductList;
