import { FC } from "react";
import { Quest } from "./Quest";

type FeaturedQuestProps = {
  image: string;
  partner: string;
  description: string;
  logo: React.ReactNode;
  amount: number;
  link?: string;
  logoLink: string;
};

export const FeaturedQuest: FC<FeaturedQuestProps> = ({
  image,
  partner,
  description,
  logo,
  amount,
  link,
  logoLink,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-stretch gap-6 bg-white/30 backdrop-blur-[20px] rounded-2xl p-6">
      <img
        src={image}
        className="lg:basis-1/3 rounded-2xl md:object-cover md:w-[40%] lg:min-w-0"
      />
      <Quest
        partner={partner}
        description={description}
        logo={logo}
        amount={amount}
        link={link}
        logoLink={logoLink}
        featured={true}
      />
    </div>
  );
};
