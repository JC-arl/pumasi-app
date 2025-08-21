import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ShoppingCart, Check, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { colors } from '../../styles/colors';
import { getAvailableCount } from '../../utils/reservationUtils';
import type { Machinery, MachinerySpecification } from '../../types/rental';

interface MachineryCardProps {
  machinery: Machinery;
  office?: {
    name: string;
    address: string;
  } | null;
  className?: string;
}

export default function MachineryCard({ machinery, office, className = '' }: MachineryCardProps) {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const firstSpec = machinery.specifications[0];
  const availableCount = firstSpec ? getAvailableCount(firstSpec) : 0;

  const handleAddToCart = (e: React.MouseEvent, spec: MachinerySpecification) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (availableCount === 0) {
      alert('현재 예약 가능한 농기계가 없습니다.');
      return;
    }

    if (isInCart(machinery.id, spec.id)) {
      alert('이미 장바구니에 추가된 장비입니다.');
      return;
    }

    addToCart({
      machineryId: machinery.id,
      machineryName: machinery.name,
      specificationId: spec.id,
      specification: spec.specification,
      manufacturer: spec.manufacturer,
      rentalPrice: spec.rentalPrice,
      officeName: office?.name || '알 수 없음',
      officeId: machinery.officeId,
    });

    alert('장바구니에 추가되었습니다!');
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/machinery/${machinery.id}`);
  };

  if (!firstSpec) return null;

  return (
    <Link
      to={`/machinery/${machinery.id}`}
      className={`block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {machinery.name}
            </h3>
            <p className="text-sm text-gray-500">{machinery.category}</p>
          </div>
        </div>

        {/* Office info */}
        {office && (
          <div className="mb-4 flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{office.name}</span>
          </div>
        )}

        {/* Specification and pricing */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            {firstSpec.specification} - {firstSpec.manufacturer}
          </div>
          <div className="text-xl font-bold" style={{color: colors.primary.main}}>
            ₩{firstSpec.rentalPrice.toLocaleString()}
            <span className="text-sm text-gray-500 font-normal">/일</span>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${availableCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={availableCount > 0 ? 'text-green-600' : 'text-red-600'}>
              {availableCount > 0 ? `${availableCount}대 예약 가능` : '예약 불가'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={(e) => handleAddToCart(e, firstSpec)}
            disabled={availableCount === 0 || isInCart(machinery.id, firstSpec.id)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              availableCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart(machinery.id, firstSpec.id)
                ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={!isInCart(machinery.id, firstSpec.id) && availableCount > 0 ? {
              borderColor: colors.primary.main,
              color: colors.primary.main,
            } : {}}
          >
            {isInCart(machinery.id, firstSpec.id) ? (
              <>
                <Check className="h-4 w-4 inline mr-1" />
                담김
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 inline mr-1" />
                담기
              </>
            )}
          </button>
          
          <button
            onClick={handleViewDetails}
            className="flex-1 px-3 py-2 text-white rounded-lg font-medium text-sm transition-colors"
            style={{backgroundColor: colors.button.primary}}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primaryHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primary}
          >
            <Eye className="h-4 w-4 inline mr-1" />
            보기
          </button>
        </div>
      </div>
    </Link>
  );
}