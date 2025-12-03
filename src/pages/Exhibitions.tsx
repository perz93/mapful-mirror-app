import CategoryPage from '@/components/CategoryPage';
import expositionIcon from '@/assets/icons/exposition.png';

const Exhibitions = () => {
  return (
    <CategoryPage
      category="exhibitions"
      title="Expositions"
      iconSrc={expositionIcon}
    />
  );
};

export default Exhibitions;
