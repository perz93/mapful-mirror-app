import { Wrench } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Workshops = () => {
  return (
    <CategoryPage
      category="workshops"
      title="Ateliers"
      icon={Wrench}
      iconColor="from-yellow-500/10 to-yellow-500/5 text-yellow-500"
    />
  );
};

export default Workshops;
