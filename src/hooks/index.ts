import React, { useEffect, useMemo, useState } from "react";
import Chess from "chess.js";
import { cleanPGN, pgnToPlys, plysToPGN } from "../utils";

// @ts-ignore
const chess = new Chess();

const useGameHistory = (pgn: string) => {
  const plys = useMemo(() => pgnToPlys(cleanPGN(pgn)), [pgn]);
  const history = useMemo(() => {
    const newHistory = plys.map((ply: string, index: number) => {
      chess.load_pgn(plysToPGN(plys.slice(0, index + 1)));
      const newPly = {
        ply,
        fen: chess.fen(),
        check: chess.in_check() && ((index + 1) % 2 === 0 ? "white" : "black"),
      };

      const lastMove = chess.undo();

      return {
        ...newPly,
        lastMove: lastMove ? [lastMove.from, lastMove.to] : undefined,
      };
    });

    return newHistory;
  }, [plys]);
  return history;
};

export default useGameHistory;
