import { useCallback, useState } from "react";
import { cleanPGN, pgnToPlys, plysToMoves } from "../utils";
import { getGame, postEvent, EventType } from "../api";

const useGame = (): any => {
  const [loading, setLoading] = useState(false);

  const [gameId, setGameId] = useState<string>("");

  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const [result, setResult] = useState<string>("");
  const [moves, setMoves] = useState<[string, string][]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [eventNumber, setEventNumber] = useState<number>(0);
  const [gameStates, setGameStates] = useState([]);

  const getEventNumber = useCallback(() => {
    setEventNumber(eventNumber + 1);
    return eventNumber;
  }, [eventNumber]);

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
    setEventNumber(0);
    setLoading(false);
  }, [
    setLoading,
    setSelectedIndex,
    setResult,
    setGameStates,
    setGameId,
    setMoves,
  ]);

  const logEvent = useCallback(
    (eventType: EventType, data = {}) =>
      postEvent(
        gameId,
        getEventNumber(),
        eventType,
        orientation === "black",
        selectedIndex,
        data
      ),
    [gameId, getEventNumber, orientation, selectedIndex]
  );

  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex < gameStates.length - 1;
  const getPrevious = useCallback(() => {
    if (hasPrevious) {
      setSelectedIndex(selectedIndex - 1);
      logEvent("PREV_PLY");
    }
  }, [hasPrevious, logEvent, selectedIndex]);
  const getNext = useCallback(() => {
    if (hasNext) {
      setSelectedIndex(selectedIndex + 1);
      logEvent("NEXT_PLY");
    }
  }, [hasNext, logEvent, selectedIndex]);
  const getFirst = useCallback(() => {
    setSelectedIndex(0);
    logEvent("FIRST_PLY");
  }, [logEvent]);
  const getLast = useCallback(() => {
    setSelectedIndex(gameStates.length - 1);
    logEvent("LAST_PLY");
  }, [gameStates.length, logEvent]);

  const changeOrientation = () => {
    setOrientation(orientation === "white" ? "black" : "white");
    logEvent("BOARD_FLIP");
  };

  const { fen, lastMove, check } = gameStates[selectedIndex] ?? {};
  return [
    loading,
    {
      fen,
      lastMove: [...(lastMove ?? [])],
      // eslint-disable-next-line no-nested-ternary
      check: check ? (selectedIndex % 2 === 0 ? "white" : "black") : false,
      orientation,
      hasPrevious,
      hasNext,
      selectedIndex,
    },
    { moves, result, gameId },
    [
      fetchGame,
      (index: number) => {
        setSelectedIndex(index);
        logEvent("SELECT_PLY");
      },
    ],
    [getFirst, getPrevious, changeOrientation, getNext, getLast],
    [logEvent],
  ];
};

export default useGame;
