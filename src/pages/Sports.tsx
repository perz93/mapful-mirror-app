import CategoryPage from '@/components/CategoryPage';
import sportIcon from '@/assets/icons/sport.png';

const Sports = () => {
  return (
    <CategoryPage
      category="sports"
      title="Sports"
      iconSrc={sportIcon}
    />
  );
};

export default Sports;
