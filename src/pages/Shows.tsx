import CategoryPage from '@/components/CategoryPage';
import spectacleIcon from '@/assets/icons/spectacle.png';

const Shows = () => {
  return (
    <CategoryPage
      category="shows"
      title="Spectacles"
      iconSrc={spectacleIcon}
    />
  );
};

export default Shows;
