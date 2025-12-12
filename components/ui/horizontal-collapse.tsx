import { ChevronDown, ChevronUp} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


//very simple singular collapsible accordion
export const HorizontalCollapsible = ({
    className,
    children,
    title,
    toggled,
    ...props
} : {
    className?: string;
    children?: React.ReactNode;
    toggled?: boolean;
    title?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
    const [isToggled, setToggled] = useState<boolean>(false);
    return (
        <div
            className={cn(
            "p-[1em] border rounded-[0.33em] transition-colors bg-white border-gray-300",
            className
            )}
            {...props}
        >
            <button 
            className='flex text-sm gap-2 font-semibold'
            onClick={() => setToggled(!isToggled)}
            >
                {!isToggled ? <ChevronDown className='h-5 w-5' /> : <ChevronUp className='h-5 w-5' />}
                {title}
            </button>
            <motion.div 
                initial={false}
                animate={{
                    height: isToggled ? "auto" : 0,
                    transform: isToggled ? "scale(1)" : "scale(0.98)",
                    filter: isToggled ? "blur(0px)" : "blur(4px)",
                    marginTop: isToggled ? 16 : 0,
                    opacity: isToggled ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
            >
                {children}
            </motion.div>
        </div>
    )
};