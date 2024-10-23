import { useEffect, useRef, useState } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { Transactions } from "./Transactions";
import { CloseIcon } from "@gardenfi/garden-book";
import { useBreakpoint } from "../../hooks/useBreakpoints";
import { BottomSheet } from "../../common/BottomSheet";

export const Sidebar = () => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);

    const { isSm } = useBreakpoint("sm");

    useEffect(() => {
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, []);

    const handleClickOutside = (e: MouseEvent) => {
        if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
            setOpen(false);
        }
    };

    const children = <div className="flex flex-col gap-5">
        <SidebarMenu />
        <Transactions />
    </div>;

    return (
        <div className={`bg-dark-grey
            absolute top-0 left-0 z-10
            h-full w-full
            transition-colors ease-cubic-in-out duration-700
            ${open ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}>
            {isSm ?
                <div
                    ref={sliderRef}
                    className={`flex flex-col gap-8
                bg-white/50 backdrop-blur-[20px]
                fixed ${open ? "right-0" : "right-[-480px]"}
                w-[480px] h-full p-6
                transition-bottom ease-cubic-in-out duration-700`}
                >
                    <div className="flex justify-end">
                        <CloseIcon
                            className="w-6 h-[14px] cursor-pointer"
                            onClick={() => setOpen(false)}
                        />
                    </div>
                    {children}
                </div>
                :
                <BottomSheet open={open} onOpenChange={setOpen}>
                    {children}
                </BottomSheet>
            }
        </div>
    );
};
