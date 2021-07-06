/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from "react";

import Chessground from "@react-chess/chessground";
import logo from "./logo.svg";
import { useViewport } from "./utils";
import {
  authenticate,
  authenticateWithLichess,
  getGame,
  login,
  submitGuess,
  useAuthStatus,
} from "./api";

import "./App.scss";
import useGame from "./hooks";

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

// @ts-nocheck
const Ply = ({
  move: [whitePly, blackPly],
  index,
  // eslint-disable-next-line react/prop-types
  setSelectedIndex,
  selectedIndex,
}: any) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      fontSize: 17,
    }}
    key={`move-${index}`}
  >
    <div className="Index-Container">
      <span>{index + 1}</span>
    </div>
    {whitePly && (
      <div
        className={`Ply-Container ${
          index * 2 + 1 === selectedIndex ? "Selected-Ply" : ""
        }`}
        key={index * 2}
        onClick={() => setSelectedIndex(index * 2 + 1)}
      >
        {whitePly}
      </div>
    )}
    {blackPly && (
      <div
        className={`Ply-Container ${
          index * 2 + 2 === selectedIndex ? "Selected-Ply" : ""
        }`}
        key={index * 2 + 1}
        onClick={() => setSelectedIndex(index * 2 + 2)}
      >
        {blackPly}
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  const [{ id, lichessUsername, providedUsername }, updateAuthStatus] =
    useAuthStatus();

  const [showModal, setShowModal] = useState<boolean>(!lichessUsername);
  const [currentGuess, setCurrentGuess] =
    useState<"black" | "white" | null>(null);

  const [
    loading,
    { fen, lastMove, check, orientation, hasPrevious, hasNext, selectedIndex },
    { moves, result, gameId },
    [fetchGame, setSelectedIndex],
    [getFirst, getPrevious, changeOrientation, getNext, getLast],
  ] = useGame();

  const width = useViewport();

  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      login(updateAuthStatus, id).then(() => {
        fetchGame();
      });
    }
  }, [fetchGame, id, updateAuthStatus]);

  useEffect(() => {
    const onKeyDown = (e: any) => {
      switch (e.key) {
        case "Left":
        case "ArrowLeft":
          getPrevious();
          break;
        case "Right":
        case "ArrowRight":
          getNext();
          break;
        case "Down":
        case "ArrowDown":
          getLast();
          break;
        case "Up":
        case "ArrowUp":
          getFirst();
          break;
        case "f":
          changeOrientation();
          break;
        default:
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getFirst, getLast, getNext, getPrevious, changeOrientation]);

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
        <h2>Maia Turing Test</h2>
        <h3>TESTING</h3>
        <p>Login with Lichess or use a guest account</p>
        <p>Try to guess which player is the computer</p>
        <button
          className="Auth-Button"
          onClick={() => authenticateWithLichess(updateAuthStatus)}
        >
          Continue with Lichess {Icon}
        </button>
        <button
          className="Auth-Button-Muted"
          onClick={() => {
            authenticate(updateAuthStatus);
          }}
        >
          Continue as Guest
        </button>
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
                <div
                  className={`Guess-Container-${
                    currentGuess === "black" ? "Selected" : ""
                  }`}
                  onClick={() => setCurrentGuess("black")}
                >
                  <h4 style={{ margin: 10 }}>Black</h4>
                </div>
                <div
                  className={`Guess-Container-${
                    currentGuess === "white" ? "Selected" : ""
                  }`}
                  onClick={() => {
                    setCurrentGuess("white");
                  }}
                >
                  <h4 style={{ margin: 10 }}>White</h4>
                </div>
                <button className="Secondary-Button">Sign out</button>
                <button className="Secondary-Button">Skip Game</button>
                <button className="Secondary-Button">View on Lichess</button>
                <button className="Submit-Button">Submit</button>
              </div>
              <div className="Mobile-Column">
                <div className="Plys-Container">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {moves
                      .map((move: any, index: number) => (
                        <Ply
                          move={move}
                          index={index}
                          setSelectedIndex={setSelectedIndex}
                          selected
                        />
                      ))
                      .concat([
                        <div className="Result-Container" key="result">
                          <h5>{result}</h5>
                        </div>,
                      ])}
                  </div>
                </div>
                <div className="Button-Group">
                  <button onClick={changeOrientation}>&#8635;</button>
                  <button onClick={() => getFirst} disabled={!hasPrevious}>
                    &#8249;&#8249;&#8249;
                  </button>
                  <button onClick={getPrevious} disabled={!hasPrevious}>
                    &#8249;
                  </button>
                  <button onClick={getNext} disabled={!hasNext}>
                    &#8250;
                  </button>
                  <button onClick={getLast} disabled={!hasNext}>
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
              Pick the AI:
              <div
                className={`Guess-Container${
                  currentGuess === "black" ? "-Selected" : ""
                }`}
                onClick={() => setCurrentGuess("black")}
              >
                <h4 style={{ margin: 10 }}>Black</h4>
              </div>
              <div
                className={`Guess-Container${
                  currentGuess === "white" ? "-Selected" : ""
                }`}
                onClick={() => {
                  setCurrentGuess("white");
                }}
              >
                <h4 style={{ margin: 10 }}>White</h4>
              </div>
            </div>
            <div className="Guess-Container">
              <h1>
                {`${(
                  (history.filter((val) => val).length / history.length) *
                  100
                ).toFixed(2)}
                %`}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "auto",
              }}
            >
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
              <button
                className="Submit-Button"
                onClick={() =>
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  submitGuess(currentGuess!, gameId).then((res) => {
                    const { guess_correct: correct } = res;
                    setHistory([...history, correct ? 1 : 0]);
                    setCurrentGuess(null);
                    fetchGame();
                  })
                }
                disabled={currentGuess === null}
              >
                Submit
              </button>
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
                animation: { duration: 150 },
                orientation,
              }}
              contained
            />
          </div>
          <div className="Bordered">
            <div className="Plys-Container">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {moves
                  .map((move: any, index: number) => (
                    <Ply
                      move={move}
                      index={index}
                      setSelectedIndex={setSelectedIndex}
                      selectedIndex={selectedIndex}
                    />
                  ))
                  .concat([
                    <div className="Result-Container" key="result">
                      <h5>{result}</h5>
                    </div>,
                  ])}
              </div>
            </div>
            <div className="Button-Group">
              <button onClick={changeOrientation}>&#8635;</button>
              <button onClick={getFirst} disabled={!hasPrevious}>
                &#8249;&#8249;&#8249;
              </button>
              <button onClick={getPrevious} disabled={!hasPrevious}>
                &#8249;
              </button>
              <button onClick={getNext} disabled={!hasNext}>
                &#8250;
              </button>
              <button onClick={getLast} disabled={!hasNext}>
                &#8250;&#8250;&#8250;
              </button>
            </div>
          </div>
        </div>
        <div className="History-Container">
          {history.slice(-10).map((v, i) => (
            <span key={i} className={v ? "Correct" : "Incorrect"} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
