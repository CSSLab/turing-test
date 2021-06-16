import React, { useCallback, useEffect, useMemo, useState } from "react";

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
  useViewport,
} from "./utils";
import {
  authenticate,
  authenticateWithLichess,
  getGame,
  login,
  useAuthStatus,
} from "./api";

import "./App.scss";

const Icon = (
  <svg viewBox="-4 -2 54 54" xmlns="http://www.w3.org/2000/svg" width={37}>
    <path
      fill="white"
      stroke="white"
      strokeLinejoin="round"
      d="M38.956.5c-3.53.418-6.452.902-9.286 2.984C5.534 1.786-.692 18.533.68 29.364 3.493 50.214 31.918 55.785 41.329 41.7c-7.444 7.696-19.276 8.752-28.323 3.084C3.959 39.116-.506 27.392 4.683 17.567 9.873 7.742 18.996 4.535 29.03 6.405c2.43-1.418 5.225-3.22 7.655-3.187l-1.694 4.86 12.752 21.37c-.439 5.654-5.459 6.112-5.459 6.112-.574-1.47-1.634-2.942-4.842-6.036-3.207-3.094-17.465-10.177-15.788-16.207-2.001 6.967 10.311 14.152 14.04 17.663 3.73 3.51 5.426 6.04 5.795 6.756 0 0 9.392-2.504 7.838-8.927L37.4 7.171z"
    />
  </svg>
);

// Awful blitz game played by me
const DEFAULT_PGN =
  "1. e4 e5 2. Nf3 d6 3. Bc4 { C41 Philidor Defense } Bg4 4. h3 Bxf3 5. Qxf3 Qf6 6. Qb3 b6 7. O-O Ne7 8. Nc3 g6 9. Qb5+ c6 10. Qb3 Bg7 11. Be2 O-O 12. d3 Na6 13. Bf3 Nc5 14. Qa3 d5 15. b4 dxe4 16. dxe4 Nd7 17. Bb2 c5 18. bxc5 Nxc5 19. Nd5 Nxd5 20. exd5 a6 21. Rfe1 Qd6 22. Qe3 e4 23. Bxg7 Kxg7 24. Bxe4 Nxe4 25. Qxe4 Rae8 26. Qd4+ f6 27. Rxe8 Rxe8 28. c4 Re2 29. a4 Qe7 30. d6 Qd7 31. Kf1 Re6 32. Rd1 h6 33. c5 bxc5 34. Qxc5 Re5 35. Qc7 Qxc7 36. dxc7 Rc5 37. Rd7+ Kf8 38. Rd8+ Ke7 39. c8=Q Rxc8 40. Rxc8 { Black resigns. } 1-0";

// @ts-ignore
const chess = new Chess();

const App: React.FC = () => {
  const [{ id, lichessUsername, providedUsername }, updateAuthStatus] =
    useAuthStatus();
  const [loading, setLoading] = useState<boolean>(false);

  const [pgn, setPgn] = useState<string>(DEFAULT_PGN);
  const [fen, setFen] = useState<string>("");

  const [plys, setplys] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [lastMove, setLastMove] = useState<cg.Key[]>();
  const [check, setCheck] = useState<cg.Color | boolean>(false);
  const [result, setResult] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(!lichessUsername);

  const [orientation, setOrientation] = useState<"white" | "black">("white");

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
  const onChangeOrientation = () =>
    setOrientation(orientation === "white" ? "black" : "white");

  const moves = useMemo(() => plysToMoves([...plys].slice(0, -1)), [plys]);

  const width = useViewport();

  useEffect(() => {
    if (id) {
      login(updateAuthStatus, id);
    }
  }, [id, updateAuthStatus]);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
      </div>
    );
  }

  const Modal = () => (
    <div className="Modal">
      <div className="Modal-Content">
        <h2>Turing Test Survey</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
          irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem
          ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
          ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
        <button
          className="Auth-Button"
          onClick={() => authenticateWithLichess(updateAuthStatus)}
        >
          Continue with Lichess {Icon}
        </button>
        <button
          className="Auth-Button-Muted"
          onClick={() => authenticate(updateAuthStatus)}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );

  const PlysContainer = () => (
    <div className="Plys-Container">
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
                    selectedIndex === index * 2 + 1 ? "Selected-Ply" : ""
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
  );

  if (width <= 800) {
    return (
      <div className="App">
        <div className="App-container">
          {/* <div className="Header">
            <div>
              <h3>
                Logged in as: <span>DrNykterstein</span>
              </h3>
            </div>
            <div className="Stats-Container">
              <div className="Stat-Row">
                <h5>Total Guesses: 580</h5>
              </div>
              <div className="Stat-Row">
                <h5>
                  <span>White:</span> <span className="Correct-Count">5</span> |{" "}
                  <span className="Incorrect-Count">10</span> |{" "}
                  <span className="Correct-Count">33%</span>
                </h5>
              </div>
              <div className="Stat-Row">
                <h5>
                  <span>Black:</span> <span className="Correct-Count">10</span>{" "}
                  | <span className="Incorrect-Count">5</span> |{" "}
                  <span className="Correct-Count">66%</span>
                </h5>
              </div>
            </div>
          </div> */}
          <div className="History-Container">
            <span className="Unknown">?</span>
            <span className="Unknown">?</span>
            <span className="Unknown">?</span>
            <span className="Unknown">?</span>
          </div>
          <div className="Container">
            <div className="Board-Container">
              <Chessground
                config={{
                  fen,
                  movable: { free: false },
                  highlight: { check: true, lastMove: true },
                  check,
                  lastMove,
                  animation: { duration: 300 },
                  orientation,
                }}
                contained
              />
            </div>
            <div className="Mobile-Container">
              <div className="Guess-Group">
                <div className="Guess-Container">
                  <h4 style={{ margin: 10 }}>Black</h4>
                  <select>
                    <option>Bot</option>
                    <option>Player</option>
                    <option>Unknown</option>
                  </select>
                </div>
                <div className="Guess-Container">
                  <h4 style={{ margin: 10 }}>White</h4>
                  <select>
                    <option>Bot</option>
                    <option>Player</option>
                    <option>Unknown</option>
                  </select>
                </div>
                <button className="Secondary-Button">Sign out</button>
                <button className="Secondary-Button">Skip Game</button>
                <button className="Secondary-Button">View on Lichess</button>
                <button className="Submit-Button">Submit</button>
              </div>
              <div className="Mobile-Column">
                <PlysContainer />
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
                  <button onClick={onChangeOrientation}>&#8635;</button>
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
      </div>
    );
  }

  return (
    <div className="App">
      {!id && <Modal />}
      <div className="App-container">
        <div className="Header">
          <div>
            <h3>
              Logged in as:{" "}
              <span>
                {lichessUsername ?? providedUsername ?? id ?? "DrNykterstein"}
              </span>
            </h3>
          </div>
        </div>
        <div className="Container">
          <div className="Submission-Container">
            <div className="Guess-Group">
              <div className="Guess-Container">
                <h4 style={{ margin: 10 }}>Black</h4>
                <select>
                  <option>Bot</option>
                  <option>Player</option>
                  <option>Unknown</option>
                </select>
              </div>
              <div className="Guess-Container">
                <h4 style={{ margin: 10 }}>White</h4>
                <select>
                  <option>Bot</option>
                  <option>Player</option>
                  <option>Unknown</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "auto",
              }}
            >
              <button className="Secondary-Button" onClick={() => getGame()}>
                Get Game [Debug]
              </button>
              <button
                className="Secondary-Button"
                onClick={() => setShowModal(true)}
              >
                Show Modal [Debug]
              </button>
              <button
                className="Secondary-Button"
                onClick={() => updateAuthStatus()}
              >
                Sign out
              </button>
              <button
                className="Secondary-Button"
                onClick={() => authenticateWithLichess(updateAuthStatus)}
              >
                Authorize with Lichess
              </button>
              <button className="Submit-Button">Submit</button>
            </div>
          </div>
          <div className="Board-Container">
            <Chessground
              config={{
                fen,
                movable: { free: false },
                highlight: { check: true, lastMove: true },
                check,
                lastMove,
                animation: { duration: 300 },
                orientation,
              }}
              height={500}
              width={500}
              contained
            />
          </div>
          <div className="Bordered">
            <PlysContainer />
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
              <button onClick={onChangeOrientation}>&#8635;</button>
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
        <div className="History-Container">
          <span className="Unknown">?</span>
          <span className="Unknown">?</span>
          <span className="Unknown">?</span>
          <span className="Unknown">?</span>
        </div>
      </div>
    </div>
  );
};

export default App;
