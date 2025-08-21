import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Truck } from 'lucide-react';
import type { AssetDetail } from '../../types/user';

interface AssetCardProps {
  asset: Partial<AssetDetail> & {
    id: string;
    name: string;
    model: string;
    hourlyRate: number;
    dailyRate: number;
    office: {
      name: string;
      address: string;
      deliveryAvailable: boolean;
    };
  };
  showDistance?: boolean;
  distance?: number;
  className?: string;
}

export default function AssetCard({ 
  asset, 
  showDistance = false, 
  distance, 
  className = '' 
}: AssetCardProps) {
  return (
    <Link
      to={`/assets/${asset.id}`}
      className={`block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {asset.name}
            </h3>
            <p className="text-sm text-gray-500">{asset.model}</p>
          </div>
          {asset.office.deliveryAvailable && (
            <div className="ml-4 flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Truck className="h-3 w-3 mr-1" />
                배송가능
              </span>
            </div>
          )}
        </div>

        {/* Office info */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{asset.office.name}</span>
          {showDistance && distance && (
            <span className="ml-2 text-brand-navy font-medium">
              {distance.toFixed(1)}km
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">시간당</span>
              <span className="ml-1 font-semibold text-gray-900">
                {asset.hourlyRate.toLocaleString()}원
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">일당</span>
              <span className="ml-1 font-semibold text-gray-900">
                {asset.dailyRate.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* Availability indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
            <span className="text-brand-navy font-medium">예약 가능</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>오늘 예약 가능</span>
          </div>
        </div>
      </div>
    </Link>
  );
}