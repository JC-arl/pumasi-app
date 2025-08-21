interface AdminCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  className?: string;
}

export default function AdminCard({ 
  title, 
  value, 
  change, 
  icon, 
  className = '' 
}: AdminCardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && (
              <div className="w-8 h-8 text-gray-400">
                {icon}
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
              {change && (
                <dd className="flex items-center text-sm">
                  <span className={`${
                    change.type === 'increase' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {change.value}
                  </span>
                  <span className="text-gray-500 ml-1">전일 대비</span>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}