import React, { useCallback, useState } from "react";
import { getEncodedAccessToken } from "./jwt";

type UpdateAuthStatus = (arg0?: Partial<ApiAuthResult>) => void;

interface AuthStatus {
  id: string | null;
  lichessUsername?: string | null;
  providedUsername?: string | null;
}

type ApiAuthResult = AuthStatus & {
  token: string;
};

const buildUrl = (path: string) => process.env.REACT_APP_API_BASE_URL + path;

export const getAuthHeader = (): string => `Bearer ${getEncodedAccessToken()}`;

export const getDefaultHeaders = () => {
  const headers: { [key: string]: string } = {};

  headers.Authorization = getAuthHeader();
  headers["Content-Type"] = "application/json";
  return headers;
};

export const useAuthStatus: () => [AuthStatus, UpdateAuthStatus] = () => {
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));
  const [lichessUsername, setLichessUsername] = useState(
    localStorage.getItem("lichess_username") === ""
      ? null
      : localStorage.getItem("lichess_username")
  );
  const [providedUsername, setProvidedUsername] = useState(
    localStorage.getItem("provided_username") === ""
      ? null
      : localStorage.getItem("provided_username")
  );

  const setAuthStatus = useCallback(
    ({
      id,
      token,
      lichessUsername: newLichessUsername,
      providedUsername: newProvidedUsername,
    }: Partial<ApiAuthResult> = {}) => {
      if (id && token) {
        setUserId(id ?? null);
        setLichessUsername(newLichessUsername ?? null);
        setProvidedUsername(newProvidedUsername ?? null);
        localStorage.setItem("user_id", id);
        localStorage.setItem("jwt:access", token);
        localStorage.setItem("provided_username", newLichessUsername ?? "");
        localStorage.setItem("lichess_username", newProvidedUsername ?? "");
      } else {
        localStorage.removeItem("user_id");
        localStorage.removeItem("jwt:access");
        localStorage.removeItem("provided_username");
        localStorage.removeItem("lichess_username");
        setUserId(id ?? null);
        setLichessUsername(newLichessUsername ?? null);
        setProvidedUsername(newProvidedUsername ?? null);
      }
    },
    []
  );

  const authStatus: AuthStatus = {
    id: userId,
    lichessUsername,
    providedUsername,
  };
  return [authStatus, setAuthStatus];
};

export const authenticate = async (updateAuthStatus: UpdateAuthStatus) => {
  const res = await fetch(buildUrl("auth/register"));
  const {
    user_id: id,
    jwt: { access_token: token },
    provided_username: providedUsername,
    lichess_username: lichessUsername,
  } = await res.json();
  updateAuthStatus({ id, token, providedUsername, lichessUsername });
};

export const login = async (
  updateAuthStatus: UpdateAuthStatus,
  userId: string
) => {
  const res = await fetch(buildUrl(`auth/login_id?user_id=${userId}`), {
    method: "POST",
  });
  const {
    user_id: id,
    jwt: { access_token: token },
    provided_username: providedUsername,
    lichess_username: lichessUsername,
  } = await res.json();
  updateAuthStatus({ id, token, providedUsername, lichessUsername });
};

export const authenticateWithLichess = async (
  updateAuthStatus: UpdateAuthStatus
) => {
  if (!localStorage.getItem("user_id")) await authenticate(updateAuthStatus);
  await fetch(buildUrl("auth/lichess_authorize"));
};

export const getGame = async () => {
  const res = await fetch(buildUrl("turing/new_game"), {
    headers: getDefaultHeaders(),
  });
  const json = await res.json();
  return json;
};

export const submitGuess = async (guess: string) => {
  const res = await fetch(buildUrl("turing/game_guess"), {
    headers: getDefaultHeaders(),
    method: "POST",
    body: JSON.stringify({
      game_id: "1234ABCD",
      white_is_bot: guess === "white",
      black_is_bot: guess === "black",
    }),
  });

  console.log(await res.json());
};
