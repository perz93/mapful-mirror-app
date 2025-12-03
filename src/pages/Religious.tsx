import CategoryPage from '@/components/CategoryPage';
import religieuxIcon from '@/assets/icons/religieux.png';

const Religious = () => {
  return (
    <CategoryPage
      category="religious"
      title="Religieux"
      iconSrc={religieuxIcon}
    />
  );
};

export default Religious;
