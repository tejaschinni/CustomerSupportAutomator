import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [currentColor, setCurrentColor] = React.useState(value);

  // Update local state when prop changes
  React.useEffect(() => {
    setCurrentColor(value);
  }, [value]);

  // Set default colors
  const defaultColors = [
    "#3B82F6", // primary
    "#10B981", // secondary
    "#6366F1", // accent
    "#EF4444", // red
    "#F59E0B", // amber
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#000000", // black
    "#6B7280", // gray
  ];

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(e.target.value);
  };

  const handleBlur = () => {
    onChange(currentColor);
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
    onChange(color);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-gray-300"
            style={{ backgroundColor: currentColor }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div>
              <Input
                type="color"
                value={currentColor}
                onChange={handleColorChange}
                onBlur={handleBlur}
                className="w-full h-10"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {defaultColors.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  className="w-8 h-8 p-0 rounded-md border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={currentColor}
        onChange={handleColorChange}
        onBlur={handleBlur}
        className="w-24 h-10 text-sm"
      />
    </div>
  );
}
