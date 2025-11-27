import { Users } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Meetups = () => {
  return (
    <CategoryPage
      category="meetups"
      title="Meetups"
      icon={Users}
      iconColor="from-blue-500/10 to-blue-500/5 text-blue-500"
    />
  );
};

export default Meetups;
