import { Plus, X } from 'lucide-react';
import type { TicketDraft } from '@/lib/ticketTypes';

const SUGGESTIONS = ['Standard', 'VIP', 'VVIP', 'Table', 'Prévente'];

interface TicketFieldsProps {
  price: string;
  onPriceChange: (v: string) => void;
  /** null = un seul prix ; tableau = plusieurs types de places */
  tiers: TicketDraft[] | null;
  onTiersChange: (v: TicketDraft[] | null) => void;
  inputClass: string;
  labelClass: string;
}

/** Prix : « Un seul prix » ou « Plusieurs places » (Standard, VIP, Table…) */
const TicketFields = ({ price, onPriceChange, tiers, onTiersChange, inputClass, labelClass }: TicketFieldsProps) => {
  const multi = tiers !== null;
  const nextName = () => SUGGESTIONS.find((s) => !(tiers ?? []).some((t) => t.name.trim().toLowerCase() === s.toLowerCase())) ?? '';

  const setMulti = (on: boolean) => {
    if (on === multi) return;
    if (on) onTiersChange([{ name: 'Standard', price }, { name: 'VIP', price: '' }]);
    else {
      onPriceChange(tiers?.[0]?.price ?? price);
      onTiersChange(null);
    }
  };
  const update = (i: number, patch: Partial<TicketDraft>) =>
    onTiersChange((tiers ?? []).map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const remove = (i: number) => {
    const rest = (tiers ?? []).filter((_, j) => j !== i);
    if (rest.length === 0) setMulti(false);
    else onTiersChange(rest);
  };

  return (
    <div className="space-y-3">
      <div role="tablist" className="grid grid-cols-2 rounded-full bg-parchment p-1">
        {[false, true].map((m) => (
          <button
            key={String(m)}
            type="button"
            role="tab"
            aria-selected={multi === m}
            onClick={() => setMulti(m)}
            className={`h-9 rounded-full text-sm font-medium transition-colors ${multi === m ? 'bg-ink text-parchment' : 'text-stone-600'}`}
          >
            {m ? 'Plusieurs places' : 'Un seul prix'}
          </button>
        ))}
      </div>

      {!multi ? (
        <div className="space-y-2">
          <label className={labelClass}>Prix (FCFA)</label>
          <input
            inputMode="numeric"
            placeholder="Vide ou 0 = gratuit"
            value={price}
            onChange={(e) => onPriceChange(e.target.value.replace(/[^\d]/g, ''))}
            className={`w-full ${inputClass}`}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_36px] gap-2 px-1 text-xs text-stone-500">
            <span>Type de place</span>
            <span>Prix (FCFA)</span>
          </div>
          {tiers!.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_36px] items-center gap-2">
              <input
                placeholder="Ex. VIP"
                value={t.name}
                maxLength={30}
                onChange={(e) => update(i, { name: e.target.value })}
                className={`w-full min-w-0 ${inputClass}`}
              />
              <input
                inputMode="numeric"
                placeholder="0"
                value={t.price}
                onChange={(e) => update(i, { price: e.target.value.replace(/[^\d]/g, '') })}
                className={`w-full min-w-0 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Retirer cette place"
                className="flex size-9 items-center justify-center rounded-full bg-parchment text-stone-600 active:scale-95"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
          ))}
          {tiers!.length < 8 && (
            <button
              type="button"
              onClick={() => onTiersChange([...(tiers ?? []), { name: nextName(), price: '' }])}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-4 text-sm font-medium text-ink active:scale-95"
            >
              <Plus size={16} strokeWidth={1.75} /> Ajouter une place
            </button>
          )}
          <p className="text-xs text-stone-500">Prix vide ou 0 = place gratuite. Le moins cher s'affiche en premier (« Dès … »).</p>
        </div>
      )}
    </div>
  );
};

export default TicketFields;
