import CategoryPage from '@/components/CategoryPage';
import festivalIcon from '@/assets/icons/festival.png';

const Festivals = () => {
  return (
    <CategoryPage
      category="festivals"
      title="Festivals"
      iconSrc={festivalIcon}
    />
  );
};

export default Festivals;
