import { useEffect, useRef, useState } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { Transactions } from "./Transactions";
import { CloseIcon } from "@gardenfi/garden-book";

export const Sidebar = () => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, []);

    const handleClickOutside = (e: MouseEvent) => {
        if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
            setVisible(false);
        }
    };

    return (
        <div className={`bg-dark-grey
        absolute top-0 left-0 z-10
        h-full w-full
        transition-colors ease-cubic-in-out duration-700
        ${visible ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}>
            <div
                ref={sliderRef}
                className={`flex flex-col gap-8
                bg-white/50 backdrop-blur-[20px]
                fixed top-0 ${visible ? "right-0" : "right-[-480px]"}
                w-[480px] h-full p-6
                transition-right ease-cubic-in-out duration-700`}
            >
                <div className="flex justify-end">
                    <CloseIcon
                        className="w-6 h-[14px] cursor-pointer"
                        onClick={() => setVisible(false)}
                    />
                </div>
                <div className="flex flex-col gap-5">
                    <SidebarMenu />
                    <Transactions />
                </div>
            </div>
        </div>
    );
};
