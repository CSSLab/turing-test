import React from "react";

export const cleanPGN = (str: string) =>
  str
    .replace(/(\{.*?\})|(\d+\.+)/g, "")
    .replace(/\s\s+/g, " ")
    .trim();

export const getResult = (str: string) =>
  str
    .match(/(\{.*?\})/g)
    ?.pop()
    ?.slice(2, -3);

export const pgnToPlys = (str: string) => str.split(" ");

export const plysToPGN = (moves: string[]) =>
  moves
    .map((move, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${move}` : move))
    .join(" ");

export const plysToMoves = (plys: string[]) =>
  plys.reduce((rows: any[], key, index) => {
    return (
      (index % 2 === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
      rows
    );
  }, []);

export const useViewport = () => {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return width;
};

export const buildLichessGameUrl = (gameId: string) =>
  `https://lichess.org/${gameId}`;
