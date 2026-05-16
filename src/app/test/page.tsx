import Link from "next/link";

export default function TestPage() {
  return (
    <div>
      <Link href="/" className="fixed top-3 right-3 z-50 text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-lg transition-colors no-underline border border-white/20">
        返回<br />Back
      </Link>
      <h1>Test Page</h1>
      <div className="circle">
        <div /><div /><div /><div /><div />
      </div>
      <div className="big">
        <div /><div /><div /><div /><div />
      </div>
      <div className="tri" />
      <div className="squ">
        <div /><div /><div /><div />
      </div>
      <div className="end">
        <div>E</div><div>N</div><div>D</div>
      </div>
    </div>
  );
}
