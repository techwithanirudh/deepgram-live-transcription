"use client";

import Chat from "@/components/chat";
import Header from "@/components/header";

const Home = () => {
  const title = "Deepgram AI";

  return (
    <div className="flex min-h-svh flex-col overflow-hidden">
      <div className="flex h-16 items-center border-b bg-muted">
        <Header title={title} />
      </div>

      <main className="flex-1">
        <Chat />
      </main>
    </div>
  );
};

export default Home;
