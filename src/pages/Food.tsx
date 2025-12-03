import CategoryPage from '@/components/CategoryPage';
import brunchIcon from '@/assets/icons/brunch.png';

const Food = () => {
  return (
    <CategoryPage
      category="food"
      title="Restauration"
      iconSrc={brunchIcon}
    />
  );
};

export default Food;
