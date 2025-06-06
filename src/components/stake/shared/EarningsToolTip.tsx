import { Typography } from "@gardenfi/garden-book";
import { motion } from "framer-motion";
import { Bar, BarChart, XAxis, ResponsiveContainer, BarProps } from "recharts";

type TooltipProps = {
  earnings: number | null;
  earningsData: { epoch: number; earnings: number }[] | null;
};

export const EarningsToolTip = ({ earnings, earningsData }: TooltipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative mx-auto flex"
    >
      <div className="absolute mb-[15px] ml-4 mt-[-5px] h-[14px] w-[14px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-5px] sm:mt-[15px]"></div>
      <div className="flex max-w-[240px] flex-col gap-2 rounded-2xl bg-white px-3 pb-0 pt-3 shadow-custom">
        <Typography size="h5" weight="medium">
          This earning is from the previous epoch that has already passed.
        </Typography>
        <div className="flex gap-2">
          <Typography size="h5" weight="medium">
            {earnings}% <span className="text-mid-grey">vs previous epoch</span>
          </Typography>
        </div>
        <div className="h-[120px] w-full">
          <Typography size="h5" weight="medium">
            <ResponsiveContainer width="100%" height="105%">
              <BarChart data={earningsData ?? []} barGap={20}>
                <XAxis
                  dataKey="epoch"
                  tickLine={false}
                  tickMargin={2}
                  axisLine={false}
                  tick={{
                    fill: "#6B7280",
                    fontSize: 12,
                    fontFamily: "Satoshi",
                  }}
                />
                <Bar
                  dataKey="earnings"
                  fill="#E5E7EB"
                  barSize={16}
                  shape={(props: BarProps) => {
                    const { x, y, width, height, index } = props;
                    const isLatest = index === (earningsData?.length ?? 0) - 1;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={isLatest ? "#F7CFDB" : "#E5E7EB"}
                        rx={4}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Typography>
        </div>
      </div>
    </motion.div>
  );
};
