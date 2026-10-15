import { Pressable } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/constants/theme';

interface ChipSelectorProps<T extends string> {
  options: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}

export function ChipSelector<T extends string>({ options, value, onChange }: ChipSelectorProps<T>) {
  const { palette } = useAppTheme();

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
            style={{
              backgroundColor: selected ? palette.highlight : palette.surface,
              borderColor: selected ? palette.highlight : palette.border,
            }}
            className="rounded-full border px-4 py-2">
            <Text
              style={{
                color: selected ? palette.onHighlight : palette.paragraph,
              }}
              className={`text-sm ${selected ? 'font-semibold' : ''}`}>
              {options[key]}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
