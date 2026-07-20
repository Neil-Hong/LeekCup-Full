"use client";

import Link from "next/link";
import {
  type DragEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Team } from "@/types";
import type {
  TeamLineupSlot,
  TeamPlayerRow,
  TeamTacticsData,
  TeamTacticSettings,
} from "@/lib/supabaseRest";
import {
  isFormationKey,
  TEAM_FORMATIONS,
  type FormationKey,
} from "@/lib/teamFormations";

type AccessState = "loading" | "login" | "ready" | "forbidden";

interface SettingsPayload {
  user: {
    displayName: string;
    role: "admin" | "bidder";
    teamSname: string | null;
    username: string;
  };
  players: TeamPlayerRow[];
  tactics: TeamTacticsData;
}

const defaultTactics: TeamTacticSettings = {
  defensiveStyle: "balanced",
  buildUpStyle: "balanced",
  width: 50,
  lineHeight: 50,
};

type PlayerRoleDefinition = {
  name: string;
  focuses: readonly string[];
};

type SettingsTab = "formation" | "assignments";

const PLAYER_ROLE_OPTIONS: Record<string, readonly PlayerRoleDefinition[]> = {
  ST: [
    {
      name: "\u67f1\u5f0f\u4e2d\u950b",
      focuses: ["\u8fdb\u653b", "\u5e73\u8861", "\u8fb9\u8def"],
    },
    { name: "\u4f2a9\u53f7", focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"] },
    {
      name: "\u7981\u533a\u4e4b\u738b",
      focuses: ["\u8fdb\u653b", "\u652f\u63f4", "\u7075\u6d3b"],
    },
    {
      name: "\u7a81\u524d\u578b\u524d\u950b",
      focuses: ["\u8fdb\u653b", "\u652f\u63f4", "\u7075\u6d3b"],
    },
  ],
  CAM: [
    {
      name: "\u534a\u8fb9\u950b",
      focuses: ["\u8fdb\u653b", "\u5e73\u8861", "\u81ea\u7531\u8dd1\u52a8"],
    },
    { name: "\u5f71\u5b50\u524d\u950b", focuses: ["\u8fdb\u653b"] },
    {
      name: "\u7ecf\u517810\u53f7",
      focuses: ["\u8fdb\u653b", "\u8fb9\u8def", "\u7075\u6d3b"],
    },
    {
      name: "\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u5e73\u8861", "\u81ea\u7531\u8dd1\u52a8"],
    },
  ],
  CM: [
    {
      name: "\u534a\u8fb9\u950b",
      focuses: ["\u8fdb\u653b", "\u5e73\u8861", "\u652f\u63f4"],
    },
    { name: "\u9547\u5b88", focuses: ["\u9632\u5b88", "\u62a2\u7403"] },
    {
      name: "\u62d6\u540e\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u9632\u5b88"],
    },
    {
      name: "\u5168\u80fd\u4e2d\u573a",
      focuses: ["\u5e73\u8861", "\u62a2\u7403"],
    },
    {
      name: "\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u8fdb\u653b", "\u81ea\u7531\u8dd1\u52a8"],
    },
  ],
  CDM: [
    { name: "\u7981\u533a\u51b2\u51fb\u8005", focuses: ["\u5e73\u8861"] },
    { name: "\u534a\u8fb9\u536b", focuses: ["\u9632\u5b88", "\u7ec4\u7ec7"] },
    { name: "\u4e2d\u524d\u536b", focuses: ["\u9632\u5b88"] },
    {
      name: "\u9547\u5b88",
      focuses: ["\u9632\u5b88", "\u62a2\u7403", "\u81ea\u7531\u8dd1\u52a8"],
    },
    {
      name: "\u62d6\u540e\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u9632\u5b88", "\u81ea\u7531\u8dd1\u52a8"],
    },
  ],
  CB: [
    { name: "\u540e\u536b", focuses: ["\u9632\u5b88", "\u5e73\u8861"] },
    { name: "\u65bd\u538b", focuses: ["\u5e73\u8861", "\u4fb5\u7565\u6027"] },
    {
      name: "\u8fb9\u540e\u536b",
      focuses: ["\u9632\u5b88", "\u4fb5\u7565\u6027", "\u652f\u63f4"],
    },
    {
      name: "\u63a7\u7403\u540e\u536b",
      focuses: ["\u9632\u5b88", "\u7ec4\u7ec7", "\u4fb5\u7565\u6027"],
    },
  ],
  LB: [
    { name: "\u4f2a\u540e\u536b", focuses: ["\u9632\u5b88", "\u5e73\u8861"] },
    {
      name: "\u8fdb\u653b\u578b\u8fb9\u7ffc\u536b",
      focuses: ["\u652f\u63f4", "\u8fdb\u653b"],
    },
    {
      name: "\u5185\u5207\u578b\u8fb9\u7ffc\u536b",
      focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"],
    },
    {
      name: "\u8fb9\u540e\u536b",
      focuses: ["\u9632\u5b88", "\u5e73\u8861", "\u7075\u6d3b"],
    },
    { name: "\u8fb9\u7ffc\u536b", focuses: ["\u5e73\u8861", "\u652f\u63f4"] },
  ],
  RB: [
    { name: "\u4f2a\u540e\u536b", focuses: ["\u9632\u5b88", "\u5e73\u8861"] },
    {
      name: "\u8fdb\u653b\u578b\u8fb9\u7ffc\u536b",
      focuses: ["\u652f\u63f4", "\u8fdb\u653b"],
    },
    {
      name: "\u5185\u5207\u578b\u8fb9\u7ffc\u536b",
      focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"],
    },
    {
      name: "\u8fb9\u540e\u536b",
      focuses: ["\u9632\u5b88", "\u5e73\u8861", "\u7075\u6d3b"],
    },
    { name: "\u8fb9\u7ffc\u536b", focuses: ["\u5e73\u8861", "\u652f\u63f4"] },
  ],
  LW: [
    {
      name: "\u8fb9\u950b",
      focuses: ["\u5e73\u8861", "\u8fdb\u653b", "\u7075\u6d3b"],
    },
    {
      name: "\u8fb9\u8def\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"],
    },
    {
      name: "\u5185\u950b",
      focuses: ["\u8fdb\u653b", "\u5e73\u8861", "\u81ea\u7531\u8dd1\u52a8"],
    },
  ],
  RW: [
    {
      name: "\u8fb9\u950b",
      focuses: ["\u5e73\u8861", "\u8fdb\u653b", "\u7075\u6d3b"],
    },
    {
      name: "\u8fb9\u8def\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"],
    },
    {
      name: "\u5185\u950b",
      focuses: ["\u8fdb\u653b", "\u5e73\u8861", "\u81ea\u7531\u8dd1\u52a8"],
    },
  ],
  LM: [
    { name: "\u8fb9\u950b", focuses: ["\u8fdb\u653b", "\u5e73\u8861"] },
    {
      name: "\u8fb9\u8def\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"],
    },
    {
      name: "\u8fb9\u4e2d\u573a",
      focuses: ["\u652f\u63f4", "\u9632\u5b88", "\u7ec4\u7ec7"],
    },
    { name: "\u5185\u950b", focuses: ["\u5e73\u8861", "\u8fdb\u653b"] },
  ],
  RM: [
    { name: "\u8fb9\u950b", focuses: ["\u8fdb\u653b", "\u5e73\u8861"] },
    {
      name: "\u8fb9\u8def\u7ec4\u7ec7\u6838\u5fc3",
      focuses: ["\u7ec4\u7ec7", "\u8fdb\u653b"],
    },
    {
      name: "\u8fb9\u4e2d\u573a",
      focuses: ["\u652f\u63f4", "\u9632\u5b88", "\u7ec4\u7ec7"],
    },
    { name: "\u5185\u950b", focuses: ["\u5e73\u8861", "\u8fdb\u653b"] },
  ],
  GK: [
    { name: "\u5b88\u95e8\u5458", focuses: ["\u9632\u5b88", "\u5e73\u8861"] },
    { name: "\u51fa\u7403\u578b\u95e8\u5c06", focuses: ["\u7ec4\u7ec7"] },
    {
      name: "\u6e05\u9053\u592b\u95e8\u5c06",
      focuses: ["\u5e73\u8861", "\u7ec4\u7ec7"],
    },
  ],
};

const GENERIC_PLAYER_ROLES: readonly PlayerRoleDefinition[] = [
  {
    name: "\u5e73\u8861",
    focuses: ["\u5e73\u8861", "\u8fdb\u653b", "\u9632\u5b88"],
  },
];

const SET_PIECE_ASSIGNMENTS = [
  { key: "captain", label: "\u961f\u957f" },
  { key: "free-kick-left", label: "\u5de6\u8def\u4efb\u610f\u7403" },
  { key: "free-kick-right", label: "\u53f3\u8def\u4efb\u610f\u7403" },
  { key: "free-kick-long", label: "\u8fdc\u8ddd\u79bb\u4efb\u610f\u7403" },
  { key: "penalty", label: "\u70b9\u7403" },
  { key: "corner-left", label: "\u5de6\u89d2\u7403\u4e3b\u7f5a\u961f\u5458" },
  { key: "corner-right", label: "\u53f3\u89d2\u7403\u4e3b\u7f5a\u961f\u5458" },
  {
    key: "corner-attack-target",
    label: "\u89d2\u7403-\u8fdb\u653b\uff08\u7ad9\u6869\u4e2d\u950b\uff09",
  },
  {
    key: "corner-attack-near-post",
    label: "\u89d2\u7403-\u8fdb\u653b\uff08\u8fd1\u95e8\u67f1\uff09",
  },
  {
    key: "corner-attack-edge",
    label: "\u89d2\u7403-\u8fdb\u653b\uff08\u7981\u533a\u5f27\u9876\uff09",
  },
  {
    key: "corner-attack-cover",
    label: "\u89d2\u7403-\u8fdb\u653b\uff08\u9632\u5b88\u8865\u4f4d\uff09",
  },
  {
    key: "corner-attack-decoy",
    label: "\u89d2\u7403-\u8fdb\u653b\uff08\u5a01\u80c1\u8bb0\u53f7\uff09",
  },
  {
    key: "corner-attack-post-guard",
    label: "\u89d2\u7403-\u8fdb\u653b\uff08\u95e8\u67f1\u5b88\u536b\uff09",
  },
  {
    key: "corner-defend-near-post",
    label: "\u89d2\u7403-\u9632\u5b88\uff08\u8fd1\u95e8\u67f1\uff09",
  },
  {
    key: "corner-defend-far-post",
    label: "\u89d2\u7403-\u9632\u5b88\uff08\u8fdc\u95e8\u67f1\uff09",
  },
  { key: "throw-in-left", label: "\u5de6\u63b7\u754c\u5916\u7403" },
  { key: "throw-in-right", label: "\u53f3\u63b7\u754c\u5916\u7403" },
] as const;

function AssignmentPlayerSelect({
  onChange,
  players,
  value,
}: {
  onChange: (playerKey: string) => void;
  players: TeamPlayerRow[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPlayer = players.find((player) => player.player_key === value);

  return (
    <div className="team-settings-assignmentSelect">
      <button
        aria-expanded={isOpen}
        className="team-settings-assignmentTrigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {selectedPlayer ? (
          <>
            {selectedPlayer.avatar_url ? (
              <img src={selectedPlayer.avatar_url} alt="" />
            ) : (
              <span className="team-settings-avatarFallback">
                {selectedPlayer.name.slice(0, 1)}
              </span>
            )}
            <span>{selectedPlayer.name}</span>
          </>
        ) : (
          <span>{"\u8bf7\u9009\u62e9\u7403\u5458"}</span>
        )}
      </button>
      {isOpen && (
        <div className="team-settings-assignmentMenu">
          <button
            className="team-settings-assignmentOption"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            type="button"
          >
            {"\u8bf7\u9009\u62e9\u7403\u5458"}
          </button>
          {players.map((player) => (
            <button
              className="team-settings-assignmentOption"
              key={player.player_key}
              onClick={() => {
                onChange(player.player_key);
                setIsOpen(false);
              }}
              type="button"
            >
              {player.avatar_url ? (
                <img src={player.avatar_url} alt="" />
              ) : (
                <span className="team-settings-avatarFallback">
                  {player.name.slice(0, 1)}
                </span>
              )}
              <span>{player.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function messageFromResponse(data: unknown, fallback: string) {
  return typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
    ? data.error
    : fallback;
}

export default function TeamSettingsClient({
  team,
  teamSlug,
}: {
  team: Team;
  teamSlug: string;
}) {
  const [access, setAccess] = useState<AccessState>("loading");
  const [payload, setPayload] = useState<SettingsPayload | null>(null);
  const [formation, setFormation] = useState<FormationKey>("4-3-3-holding");
  const [tactics, setTactics] = useState<TeamTacticSettings>(defaultTactics);
  const [lineup, setLineup] = useState<TeamLineupSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [playerRoles, setPlayerRoles] = useState<Record<string, string>>({});
  const [playerFocus, setPlayerFocus] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsTab>("formation");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setError("");
    const response = await fetch(
      `/api/team-settings?teamSname=${encodeURIComponent(teamSlug)}`,
      { cache: "no-store" },
    );
    const data = (await response.json().catch(() => null)) as
      | SettingsPayload
      | { error?: string }
      | null;

    if (response.status === 401) {
      setPayload(null);
      setAccess("login");
      return;
    }

    if (response.status === 403) {
      setPayload(null);
      setAccess("forbidden");
      setError(
        messageFromResponse(data, "This account cannot manage this team."),
      );
      return;
    }

    if (!response.ok || !data || !("players" in data)) {
      setPayload(null);
      setAccess("login");
      setError(messageFromResponse(data, "Unable to load team settings."));
      return;
    }

    const nextFormation = isFormationKey(data.tactics.formation)
      ? data.tactics.formation
      : "4-3-3-holding";
    setPayload(data);
    setFormation(nextFormation);
    setTactics({ ...defaultTactics, ...data.tactics.tactics });
    setLineup(data.tactics.lineup);
    setPlayerRoles(
      Object.fromEntries(
        data.tactics.lineup.flatMap((slot) =>
          slot.playerRole ? [[slot.slotId, slot.playerRole]] : [],
        ),
      ),
    );
    setPlayerFocus(
      Object.fromEntries(
        data.tactics.lineup.flatMap((slot) =>
          slot.focus ? [[slot.slotId, slot.focus]] : [],
        ),
      ),
    );
    setAssignments(
      Object.fromEntries(
        data.tactics.assignments.map((assignment) => [
          assignment.assignmentKey,
          assignment.playerKey,
        ]),
      ),
    );
    setAccess("ready");
  }, [teamSlug]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const slots = TEAM_FORMATIONS[formation].slots;
  const assignedBySlot = useMemo(
    () => new Map(lineup.map((item) => [item.slotId, item])),
    [lineup],
  );
  const playerByKey = useMemo(
    () =>
      new Map(
        payload?.players.map((player) => [player.player_key, player]) ?? [],
      ),
    [payload],
  );
  const assignedKeys = useMemo(
    () => new Set(lineup.map((item) => item.playerKey)),
    [lineup],
  );
  const selectedAssignment = selectedSlotId
    ? assignedBySlot.get(selectedSlotId)
    : undefined;
  const selectedSlot = selectedSlotId
    ? slots.find((slot) => slot.id === selectedSlotId)
    : undefined;
  const selectedPlayer = selectedAssignment
    ? playerByKey.get(selectedAssignment.playerKey)
    : undefined;
  const selectedRoleOptions = selectedSlot
    ? (PLAYER_ROLE_OPTIONS[selectedSlot.label] ?? GENERIC_PLAYER_ROLES)
    : GENERIC_PLAYER_ROLES;
  const selectedRoleName = selectedAssignment
    ? (playerRoles[selectedAssignment.slotId] ?? selectedRoleOptions[0].name)
    : "";
  const selectedRole =
    selectedRoleOptions.find((role) => role.name === selectedRoleName) ??
    selectedRoleOptions[0];
  const selectedFocus = selectedAssignment
    ? (playerFocus[selectedAssignment.slotId] ?? selectedRole.focuses[0])
    : "";

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) return;

    setError("");
    setNotice("");
    setIsLoggingIn(true);
    const response = await fetch("/api/auction/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => null);
    setIsLoggingIn(false);

    if (!response.ok) {
      setError(messageFromResponse(data, "Login failed."));
      return;
    }

    setPassword("");
    await loadSettings();
  };

  const logout = async () => {
    await fetch("/api/auction/logout", { method: "POST" });
    setPayload(null);
    setLineup([]);
    setAccess("login");
    setNotice("");
    setError("");
  };

  const setPlayerInSlot = (slotId: string, playerKey: string) => {
    const slot = slots.find((item) => item.id === slotId);
    if (!slot || !playerByKey.has(playerKey)) return;

    setLineup((current) => [
      ...current.filter(
        (item) => item.slotId !== slotId && item.playerKey !== playerKey,
      ),
      { slotId, playerKey, role: slot.defaultRole },
    ]);
    const roleOptions = PLAYER_ROLE_OPTIONS[slot.label] ?? GENERIC_PLAYER_ROLES;
    setPlayerRoles((current) => ({
      ...current,
      [slotId]: current[slotId] ?? roleOptions[0].name,
    }));
    setPlayerFocus((current) => ({
      ...current,
      [slotId]: current[slotId] ?? roleOptions[0].focuses[0],
    }));
    setSelectedSlotId(slotId);
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>, slotId: string) => {
    event.preventDefault();
    setPlayerInSlot(slotId, event.dataTransfer.getData("text/plain"));
  };

  const updateFormation = (nextFormation: FormationKey) => {
    if (nextFormation === formation) return;

    if (
      lineup.length > 0 &&
      !window.confirm("Changing formation clears the current lineup. Continue?")
    ) {
      return;
    }

    setFormation(nextFormation);
    setLineup([]);
    setSelectedSlotId(null);
    setPlayerRoles({});
    setPlayerFocus({});
    setNotice("");
  };

  const updatePlayerRole = (slotId: string, roleName: string) => {
    const role =
      selectedRoleOptions.find((item) => item.name === roleName) ??
      selectedRoleOptions[0];

    setPlayerRoles((current) => ({ ...current, [slotId]: role.name }));
    setPlayerFocus((current) => ({ ...current, [slotId]: role.focuses[0] }));
  };

  const saveSettings = async () => {
    if (isSaving) return;

    setError("");
    setNotice("");
    setIsSaving(true);
    const response = await fetch("/api/team-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamSname: teamSlug,
        formation,
        tactics,
        lineup: lineup.map((slot) => ({
          ...slot,
          playerRole: playerRoles[slot.slotId],
          focus: playerFocus[slot.slotId],
        })),
        assignments: Object.entries(assignments)
          .filter(([, playerKey]) => playerKey)
          .map(([assignmentKey, playerKey]) => ({ assignmentKey, playerKey })),
      }),
    });
    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(messageFromResponse(data, "Failed to save team settings."));
      return;
    }

    setNotice("Team settings saved.");
    await loadSettings();
  };

  if (access === "loading") {
    return <div className="team-settings-status">Loading team settings...</div>;
  }

  if (access === "login" || access === "forbidden") {
    return (
      <section className="team-settings-loginPanel">
        <Link
          href={`/teams/${encodeURIComponent(teamSlug)}`}
          className="team-detail-navButton"
        >
          <span>{"\u8fd4\u56de\u9635\u5bb9"}</span>
          <span>Back to Teams</span>
        </Link>
        <div className="team-settings-loginCard">
          <img className="team-settings-loginLogo" src={team.img} alt="" />
          <h2>{"\u7403\u961f\u8bbe\u7f6e\u767b\u5f55"}</h2>
          <p>Team Settings Login</p>
          {access === "forbidden" ? (
            <button
              className="team-settings-textButton"
              type="button"
              onClick={logout}
            >
              Use another account
            </button>
          ) : (
            <form onSubmit={handleLogin} className="team-settings-loginForm">
              <input
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                required
                value={username}
              />
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                type="password"
                value={password}
              />
              <button
                className="team-settings-primaryButton"
                disabled={isLoggingIn}
                type="submit"
              >
                <span>{"\u767b\u5f55"}</span>
                <span>{isLoggingIn ? "Logging in..." : "Login"}</span>
              </button>
            </form>
          )}
          {error && <p className="team-settings-error">{error}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="team-settings-shell">
      <div className="team-settings-topbar">
        <Link
          href={`/teams/${encodeURIComponent(teamSlug)}`}
          className="team-detail-navButton"
        >
          <span>{"\u8fd4\u56de\u9635\u5bb9"}</span>
          <span>Back to Teams</span>
        </Link>
        <div className="team-settings-teamIdentity">
          <img src={team.img} alt="" />
          <div>
            <strong>{team.name}</strong>
            <span>{payload?.user.displayName}</span>
          </div>
        </div>
        <div className="team-settings-topActions">
          <button
            className="team-settings-primaryButton"
            disabled={isSaving}
            onClick={saveSettings}
            type="button"
          >
            <span>{"\u4fdd\u5b58\u8bbe\u7f6e"}</span>
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
          <button
            className="team-settings-logout"
            onClick={logout}
            type="button"
          >
            <span>{"\u9000\u51fa"}</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="team-settings-layout">
        <aside className="team-settings-roster">
          <div className="team-settings-sectionTitle">
            <span>{"\u7403\u5458\u540d\u5355"}</span>
            <span>Squad</span>
          </div>
          <p className="team-settings-hint">Drag a player onto a position.</p>
          <div className="team-settings-playerList">
            {payload?.players.length ? (
              payload.players.map((player) => (
                <button
                  className={`team-settings-player${assignedKeys.has(player.player_key) ? " is-assigned" : ""}`}
                  draggable
                  key={player.player_key}
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", player.player_key)
                  }
                  onClick={() => {
                    const firstAvailable = slots.find(
                      (slot) => !assignedBySlot.has(slot.id),
                    );
                    if (firstAvailable)
                      setPlayerInSlot(firstAvailable.id, player.player_key);
                  }}
                  type="button"
                >
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt="" />
                  ) : (
                    <span className="team-settings-avatarFallback">
                      {player.name.slice(0, 1)}
                    </span>
                  )}
                  <span>
                    <strong>{player.name}</strong>
                    <small>
                      {player.overall_rating} {player.position}
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <p className="team-settings-empty">
                No players in this squad yet.
              </p>
            )}
          </div>
        </aside>

        <main className="team-settings-pitchPanel">
          <div className="team-settings-tabs" role="tablist">
            <button
              aria-selected={activeSettingsTab === "formation"}
              className={activeSettingsTab === "formation" ? "is-active" : ""}
              onClick={() => setActiveSettingsTab("formation")}
              role="tab"
              type="button"
            >
              <span>{"\u9635\u578b"}</span>
              <small>Formation</small>
            </button>
            <button
              aria-selected={activeSettingsTab === "assignments"}
              className={activeSettingsTab === "assignments" ? "is-active" : ""}
              onClick={() => setActiveSettingsTab("assignments")}
              role="tab"
              type="button"
            >
              <span>{"\u5206\u914d"}</span>
              <small>Assignments</small>
            </button>
          </div>
          {activeSettingsTab === "formation" && (
            <>
              <select
                className="team-settings-select"
                onChange={(event) =>
                  updateFormation(event.target.value as FormationKey)
                }
                value={formation}
              >
                {Object.entries(TEAM_FORMATIONS).map(([key, definition]) => (
                  <option key={key} value={key}>
                    {definition.label}
                  </option>
                ))}
              </select>
              <div className="team-settings-pitch">
                <div className="team-settings-pitchCenter" />
                {slots.map((slot) => {
                  const assigned = assignedBySlot.get(slot.id);
                  const player = assigned
                    ? playerByKey.get(assigned.playerKey)
                    : null;
                  return (
                    <button
                      className={`team-settings-slot${player ? " is-filled" : ""}`}
                      key={slot.id}
                      onClick={() => player && setSelectedSlotId(slot.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onDrop(event, slot.id)}
                      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                      title={
                        player
                          ? `Remove ${player.name}`
                          : `Drop player in ${slot.label}`
                      }
                      type="button"
                    >
                      {player?.avatar_url ? (
                        <img src={player.avatar_url} alt="" />
                      ) : (
                        <span>{slot.label}</span>
                      )}
                      <small>{player ? player.name : slot.label}</small>
                    </button>
                  );
                })}
              </div>
              <div className="team-settings-teamTactics">
                <div className="team-settings-sectionTitle">
                  <span>{"\u7403\u961f\u6218\u672f"}</span>
                  <span>Team Tactics</span>
                </div>
                <label>
                  <span>
                    {"\u7ec4\u7ec7\u98ce\u683c"} <small>Build up style</small>
                  </span>
                  <select
                    value={tactics.buildUpStyle}
                    onChange={(event) =>
                      setTactics((current) => ({
                        ...current,
                        buildUpStyle: event.target
                          .value as TeamTacticSettings["buildUpStyle"],
                      }))
                    }
                  >
                    <option value="short-passing">
                      {"\u77ed\u4f20"} / Short passing
                    </option>
                    <option value="counter">{"\u53cd\u51fb"} / Counter</option>
                    <option value="balanced">
                      {"\u5e73\u8861"} / Balanced
                    </option>
                  </select>
                </label>
                <label className="team-settings-lineHeight">
                  <span>
                    {"\u9632\u5b88\u65b9\u9488"}{" "}
                    <small>Defensive approach</small>
                  </span>
                  <span>
                    {"\u9632\u7ebf\u9ad8\u5ea6"} <small>Line height</small>
                  </span>
                  <input
                    max="100"
                    min="1"
                    onChange={(event) =>
                      setTactics((current) => ({
                        ...current,
                        lineHeight: Number(event.target.value),
                      }))
                    }
                    type="number"
                    value={tactics.lineHeight}
                  />
                </label>
              </div>
            </>
          )}
          {activeSettingsTab === "assignments" && (
            <section className="team-settings-assignments">
              <div className="team-settings-assignmentGrid">
                {SET_PIECE_ASSIGNMENTS.map((assignment) => (
                  <label key={assignment.key}>
                    <span>{assignment.label}</span>
                    <AssignmentPlayerSelect
                      onChange={(playerKey) =>
                        setAssignments((current) => ({
                          ...current,
                          [assignment.key]: playerKey,
                        }))
                      }
                      players={payload?.players ?? []}
                      value={assignments[assignment.key] ?? ""}
                    />
                  </label>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="team-settings-tactics">
          <div className="team-settings-sectionTitle">
            <span>{"\u7403\u5458\u89d2\u8272"}</span>
            <span>Player Role</span>
          </div>
          {selectedAssignment && selectedPlayer ? (
            <div className="team-settings-playerRole">
              <div className="team-settings-selectedPlayer">
                {(selectedPlayer.card_image_url ??
                selectedPlayer.card_image_public_url) ? (
                  <img
                    className="team-settings-playerCard"
                    src={
                      selectedPlayer.card_image_url ??
                      selectedPlayer.card_image_public_url ??
                      ""
                    }
                    alt={`${selectedPlayer.name} card`}
                  />
                ) : selectedPlayer.avatar_url ? (
                  <img src={selectedPlayer.avatar_url} alt="" />
                ) : (
                  <span className="team-settings-avatarFallback">
                    {selectedPlayer.name.slice(0, 1)}
                  </span>
                )}
                <div>
                  {selectedPlayer.nation_image_url && (
                    <img
                      className="team-settings-nation"
                      src={selectedPlayer.nation_image_url}
                      alt=""
                    />
                  )}
                  <strong>{selectedPlayer.name}</strong>
                  <small>
                    {selectedPlayer.overall_rating} {selectedPlayer.position}
                  </small>
                </div>
              </div>
              <label>
                <span>
                  {"\u89d2\u8272"} <small>Role</small>
                </span>
                <select
                  onChange={(event) =>
                    updatePlayerRole(
                      selectedAssignment.slotId,
                      event.target.value,
                    )
                  }
                  value={selectedRoleName}
                >
                  {selectedRoleOptions.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  {"\u4fa7\u91cd\u70b9"} <small>Focus</small>
                </span>
                <select
                  value={selectedFocus}
                  onChange={(event) =>
                    setPlayerFocus((current) => ({
                      ...current,
                      [selectedAssignment.slotId]: event.target.value,
                    }))
                  }
                >
                  {selectedRole.focuses.map((focus) => (
                    <option key={focus} value={focus}>
                      {focus}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="team-settings-textButton"
                onClick={() => {
                  setLineup((items) =>
                    items.filter(
                      (item) => item.slotId !== selectedAssignment.slotId,
                    ),
                  );
                  setSelectedSlotId(null);
                }}
                type="button"
              >
                {"\u79fb\u51fa\u9635\u5bb9"} / Remove from lineup
              </button>
            </div>
          ) : (
            <p className="team-settings-emptyRole">
              {
                "\u70b9\u51fb\u9635\u578b\u4e2d\u5df2\u653e\u7f6e\u7684\u7403\u5458\u4ee5\u8bbe\u7f6e\u89d2\u8272\u3002"
              }
              <span>Select a placed player to edit their role.</span>
            </p>
          )}
          {notice && <p className="team-settings-notice">{notice}</p>}
          {error && <p className="team-settings-error">{error}</p>}
        </aside>
      </div>
    </section>
  );
}
