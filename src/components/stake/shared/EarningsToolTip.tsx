import { Typography } from "@gardenfi/garden-book";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, ResponsiveContainer, BarProps } from "recharts";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
} from "../../../common/Chart";
import { formatAmount } from "../../../utils/utils";

const chartConfig = {
  earnings: {
    color: "#F7CFDB",
  },
} satisfies ChartConfig;

type TooltipProps = {
  earnings: number | null;
  earningRate: number | null;
  earningsData: { epoch: number; earnings: number }[] | null;
};

export const EarningsToolTip = ({
  earnings,
  earningRate,
  earningsData,
}: TooltipProps) => {
  useEffect(() => {
    console.log("earnings", earnings);
    console.log("earningrate", earningRate);
    console.log("earningData", earningsData);
  }, []);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative mx-auto flex"
    >
      <div className="absolute mb-[15px] ml-4 mt-[-5px] h-[14px] w-[14px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-5px] sm:mt-[15px]"></div>
      <div className="flex max-w-[240px] flex-col gap-2 rounded-2xl bg-white shadow-custom">
        <Typography size="h5" weight="medium" className="px-3 pt-3">
          This earning is from the previous epoch that has already passed.
        </Typography>
        <div className="flex flex-col gap-1 px-3">
          <Typography size="h5" weight="bold">
            ${formatAmount(earnings ?? 0, 0, 2)}
          </Typography>
          <Typography
            size="h5"
            weight="medium"
            className={
              Number(earningRate ?? 0) > 0
                ? "!text-light-green"
                : "!text-red-500"
            }
          >
            {Number(earningRate ?? 0) > 0
              ? `+${formatAmount(earningRate ?? 0, 0, 2)}%`
              : `-${formatAmount(earningRate ?? 0, 0, 2)}%`}{" "}
            <span className="text-mid-grey">vs previous epoch</span>
          </Typography>
        </div>
        {earningsData && earningsData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-[100px] w-full px-1 pb-0.5"
          >
            <Typography size="h5" weight="medium">
              <ResponsiveContainer width="100%" height="105%">
                <BarChart
                  data={earningsData ?? []}
                  barGap={20}
                  onMouseMove={(state: {
                    isTooltipActive?: boolean;
                    activeTooltipIndex?: number;
                  }) => {
                    if (state.isTooltipActive) {
                      setActiveIndex(state.activeTooltipIndex ?? null);
                    } else {
                      setActiveIndex(null);
                    }
                  }}
                  onMouseLeave={() => setActiveIndex(null)}
                >
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
                  <ChartTooltip
                    cursor={false}
                    content={({ payload }) => {
                      if (!payload?.[0]?.value) return null;
                      return (
                        <div className="rounded-md bg-white/75 px-2 py-1 backdrop-blur-sm">
                          <Typography size="h5" weight="medium">
                            ${formatAmount(Number(payload[0].value), 0, 2)}
                          </Typography>
                        </div>
                      );
                    }}
                    label={false}
                  />
                  <Bar
                    dataKey="earnings"
                    fill="#F3F4F6"
                    barSize={16}
                    shape={(props: BarProps) => {
                      const { x, y, width, height, index } = props;
                      const isLatest =
                        index === (earningsData?.length ?? 0) - 1;
                      const isActive = index === activeIndex;
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={
                            isActive
                              ? "#E36492"
                              : isLatest
                                ? "#F7CFDB"
                                : "#F3F4F6"
                          }
                          rx={4}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Typography>
          </ChartContainer>
        ) : (
          <div className="py-0.5" />
        )}
      </div>
    </motion.div>
  );
};
