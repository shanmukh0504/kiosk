import {
  ArrowNorthEastIcon,
  Chip,
  OpenInFullIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC } from "react";
import { Link } from "react-router-dom";
import { PartnerChip } from "./PartnerChip";

type QuestProps = {
  partner: string;
  description: string;
  logo: React.ReactNode;
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
      className={`flex flex-col           
            ${featured ? "lg:basis-2/3 lg:grow-0 lg:shrink-0" : ""}
            bg-white/50 backdrop-blur-[20px] rounded-2xl p-6`}
    >
      <div className="flex justify-between">
        <Link to={logoLink} target="_blank">
          <PartnerChip name={partner} logo={logo} />
        </Link>
        <div className="flex justify-center items-center w-6 h-6">
          {showModal ? (
            <OpenInFullIcon
              className="w-[18px] h-full cursor-pointer"
              onClick={() => showModal()}
            />
          ) : (
            link && (
              <Link to={link} target="_blank">
                <ArrowNorthEastIcon className="w-[15px] h-full" />
              </Link>
            )
          )}
        </div>
      </div>
      <div className="grow mt-5">
        <Typography size="h3" weight="medium">
          {description}
        </Typography>
      </div>
      <div className="flex justify-end mt-8">
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
