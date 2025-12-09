import { ChevronDown, ChevronUp} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";


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
            <div className={cn('transition-[max-height] duration-300 ease-in-out', isToggled ? 'mt-4 max-h-[100vh]' : 'max-h-0 overflow-hidden')}>
                {isToggled && children}
            </div>
        </div>
    )
};