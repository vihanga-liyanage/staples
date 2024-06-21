import { FunctionComponent, ReactElement } from 'react';
import bannerImage from '../assets/images/banner.png';

const Banner: FunctionComponent = (): ReactElement => {
  return (
    <div className="banner">
      <img src={bannerImage} alt="Staples Banner" className="banner-image" />
    </div>
  );
};

export default Banner;
