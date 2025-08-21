import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart, Calendar } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { colors } from '../../styles/colors';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart } = useCart();

  const handleReserveAll = () => {
    if (cart.items.length === 0) {
      alert('장바구니가 비어 있습니다.');
      return;
    }

    // 여러 장비를 한번에 예약하는 페이지로 이동
    const cartData = encodeURIComponent(JSON.stringify(cart.items));
    navigate(`/reserve/multiple?cart=${cartData}`);
  };

  const handleReserveItem = (item: any) => {
    const params = new URLSearchParams({
      machinery: item.machineryId,
      machineryName: item.machineryName,
      office: item.officeId,
      officeName: item.officeName,
      specification: item.specification,
      specificationId: item.specificationId,
      manufacturer: item.manufacturer,
      rentalPrice: item.rentalPrice.toString()
    });
    
    navigate(`/reserve?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8" style={{backgroundColor: '#F3F3E0'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              뒤로가기
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="h-7 w-7 mr-2" style={{color: colors.primary.main}} />
              장바구니
            </h1>
          </div>
          
          {cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 inline mr-1" />
              전체 삭제
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">장바구니가 비어 있습니다</h2>
            <p className="text-gray-500 mb-6">관심 있는 농기계를 장바구니에 담아보세요</p>
            <button
              onClick={() => navigate('/map')}
              className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
              style={{backgroundColor: colors.button.primary}}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primaryHover}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primary}
            >
              농기계 둘러보기
            </button>
          </div>
        ) : (
          /* Cart Items */
          <div className="space-y-4">
            {/* Cart Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  선택한 장비 ({cart.totalItems}개)
                </h2>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{color: colors.primary.main}}>
                    총 ₩{cart.totalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">/일 (추정)</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleReserveAll}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors"
                  style={{backgroundColor: colors.button.primary}}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primaryHover}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primary}
                >
                  <Calendar className="h-5 w-5 inline mr-2" />
                  전체 예약하기
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  계속 쇼핑하기
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.machineryName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.specification} - {item.manufacturer}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {item.officeName}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold" style={{color: colors.primary.main}}>
                        ₩{item.rentalPrice.toLocaleString()}
                        <span className="text-sm text-gray-500 font-normal">/일</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReserveItem(item)}
                          className="px-4 py-2 text-white rounded-lg font-medium transition-colors"
                          style={{backgroundColor: colors.button.primary}}
                          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primaryHover}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primary}
                        >
                          예약하기
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(item.addedAt).toLocaleDateString('ko-KR')} 담음
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}