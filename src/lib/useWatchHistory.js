"use client";

import { useState } from "react";

const STORAGE_KEY = "kaelnime_watch_history";
const MAX_HISTORY = 50;

function generateEpisodeId(episodeTitle) {
  return episodeTitle
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getStoredHistory() {
  if (typeof window === "undefined") return [];
  const storedHistory = localStorage.getItem(STORAGE_KEY);
  if (storedHistory) {
    try {
      const parsed = JSON.parse(storedHistory);
      return parsed.map(entry => ({
        ...entry,
        episodeId: entry.episodeId || generateEpisodeId(entry.episodeTitle)
      }));
    } catch (error) {
      console.error("Failed to parse watch history:", error);
      return [];
    }
  }
  return [];
}

export function useWatchHistory() {
  const [history, setHistory] = useState(getStoredHistory);

  const addToHistory = (episodeData) => {
    if (!episodeData.episodeId) {
      console.warn("episodeId is missing from episodeData");
      return;
    }

    const episodeTitle = episodeData.title || episodeData.episodeTitle || "Unknown Episode";
    
    const newEntry = {
      episodeId: episodeData.episodeId,
      episodeTitle,
      animeId: episodeData.animeId,
      animeTitle: episodeData.animeTitle || episodeTitle?.split(" Episode")[0] || "Unknown Anime",
      poster: episodeData.poster,
      watchedAt: Date.now(),
      releaseDate: episodeData.releasedOn || episodeData.releaseDate,
    };

    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(
        (entry) => entry.episodeId !== episodeData.episodeId
      );
      
      const updated = [newEntry, ...filtered];
      
      const limited = updated.slice(0, MAX_HISTORY);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      return limited;
    });
  };

  const getHistory = () => {
    return history;
  };

  const removeFromHistory = (episodeId) => {
    setHistory((prevHistory) => {
      const updated = prevHistory.filter((entry) => entry.episodeId !== episodeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getGroupedHistory = () => {
    const grouped = {};
    
    history.forEach(entry => {
      const animeId = entry.animeId || "unknown";
      
      if (!grouped[animeId]) {
        grouped[animeId] = {
          animeId: entry.animeId,
          animeTitle: entry.animeTitle || "Unknown Anime",
          poster: entry.poster,
          episodes: [],
          latestEpisode: entry,
          lastWatchedAt: entry.watchedAt
        };
      }
      
      grouped[animeId].episodes.push(entry);
      
      if (entry.watchedAt > grouped[animeId].lastWatchedAt) {
        grouped[animeId].lastWatchedAt = entry.watchedAt;
        grouped[animeId].latestEpisode = entry;
        grouped[animeId].poster = entry.poster;
      }
    });
    
    return Object.values(grouped).sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
  };

  const removeAnimeHistory = (animeId) => {
    setHistory((prevHistory) => {
      const updated = prevHistory.filter((entry) => entry.animeId !== animeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getAnimeEpisodes = (animeId) => {
    return history
      .filter(entry => entry.animeId === animeId)
      .sort((a, b) => b.watchedAt - a.watchedAt);
  };

  return {
    history,
    addToHistory,
    getHistory,
    removeFromHistory,
    clearHistory,
    getGroupedHistory,
    removeAnimeHistory,
    getAnimeEpisodes,
  };
}
