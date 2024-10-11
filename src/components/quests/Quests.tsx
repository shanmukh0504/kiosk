import { FeaturedQuest } from "./FeaturedQuest";
import { Quest } from "./Quest";

export const Quests = () => {
    return (
        <div className="w-full max-w-[1600px] mx-auto mt-10">
            <FeaturedQuest
                image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/08/season3_review-1.png"
                partner="GMX"
                description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                link="https://garden.finance"
                amount={20}
            />
            <div className="grid grid-cols-3 gap-6 mt-10">
                <Quest
                    partner="GMX"
                    description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                    link="https://garden.finance"
                    amount={20}
                />
                <Quest
                    partner="GMX"
                    description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                    link="https://garden.finance"
                    amount={20}
                />
                <Quest
                    partner="GMX"
                    description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                    link="https://garden.finance"
                    amount={20}
                />
                <Quest
                    partner="GMX"
                    description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                    link="https://garden.finance"
                    amount={20}
                />
                <Quest
                    partner="GMX"
                    description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                    link="https://garden.finance"
                    amount={20}
                />
            </div>
        </div>
    );
};
