import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center space-y-6">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Guardian AI</h1>
        <p className="text-gray-400">
          Emergency Intelligence & Survival Assistant
        </p>
      </div>

      <Link
        href="/chat"
        className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition"
      >
        Emergency Chat
      </Link>

    </main>
  );
}