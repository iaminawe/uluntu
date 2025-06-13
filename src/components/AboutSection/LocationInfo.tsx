import React from 'react';
import { LocationInfo as LocationInfoType } from '@/shared/components/layout/AboutSection/types';

interface LocationInfoProps {
  locationInfo: LocationInfoType;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ locationInfo }) => {
  const { title, address, hostedBy, mapEmbedUrl } = locationInfo;
  
  return (
    <div className="bg-slate-100 p-4 rounded-lg">
      <div className="aspect-video relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe 
            src={mapEmbedUrl}
            className="w-full h-full rounded-lg border-0" 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title={`${title} Map`}
          ></iframe>
        </div>
      </div>
      <div className="bg-white p-6 mt-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-slate-700">
          {address.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < address.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
        {hostedBy && (
          <p className="mt-3 text-slate-600">
            Hosted by {hostedBy.url ? (
              <a href={hostedBy.url} className="text-indigo-600 hover:underline">
                {hostedBy.name}
              </a>
            ) : (
              <span>{hostedBy.name}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationInfo;
