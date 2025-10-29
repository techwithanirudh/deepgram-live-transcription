"use client";

import Image from "next/image";
import App from "./components/App";

const Home = () => {
  return (
    <div className="h-full overflow-hidden">
      {/* height 4rem */}
      <div className="flex h-[4rem] items-center bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px]">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <div>
            <a className="flex items-center" href="/">
              <Image
                alt="Deepgram Logo"
                className="h-8 w-auto max-w-[12.5rem] sm:max-w-none"
                height={0}
                priority
                src="/deepgram.svg"
                width={0}
              />
            </a>
          </div>
        </header>
      </div>

      <main className="-mb-[4rem] mx-auto h-[calc(100%-4rem)] px-4 md:px-6 lg:px-8">
        <App />
      </main>
    </div>
  );
};

export default Home;
