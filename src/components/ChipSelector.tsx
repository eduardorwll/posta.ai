import { Pressable } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

interface ChipSelectorProps<T extends string> {
  options: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}

export function ChipSelector<T extends string>({ options, value, onChange }: ChipSelectorProps<T>) {
  return (
    <HStack className="flex-wrap gap-2">
      {(Object.keys(options) as T[]).map((key) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(key)}
            className={`rounded-full border px-4 py-2 bg-[#001e1d] ${
              selected ? 'border-[#f9bc60]' : 'border-[#001e1d]'
            }`}>
            <Text
              className={`text-sm ${selected ? 'font-semibold text-[#fffffe]' : 'text-[#abd1c6]'}`}>
              {options[key]}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
