import { Typography } from "@gardenfi/garden-book";

type SwitchProps<T extends string> = {
  options: {
    label: string;
    value: T;
    default?: boolean;
  }[];
  value: T;
  onChange: (value: T) => void;
};

export const Switch = <T extends string>({
  options,
  value,
  onChange,
}: SwitchProps<T>) => {
  return (
    <div className="h-full w-fit items-center justify-end overflow-hidden rounded-full bg-white/50">
      {options.map((option) => (
        <span
          className={`inline-block cursor-pointer rounded-full px-3 pb-[7px] pt-[5px] transition-all duration-150 ease-in-out ${
            value === option.value ? "bg-white" : ""
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
        >
          <Typography weight="bold" size="h4">
            {option.label}
          </Typography>
        </span>
      ))}
    </div>
  );
};
