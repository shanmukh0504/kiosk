import { useState } from "react";
import { FeaturedQuest } from "./FeaturedQuest";
import { Quest } from "./Quest";
import { QuestModal } from "./QuestModal";

export const Quests = () => {
    const [showModal, setShowModal] = useState(false);
    return (
        <div className="w-full max-w-[1600px] mx-auto mt-10 px-10">
            <FeaturedQuest
                image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/08/season3_review-1.png"
                partner="GMX"
                description="Deposit WBTC into Radiant and borrow & loop USDC to leverage your deposit and gain enhanced yield."
                link="https://garden.finance"
                amount={20}
            />
            <div className="grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
                <Quest
                    partner="Garden"
                    description="Follow us on 𝕏 and join our garden townhall to earn 20 SEED!"
                    link="https://garden.finance"
                    amount={20}
                    showModal={() => setShowModal(true)}
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
            {/* TODO: Ensure this is not hard coded once the API has been integrated */}
            <QuestModal
                partner="Garden"
                description="Follow us on 𝕏 and join our garden townhall to earn 20 SEED!"
                open={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};
