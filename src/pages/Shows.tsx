import { Theater } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Shows = () => {
  return (
    <CategoryPage
      category="shows"
      title="Spectacles"
      icon={Theater}
      iconColor="from-teal-500/10 to-teal-500/5 text-teal-500"
    />
  );
};

export default Shows;
