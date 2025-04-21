
import React from "react";
import { Button } from "@/components/ui/button";

export default function TopAmenities({ amenities, selectedAmenities, onSelect }) {
  // Get the top 6 most used amenities
  const topAmenities = React.useMemo(() => {
    const amenityCount = {};
    amenities.forEach(amenity => {
      if (amenityCount[amenity]) {
        amenityCount[amenity]++;
      } else {
        amenityCount[amenity] = 1;
      }
    });

    return Object.entries(amenityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([amenity]) => amenity);
  }, [amenities]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Filtrar por comodidades</h3>
      {topAmenities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {topAmenities.map((amenity) => (
            <Button
              key={amenity}
              variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
              onClick={() => onSelect(amenity)}
              className="text-sm"
            >
              {amenity}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Nenhuma comodidade disponível para filtrar.</p>
      )}
    </div>
  );
}
