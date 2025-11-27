import { Trophy } from 'lucide-react';
import CategoryPage from '@/components/CategoryPage';

const Sports = () => {
  return (
    <CategoryPage
      category="sports"
      title="Sports"
      icon={Trophy}
      iconColor="from-blue-500/10 to-blue-500/5 text-blue-500"
    />
  );
};

export default Sports;
