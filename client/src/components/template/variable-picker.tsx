import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariablePickerProps {
  onSelectVariable: (variable: string) => void;
}

export function VariablePicker({ onSelectVariable }: VariablePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Fetch variables from API
  const { data: variables, isLoading } = useQuery({
    queryKey: ['/api/variables'],
  });

  // Group variables by category
  const groupedVariables = variables?.reduce((acc: Record<string, any[]>, variable: any) => {
    const category = variable.name.split('.')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(variable);
    return acc;
  }, {}) || {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="flex items-center justify-between"
        >
          <span>Variables</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search variables..." />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">Loading variables...</div>
            ) : (
              <>
                <CommandEmpty>No variables found.</CommandEmpty>
                {Object.entries(groupedVariables).map(([category, vars]) => (
                  <CommandGroup key={category} heading={category}>
                    {vars.map((variable) => (
                      <CommandItem
                        key={variable.id}
                        value={variable.name}
                        onSelect={() => {
                          onSelectVariable(variable.name);
                          setOpen(false);
                        }}
                      >
                        <span>{variable.name}</span>
                        <span className="ml-auto text-xs text-gray-400">
                          {variable.exampleValue}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
