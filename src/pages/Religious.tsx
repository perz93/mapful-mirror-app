import { Church } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Religious = () => {
  return (
    <CategoryPage
      category="religious"
      title="Religieux"
      icon={Church}
      iconColor="from-violet-500/10 to-violet-500/5 text-violet-500"
    />
  );
};

export default Religious;
