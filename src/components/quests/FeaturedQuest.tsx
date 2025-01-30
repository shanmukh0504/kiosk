import { FC, ReactNode } from "react";
import { Quest } from "./Quest";

type FeaturedQuestProps = {
  image: string;
  partner: string;
  description: string;
  logo: ReactNode;
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
    <div className="flex flex-col gap-6 rounded-2xl bg-white/30 p-6 backdrop-blur-[20px] md:flex-row md:items-stretch">
      <img
        src={image}
        className="rounded-2xl md:w-[40%] md:object-cover lg:min-w-0 lg:basis-1/3"
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
