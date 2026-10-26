import React, { useState } from 'react';
import { Game } from '../types';
import { Gamepad2, Search, Download, Star, Play } from 'lucide-react';

const MOCK_GAMES: Game[] = [
  { id: 'g1', title: 'Nebula Runner', description: 'Infinite space corridor', icon: 'Rocket', category: 'Action', installed: true },
  { id: 'g2', title: 'Code Miner', description: 'Find syntax errors in the dark', icon: 'Pickaxe', category: 'Puzzle', installed: false },
  { id: 'g3', title: 'Quantum Tactics', description: 'Strategic grid combat', icon: 'Shield', category: 'Strategy', installed: true },
];

export const GamesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  
  const filteredGames = MOCK_GAMES.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Gamepad2 /> Games</h2>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search games..." 
          className="w-full bg-zinc-900 text-white p-3 pl-10 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredGames.map(game => (
          <div key={game.id} className="bg-zinc-900 p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-zinc-800">
            <div className="bg-zinc-800 p-3 rounded-full"><Star className="w-6 h-6 text-yellow-500" /></div>
            <h3 className="font-bold text-white text-sm">{game.title}</h3>
            <p className="text-zinc-400 text-[10px]">{game.description}</p>
            <button className="bg-blue-600 text-white w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              {game.installed ? <Play className="w-3 h-3" /> : <Download className="w-3 h-3" />}
              {game.installed ? 'Play' : 'Install'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
