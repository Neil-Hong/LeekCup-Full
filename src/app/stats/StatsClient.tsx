"use client";

import React, { useEffect } from "react";
import CountUp from "react-countup";
import Link from "next/link";
import { scrollAnimate } from "@/utils/drawUtils";

export interface StatRow {
  rank: number;
  img: string;
  name: string;
  val: string;
}

export interface TeamStatRow {
  rank?: number;
  team: {
    name: string;
    img: string;
  };
  val: string;
}

export interface StatsSummaryCardData {
  assistsPerMatch: string;
  assistsPerMinute: string;
  completedMatches: number;
  goalsPerMatch: string;
  goalsPerMinute: string;
  totalAssists: number;
  totalGoals: number;
}

interface StatsCardProps {
  title: string;
  end: number;
  suffix?: string;
  subtitle: string;
  img: string;
  subVal1: string;
  subLabel1: string;
  subVal2: string;
  subLabel2: string;
}

interface StatsClientProps {
  goalsData: StatRow[];
  assistsData: StatRow[];
  redCardsData: StatRow[];
  summary: StatsSummaryCardData;
  yellowCardsData: StatRow[];
  clubGoalsData: TeamStatRow[];
  clubGoalsConcededData: TeamStatRow[];
}

function BackBtn() {
  return (
    <Link
      href="/entrance"
      className="fixed top-3 right-3 z-50 text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-lg transition-colors no-underline border border-white/20"
    >
      返回
      <br />
      Back
    </Link>
  );
}

export default function StatsClient({
  assistsData,
  clubGoalsConcededData,
  clubGoalsData,
  goalsData,
  redCardsData,
  summary,
  yellowCardsData,
}: StatsClientProps) {
  useEffect(() => {
    scrollAnimate(".bar", "scale-up-hor-left");
    scrollAnimate(".playerCard-container", "scale-up-hor-left");
  }, []);

  return (
    <div className="stats text-center">
      <BackBtn />
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯实时数据
      </h1>
      <h2 className="text-lg sm:text-xl text-white">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP LIVE DATA
      </h2>

      <div className="flex flex-col items-center mt-2">
        <h3 className="text-lg text-white">Stats</h3>
      </div>

      <div className="stats-container mt-6">
        <StatsCard
          title="Matches"
          end={summary.completedMatches}
          subtitle="Matches played"
          img="/images/pitch.svg"
          subVal1={summary.goalsPerMatch}
          subLabel1="Goals per match"
          subVal2={summary.goalsPerMinute}
          subLabel2="Minutes per goal"
        />
        <StatsCard
          title="Goals"
          end={summary.totalGoals}
          subtitle="Total goals"
          img="/images/net.svg"
          subVal1={summary.goalsPerMatch}
          subLabel1="Goals per match"
          subVal2={summary.goalsPerMinute}
          subLabel2="Minutes per goal"
        />
        <StatsCard
          title="Assists"
          end={summary.totalAssists}
          subtitle="Total assists"
          img="/images/net.svg"
          subVal1={summary.assistsPerMatch}
          subLabel1="Assists per match"
          subVal2={summary.assistsPerMinute}
          subLabel2="Minutes per assists"
        />
      </div>

      <div className="stats-player-grid">
        <PlayerCard title="Goals" data={goalsData} />
        <PlayerCard title="Assists" data={assistsData} />
        <PlayerCard title="Red Cards" data={redCardsData} />
        <PlayerCard title="Yellow Cards" data={yellowCardsData} />
        <TeamCard title="Club Goals" data={clubGoalsData} />
        <TeamCard
          title="Club Goals Conceded(失球)"
          data={clubGoalsConcededData}
        />
      </div>
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
}: StatsCardProps) {
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
              decimals={subVal2.includes(".") ? 2 : 0}
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
          <React.Fragment key={`${title}-${row.rank}-${row.name}`}>
            <div
              className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}
            >
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
            <div
              className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}
            >
              {row.val}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function TeamCard({ title, data }: { title: string; data: TeamStatRow[] }) {
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
          <React.Fragment key={`${title}-${row.rank ?? i + 1}-${row.team.name}`}>
            <div
              className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}
            >
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
            <div
              className={i === 0 ? "playerCard-row1" : "playerCard-row-white"}
            >
              {row.val}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
