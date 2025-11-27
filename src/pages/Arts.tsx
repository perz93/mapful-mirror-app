import { Palette } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Arts = () => {
  return (
    <CategoryPage
      category="arts"
      title="Arts"
      icon={Palette}
      iconColor="from-pink-500/10 to-pink-500/5 text-pink-500"
    />
  );
};

export default Arts;
