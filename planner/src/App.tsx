/** @author Erbol king */
import { AnimatePresence, motion } from 'motion/react';
import { usePlanner } from './store';
import { Setup } from './ui/Setup';
import { Editor } from './ui/Editor';

export function App() {
  const step = usePlanner((s) => s.step);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        className="h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        {step === 'setup' ? <Setup /> : <Editor />}
      </motion.div>
    </AnimatePresence>
  );
}
