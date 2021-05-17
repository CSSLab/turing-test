import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import Chess from "chess.js";
import Chessground from "@react-chess/chessground";
import * as cg from "chessground/types";
import logo from "./logo.svg";
import { cleanPGN, plysToPGN, pgnToPlys, plysToMoves } from "./utils";

// Awful blitz game played by me
const DEFAULT_PGN =
  "1. e4 { [%clk 0:03:00] } 1... b6 { [%clk 0:03:00] } 2. d4 { [%clk 0:02:58] } 2... Ba6 { [%clk 0:03:00] } 3. Bxa6 { [%clk 0:02:56] } 3... Nxa6 { [%clk 0:02:59] } 4. Qd3 { [%clk 0:02:55] } 4... Qc8 { [%clk 0:02:59] } 5. Nc3 { [%clk 0:02:53] } 5... Qb7 { [%clk 0:02:59] } 6. Nf3 { [%clk 0:02:51] } 6... e6 { [%clk 0:02:58] } 7. Bf4 { [%clk 0:02:50] } 7... Bb4 { [%clk 0:02:57] } 8. a3 { [%clk 0:02:48] } 8... Bxc3+ { [%clk 0:02:55] } 9. bxc3 { [%clk 0:02:48] } 9... Nf6 { [%clk 0:02:53] } 10. e5 { [%clk 0:02:46] } 10... Nd5 { [%clk 0:02:52] } 11. Bd2 { [%clk 0:02:41] } 11... c6 { [%clk 0:02:45] } 12. Ng5 { [%clk 0:02:40] } 12... h6 { [%clk 0:02:42] } 13. Nf3 { [%clk 0:02:35] } 13... O-O { [%clk 0:02:40] } 14. Bxh6 { [%clk 0:02:31] } 14... f5 { [%clk 0:02:36] } 15. Bg5 { [%clk 0:02:19] } 15... Qc8 { [%clk 0:02:29] } 16. O-O { [%clk 0:02:14] } 16... c5 { [%clk 0:02:27] } 17. c4 { [%clk 0:02:03] } 17... Ndc7 { [%clk 0:02:09] } 18. c3 { [%clk 0:01:56] } 18... Qe8 { [%clk 0:02:06] } 19. d5 { [%clk 0:01:51] } 19... Qg6 { [%clk 0:01:53] } 20. d6 { [%clk 0:01:46] } 20... Ne8 { [%clk 0:01:47] } 21. Be7 { [%clk 0:01:45] } 21... Rf7 { [%clk 0:01:46] } 22. Nh4 { [%clk 0:01:42] } 22... Qh6 { [%clk 0:01:40] } 23. Qf3 { [%clk 0:01:30] } 23... g5 { [%clk 0:01:37] } 24. Qxa8 { [%clk 0:01:27] } 24... gxh4 { [%clk 0:01:33] } 25. Qxe8+ { [%clk 0:01:21] } 25... Kg7 { [%clk 0:01:26] } 26. Bf6+ { [%clk 0:01:11] } 26... Kg6 { [%clk 0:01:14] } 27. Qg8+ { [%clk 0:00:58] } 27... Rg7 { [%clk 0:01:10] } 28. Bxg7 { [%clk 0:00:57] } 28... Qxg7 { [%clk 0:01:09] } 29. Qxg7+ { [%clk 0:00:56] } 29... Kxg7 { [%clk 0:01:09] } 30. g3 { [%clk 0:00:54] } 30... Nb8 { [%clk 0:01:08] } 31. gxh4 { [%clk 0:00:53] } 31... Nc6 { [%clk 0:01:06] } 32. Rfe1 { [%clk 0:00:51] } 32... Kg6 { [%clk 0:01:05] } 33. Kh1 { [%clk 0:00:50] } 33... Kh5 { [%clk 0:01:03] } 34. a4 { [%clk 0:00:46] } 34... Kxh4 { [%clk 0:01:02] } 35. Ra2 { [%clk 0:00:43] } 35... Kg4 { [%clk 0:01:01] } 36. Rae2 { [%clk 0:00:41] } 36... Na5 { [%clk 0:00:54] } 37. Rg1+ { [%clk 0:00:38] } 37... Kf4 { [%clk 0:00:48] } 38. h3 { [%clk 0:00:36] } 38... Nxc4 { [%clk 0:00:47] } 39. h4 { [%clk 0:00:35] } 39... Nxe5 { [%clk 0:00:46] } 40. Rxe5 { [%clk 0:00:33] } 40... Kxe5 { [%clk 0:00:44] } 41. h5 { [%clk 0:00:33] } 41... Kxd6 { [%clk 0:00:43] } 42. h6 { [%clk 0:00:33] } 42... e5 { [%clk 0:00:42] } 43. h7 { [%clk 0:00:33] } 43... Kd5 { [%clk 0:00:41] } 44. h8=Q { [%clk 0:00:33] } 44... d6 { [%clk 0:00:40] } 45. Qg8+ { [%clk 0:00:32] } 45... Ke4 { [%clk 0:00:37] } 46. Re1+ { [%clk 0:00:31] } 46... Kf4 { [%clk 0:00:36] } 47. Qc4+ { [%clk 0:00:29] } 47... e4 { [%clk 0:00:35] } 48. f3 { [%clk 0:00:28] } 48... Kxf3 { [%clk 0:00:33] } 49. Rf1+ { [%clk 0:00:27] } 49... Kg4 { [%clk 0:00:31] } 50. Qe2+ { [%clk 0:00:26] } 50... Kg5 { [%clk 0:00:29] } 51. Qe3+ { [%clk 0:00:25] } 51... Kf6 { [%clk 0:00:29] } 52. Qf4 { [%clk 0:00:24] } 52... Ke7 { [%clk 0:00:23] } 53. Rd1 { [%clk 0:00:23] } 53... Kd7 { [%clk 0:00:23] } 54. Qxd6+ { [%clk 0:00:22] } 54... Kc8 { [%clk 0:00:22] } 55. Qe5 { [%clk 0:00:21] } 55... Kb7 { [%clk 0:00:22] } 56. Qxf5 { [%clk 0:00:21] } 56... Ka6 { [%clk 0:00:20] } 57. Qxe4 { [%clk 0:00:20] } 57... Ka5 { [%clk 0:00:19] } 58. Qc4 { [%clk 0:00:19] } 58... a6 { [%clk 0:00:18] } 59. Qe6 { [%clk 0:00:15] } 59... b5 { [%clk 0:00:16] } 60. Ra1 { [%clk 0:00:15] } 60... bxa4 { [%clk 0:00:14] } 61. Qe7 { [%clk 0:00:14] } 61... Kb5 { [%clk 0:00:13] } 62. Qd7+ { [%clk 0:00:13] } 62... Kc4 { [%clk 0:00:12] } 63. Qf7+ { [%clk 0:00:12] } 63... Kxc3 { [%clk 0:00:10] } 64. Rc1+ { [%clk 0:00:11] } 64... Kb4 { [%clk 0:00:10] } 65. Rb1+ { [%clk 0:00:10] } 65... Kc3 { [%clk 0:00:07] } 66. Qf3+ { [%clk 0:00:09] } 66... Kd4 { [%clk 0:00:07] } 67. Qg4+ { [%clk 0:00:09] } 67... Ke5 { [%clk 0:00:07] } 68. Qg3+ { [%clk 0:00:08] } 68... Ke6 { [%clk 0:00:06] } 69. Qg2 { [%clk 0:00:08] } 69... Kd7 { [%clk 0:00:05] } 70. Rd1+ { [%clk 0:00:08] } 70... Kc7 { [%clk 0:00:04] } 71. Qf2 { [%clk 0:00:08] } 71... Kb6 { [%clk 0:00:04] } 72. Qb2+ { [%clk 0:00:08] } 72... Kc6 { [%clk 0:00:03] } 73. Rc1 { [%clk 0:00:08] } 73... c4 { [%clk 0:00:02] } 74. Qd2 { [%clk 0:00:08] } 74... Kc5 { [%clk 0:00:01] } 75. Qc2 { [%clk 0:00:07] } 75... Kb4 { [%clk 0:00:01] } 76. Qxc4+ { 1-0 White wins on time. } { [%clk 0:00:07] } 1-0";

// @ts-ignore
const chess = new Chess();

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [pgn, setPgn] = useState<string>(DEFAULT_PGN);
  const [fen, setFen] = useState<string>("");

  const [plys, setplys] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [lastMove, setLastMove] = useState<cg.Key[]>();
  const [check, setCheck] = useState<cg.Color | boolean>(false);

  const updateCheck = useCallback(() => {
    if (selectedIndex === plys.length - 1) {
      setCheck(false);
      return;
    }
    let checkStatus: cg.Color | boolean = false;
    if (chess.in_check()) {
      checkStatus = selectedIndex % 2 ? "white" : "black";
    }
    setCheck(checkStatus);
  }, [plys.length, selectedIndex]);

  useEffect(() => {
    setplys(pgnToPlys(cleanPGN(pgn)));
    chess.load_pgn(pgn);
    setFen(chess.fen());
  }, [pgn, updateCheck]);

  useEffect(() => {
    chess.load_pgn(plysToPGN(plys.slice(0, selectedIndex + 1)));
    setFen(chess.fen());
    updateCheck();
    const newLastMove = chess.undo();
    if (newLastMove) {
      setLastMove([newLastMove.from, newLastMove.to]);
    }
  }, [selectedIndex, plys, updateCheck]);

  const hasPrevious = selectedIndex >= 0;
  const hasNext = selectedIndex < plys.length - 2;
  const getPrevious = () => setSelectedIndex(selectedIndex - 1);
  const getNext = () => setSelectedIndex(selectedIndex + 1);

  if (loading) {
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>;
  }

  const moves = useMemo(() => plysToMoves(plys), [plys]);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: "flex" }}>
          <Chessground
            config={{
              fen,
              movable: { free: false },
              highlight: { check: true, lastMove: true },
              check,
              lastMove,
              animation: { duration: 300 },
            }}
            height={500}
            width={500}
          />
          <div>
            <div
              style={{ height: 500, overflowY: "scroll", overflowX: "hidden" }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {moves.map(([whitePly, blackPly], index) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      fontSize: 18,
                    }}
                  >
                    <div style={{ margin: 3, width: 35 }}>
                      <span>{index + 1}</span>
                    </div>
                    <div
                      style={{
                        margin: 3,
                        width: 60,
                        justifyContent: "flex-start",
                        display: "flex",
                      }}
                      onClick={() => setSelectedIndex(index * 2)}
                    >
                      {whitePly}
                    </div>
                    <div
                      style={{
                        margin: 3,
                        width: 60,
                        justifyContent: "flex-start",
                        display: "flex",
                      }}
                      onClick={() => setSelectedIndex(index * 2 + 1)}
                    >
                      {blackPly}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button onClick={() => setSelectedIndex(0)}>{"<<<"}</button>
              <button onClick={getPrevious} disabled={!hasPrevious}>
                {"<"}
              </button>
              <button onClick={getNext} disabled={!hasNext}>
                {">"}
              </button>
              <button onClick={() => setSelectedIndex(plys.length - 2)}>
                {">>>"}
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default App;
