import React from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';

interface PodiumProps {
  winnerGamertag: string;
}

export const Podium: React.FC<PodiumProps> = ({ winnerGamertag }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/40 border border-yellow-500/30 rounded-3xl mt-8 relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.1}
      />
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="text-center z-10"
      >
        <div className="flex justify-center mb-6 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"
          />
          <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        </div>
        
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 mb-2 uppercase tracking-widest drop-shadow-lg">
          ¡Campeón del Torneo!
        </h2>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Medal className="w-8 h-8 text-yellow-500" />
          <p className="text-5xl font-bold text-white tracking-wider">{winnerGamertag}</p>
          <Star className="w-8 h-8 text-yellow-500" />
        </div>
      </motion.div>
    </div>
  );
};
