import CategoryPage from '@/components/CategoryPage';
import atelierIcon from '@/assets/icons/atelier.png';

const Workshops = () => {
  return (
    <CategoryPage
      category="workshops"
      title="Ateliers"
      iconSrc={atelierIcon}
    />
  );
};

export default Workshops;
