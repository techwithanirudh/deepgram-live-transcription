"use client";

import Image from "next/image";
import GitHubButton from "react-github-btn";
import App from "./components/App";
import { FacebookIcon } from "./components/icons/FacebookIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import { XIcon } from "./components/icons/XIcon";

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
          <div className="flex items-center gap-6 text-sm">
            <span className="mt-1">
              <GitHubButton
                aria-label="Star deepgram-starters/nextjs-live-transcription on GitHub"
                data-color-scheme="no-preference: light; light: light; dark: light;"
                data-show-count="true"
                data-size="large"
                href="https://github.com/deepgram-starters/nextjs-live-transcription"
              >
                Star
              </GitHubButton>
            </span>

            <span className="gradient-shadow rounded bg-gradient-to-r from-[#149AFB]/80 to-[#13EF93]/50">
              <a
                className="m-px hidden rounded bg-black px-8 py-2 font-semibold text-white text-xs md:inline-block"
                href="https://console.deepgram.com/signup?jump=keys"
                rel="noopener"
                target="_blank"
              >
                Get an API Key
              </a>
            </span>
          </div>
        </header>
      </div>

      {/* height 100% minus 8rem */}
      <main className="-mb-[4rem] mx-auto h-[calc(100%-4rem)] px-4 md:px-6 lg:px-8">
        <App />
      </main>

      {/* height 4rem */}
      <div className="absolute flex h-[4rem] w-full items-center bg-black/80">
        <footer className="mx-auto flex w-full max-w-7xl items-center justify-center gap-4 px-4 font-inter text-[#8a8a8e] md:px-6 md:text-xl lg:px-8">
          <span className="text-[#4e4e52] text-base">share it</span>
          <a
            aria-label="share on twitter"
            href="#"
            onClick={(e) => {
              window.open(
                "https://twitter.com/intent/tweet?text=%F0%9F%94%A5%F0%9F%8E%89%20Check%20out%20this%20awesome%20%23AI%20demo%20by%20%40Deepgram%20and%20%40lukeocodes%0A%0A%20https%3A//aura-tts-demo.deepgram.com",
                "",
                "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
              );

              return e.preventDefault();
            }}
            rel="noopener"
            target="_blank"
          >
            <XIcon className="mb-1" />
          </a>
          <a
            aria-label="share on Linkedin"
            href="#"
            onClick={(e) => {
              window.open(
                "https://www.linkedin.com/shareArticle?mini=true&url=https%3A//aura-tts-demo.deepgram.com&title=Excellent review on my website reviews",
                "",
                "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
              );

              return e.preventDefault();
            }}
          >
            <LinkedInIcon className="mb-1" />
          </a>
          <a
            aria-label="share on Facebook"
            href="#"
            onClick={(e) => {
              window.open(
                "https://www.facebook.com/sharer/sharer.php?u=https%3A//aura-tts-demo.deepgram.com",
                "",
                "_blank, width=600, height=500, resizable=yes, scrollbars=yes"
              );

              return e.preventDefault();
            }}
            rel="noopener"
            target="_blank"
          >
            <FacebookIcon className="mb-1" />
          </a>
          <div className="h-7 w-px border-[#4e4e52] border-l">&nbsp;</div>
          <a
            className="font-semibold text-base"
            href="https://deepgram.com/contact-us"
            rel="noopener"
            target="_blank"
          >
            contact us
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Home;
