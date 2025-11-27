import { Sparkles } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Festivals = () => {
  return (
    <CategoryPage
      category="festivals"
      title="Festivals"
      icon={Sparkles}
      iconColor="from-red-500/10 to-red-500/5 text-red-500"
    />
  );
};

export default Festivals;
