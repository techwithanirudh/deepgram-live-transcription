"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type MicrophoneContextType = {
  microphone: MediaRecorder | null;
  startMicrophone: (options?: StartMicrophoneOptions) => void;
  stopMicrophone: () => void;
  setupMicrophone: () => Promise<void>;
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
  const stopTracks = useCallback((stream?: MediaStream | null) => {
    if (!stream) {
      return;
    }

    for (const track of stream.getTracks()) {
      track.stop();
    }
  }, []);

  const [microphoneState, setMicrophoneState] = useState<MicrophoneStateValue>(
    MicrophoneState.NotSetup
  );
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const microphoneRef = useRef<MediaRecorder | null>(null);

  useEffect(
    () => () => {
      stopTracks(microphoneRef.current?.stream);
      microphoneRef.current = null;
    },
    [stopTracks]
  );

  const setupMicrophone = useCallback(async () => {
    setMicrophoneState(MicrophoneState.SettingUp);

    let userMedia: MediaStream | null = null;

    try {
      userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const newMicrophone = new MediaRecorder(userMedia);
      microphoneRef.current = newMicrophone;

      const handleOpen = () => {
        setMicrophoneState(MicrophoneState.Open);
      };

      const handlePause = () => {
        setMicrophoneState(MicrophoneState.Paused);
      };

      const handleStop = () => {
        stopTracks(newMicrophone.stream);
        microphoneRef.current = null;
        setMicrophone(null);
        setMicrophoneState(MicrophoneState.NotSetup);
      };

      const handleError = () => {
        setMicrophoneState(MicrophoneState.Error);
        stopTracks(newMicrophone.stream);
        microphoneRef.current = null;
        setMicrophone(null);
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
      stopTracks(userMedia);
      microphoneRef.current = null;
      setMicrophone(null);
      throw err;
    }
  }, [stopTracks]);

  const stopMicrophone = useCallback(() => {
    const recorder = microphoneRef.current;
    if (!recorder) {
      return;
    }

    if (recorder.state === "inactive") {
      stopTracks(recorder.stream);
      microphoneRef.current = null;
      setMicrophone(null);
      setMicrophoneState(MicrophoneState.NotSetup);
      return;
    }

    setMicrophoneState(MicrophoneState.Pausing);

    try {
      recorder.stop();
    } catch (err: unknown) {
      setMicrophoneState(MicrophoneState.Error);
      stopTracks(recorder.stream);
      microphoneRef.current = null;
      setMicrophone(null);
      throw err;
    }
  }, [stopTracks]);

  const startMicrophone = useCallback(
    (options?: StartMicrophoneOptions) => {
      const recorder = microphoneRef.current;
      if (!recorder) {
        return;
      }

      if (recorder.state === "recording") {
        return;
      }

      setMicrophoneState(MicrophoneState.Opening);

      if (options?.skipStart) {
        return;
      }

      try {
        if (recorder.state === "paused") {
          recorder.resume();
        } else {
          recorder.start(250);
        }
      } catch (err: unknown) {
        setMicrophoneState(MicrophoneState.Error);
        stopTracks(recorder.stream);
        microphoneRef.current = null;
        setMicrophone(null);
        throw err;
      }
    },
    [stopTracks]
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
