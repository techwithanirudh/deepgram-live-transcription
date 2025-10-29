"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type MicrophoneContextType = {
  microphone: MediaRecorder | null;
  startMicrophone: (options?: StartMicrophoneOptions) => void;
  stopMicrophone: () => void;
  setupMicrophone: () => void;
  microphoneState: MicrophoneStateValue | null;
};

export const MicrophoneEvents = {
  DataAvailable: "dataavailable",
  Error: "error",
  Pause: "pause",
  Resume: "resume",
  Start: "start",
  Stop: "stop",
} as const;

export type MicrophoneEvent =
  (typeof MicrophoneEvents)[keyof typeof MicrophoneEvents];

export const MicrophoneState = {
  NotSetup: -1,
  SettingUp: 0,
  Ready: 1,
  Opening: 2,
  Open: 3,
  Error: 4,
  Pausing: 5,
  Paused: 6,
} as const;

export type MicrophoneStateValue =
  (typeof MicrophoneState)[keyof typeof MicrophoneState];

type StartMicrophoneOptions = {
  skipStart?: boolean;
};

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined
);

type MicrophoneContextProviderProps = {
  children: ReactNode;
};

const MicrophoneContextProvider: React.FC<MicrophoneContextProviderProps> = ({
  children,
}) => {
  const [microphoneState, setMicrophoneState] = useState<MicrophoneStateValue>(
    MicrophoneState.NotSetup
  );
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);

  const setupMicrophone = async () => {
    setMicrophoneState(MicrophoneState.SettingUp);

    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const newMicrophone = new MediaRecorder(userMedia);

      const handleOpen = () => {
        setMicrophoneState(MicrophoneState.Open);
      };

      const handlePause = () => {
        setMicrophoneState(MicrophoneState.Paused);
      };

      const handleStop = () => {
        setMicrophoneState(MicrophoneState.Ready);
      };

      const handleError = () => {
        setMicrophoneState(MicrophoneState.Error);
      };

      newMicrophone.addEventListener(MicrophoneEvents.Start, handleOpen);
      newMicrophone.addEventListener(MicrophoneEvents.Resume, handleOpen);
      newMicrophone.addEventListener(MicrophoneEvents.Pause, handlePause);
      newMicrophone.addEventListener(MicrophoneEvents.Stop, handleStop);
      newMicrophone.addEventListener(MicrophoneEvents.Error, handleError);

      setMicrophoneState(MicrophoneState.Ready);
      setMicrophone(newMicrophone);
    } catch (err: unknown) {
      setMicrophoneState(MicrophoneState.Error);
      throw err;
    }
  };

  const stopMicrophone = useCallback(() => {
    if (!microphone) {
      return;
    }

    if (microphone.state === "inactive") {
      setMicrophoneState(MicrophoneState.Ready);
      return;
    }

    setMicrophoneState(MicrophoneState.Pausing);

    try {
      microphone.stop();
    } catch (err: unknown) {
      setMicrophoneState(MicrophoneState.Error);
      throw err;
    }
  }, [microphone]);

  const startMicrophone = useCallback(
    (options?: StartMicrophoneOptions) => {
      if (!microphone) {
        return;
      }

      if (microphone.state === "recording") {
        return;
      }

      setMicrophoneState(MicrophoneState.Opening);

      if (options?.skipStart) {
        return;
      }

      try {
        if (microphone.state === "paused") {
          microphone.resume();
        } else {
          microphone.start(250);
        }
      } catch (err: unknown) {
        setMicrophoneState(MicrophoneState.Error);
        throw err;
      }
    },
    [microphone]
  );

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        startMicrophone,
        stopMicrophone,
        setupMicrophone,
        microphoneState,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

function useMicrophone(): MicrophoneContextType {
  const context = useContext(MicrophoneContext);

  if (context === undefined) {
    throw new Error(
      "useMicrophone must be used within a MicrophoneContextProvider"
    );
  }

  return context;
}

export { MicrophoneContextProvider, useMicrophone };
