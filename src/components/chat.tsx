"use client";

import {
  type LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  SOCKET_STATES,
} from "@deepgram/sdk";
import { useEffect, useRef, useState } from "react";
import { useDeepgram } from "../context/deepgram-context-provider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/microphone-context-provider";
import Visualizer from "./visualizer";

const App: React.FC = () => {
  const [caption, setCaption] = useState<string | undefined>();
  const { connection, connectionState } = useDeepgram();
  const { microphone, startMicrophone, microphoneState } = useMicrophone();
  const captionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!microphone) {
      return;
    }
    if (!connection) {
      return;
    }

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close.
      if (e.data.size > 0 && connectionState === SOCKET_STATES.open) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      const thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        if (captionTimeout.current) {
          clearTimeout(captionTimeout.current);
        }
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          captionTimeout.current = null;
        }, 3000);
      }
    };

    if (connectionState === SOCKET_STATES.open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      if (captionTimeout.current) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = null;
      }
    };
  }, [connectionState]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    if (
      connectionState !== SOCKET_STATES.open ||
      microphoneState !== MicrophoneState.Open
    ) {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
      return;
    }

    connection.keepAlive();

    if (keepAliveInterval.current) {
      clearInterval(keepAliveInterval.current);
    }

    keepAliveInterval.current = setInterval(() => {
      connection.keepAlive();
    }, 10_000);

    return () => {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
    };
  }, [microphoneState, connectionState, connection]);

  return (
    <div className="flex h-[calc(100svh-theme(spacing.16))] w-full flex-row overflow-x-hidden">
      <div className="flex h-full flex-auto flex-col">
        <div className="relative h-full w-full">
          {microphone && (
            <Visualizer
              isActive={microphoneState === MicrophoneState.Open}
              microphone={microphone}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex h-16 w-full items-center justify-center border-t bg-muted text-center text-muted-foreground transition-opacity duration-300 empty:opacity-0">
            {caption && <span className="rounded-xl">{caption}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
