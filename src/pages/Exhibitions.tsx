import { Image } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Exhibitions = () => {
  return (
    <CategoryPage
      category="exhibitions"
      title="Expositions"
      icon={Image}
      iconColor="from-cyan-500/10 to-cyan-500/5 text-cyan-500"
    />
  );
};

export default Exhibitions;
