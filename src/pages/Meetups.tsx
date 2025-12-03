import CategoryPage from '@/components/CategoryPage';
import meetupIcon from '@/assets/icons/meetup.png';

const Meetups = () => {
  return (
    <CategoryPage
      category="meetups"
      title="Meetups"
      iconSrc={meetupIcon}
    />
  );
};

export default Meetups;
