import { FC } from "react";
import { Quest } from "./Quest";

type FeaturedQuestProps = {
    image: string,
    partner: string,
    description: string,
    link: string,
    amount: number;
};

export const FeaturedQuest: FC<FeaturedQuestProps> = ({
    image,
    partner,
    description,
    amount,
    link,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-stretch gap-6 bg-white/30 backdrop-blur-[20px] rounded-2xl p-6">
            <img src={image} className="lg:basis-1/3 rounded-2xl md:object-cover md:w-[40%] lg:min-w-0" />
            <Quest
                partner={partner}
                description={description}
                link={link}
                amount={amount}
                featured={true}
            />
        </div>
    );
};
