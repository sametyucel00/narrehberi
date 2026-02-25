import { motion, AnimatePresence } from 'framer-motion';
import { NAR_GOLD } from '../constants';

const positions = [
  { left: '10%', top: '15%' }, { left: '30%', top: '25%' }, { left: '50%', top: '20%' }, { left: '70%', top: '30%' },
  { left: '15%', top: '50%' }, { left: '40%', top: '55%' }, { left: '65%', top: '50%' },
  { left: '25%', top: '75%' }, { left: '55%', top: '78%' }, { left: '80%', top: '70%' },
];

export default function GoldParticles({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="gold-particles" aria-hidden="true">
          {positions.map((pos, i) => (
            <motion.span
              key={i}
              className="gold-particle"
              style={{ ...pos, width: 4 + (i % 2), height: 4 + (i % 2), background: NAR_GOLD, filter: 'blur(1.5px)', borderRadius: '50%' }}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: [0, 0.5, 0.15], x: [0, 35 + (i % 4) * 15], transition: { duration: 2.5 + (i % 4) * 0.25, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.8 } }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
