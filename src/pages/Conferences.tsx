import CategoryPage from '@/components/CategoryPage';
import conferenceIcon from '@/assets/icons/conference.png';

const Conferences = () => {
  return (
    <CategoryPage
      category="conferences"
      title="Conférences"
      iconSrc={conferenceIcon}
    />
  );
};

export default Conferences;
