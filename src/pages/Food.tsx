import { Utensils } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Food = () => {
  return (
    <CategoryPage
      category="food"
      title="Restauration"
      icon={Utensils}
      iconColor="from-orange-500/10 to-orange-500/5 text-orange-500"
    />
  );
};

export default Food;
