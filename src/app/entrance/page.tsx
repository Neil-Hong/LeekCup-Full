import Link from "next/link";
import ResetAllButton from "@/components/groupstage/ResetAllButton";
import VideoPlayer from "@/components/review/VideoPlayer";

export default function EntrancePage() {
  return (
    <div className="flex flex-col w-full text-center">
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP
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
            视频来源: 鱼吧用户M1Nmin <br />
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
        <Link href="/teams" className="btn">
          阵容
          <br />
          Teams
        </Link>
        <Link href="/draw" className="btn">
          开始抽签
          <br />
          Start
        </Link>
        {/* <Link href="/round16" className="btn">
          进入第二轮
          <br />
          Round 2
        </Link> */}
        <Link href="/groupstage" className="btn">
          进入小组赛
          <br />
          Group Stage
        </Link>
        <Link href="/group-playoffs" className="btn">
          进入小组附加赛
          <br />
          Group Play-off Stage
        </Link>
        <Link href="/groupstandings" className="btn">
          小组实时积分
          <br />
          Group Standings
        </Link>
        <Link href="/stats" className="btn">
          技术统计
          <br />
          Stats
        </Link>
        <ResetAllButton className="btn" />
      </div>

      <div className="h-[150px]" />
    </div>
  );
}
