import React from "react";
import { Slider } from "@/components/ui/slider";

export default function PriceRangeFilter({ priceRange, setPriceRange, maxPrice = 1000 }) {
  const [localRange, setLocalRange] = React.useState(priceRange);

  // Atualiza o estado local quando o priceRange muda
  React.useEffect(() => {
    setLocalRange(priceRange);
  }, [priceRange]);

  // Atualiza o filtro global apenas quando o usuário termina de arrastar
  const handleRangeChange = (value) => {
    setLocalRange(value);
  };

  const handleRangeCommit = (value) => {
    setPriceRange(value);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Filtrar por preço</h3>
      <div className="px-2">
        <Slider
          defaultValue={localRange}
          value={localRange}
          max={maxPrice}
          step={10}
          onValueChange={handleRangeChange}
          onValueCommit={handleRangeCommit}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{localRange[0]} €</span>
          <span>{localRange[1]} €</span>
        </div>
      </div>
    </div>
  );
}