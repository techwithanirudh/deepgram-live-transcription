"use client";

import {
  createClient,
  type LiveClient,
  type LiveSchema,
  LiveTranscriptionEvents,
  SOCKET_STATES,
} from "@deepgram/sdk";

import {
  createContext,
  type FunctionComponent,
  type ReactNode,
  useContext,
  useState,
} from "react";

type DeepgramContextType = {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
};

const DeepgramContext = createContext<DeepgramContextType | undefined>(
  undefined
);

type DeepgramContextProviderProps = {
  children: ReactNode;
};

const getToken = async (): Promise<string> => {
  const response = await fetch("/api/authenticate", { cache: "no-store" });
  const result = await response.json();
  return result.access_token;
};

const DeepgramContextProvider: FunctionComponent<
  DeepgramContextProviderProps
> = ({ children }) => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(
    SOCKET_STATES.closed
  );

  /**
   * Connects to the Deepgram speech recognition service and sets up a live transcription session.
   *
   * @param options - The configuration options for the live transcription session.
   * @param endpoint - The optional endpoint URL for the Deepgram service.
   * @returns A Promise that resolves when the connection is established.
   */
  const connectToDeepgram = async (options: LiveSchema, endpoint?: string) => {
    if (
      connectionState === SOCKET_STATES.connecting ||
      connectionState === SOCKET_STATES.open ||
      connectionState === SOCKET_STATES.closing
    ) {
      return;
    }

    setConnectionState(SOCKET_STATES.connecting);

    try {
      const token = await getToken();
      const deepgram = createClient({ accessToken: token });

      const conn = deepgram.listen.live(options, endpoint);

      conn.addListener(LiveTranscriptionEvents.Open, () => {
        setConnectionState(SOCKET_STATES.open);
      });

      conn.addListener(LiveTranscriptionEvents.Close, () => {
        setConnectionState(SOCKET_STATES.closed);
        setConnection(null);
      });

      conn.addListener(LiveTranscriptionEvents.Error, () => {
        setConnectionState(SOCKET_STATES.closed);
        setConnection(null);
      });

      setConnection(conn);
    } catch (err) {
      setConnectionState(SOCKET_STATES.closed);
      setConnection(null);
      throw err;
    }
  };

  const disconnectFromDeepgram = () => {
    if (connection) {
      if (connectionState !== SOCKET_STATES.closed) {
        setConnectionState(SOCKET_STATES.closing);
      }
      connection.requestClose();
      setConnection(null);
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connection,
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error(
      "useDeepgram must be used within a DeepgramContextProvider"
    );
  }
  return context;
}

export { DeepgramContextProvider, useDeepgram };
