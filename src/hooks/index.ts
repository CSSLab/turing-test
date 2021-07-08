import { useCallback, useState } from "react";
import { cleanPGN, pgnToPlys, plysToMoves } from "../utils";
import { getGame } from "../api";

// @ts-ignore

const useGame = (): any => {
  const [loading, setLoading] = useState(false);

  const [gameId, setGameId] = useState<string>("");

  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const [result, setResult] = useState<string>("");
  const [moves, setMoves] = useState<[string, string][]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [gameStates, setGameStates] = useState([]);

  const fetchGame = useCallback(async () => {
    setLoading(true);
    const game = await getGame();
    const {
      moves: gamePgn,
      termination,
      result: gameResult,
      game_id: gameID,
      game_states: states,
    } = game;
    setMoves(plysToMoves(pgnToPlys(cleanPGN(gamePgn))));
    setGameId(gameID);
    setGameStates(states);
    setResult(
      `${gameResult.replace("_", " ")} by ${
        termination === "mate" ? "checkmate" : "time"
      }`
    );
    setSelectedIndex(0);
    setLoading(false);
  }, [
    setLoading,
    setSelectedIndex,
    setResult,
    setGameStates,
    setGameId,
    setMoves,
  ]);

  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex < gameStates.length - 1;
  const getPrevious = useCallback(
    () => (hasPrevious ? setSelectedIndex(selectedIndex - 1) : {}),
    [hasPrevious, selectedIndex]
  );
  const getNext = useCallback(
    () => (hasNext ? setSelectedIndex(selectedIndex + 1) : {}),
    [hasNext, selectedIndex]
  );
  const getFirst = useCallback(() => setSelectedIndex(0), [setSelectedIndex]);
  const getLast = useCallback(
    () => setSelectedIndex(gameStates.length - 1),
    [gameStates.length, setSelectedIndex]
  );

  const changeOrientation = () =>
    setOrientation(orientation === "white" ? "black" : "white");

  const { fen, lastMove, check } = gameStates[selectedIndex] ?? {};
  return [
    loading,
    {
      fen,
      lastMove: [...(lastMove ?? [])],
      check,
      orientation,
      hasPrevious,
      hasNext,
      selectedIndex,
    },
    { moves, result, gameId },
    [fetchGame, setSelectedIndex],
    [getFirst, getPrevious, changeOrientation, getNext, getLast],
  ];
};

export default useGame;
