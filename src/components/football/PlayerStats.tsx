"use client";

import { motion, useReducedMotion } from "motion/react";
import { Ban, CircleDot, Goal, Shirt } from "lucide-react";
import { useEffect, useState } from "react";
import type { StadiumPlayer } from "./types";

// Geporteerd van het Lovable-ontwerp ("stadium-spirit"); "Injuries" is
// vervangen door "Rood" (rode kaarten), omdat dat al beschikbaar is in onze
// spelersstatistieken en beter past bij een publiek zichtbare kaart.
type Stat = { label: string; value: number; icon: typeof Goal };

function CountUp({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Bij reduceMotion tonen we `value` direct in de render (zie hieronder) en
    // hoeft dit effect niets te doen.
    if (reduceMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 520, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, value]);

  return <span>{reduceMotion ? value : shown}</span>;
}

export function PlayerStats({ player }: { player: StadiumPlayer }) {
  const stats: Stat[] = [
    { label: "Wedstrijden", value: player.matches, icon: Shirt },
    { label: "Doelpunten", value: player.goals, icon: Goal },
    { label: "Geel", value: player.yellowCards, icon: CircleDot },
    { label: "Rood", value: player.redCards, icon: Ban },
  ];

  return (
    <motion.div
      className="player-stats"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: 0.08 }}
    >
      {stats.map(({ label, value, icon: Icon }, index) => (
        <motion.div
          className="player-stat"
          key={label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.11 + index * 0.045 }}
        >
          <Icon aria-hidden="true" />
          <strong>
            <CountUp value={value} />
          </strong>
          <span>{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
