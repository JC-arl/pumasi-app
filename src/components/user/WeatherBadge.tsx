import { Cloud, CloudRain, Sun, CloudSnow } from 'lucide-react';
import type { WeatherInfo } from '../../types/user';

interface WeatherBadgeProps {
  weather: WeatherInfo;
  className?: string;
}

export default function WeatherBadge({ weather, className = '' }: WeatherBadgeProps) {
  const getWeatherIcon = (condition: WeatherInfo['condition']) => {
    switch (condition) {
      case 'SUNNY':
        return <Sun className="h-4 w-4" />;
      case 'CLOUDY':
        return <Cloud className="h-4 w-4" />;
      case 'RAINY':
        return <CloudRain className="h-4 w-4" />;
      case 'STORMY':
        return <CloudSnow className="h-4 w-4" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const getBadgeStyle = (recommendation: WeatherInfo['recommendation']) => {
    switch (recommendation) {
      case 'OPTIMAL':
        return 'bg-brand-light text-brand-navy border-brand-blue';
      case 'CAUTION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_RECOMMENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationText = (recommendation: WeatherInfo['recommendation']) => {
    switch (recommendation) {
      case 'OPTIMAL':
        return '작업 최적';
      case 'CAUTION':
        return '주의 필요';
      case 'NOT_RECOMMENDED':
        return '작업 부적합';
      default:
        return '정보 없음';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeStyle(weather.recommendation)} ${className}`}>
      {getWeatherIcon(weather.condition)}
      <span className="ml-2">{getRecommendationText(weather.recommendation)}</span>
      <span className="ml-2 text-xs">({weather.precipitationProbability}%)</span>
    </div>
  );
}