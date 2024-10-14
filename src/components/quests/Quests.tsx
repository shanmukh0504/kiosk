import { useState } from "react";
import { FeaturedQuest } from "./FeaturedQuest";
import { Quest } from "./Quest";
import { QuestModal } from "./QuestModal";
import { Partner, QuestsInfo } from "../../constants/quests";

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
                {QuestsInfo?.map(
                    (quest, i) =>
                        <Quest
                            key={i}
                            partner={quest.name}
                            description={quest.description}
                            logo={quest.logo}
                            amount={quest.amount}
                            link={quest.link}
                            logoLink={quest.logoLink}
                            showModal={quest.partner === Partner.Garden ? () => setShowModal(true) : undefined}
                        />
                )}
            </div>
            <QuestModal
                partner={QuestsInfo[0].name}
                description={QuestsInfo[0].description}
                logo={QuestsInfo[0].logo}
                open={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};
