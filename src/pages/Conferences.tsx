import { Monitor } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Conferences = () => {
  return (
    <CategoryPage
      category="conferences"
      title="Conférences"
      icon={Monitor}
      iconColor="from-indigo-500/10 to-indigo-500/5 text-indigo-500"
    />
  );
};

export default Conferences;
