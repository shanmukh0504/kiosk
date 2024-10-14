import { useEffect, useState } from "react";
import { FeaturedQuest } from "./FeaturedQuest";
import { Quest } from "./Quest";
import { QuestModal } from "./QuestModal";
import { Partner, QuestsInfo } from "../../constants/quests";
import { questStore } from "../../store/questStore";

export const Quests = () => {
    const { questData, fetchQuestData } = questStore();
    const [showModal, setShowModal] = useState(false);

    // Set featured quest and get its index
    const featuredPartner = Partner.Solv;
    const featuredIndex = QuestsInfo.findIndex(quest => quest.partner === featuredPartner);

    useEffect(() => {
        void fetchQuestData();
    }, [fetchQuestData]);

    // TODO: Do something with this data
    console.log(questData);

    return (
        <div className="w-full max-w-[1600px] mx-auto mt-10 px-10">
            <FeaturedQuest
                image="https://wbtc-garden.ghost.io/content/images/size/w1000/2024/08/season3_review-1.png" // TODO: This should not be hard coded
                partner={QuestsInfo[featuredIndex].name}
                description={QuestsInfo[featuredIndex].description}
                logo={QuestsInfo[featuredIndex].logo}
                amount={QuestsInfo[featuredIndex].amount}
                link={QuestsInfo[featuredIndex].link}
                logoLink={QuestsInfo[featuredIndex].logoLink}
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
