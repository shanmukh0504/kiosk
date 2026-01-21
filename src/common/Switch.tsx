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
        <Typography
          key={option.value}
          weight="medium"
          size="h5"
          breakpoints={{ sm: "h4" }}
          className={`inline-block cursor-pointer rounded-full px-3 py-1.5 transition-all duration-150 ease-in-out ${
            value === option.value ? "bg-white" : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Typography>
      ))}
    </div>
  );
};
