"use client";

import { useReducer, useCallback } from "react";
import type { Item, Response, SessionState } from "./types";
import {
  DEFAULT_MAX_ITEMS,
  STARTING_DIFFICULTY,
  nextDifficulty,
  selectNextItem,
  updateTheta,
  thetaToScore,
} from "./engine";

type Action =
  | { type: "LOAD_SUCCESS"; items: Item[] }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "START" }
  | { type: "ANSWER"; selectedAnswer: string; nowMs: number }
  | { type: "RESTART" };

function makeInitialState(maxItems = DEFAULT_MAX_ITEMS): SessionState {
  return {
    phase: "loading",
    loadError: null,
    allItems: [],
    seenIds: new Set(),
    currentItem: null,
    currentDifficulty: STARTING_DIFFICULTY,
    theta: 0,
    responses: [],
    maxItems,
    itemStartTime: 0,
  };
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, phase: "ready", allItems: action.items };

    case "LOAD_ERROR":
      return { ...state, phase: "error", loadError: action.message };

    case "START": {
      const item = selectNextItem(state.allItems, new Set(), STARTING_DIFFICULTY);
      if (!item) return { ...state, phase: "error", loadError: "No items available to start the test." };
      return {
        ...state,
        phase: "active",
        seenIds: new Set([item.item_id]),
        currentItem: item,
        currentDifficulty: STARTING_DIFFICULTY,
        theta: 0,
        responses: [],
        itemStartTime: Date.now(),
      };
    }

    case "ANSWER": {
      if (!state.currentItem) return state;
      const isCorrect = action.selectedAnswer === state.currentItem.correct_answer;
      const newTheta = updateTheta(state.theta, isCorrect);
      const newScore = thetaToScore(newTheta);
      const response: Response = {
        item: state.currentItem,
        selectedAnswer: action.selectedAnswer,
        isCorrect,
        thetaAfter: newTheta,
        scoreAfter: newScore,
        elapsedMs: action.nowMs - state.itemStartTime,
      };
      const newResponses = [...state.responses, response];

      if (newResponses.length >= state.maxItems) {
        return { ...state, phase: "complete", responses: newResponses, theta: newTheta };
      }

      const newDifficulty = nextDifficulty(state.currentDifficulty, isCorrect);
      const newSeenIds = new Set<string>(state.seenIds);
      newSeenIds.add(state.currentItem.item_id);
      const nextItem = selectNextItem(state.allItems, newSeenIds, newDifficulty);

      if (!nextItem) {
        return { ...state, phase: "complete", responses: newResponses, theta: newTheta };
      }

      newSeenIds.add(nextItem.item_id);
      return {
        ...state,
        phase: "active",
        responses: newResponses,
        theta: newTheta,
        currentDifficulty: newDifficulty,
        seenIds: newSeenIds,
        currentItem: nextItem,
        itemStartTime: action.nowMs,
      };
    }

    case "RESTART":
      return makeInitialState(state.maxItems);

    default:
      return state;
  }
}

export function useSession(maxItems = DEFAULT_MAX_ITEMS) {
  const [state, dispatch] = useReducer(reducer, undefined, () => makeInitialState(maxItems));

  const loadItems = useCallback((items: Item[]) => {
    dispatch({ type: "LOAD_SUCCESS", items });
  }, []);

  const loadError = useCallback((message: string) => {
    dispatch({ type: "LOAD_ERROR", message });
  }, []);

  const start = useCallback(() => {
    dispatch({ type: "START" });
  }, []);

  const answer = useCallback((selectedAnswer: string) => {
    dispatch({ type: "ANSWER", selectedAnswer, nowMs: Date.now() });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  return { state, loadItems, loadError, start, answer, restart };
}