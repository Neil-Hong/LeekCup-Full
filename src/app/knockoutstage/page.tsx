import Link from "next/link";
import Image from "next/image";

const PLACEHOLDER_TEAM = {
  img: "/images/Question.png",
  name: "TBD",
};

const KNOCKOUT_MATCHES = [
  ["QF1", "QF2"],
  ["QF3", "QF4"],
  ["QF5", "QF6"],
  ["QF7", "QF8"],
];

export default function KnockoutStagePage() {
  return (
    <main className="groupstage-page groupstage-enterPage groupstandings-page text-center">
      <div className="groupplayoff-titleRow">
        <div className="groupplayoff-titleText">
          <h1 className="text-2xl sm:text-3xl text-white font-bold">
            2026-2027赛季 84452韭菜杯淘汰赛
          </h1>
          <h2 className="text-lg sm:text-xl text-white mt-2">
            2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP KNOCKOUT STAGE
          </h2>
        </div>
        <Link href="/entrance" className="groupstage-actionButton groupplayoff-topBack">
          <span>返回</span>
          <span>Back</span>
        </Link>
      </div>

      <section className="groupplayoff-table groupplayoff-pageTable knockoutstage-table">
        <h3>
          <span>淘汰赛</span>
          <span>Knockout Stage</span>
        </h3>
        <div className="groupplayoff-list">
          {KNOCKOUT_MATCHES.map(([homeLabel, awayLabel], index) => (
            <div
              className="groupplayoff-row"
              key={`${homeLabel}-${awayLabel}`}
              style={{ animationDelay: `${760 + index * 70}ms` }}
            >
              <PlaceholderTeam label={homeLabel} />
              <span className="groupplayoff-versus">VS</span>
              <PlaceholderTeam align="right" label={awayLabel} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlaceholderTeam({
  align = "left",
  label,
}: {
  align?: "left" | "right";
  label: string;
}) {
  return (
    <div className={`groupplayoff-team is-${align}`}>
      <span className="groupplayoff-seed">{label}</span>
      <Image
        src={PLACEHOLDER_TEAM.img}
        alt={PLACEHOLDER_TEAM.name}
        width={52}
        height={48}
      />
      <span>{PLACEHOLDER_TEAM.name}</span>
    </div>
  );
}
