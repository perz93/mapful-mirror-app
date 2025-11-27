import { Coffee } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Brunch = () => {
  return (
    <CategoryPage
      category="brunch"
      title="Brunch"
      icon={Coffee}
      iconColor="from-amber-500/10 to-amber-500/5 text-amber-500"
    />
  );
};

export default Brunch;
