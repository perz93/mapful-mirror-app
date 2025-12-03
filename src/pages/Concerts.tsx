import CategoryPage from '@/components/CategoryPage';
import concertIcon from '@/assets/icons/concert.png';

const Concerts = () => {
  return (
    <CategoryPage
      category="music"
      title="Concerts"
      iconSrc={concertIcon}
    />
  );
};

export default Concerts;
