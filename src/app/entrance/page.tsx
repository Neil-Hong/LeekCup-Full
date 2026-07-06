import Link from "next/link";
import VideoPlayer from "@/components/review/VideoPlayer";

export default function EntrancePage() {
  return (
    <div className="flex flex-col w-full text-center">
      {/* <Link
        href="/entrance"
        className="fixed top-3 right-3 z-50 text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-lg transition-colors no-underline border border-white/20"
      >
        返回
        <br />
        Back
      </Link> */}
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center mt-4 px-4">
        <div />
        <div>
          <h1 className="text-2xl sm:text-3xl text-white font-bold">
            赛事回顾
          </h1>
          <h2 className="text-lg sm:text-xl text-white">Leek Cup Review</h2>
        </div>
        <div>
          <h3 className="text-sm text-white/70">
            数据&视频来源: 鱼吧用户M1Nmin <br />
            若侵删
          </h3>
          <h3 className="text-sm text-white/70">
            Source: https://yuba.douyu.com/p/495607051644161807
          </h3>
        </div>
      </div>

      <div className="max-w-[900px] w-full mx-auto mt-4">
        <VideoPlayer />
      </div>

      <div className="statics-container mt-6">
        <Link href="/draw" className="btn">
          开始抽签
          <br />
          Start
        </Link>
        <Link href="/round16" className="btn">
          进入第二轮
          <br />
          Round 2
        </Link>
        <Link href="/round3" className="btn">
          进入第三轮
          <br />
          Round 3
        </Link>
        <Link href="/stats" className="btn">
          技术统计
          <br />
          Stats
        </Link>
        <Link href="/round4" className="btn">
          进入第四轮
          <br />
          Round 4
        </Link>
        <Link href="/teams" className="btn">
          阵容
          <br />
          Teams
        </Link>
        <Link href="/review" className="btn">
          赛事回顾
          <br />
          Match Review
        </Link>
      </div>

      <div className="h-[150px]" />
    </div>
  );
}
