"use client";

import { ModeToggle } from "@/components/mode-toggle";
import App from "../components/App";

const Home = () => {
  const title = "Deepgram AI";

  return (
    <div className="flex min-h-svh flex-col overflow-hidden">
      <div className="flex h-16 items-center border-b bg-muted">
        <header className="mx-auto flex w-full items-center justify-between px-4 md:px-6 lg:px-8">
          <div>
            <a className="flex items-center font-bold text-xl" href="/">
              {title}
            </a>
          </div>
          <div>
            <ModeToggle />
          </div>
        </header>
      </div>

      <main className="flex-1">
        <App />
      </main>
    </div>
  );
};

export default Home;
