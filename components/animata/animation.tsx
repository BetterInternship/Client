import { AnimatePresence } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// ! work in progress, should be generic compononents we can reuse for anims
interface IEnterAnimation {

}

interface IExitAnimation {

}

export const useEnterRef = () => useRef<IEnterAnimation>(null);
export const useExitRef = () => useRef<IExitAnimation>(null);

export const AnimatedComponent = forwardRef((props, ref) => {
  const [active, setActive] = useState(false);
  useImperativeHandle(ref, () => ({
    enter() {

    },
    exit() {

    }
  }));


  return <AnimatePresence>
    {active && }
  </AnimatePresence>
});

