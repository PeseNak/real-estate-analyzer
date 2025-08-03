import React from 'react';
// We use different icons that match our new data
import { Bed, Square, Wallet, Calendar, KeyRound, Home, Link as LinkIcon } from 'lucide-react';

// ## 1. This interface is now updated to match the backend data
interface PropertyCardProps {
  property: {
    link: string;
    area_m2: number;
    building_age: number;
    room_count: number;
    total_price_toman?: number;
    price_per_m2_toman?: number;
    deposit_toman?: number;
    monthly_rent_toman?: number;
  };
  isDark: boolean;
  type: 'sale' | 'rent';
}

export default function PropertyCard({ property, isDark, type }: PropertyCardProps) {
  // Using a placeholder image since the backend doesn't provide one
  const placeholderImage = `https://picsum.photos/seed/${property.link}/500/300`;

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <div>
        {/* Property Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={placeholderImage} 
            alt="Real estate property"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
            type === 'sale' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            For {type === 'sale' ? 'Sale' : 'Rent'}
          </div>
        </div>

        {/* ## 2. Displaying the REAL data from the backend */}
        <div className="p-4">
          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${ isDark ? 'text-white' : 'text-gray-900' }`}>
            <Home size={20} />
            {property.area_m2} m² Property
          </h3>
          
          {/* Price Section */}
          <div className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {type === 'sale' && property.total_price_toman && (
              <div className='flex items-center gap-2'>
                <Wallet size={24} />
                <span>{property.total_price_toman.toLocaleString()} Toman</span>
              </div>
            )}
            {type === 'rent' && property.deposit_toman && (
              <div>
                <div className='flex items-center gap-2 text-lg'>
                  <KeyRound size={20} />
                  <span>Deposit: {property.deposit_toman.toLocaleString()} T</span>
                </div>
                {property.monthly_rent_toman && (
                  <div className='flex items-center gap-2 text-base text-gray-400 mt-1'>
                    <span>Rent: {property.monthly_rent_toman.toLocaleString()} T/month</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Property Features */}
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center">
              <Bed size={16} className="mr-2" />
              <span>{property.room_count} rooms</span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>{property.building_age} years old</span>
            </div>
            <div className="flex items-center">
              <Square size={16} className="mr-2" />
              <span>{property.area_m2} m²</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Link to original listing */}
      <div className="p-4 pt-2">
        <a href={property.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full mt-4 text-center font-semibold py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors">
          <LinkIcon size={16} />
          View Listing
        </a>
      </div>
    </div>
  );
}