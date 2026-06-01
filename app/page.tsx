import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-4xl font-bold text-indigo-700">EdCipher Math</h1>
      <p className="text-lg text-slate-600 max-w-md text-center">
        TSIA2 college placement math prep — computer-adaptive practice tests.
      </p>
      <Link
        href="/adaptive-test"
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors"
      >
        Start Practice Test
      </Link>
    </main>
  );
}