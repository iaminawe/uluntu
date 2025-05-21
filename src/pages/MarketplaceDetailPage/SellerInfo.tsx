import { Link } from 'react-router-dom';
import { SellerInfoProps } from './types';

const SellerInfo: React.FC<SellerInfoProps> = ({ seller }) => {
  return (
    <div className="p-6 border-t border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About the Seller</h2>
      <div className="flex items-start space-x-4">
        <Link to={`/directory/${seller.id}`}>
          <img
            src={seller.image}
            alt={seller.name}
            className="w-12 h-12 rounded-full"
          />
        </Link>
        <div>
          <Link
            to={`/directory/${seller.id}`}
            className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
          >
            {seller.name}
          </Link>
          {seller.title && (
            <p className="text-slate-600 dark:text-slate-300">{seller.title}</p>
          )}
          {seller.bio && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{seller.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;
