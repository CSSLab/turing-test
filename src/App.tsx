import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./App.scss";

import Chess from "chess.js";
import Chessground from "@react-chess/chessground";
import * as cg from "chessground/types";
import logo from "./logo.svg";
import {
  cleanPGN,
  plysToPGN,
  pgnToPlys,
  plysToMoves,
  getResult,
} from "./utils";

// Awful blitz game played by me
const DEFAULT_PGN =
  "1. e4 e5 2. Nf3 d6 3. Bc4 { C41 Philidor Defense } Bg4 4. h3 Bxf3 5. Qxf3 Qf6 6. Qb3 b6 7. O-O Ne7 8. Nc3 g6 9. Qb5+ c6 10. Qb3 Bg7 11. Be2 O-O 12. d3 Na6 13. Bf3 Nc5 14. Qa3 d5 15. b4 dxe4 16. dxe4 Nd7 17. Bb2 c5 18. bxc5 Nxc5 19. Nd5 Nxd5 20. exd5 a6 21. Rfe1 Qd6 22. Qe3 e4 23. Bxg7 Kxg7 24. Bxe4 Nxe4 25. Qxe4 Rae8 26. Qd4+ f6 27. Rxe8 Rxe8 28. c4 Re2 29. a4 Qe7 30. d6 Qd7 31. Kf1 Re6 32. Rd1 h6 33. c5 bxc5 34. Qxc5 Re5 35. Qc7 Qxc7 36. dxc7 Rc5 37. Rd7+ Kf8 38. Rd8+ Ke7 39. c8=Q Rxc8 40. Rxc8 { Black resigns. } 1-0";

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
  const [result, setResult] = useState<string>("");

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
    const gameResult = getResult(pgn);
    setResult(gameResult ?? "");
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

  const moves = useMemo(() => plysToMoves([...plys].slice(0, -1)), [plys]);

  return (
    <div className="App">
      <div className="App-container">
        <div style={{ display: "flex", maxHeight: 500 }}>
          <div className="Submission-Container">
            <div className="Guess-Container">
              <h4 style={{ margin: 10 }}>Black</h4>
              <select>
                <option>Bot</option>
                <option>Player</option>
              </select>
            </div>
            <div className="Guess-Container">
              <h4 style={{ margin: 10 }}>White</h4>
              <select>
                <option>Bot</option>
                <option>Player</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "auto",
              }}
            >
              <button className="Secondary-Button">Skip Game</button>
              <button className="Secondary-Button">View on Lichess</button>
              <button className="Submit-Button">Submit</button>
            </div>
          </div>
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
          <div className="Bordered">
            <div
              style={{ height: 500, overflowY: "scroll", overflowX: "hidden" }}
              className="Plys-Container"
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {moves
                  .map(([whitePly, blackPly], index) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        fontSize: 17,
                      }}
                      // eslint-disable-next-line react/no-array-index-key
                      key={index * 2}
                    >
                      <div className="Index-Container">
                        <span>{index + 1}</span>
                      </div>
                      <div
                        className={`Ply-Container ${
                          selectedIndex === index * 2 ? "Selected-Ply" : ""
                        }`}
                        onClick={() => setSelectedIndex(index * 2)}
                      >
                        {whitePly}
                      </div>
                      {blackPly && (
                        <div
                          className={`Ply-Container ${
                            selectedIndex === index * 2 + 1
                              ? "Selected-Ply"
                              : ""
                          }`}
                          // eslint-disable-next-line react/no-array-index-key
                          key={index * 2 + 1}
                          onClick={() => setSelectedIndex(index * 2 + 1)}
                        >
                          {blackPly}
                        </div>
                      )}
                    </div>
                  ))
                  .concat([
                    <div className="Result-Container" key="result">
                      <h5>
                        {result} {[...plys].pop()}
                      </h5>
                    </div>,
                  ])}
              </div>
            </div>
            <div className="Button-Group">
              <button
                onClick={() => setSelectedIndex(0)}
                disabled={!hasPrevious}
              >
                &#8249;&#8249;&#8249;
              </button>
              <button onClick={getPrevious} disabled={!hasPrevious}>
                &#8249;
              </button>
              <button onClick={getNext} disabled={!hasNext}>
                &#8250;
              </button>
              <button
                onClick={() => setSelectedIndex(plys.length - 2)}
                disabled={!hasNext}
              >
                &#8250;&#8250;&#8250;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
