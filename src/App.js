import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Users, Hash, Crown, Calculator, Gavel } from 'lucide-react';

// --- Global CSS adjustments ---
// Note: Main styling is handled by Tailwind in index.html
const GlobalStyles = () => (
  <style>{`
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }
    ::-webkit-scrollbar-thumb {
      background: #8C1D40;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #5C122A;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 8px 32px 0 rgba(140, 29, 64, 0.1);
    }

    .input-transition {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hide number input spinners */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
  `}</style>
);

// --- Scoring Logic ---
const calculateRoundScore = (bid, actual) => {
  const b = parseInt(bid) || 0;
  const a = parseInt(actual) || 0;

  if (actual === '') return 0;

  // Rule 2: Made bid exactly
  if (a === b) return b * 10;
  // Rule 1: Overtricks (Sandbags)
  else if (a > b) return (b * 10) + (a - b);
  // Rule 3: Set (Under bid)
  else return b * -10;
};

// --- Initial State ---
const createInitialRounds = () => {
  const rounds = [];
  // Original 3 to 13 range
  for (let i = 3; i <= 13; i++) {
    rounds.push({
      round: i,
      team1Bid: '',
      team1Actual: '',
      team2Bid: '',
      team2Actual: '',
    });
  }
  return rounds;
};

// --- Main App Component ---
function App() {
  const [rounds, setRounds] = useState(createInitialRounds());
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (roundNum, team, field, value) => {
    if (value === '') {
      updateRoundState(roundNum, team, field, value);
      return;
    }
    const numValue = parseInt(value, 10);

    // Strict logic: max input cannot exceed the round number
    if (numValue > roundNum) return;
    if (numValue < 0) return;

    updateRoundState(roundNum, team, field, value);
  };

  const updateRoundState = (roundNum, team, field, value) => {
    setRounds(prevRounds =>
      prevRounds.map(r => {
        if (r.round !== roundNum) return r;

        const updatedRound = { ...r };
        updatedRound[`${team}${field}`] = value;

        // Auto-fill logic
        if (field === 'Actual' && value !== '') {
          const otherTeam = team === 'team1' ? 'team2' : 'team1';

          // Calculation uses roundNum as the total tricks available
          const remainder = roundNum - parseInt(value, 10);

          if (updatedRound[`${otherTeam}Actual`] === '') {
            updatedRound[`${otherTeam}Actual`] = remainder >= 0 ? remainder : 0;
          }
        }
        return updatedRound;
      })
    );
  };

  const resetGame = () => {
    if (window.confirm("Are you sure you want to start a new game? All scores will be cleared.")) {
      setRounds(createInitialRounds());
      setTeam1Name('');
      setTeam2Name('');
    }
  };

  // --- Calculations ---
  let team1RunningTotal = 0;
  let team2RunningTotal = 0;

  const calculatedData = rounds.map(r => {
    const team1Score = calculateRoundScore(r.team1Bid, r.team1Actual);
    const team2Score = calculateRoundScore(r.team2Bid, r.team2Actual);

    if (r.team1Actual !== '') team1RunningTotal += team1Score;
    if (r.team2Actual !== '') team2RunningTotal += team2Score;

    const isRoundScored = r.team1Actual !== '' || r.team2Actual !== '';
    const currentDiff = team1RunningTotal - team2RunningTotal;

    // Bidding Order Logic
    // Odd rounds (3, 5, 7...): Gold (Team 2) bids first
    // Even rounds (4, 6, 8...): Maroon (Team 1) bids first
    const isOddRound = r.round % 2 !== 0;
    const isGoldFirst = isOddRound;
    const isMaroonFirst = !isOddRound;

    return {
      ...r,
      team1Score,
      team2Score,
      team1RunningTotal,
      team2RunningTotal,
      isRoundScored,
      currentDiff,
      isGoldFirst,
      isMaroonFirst
    };
  });

  const finalTeam1Total = team1RunningTotal;
  const finalTeam2Total = team2RunningTotal;
  const difference = finalTeam1Total - finalTeam2Total;

  const t1Display = team1Name || 'Maroon Team';
  const t2Display = team2Name || 'Gold Team';

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-slate-800 selection:bg-[#FFC627] selection:text-[#8C1D40]">
      <GlobalStyles />

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#8C1D40] shadow-lg py-3' : 'bg-[#8C1D40] py-6'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Crown className="w-6 h-6 text-[#FFC627]" />
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-white font-serif tracking-wide">
              Spades<span className="text-[#FFC627]">Scorecard</span>
            </h1>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors backdrop-blur-sm border border-white/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Game</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container mx-auto px-4 pt-24 md:pt-32 pb-12 flex flex-col lg:flex-row gap-6 md:gap-8">

        {/* Left Column: Scoreboard */}
        <div className="flex-grow order-2 lg:order-1 animate-fade-in">

          {/* Team Names Setup */}
          <div className="glass-panel rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 group">
              <label className="block text-xs font-bold text-[#8C1D40] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Maroon Team
              </label>
              <input
                type="text"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                placeholder="Enter team name..."
                className="w-full bg-stone-50 border-b-2 border-[#8C1D40]/20 focus:border-[#8C1D40] px-4 py-3 text-lg font-semibold text-slate-800 outline-none input-transition placeholder:text-slate-400 rounded-t-md hover:bg-white"
              />
            </div>
            <div className="flex-1 group">
              <label className="block text-xs font-bold text-[#B08900] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Gold Team
              </label>
              <input
                type="text"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                placeholder="Enter team name..."
                className="w-full bg-stone-50 border-b-2 border-[#FFC627]/40 focus:border-[#FFC627] px-4 py-3 text-lg font-semibold text-slate-800 outline-none input-transition placeholder:text-slate-400 rounded-t-md hover:bg-white"
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#2D2926] text-white text-sm uppercase tracking-wider">
                    <th className="py-4 px-2 font-medium w-16 text-center">
                      <Hash className="w-4 h-4 mx-auto opacity-50" />
                    </th>
                    <th colSpan="4" className="py-4 px-4 bg-[#8C1D40] border-r border-[#ffffff]/10">
                      <div className="flex flex-col">
                        <span className="font-serif text-lg font-bold truncate max-w-[150px] sm:max-w-none mx-auto">{t1Display}</span>
                      </div>
                    </th>
                    <th colSpan="4" className="py-4 px-4 bg-[#D4AF37] text-[#2D2926]">
                      <div className="flex flex-col">
                        <span className="font-serif text-lg font-bold truncate max-w-[150px] sm:max-w-none mx-auto">{t2Display}</span>
                      </div>
                    </th>
                    <th className="py-4 px-2 font-medium w-16 text-center">Diff</th>
                  </tr>
                  <tr className="bg-stone-200 text-xs font-semibold text-stone-600 border-b border-stone-300">
                    <th className="py-2">Rd</th>
                    <th className="py-2 w-16 bg-[#8C1D40]/5">Bid</th>
                    <th className="py-2 w-16 bg-[#8C1D40]/10">Wins</th>
                    <th className="py-2 bg-[#8C1D40]/5">Pts</th>
                    <th className="py-2 bg-[#8C1D40]/10">Tot</th>
                    <th className="py-2 w-16 bg-[#FFC627]/10">Bid</th>
                    <th className="py-2 w-16 bg-[#FFC627]/20">Wins</th>
                    <th className="py-2 bg-[#FFC627]/10">Pts</th>
                    <th className="py-2 bg-[#FFC627]/20">Tot</th>
                    <th className="py-2 text-center">+/-</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedData.map((data, idx) => (
                    <tr
                      key={data.round}
                      className={`
                        group border-b border-stone-200 hover:bg-stone-50 transition-colors
                        ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F6]'}
                      `}
                    >
                      {/* CHANGED: Gavel icon is now brighter (removed opacity) and slightly larger position adjustment */}
                      <td className="py-3 text-center font-bold text-slate-800 relative">
                        {(data.isMaroonFirst || data.isGoldFirst) && (
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 right-2 ${data.isMaroonFirst ? 'text-[#8C1D40]' : 'text-[#B08900]'}`}
                            title={data.isMaroonFirst ? "Maroon Team Bids First" : "Gold Team Bids First"}
                          >
                            <Gavel className="w-3 h-3" />
                          </div>
                        )}
                        {data.round}
                      </td>

                      {/* Team 1 Inputs - Removed background tints */}
                      <td className="p-2">
                        <input
                          type="number"
                          placeholder="-"
                          min="0"
                          max={data.round}
                          className="w-full text-center p-2 rounded-lg border border-stone-200 bg-white outline-none font-bold text-[#8C1D40] input-transition shadow-sm focus:ring-2 focus:ring-[#8C1D40] focus:border-[#8C1D40]"
                          value={data.team1Bid}
                          onChange={e => handleInputChange(data.round, 'team1', 'Bid', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          placeholder="-"
                          min="0"
                          max={data.round}
                          className="w-full text-center p-2 rounded-lg border border-stone-200 bg-stone-50 outline-none font-bold text-slate-800 input-transition shadow-sm focus:ring-2 focus:ring-[#8C1D40] focus:border-[#8C1D40]"
                          value={data.team1Actual}
                          onChange={e => handleInputChange(data.round, 'team1', 'Actual', e.target.value)}
                        />
                      </td>
                      <td className="py-3 text-center text-sm font-medium text-stone-500">
                        {data.team1Actual !== '' ? (
                          <span className={data.team1Score < 0 ? "text-red-500" : "text-green-600"}>
                            {data.team1Score}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 text-center font-bold text-[#8C1D40]">
                        {data.isRoundScored ? data.team1RunningTotal : '-'}
                      </td>

                      {/* Team 2 Inputs - Removed background tints */}
                      <td className="p-2">
                        <input
                          type="number"
                          placeholder="-"
                          min="0"
                          max={data.round}
                          className="w-full text-center p-2 rounded-lg border border-stone-200 bg-white outline-none font-bold text-[#B08900] input-transition shadow-sm focus:ring-2 focus:ring-[#FFC627] focus:border-[#FFC627]"
                          value={data.team2Bid}
                          onChange={e => handleInputChange(data.round, 'team2', 'Bid', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          placeholder="-"
                          min="0"
                          max={data.round}
                          className="w-full text-center p-2 rounded-lg border border-stone-200 bg-stone-50 outline-none font-bold text-slate-800 input-transition shadow-sm focus:ring-2 focus:ring-[#FFC627] focus:border-[#FFC627]"
                          value={data.team2Actual}
                          onChange={e => handleInputChange(data.round, 'team2', 'Actual', e.target.value)}
                        />
                      </td>
                      <td className="py-3 text-center text-sm font-medium text-stone-500">
                        {data.team2Actual !== '' ? (
                          <span className={data.team2Score < 0 ? "text-red-500" : "text-green-600"}>
                            {data.team2Score}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 text-center font-bold text-[#B08900]">
                        {data.isRoundScored ? data.team2RunningTotal : '-'}
                      </td>

                      {/* Diff */}
                      {/* CHANGED: text-stone-400 -> text-slate-800 to make it bright/visible */}
                      <td className="py-3 text-center text-xs font-bold text-slate-800 border-l border-stone-100">
                        {data.isRoundScored ? (
                          <span className={`px-2 py-1 rounded-full ${Math.abs(data.currentDiff) < 10 ? 'bg-stone-100' : 'bg-stone-200'}`}>
                            {Math.abs(data.currentDiff)}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <aside className="lg:w-80 order-1 lg:order-2 shrink-0">
          <div className="sticky top-24 space-y-6">

            {/* Summary Card */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8C1D40] via-[#FFC627] to-[#8C1D40]"></div>

              <h2 className="text-xl font-serif font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5 text-[#8C1D40]" />
                Current Standing
              </h2>

              <div className="space-y-4">
                {/* Team 1 Score */}
                <div className={`relative p-4 rounded-xl border transition-all duration-500 ${difference > 0 ? 'bg-[#8C1D40] text-white shadow-lg scale-105 border-[#8C1D40]' : 'bg-white text-slate-700 border-stone-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate pr-2">{t1Display}</span>
                    <span className="text-2xl font-serif font-black">{finalTeam1Total}</span>
                  </div>
                  {difference > 0 && (
                    <div className="absolute -top-3 -right-2 bg-[#FFC627] text-[#8C1D40] p-1.5 rounded-full shadow-sm animate-bounce">
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Team 2 Score */}
                <div className={`relative p-4 rounded-xl border transition-all duration-500 ${difference < 0 ? 'bg-[#FFC627] text-[#2D2926] shadow-lg scale-105 border-[#FFC627]' : 'bg-white text-slate-700 border-stone-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate pr-2">{t2Display}</span>
                    <span className="text-2xl font-serif font-black">{finalTeam2Total}</span>
                  </div>
                  {difference < 0 && (
                    <div className="absolute -top-3 -right-2 bg-[#8C1D40] text-white p-1.5 rounded-full shadow-sm animate-bounce">
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 text-center">
                <p className="text-sm font-medium text-stone-500 uppercase tracking-widest mb-1">Difference</p>
                <p className="text-3xl font-black text-slate-800">{Math.abs(difference)}</p>
                <p className="text-xs text-[#8C1D40] font-bold mt-2">
                  {difference > 0 ? `${t1Display} Leads` : difference < 0 ? `${t2Display} Leads` : 'Game Tied'}
                </p>
              </div>
            </div>

          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
