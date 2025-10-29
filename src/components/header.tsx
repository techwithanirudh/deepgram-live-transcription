"use client";

import { SOCKET_STATES } from "@deepgram/sdk";
import { useMemo } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { DEFAULT_DEEPGRAM_OPTIONS } from "@/config/deepgram";
import { useDeepgram } from "@/context/deepgram-context-provider";
import {
  MicrophoneState,
  type MicrophoneStateValue,
  useMicrophone,
} from "@/context/microphone-context-provider";

const makeLabel = (state: MicrophoneStateValue | null): string => {
  switch (state) {
    case MicrophoneState.Open:
      return "Stop Transcription";
    case MicrophoneState.Paused:
    case MicrophoneState.Ready:
      return "Start Transcription";
    case MicrophoneState.Opening:
      return "Starting…";
    case MicrophoneState.Pausing:
      return "Stopping…";
    case MicrophoneState.SettingUp:
      return "Preparing…";
    case MicrophoneState.Error:
      return "Microphone Error";
    default:
      return "Initializing…";
  }
};

function Header({ title }: { title: string }) {
  const { microphoneState, startMicrophone, stopMicrophone } = useMicrophone();
  const { connectionState, connectToDeepgram, disconnectFromDeepgram } =
    useDeepgram();

  const isActive =
    microphoneState === MicrophoneState.Open ||
    microphoneState === MicrophoneState.Opening;
  const isInteractable =
    microphoneState === MicrophoneState.Ready ||
    microphoneState === MicrophoneState.Paused ||
    microphoneState === MicrophoneState.Open;
  const isTransitioning =
    microphoneState === MicrophoneState.Opening ||
    microphoneState === MicrophoneState.Pausing ||
    microphoneState === MicrophoneState.SettingUp;

  const label = useMemo(() => makeLabel(microphoneState), [microphoneState]);

  const handleClick = async () => {
    if (isActive) {
      stopMicrophone();
      disconnectFromDeepgram();
      return;
    }

    if (connectionState === SOCKET_STATES.open) {
      startMicrophone();
      return;
    }

    startMicrophone({ skipStart: true });

    if (
      connectionState === SOCKET_STATES.connecting ||
      connectionState === SOCKET_STATES.closing
    ) {
      return;
    }

    try {
      await connectToDeepgram(DEFAULT_DEEPGRAM_OPTIONS);
    } catch (err) {
      stopMicrophone();
      // biome-ignore lint/suspicious/noConsole: we want to log the error
      console.error("Failed to start transcription", err);
    }
  };

  return (
    <header className="mx-auto flex w-full items-center justify-between px-4 md:px-6 lg:px-8">
      <div>
        <a className="flex items-center font-bold text-xl" href="/">
          {title}
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Button
          aria-pressed={isActive}
          disabled={!isInteractable || isTransitioning}
          onClick={handleClick}
        >
          {label}
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
