import React from 'react';
import { games, regions, languages, countries, systems } from '../lib/roomOptions';

interface FiltersProps {
  values: {
    name: string;
    game: string;
    region: string;
    language: string;
    country: string;
    system: string; // Added system field
  };
  onChange: (values: any) => void;
  onApply: () => void;
  onClear: () => void;
}

const Filters: React.FC<FiltersProps> = ({ values, onChange, onApply, onClear }) => {
  return (
    <form className="flex flex-wrap gap-4 items-center justify-center w-full" onSubmit={e => { e.preventDefault(); onApply(); }}>
      <input
        type="text"
        placeholder="Room name"
        value={values.name}
        onChange={e => onChange({ ...values, name: e.target.value })}
        className="min-w-[120px] flex-1 px-3 py-2 rounded-lg border border-purple-400 bg-[#281e46]/[0.85] text-white text-base outline-none focus:ring-2 focus:ring-purple-400"
        aria-label="Room name"
      />
      <select
        value={values.game}
        onChange={e => onChange({ ...values, game: e.target.value })}
        className="min-w-[120px] flex-1 px-3 py-2 rounded-lg border border-purple-400 bg-[#281e46]/[0.85] text-white text-base"
        aria-label="Game"
      >
        <option value="">Game</option>
        {games.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <select
        value={values.system}
        onChange={e => onChange({ ...values, system: e.target.value })}
        className="min-w-[120px] flex-1 px-3 py-2 rounded-lg border border-blue-400 bg-[#1e2a46]/[0.85] text-white text-base"
        aria-label="System"
      >
        <option value="">System</option>
        {systems.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={values.region}
        onChange={e => onChange({ ...values, region: e.target.value })}
        className="min-w-[100px] flex-1 px-3 py-2 rounded-lg border border-purple-400 bg-[#281e46]/[0.85] text-white text-base"
        aria-label="Region"
      >
        <option value="">Region</option>
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select
        value={values.language}
        onChange={e => onChange({ ...values, language: e.target.value })}
        className="min-w-[100px] flex-1 px-3 py-2 rounded-lg border border-purple-400 bg-[#281e46]/[0.85] text-white text-base"
        aria-label="Language"
      >
        <option value="">Language</option>
        {languages.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <select
        value={values.country}
        onChange={e => onChange({ ...values, country: e.target.value })}
        className="min-w-[100px] flex-1 px-3 py-2 rounded-lg border border-purple-400 bg-[#281e46]/[0.85] text-white text-base"
        aria-label="Country (optional)"
      >
        <option value="">Country (optional)</option>
        {countries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button
        type="submit"
        className="px-5 py-2 rounded-lg font-bold text-base bg-gradient-to-r from-purple-400 to-purple-300 text-[#18122B] border-none cursor-pointer ml-2 shadow-md hover:from-purple-500 hover:to-purple-400"
      >
        Apply
      </button>
      <button
        type="button"
        className="px-5 py-2 rounded-lg font-bold text-base bg-[#2D2350] text-white border-none cursor-pointer ml-1 shadow-md hover:bg-purple-900/30"
        onClick={onClear}
      >
        Clear
      </button>
    </form>
  );
};

export default Filters;
