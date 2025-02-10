import {
  ArrowNorthEastIcon,
  Chip,
  OpenInFullIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import { PartnerChip } from "./PartnerChip";

type QuestProps = {
  partner: string;
  description: string;
  logo: ReactNode;
  amount: number;
  link?: string;
  logoLink: string;
  featured?: boolean;
  showModal?: () => void;
};

export const Quest: FC<QuestProps> = ({
  partner,
  description,
  logo,
  amount,
  link,
  logoLink,
  featured,
  showModal,
}) => {
  return (
    <div
      className={`flex flex-col ${featured ? "lg:shrink-0 lg:grow-0 lg:basis-2/3" : ""} rounded-2xl bg-white/50 p-6 backdrop-blur-[20px]`}
    >
      <div className="flex justify-between">
        <Link to={logoLink} target="_blank">
          <PartnerChip name={partner} logo={logo} />
        </Link>
        <div className="flex h-6 w-6 items-center justify-center">
          {showModal ? (
            <OpenInFullIcon
              className="h-full w-[18px] cursor-pointer"
              onClick={() => showModal()}
            />
          ) : (
            link && (
              <Link to={link} target="_blank">
                <ArrowNorthEastIcon className="h-full w-[15px]" />
              </Link>
            )
          )}
        </div>
      </div>
      <div className="mt-5 grow">
        <Typography size="h3" weight="medium">
          {description}
        </Typography>
      </div>
      <div className="mt-8 flex justify-end">
        <Chip className="py-1 pl-3 pr-2">
          <Typography size="h3" weight="medium">
            {amount} SEED
          </Typography>
          <Chip.CheckBox checked={false} />
        </Chip>
      </div>
    </div>
  );
};
