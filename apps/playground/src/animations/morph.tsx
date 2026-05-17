import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useState } from "react";

const cards = [
  {
    id: 1,
    color: "#e74c3c",
    label: "Red",
    description: "Warm and energetic — draws attention, evokes passion.",
  },
  {
    id: 2,
    color: "#3498db",
    label: "Blue",
    description: "Calm and trustworthy — associated with depth and stability.",
  },
  {
    id: 3,
    color: "#2ecc71",
    label: "Green",
    description: "Refreshing — symbolises growth and harmony.",
  },
  {
    id: 4,
    color: "#f39c12",
    label: "Orange",
    description: "Vibrant and friendly — radiates warmth and creativity.",
  },
  {
    id: 5,
    color: "#9b59b6",
    label: "Purple",
    description: "Rich and mysterious — linked to imagination and wisdom.",
  },
  {
    id: 6,
    color: "#1abc9c",
    label: "Teal",
    description: "A blend of blue and green that evokes clarity.",
  },
];

function makePlaylist(prefix: string) {
  return [
    { id: `${prefix}-1`, title: "Track One", artist: "Artist A" },
    { id: `${prefix}-2`, title: "Track Two", artist: "Artist B" },
    { id: `${prefix}-3`, title: "Track Three", artist: "Artist C" },
    { id: `${prefix}-4`, title: "Track Four", artist: "Artist D" },
    { id: `${prefix}-5`, title: "Track Five", artist: "Artist E" },
  ];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

function Toggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="flex select-none items-center gap-2 rounded-full border px-4 py-2 font-medium text-sm transition-colors"
      onClick={onToggle}
      style={{
        borderColor: enabled ? "#2ecc71" : "#ccc",
        backgroundColor: enabled ? "#eafaf1" : "#fafafa",
        color: enabled ? "#1a7a4c" : "#666",
      }}
      type="button"
    >
      <span
        className="inline-block h-3 w-3 rounded-full transition-colors"
        style={{ backgroundColor: enabled ? "#2ecc71" : "#ccc" }}
      />
      {label}: {enabled ? "ON" : "OFF"}
    </button>
  );
}

export default function Morph() {
  const [useLayoutId, setUseLayoutId] = useState(true);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const [useLayoutGroup, setUseLayoutGroup] = useState(true);
  const [listA, setListA] = useState(() => makePlaylist("item"));
  const [listB, setListB] = useState(() => makePlaylist("item"));

  const toggleLayoutId = useCallback(() => {
    setSelectedCard(null);
    setUseLayoutId((v) => !v);
  }, []);

  const selected = cards.find((c) => c.id === selectedCard) ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="mb-16">
        <h1 className="mb-1 font-bold text-2xl">layoutId</h1>
        <p className="mb-6 text-neutral-500 text-sm">
          Two elements with the same <code>layoutId</code> morph between
          positions.
        </p>

        <div className="mb-6">
          <Toggle
            enabled={useLayoutId}
            label="Use layoutId"
            onToggle={toggleLayoutId}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <motion.div
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl p-8 text-white shadow-sm"
              key={card.id}
              layoutId={useLayoutId ? `morph-card-${card.id}` : undefined}
              onClick={() => setSelectedCard(card.id)}
              style={{ backgroundColor: card.color }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-semibold text-lg">{card.label}</span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selected !== null &&
            (useLayoutId ? (
              <motion.div
                animate={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                exit={{ backgroundColor: "rgba(0,0,0,0)" }}
                initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                key="backdrop"
                onClick={() => setSelectedCard(null)}
              >
                <motion.div
                  className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-white shadow-lg"
                  layoutId={`morph-card-${selected.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: selected.color }}
                >
                  <span className="font-bold text-2xl">{selected.label}</span>
                  <p className="text-center text-sm text-white/80">
                    {selected.description}
                  </p>
                  <button
                    className="mt-2 rounded-full bg-white/20 px-4 py-1.5 font-medium text-sm backdrop-blur-sm transition-colors hover:bg-white/30"
                    onClick={() => setSelectedCard(null)}
                    type="button"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                exit={{ backgroundColor: "rgba(0,0,0,0)" }}
                initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                key="backdrop"
                onClick={() => setSelectedCard(null)}
              >
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-white shadow-lg"
                  exit={{ opacity: 0, scale: 0.8 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: selected.color }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <span className="font-bold text-2xl">{selected.label}</span>
                  <p className="text-center text-sm text-white/80">
                    {selected.description}
                  </p>
                  <button
                    className="mt-2 rounded-full bg-white/20 px-4 py-1.5 font-medium text-sm backdrop-blur-sm transition-colors hover:bg-white/30"
                    onClick={() => setSelectedCard(null)}
                    type="button"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            ))}
        </AnimatePresence>
      </section>

      <section>
        <h2 className="mb-1 font-bold text-2xl">LayoutGroup</h2>
        <p className="mb-6 text-neutral-500 text-sm">
          <code>LayoutGroup</code> with an <code>id</code> namespaces
          <code>layoutId</code> so identically-named elements don't collide.
        </p>

        <div className="mb-6">
          <Toggle
            enabled={useLayoutGroup}
            label="Use LayoutGroup"
            onToggle={() => {
              setUseLayoutGroup((v) => !v);
              setListA(makePlaylist("item"));
              setListB(makePlaylist("item"));
            }}
          />
        </div>

        {useLayoutGroup ? (
          <div className="flex flex-col gap-4 sm:flex-row">
            <LayoutGroup id="a">
              {renderPlaylist("Playlist A", listA, () => setListA(shuffle))}
            </LayoutGroup>
            <LayoutGroup id="b">
              {renderPlaylist("Playlist B", listB, () => setListB(shuffle))}
            </LayoutGroup>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            {renderPlaylist("Playlist A", listA, () => setListA(shuffle))}
            {renderPlaylist("Playlist B", listB, () => setListB(shuffle))}
          </div>
        )}
      </section>
    </div>
  );
}

function renderPlaylist(
  title: string,
  items: { id: string; title: string; artist: string }[],
  onShuffle: () => void
) {
  return (
    <div className="flex-1 rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-700 text-sm">{title}</h3>
        <button
          className="rounded-md border px-3 py-1 font-medium text-neutral-600 text-xs transition-colors hover:bg-neutral-100"
          onClick={onShuffle}
          type="button"
        >
          Shuffle
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <motion.li
            className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2"
            key={item.id}
            layout
            layoutId={item.id}
          >
            <span className="font-medium text-neutral-400 text-xs">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-neutral-800 text-sm">
                {item.title}
              </p>
              <p className="text-neutral-500 text-xs">{item.artist}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
