"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { StadiumPlayer } from "./types";
import { PlayerPortrait } from "./PlayerPortrait";
import { PlayerStats } from "./PlayerStats";

type MobilePlayerOverlayProps = {
  player: StadiumPlayer | null;
  onClose: () => void;
};

// Op mobiel/touch groeit een aangetikte spelerskaart niet meer in-place op
// zijn veldpositie (die kan overal op het veld liggen, dus ook half buiten
// beeld) — in plaats daarvan tonen we deze losstaande kopie. Dit is puur
// DOM/CSS (geen 3D/Html-positionering), met `position: fixed` op een
// element zonder getransformeerde voorouder, dus hij verschijnt altijd
// precies gecentreerd op het scherm.
export function MobilePlayerOverlay({ player, onClose }: MobilePlayerOverlayProps) {
  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="mobile-player-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="mobile-overlay-card"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <button type="button" className="mobile-overlay-close" onClick={onClose} aria-label="Sluiten">
              <X aria-hidden="true" />
            </button>
            <span className="card-sheen" aria-hidden="true" />
            <span className="portrait-wrap">
              <PlayerPortrait player={player} />
            </span>
            <span className="player-identity">
              <strong>{player.name}</strong>
              <span>Basisploeg</span>
            </span>
            <PlayerStats player={player} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
