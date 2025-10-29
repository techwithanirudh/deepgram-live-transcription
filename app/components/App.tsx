"use client";

import {
  type LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  SOCKET_STATES,
} from "@deepgram/sdk";
import { useEffect, useRef, useState } from "react";
import { useDeepgram } from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";

const App: React.FC = () => {
  const [caption, setCaption] = useState<string | undefined>(
    "Powered by Deepgram"
  );
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    setupMicrophone();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
  }, [microphoneState]);

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
      if (e.data.size > 0) {
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
      // prettier-ignore
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!connection) {
      return;
    }

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === SOCKET_STATES.open
    ) {
      connection.keepAlive();

      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10_000);
    } else if (keepAliveInterval.current) {
      clearInterval(keepAliveInterval.current);
      keepAliveInterval.current = null;
    }

    return () => {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
    };
  }, [microphoneState, connectionState]);

  return (
    <div className="flex h-full antialiased">
      <div className="flex h-full w-full flex-row overflow-x-hidden">
        <div className="flex h-full flex-auto flex-col">
          {/* height 100% minus 8rem */}
          <div className="relative h-full w-full">
            {microphone && <Visualizer microphone={microphone} />}
            <div className="absolute inset-x-0 bottom-[8rem] mx-auto max-w-4xl text-center">
              {caption && <span className="bg-black/70 p-8">{caption}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
