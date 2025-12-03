import CategoryPage from '@/components/CategoryPage';
import expositionIcon from '@/assets/icons/exposition.png';

const Arts = () => {
  return (
    <CategoryPage
      category="arts"
      title="Arts"
      iconSrc={expositionIcon}
    />
  );
};

export default Arts;
