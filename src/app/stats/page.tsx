"use client";

import React, { useEffect } from "react";
import CountUp from "react-countup";
import { TEAMS } from "@/data/teams";
import { scrollAnimate } from "@/utils/drawUtils";
import Link from "next/link";

function BackBtn() {
  return (
    <Link
      href="/"
      className="fixed top-3 right-3 z-50 text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-lg transition-colors no-underline border border-white/20"
    >
      返回
      <br />
      Back
    </Link>
  );
}

const GOALS_DATA = [
  { rank: 1, img: "/images/Lewandowski.jpg", name: "Lewandowski", val: "7" },
  { rank: 2, img: "/images/Ronaldo.png", name: "Ronaldo", val: "6" },
  { rank: 2, img: "/images/Dalglish.png", name: "Dalglish", val: "6" },
  { rank: 3, img: "/images/Eto.png", name: "Eto'o", val: "5" },
  { rank: 3, img: "/images/Crouch.png", name: "Crouch", val: "5" },
  { rank: 3, img: "/images/Antony.png", name: "Antony", val: "5" },
];

const ASSISTS_DATA = [
  { rank: 1, img: "/images/cantona2.png", name: "Cantona", val: "7" },
  { rank: 2, img: "/images/Cruyff.png", name: "Cruyff", val: "6" },
  { rank: 3, img: "/images/edg.png", name: "Ødegaard", val: "4" },
  { rank: 3, img: "/images/Nedvěd.png", name: "Nedvěd", val: "4" },
  { rank: 3, img: "/images/Torres.png", name: "Torres", val: "4" },
  { rank: 3, img: "/images/Hugo.png", name: "Hugo Sánchez", val: "4" },
];

const REDS_DATA = [
  {
    rank: 1,
    img: "/images/De-Bruyne.png",
    name: "De Bruyne(2000万)",
    val: "1",
  },
  { rank: 1, img: "/images/Saka.jpg", name: "Saka", val: "1" },
  { rank: 2, img: "/images/Question.png", name: "TBD", val: "?" },
  { rank: 2, img: "/images/Question.png", name: "TBD", val: "?" },
  { rank: 2, img: "/images/Question.png", name: "TBD", val: "?" },
  { rank: 2, img: "/images/Question.png", name: "TBD", val: "?" },
];

const YELLOWS_DATA = [
  { rank: 1, img: "/images/Seedorf.png", name: "Seedorf", val: "2" },
  { rank: 1, img: "/images/Eusébio.png", name: "Eusébio", val: "2" },
  { rank: 2, img: "/images/Lampard.png", name: "Lampard", val: "1" },
  { rank: 2, img: "/images/Dias.png", name: "Dias", val: "1" },
  { rank: 2, img: "/images/Tchouameni.png", name: "Tchouameni", val: "1" },
  { rank: 2, img: "/images/azp.png", name: "Azpilicueta", val: "1" },
];

interface StatRow {
  rank: number;
  img: string;
  name: string;
  val: string;
}

export default function StatsPage() {
  useEffect(() => {
    scrollAnimate(".bar", "scale-up-hor-left");
    scrollAnimate(".playerCard-container", "scale-up-hor-left");
  }, []);

  const clubGoals = [
    { team: TEAMS[4], val: "16" },
    { team: TEAMS[15], val: "14" },
    { team: TEAMS[1], val: "13" },
    { team: TEAMS[16], val: "13" },
    { team: TEAMS[2], val: "13" },
    { team: TEAMS[22], val: "13" },
  ];
  const conceded = [
    { team: TEAMS[21], val: "17" },
    { team: TEAMS[8], val: "17" },
    { team: TEAMS[12], val: "17" },
    { team: TEAMS[23], val: "15" },
    { team: TEAMS[24], val: "14" },
    { team: TEAMS[20], val: "14" },
  ];
  const leastConceded = [
    { team: TEAMS[10], val: "2" },
    { team: TEAMS[11], val: "5" },
    { team: TEAMS[19], val: "7" },
    { team: TEAMS[18], val: "7" },
    { team: TEAMS[16], val: "8" },
    { team: TEAMS[7], val: "8" },
  ];
  const gd = [
    { team: TEAMS[10], val: "9" },
    { team: TEAMS[4], val: "6" },
    { team: TEAMS[16], val: "5" },
    { team: TEAMS[2], val: "4" },
    { team: TEAMS[19], val: "4" },
    { team: TEAMS[18], val: "3" },
  ];
  const ga = [
    { team: TEAMS[8], val: "-9" },
    { team: TEAMS[3], val: "-7" },
    { team: TEAMS[21], val: "-6" },
    { team: TEAMS[23], val: "-5" },
    { team: TEAMS[12], val: "-4" },
    { team: TEAMS[20], val: "-3" },
  ];

  return (
    <div className="stats text-center">
      <BackBtn />
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2022-2023赛季 84452韭菜杯
      </h1>
      <h2 className="text-lg sm:text-xl text-white">
        2022-2023 Season &nbsp;&nbsp;84452 LEEK CUP
      </h2>
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        技术统计(截至第三轮)
      </h1>
      <div className="flex flex-col items-center mt-2">
        <h3 className="text-lg text-white">Stats</h3>
        <h3 className="text-sm text-white/70">数据来源：工具人（里指导）</h3>
      </div>

      <div className="stats-container mt-6">
        <StatsCard
          title="Matches"
          end={39}
          suffix="/70"
          subtitle="Matches played"
          img="/images/pitch.svg"
          subVal1="6.46"
          subLabel1="Goals per match"
          subVal2="13.66"
          subLabel2="Minutes per goal"
        />
        <StatsCard
          title="Goals"
          end={257}
          subtitle="Total goals"
          img="/images/net.svg"
          subVal1="6.46"
          subLabel1="Goals per match"
          subVal2="13.66"
          subLabel2="Minutes per goal"
        />
        <StatsCard
          title="Assists"
          end={175}
          subtitle="Total assits"
          img="/images/net.svg"
          subVal1="4.49"
          subLabel1="Assists per match"
          subVal2="19.6"
          subLabel2="Minutes per assists"
        />
      </div>

      <div className="stats-player-grid">
        <PlayerCard title="Goals" data={GOALS_DATA} />
        <PlayerCard title="Assists" data={ASSISTS_DATA} />
        <PlayerCard title="Red Cards" data={REDS_DATA} />
        <PlayerCard title="Yellow Cards" data={YELLOWS_DATA} />
        <TeamCard title="Club Goals" data={clubGoals} />
        <TeamCard title="Club Goals Conceded(失球)" data={conceded} />
        <TeamCard
          title="Least Club Goals Conceded (最少失球)"
          data={leastConceded}
        />
        <TeamCard title="Goals Differential(净胜球)" data={gd} />
        <TeamCard title="Goals Against(净负球)" data={ga} />
      </div>

      <img
        src="/images/WinnerRoad.png"
        alt="road"
        className="max-w-full mx-auto mt-8"
      />
      <div className="h-[80px]" />
    </div>
  );
}

function StatsCard({
  title,
  end,
  suffix,
  subtitle,
  img,
  subVal1,
  subLabel1,
  subVal2,
  subLabel2,
}: any) {
  return (
    <div className="stats-card">
      <p className="text-left text-xl">{title}</p>
      <div className="flex flex-row items-center justify-between">
        <div className="text-left">
          <div className="flex flex-row items-end leading-7 text-xl">
            <span className="text-3xl">
              <CountUp start={0} end={end} duration={2} />
            </span>
            {suffix && <span className="leading-[18px]">{suffix}</span>}
          </div>
          <div className="small-content">{subtitle}</div>
        </div>
        <div>
          <img src={img} alt="" />
        </div>
      </div>
      <hr />
      <div className="bar" />
      <div className="flex flex-row justify-between mt-4">
        <div>
          <div className="text-3xl text-left">
            <CountUp
              start={0}
              end={Number(subVal1)}
              duration={2}
              decimals={subVal1.includes(".") ? 2 : 0}
            />
          </div>
          <div className="small-content">{subLabel1}</div>
        </div>
        <div>
          <div className="text-3xl text-left">
            <CountUp
              start={0}
              end={Number(subVal2)}
              duration={2}
              decimals={subVal2.includes(".") ? 1 : 0}
            />
          </div>
          <div className="small-content">{subLabel2}</div>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ title, data }: { title: string; data: StatRow[] }) {
  return (
    <div className="playerCard-container">
      <div className="goal-header">&nbsp;&nbsp;{title}</div>
      <div className="playerCard">
        {data.map((row, i) => (
          <React.Fragment key={i}>
            <div className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}>
              {row.rank}
            </div>
            {i === 0 ? (
              <div className="playerCard-row1-1">
                <img src={row.img} alt={row.name} />
                <div>{row.name}</div>
              </div>
            ) : (
              <div className="playerCard-row1-2">
                <img src={row.img} alt={row.name} />
                <div>{row.name}</div>
              </div>
            )}
            <div className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}>
              {row.val}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function TeamCard({
  title,
  data,
}: {
  title: string;
  data: { team: { name: string; img: string }; val: string }[];
}) {
  return (
    <div className="playerCard-container">
      <div
        className="goal-header"
        style={{ fontSize: title.length > 20 ? "20px" : "28px" }}
      >
        &nbsp;&nbsp;{title}
      </div>
      <div className="playerCard">
        {data.map((row, i) => (
          <React.Fragment key={i}>
            <div className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}>
              {i + 1}
            </div>
            {i === 0 ? (
              <div className="playerCard-row1-1">
                <img src={row.team.img} alt={row.team.name} />
                <div style={{ fontSize: "18px" }}>{row.team.name}</div>
              </div>
            ) : (
              <div className="playerCard-row1-2">
                <img src={row.team.img} alt={row.team.name} />
                <div>{row.team.name}</div>
              </div>
            )}
            <div className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}>
              {row.val}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
