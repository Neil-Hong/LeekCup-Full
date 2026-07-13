"use client";

import { useEffect, useMemo, useState } from "react";
import type { Fc26PlayerSearchResult } from "@/lib/supabaseRest";

interface AddPlayerSearchProps {
  teamName: string;
  teamSname: string;
}

export default function AddPlayerSearch({
  teamName,
  teamSname,
}: AddPlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Fc26PlayerSearchResult[]>([]);
  const [selectedPlayer, setSelectedPlayer] =
    useState<Fc26PlayerSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionPrice, setTransactionPrice] = useState("0");
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2 || selectedPlayer?.name === trimmedQuery) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setSearchMessage("");
      setHasSearched(false);

      try {
        const response = await fetch(
          `/api/player-search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setResults([]);
          setSearchMessage("搜索失败 / Search failed");
          return;
        }

        const data = (await response.json()) as {
          players?: Fc26PlayerSearchResult[];
        };
        const players = data.players ?? [];
        setResults(players);
        setSearchMessage(
          players.length === 0 ? "没有找到球员 / No players found" : "",
        );
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setSearchMessage("搜索失败 / Search failed");
        }
      } finally {
        if (!controller.signal.aborted) {
          setHasSearched(true);
          setIsLoading(false);
        }
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, selectedPlayer]);

  const selectedCardImage = useMemo(() => {
    if (!selectedPlayer) return null;
    return selectedPlayer.card_image_url ?? selectedPlayer.card_image_public_url;
  }, [selectedPlayer]);

  const selectPlayer = (player: Fc26PlayerSearchResult) => {
    if (player.isSelected) {
      setErrorMessage("该球员已被选择，This player has been chose.");
      setSelectedPlayer(null);
      setResults([]);
      return;
    }

    setErrorMessage("");
    setSelectedPlayer(player);
    setQuery(player.name);
    setResults([]);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setErrorMessage("");

    if (selectedPlayer && value !== selectedPlayer.name) {
      setSelectedPlayer(null);
    }

    if (value.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setSearchMessage("");
      setHasSearched(false);
    }
  };

  const confirmPlayer = async () => {
    if (!selectedPlayer || isConfirming) return;

    const transactionPriceMillions = Number(transactionPrice || 0);

    if (
      !Number.isFinite(transactionPriceMillions) ||
      transactionPriceMillions < 0
    ) {
      setErrorMessage("Invalid transaction price.");
      return;
    }

    setIsConfirming(true);
    setErrorMessage("");

    const response = await fetch("/api/team-player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamSname,
        player: selectedPlayer,
        transactionPrice: Math.round(transactionPriceMillions * 1000000),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setErrorMessage(data?.error ?? "Failed to add player.");
      setIsConfirming(false);
      return;
    }

    const refreshMessage = {
      type: "team-player-added",
      teamSname,
    };
    window.opener?.postMessage(refreshMessage, window.location.origin);

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("team-player-events");
      channel.postMessage(refreshMessage);
      channel.close();
    }

    window.close();
  };

  return (
    <section className="add-player-panel" aria-label={`${teamName} add player`}>
      {selectedPlayer && (
        <div className="add-player-selected">
          <div className="add-player-cardImage">
            {selectedCardImage ? (
              <img src={selectedCardImage} alt={selectedPlayer.name} />
            ) : (
              <div className="add-player-cardPlaceholder">
                {selectedPlayer.overall_rating}
              </div>
            )}
          </div>

          <div className="add-player-cardInfo">
            <div className="add-player-cardTopline">
              <span>{selectedPlayer.overall_rating}</span>
              <span>{selectedPlayer.position}</span>
              {selectedPlayer.nation_image_url && (
                <img
                  src={selectedPlayer.nation_image_url}
                  alt={selectedPlayer.nation}
                />
              )}
            </div>
            <h2>{selectedPlayer.name}</h2>
            <div className="add-player-stats">
              <Stat label="PAC" value={selectedPlayer.pac} />
              <Stat label="SHO" value={selectedPlayer.sho} />
              <Stat label="PAS" value={selectedPlayer.pas} />
              <Stat label="DRI" value={selectedPlayer.dri} />
              <Stat label="DEF" value={selectedPlayer.def} />
              <Stat label="PHY" value={selectedPlayer.phy} />
            </div>
          </div>
        </div>
      )}

      <div className="add-player-searchWrap">
        <input
          className="add-player-search"
          onChange={(event) => changeQuery(event.target.value)}
          placeholder="Search Player"
          type="search"
          value={query}
        />

        {!selectedPlayer &&
          (results.length > 0 || isLoading || (hasSearched && searchMessage)) && (
          <div className="add-player-results">
            {isLoading ? (
              <div className="add-player-resultStatus">Searching...</div>
            ) : searchMessage ? (
              <div className="add-player-resultStatus">{searchMessage}</div>
            ) : (
              results.map((player) => (
                <button
                  className="add-player-result"
                  key={player.player_key}
                  onClick={() => selectPlayer(player)}
                  type="button"
                >
                  <span className="add-player-resultAvatar">
                    {player.avatar_url ? (
                      <img src={player.avatar_url} alt={player.name} />
                    ) : (
                      player.overall_rating
                    )}
                  </span>
                  <span>{player.name}</span>
                  <span>{player.isSelected ? "Selected" : player.position}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <label className="add-player-priceWrap">
        <span>成交价</span>
        <span>Transaction Price</span>
        <input
          aria-label="Transaction price in millions"
          inputMode="numeric"
          min="0"
          onChange={(event) => setTransactionPrice(event.target.value)}
          type="number"
          value={transactionPrice}
        />
        <span className="add-player-priceUnit">M</span>
      </label>

      {errorMessage && <div className="add-player-error">{errorMessage}</div>}

      <button
        className="add-player-button"
        disabled={!selectedPlayer || isConfirming}
        onClick={confirmPlayer}
        type="button"
      >
        <span>确认</span>
        <span>Confirm</span>
      </button>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="add-player-stat">
      <span>{value}</span>
      <span>{label}</span>
    </div>
  );
}
