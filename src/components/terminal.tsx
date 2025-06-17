import { useState, useRef, useEffect } from "react";

const users: Record<string, string> = {
  hamdi: "devpass",
  alice: "1234",
  guest: "guest",
};

export default function Terminal() {
  const [history, setHistory] = useState([
    "Welcome to Hamdi’s Terminal Portfolio!",
    "Type 'help' to see available commands.",
    "🔑 Hint: Connect using the guest account → username: guest, password: guest",
  ]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [connectStep, setConnectStep] = useState<null | "askName" | "askPassword">(null);
  const [tempName, setTempName] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const commands: { [key: string]: string | undefined } = {
    help: `Available commands: connect, about , projects, contact, whoami,clear`,
    about: "Hi, I'm Hamdi. I'm a full-stack mern developper & game developer.",
    projects: "• Game on Steam\n• Freelancing on UpWork\n• Unity mobile games",
    contact: "\nEmail: hamdibenhassene192@gmail.com",
    whoami: user ? user.name : "invited user",
    sudo: "Use: sudo [command]",
    clear: "screen cleared",
  };

  const runCommand = (cmdRaw: string) => {
    const isSudo = cmdRaw.startsWith("sudo ");
    const cmd = isSudo ? cmdRaw.slice(5) : cmdRaw;
    const isLoggedIn = !!user;

    if (!isLoggedIn && !isSudo && cmd !== "connect") {
      return `Access denied. Please connect first or use sudo.`;
    }

    if (cmd === "clear") {
      setHistory([]);
      return null;
    }

    if (cmd === "connect") {
      setConnectStep("askName");
      return "Enter your first name:\n(You can use 'guest' as username with password 'guest')";
    }

    if (cmd === "logout") {
      localStorage.removeItem("user");
      setUser(null);
      return "You have been logged out.";
    }

    const response = commands[cmd];
    return response || `Command not found: ${cmd}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const current = input.trim();
      if (current === "") return;

      setCommandHistory((prev) => [...prev, current]);
      setHistoryIndex(-1);

      if (connectStep === "askName") {
        setTempName(current.toLowerCase());
        setConnectStep("askPassword");
        setHistory((h) => [...h, `> ${current}`, "Enter password:"]);
        setInput("");
        return;
      }
      if (connectStep === "askPassword") {
        const correct = users[tempName];
        if (current === correct) {
          const newUser = { name: tempName };
          setUser(newUser);
          localStorage.setItem("user", JSON.stringify(newUser));
          setHistory((h) => [
            ...h,
            `> ${"*".repeat(current.length)}`,
            `✅ Welcome, ${tempName}. You are now connected.`,
          ]);
        } else {
          setHistory((h) => [
            ...h,
            `> ${"*".repeat(current.length)}`,
            "❌ Incorrect password. Connection failed.",
          ]);
        }
        setConnectStep(null);
        setTempName("");
        setInput("");
        return;
      }

    
      const output = runCommand(current);
      if (output !== null) {
      setHistory((h) => [...h, `> ${current}`, output]);
}


      setInput("");
    }

    if (e.key === "ArrowUp") {
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    }

    if (e.key === "ArrowDown") {
      if (commandHistory.length === 0) return;
      const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex] || "");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="bg-black text-green-500 font-mono h-screen p-4 overflow-y-auto">
      {history.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <div className="flex">
        <span className="text-green-400">{user?.name || "guest"}@portfolio:~$</span>&nbsp;
        <input
          className="bg-black text-green-500 font-mono outline-none border-none w-full caret-green-500"
          type={connectStep === "askPassword" ? "password" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
