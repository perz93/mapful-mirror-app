import { Music } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Concerts = () => {
  return (
    <CategoryPage
      category="music"
      title="Concerts"
      icon={Music}
      iconColor="from-orange-500/10 to-orange-500/5 text-orange-500"
    />
  );
};

export default Concerts;
