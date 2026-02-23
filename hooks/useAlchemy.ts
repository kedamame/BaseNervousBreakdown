"use client";

import { useCallback, useRef, useState } from "react";
import {
  fetchNFTImages,
  fetchTokenImages,
  buildImagePool,
} from "@/lib/alchemy";
import { AssetImage } from "@/lib/types";

export interface AlchemyState {
  images: AssetImage[];
  isLoading: boolean;
  progress: number;
  message: string;
  error: string | null;
}

export function useAlchemy() {
  const [state, setState] = useState<AlchemyState>({
    images: [],
    isLoading: false,
    progress: 0,
    message: "",
    error: null,
  });

  // Hold all fetched images for use across stages
  const allImagesRef = useRef<AssetImage[]>([]);
  const fetchedRef = useRef(false);

  const loadAssetsForStage = useCallback(
    async (address: string, pairsNeeded: number) => {
      // If we already have enough, return immediately
      if (allImagesRef.current.length >= pairsNeeded) {
        setState((prev) => ({
          ...prev,
          images: allImagesRef.current,
          isLoading: false,
          progress: 100,
        }));
        return allImagesRef.current;
      }

      setState({
        images: [],
        isLoading: true,
        progress: 0,
        message: "ウォレットを確認中...",
        error: null,
      });

      try {
        // Step 1: Fetch NFTs (priority)
        setState((prev) => ({
          ...prev,
          progress: 20,
          message: "NFTを読み込み中...",
        }));

        const nfts = await fetchNFTImages(address);

        setState((prev) => ({
          ...prev,
          progress: 60,
          message: `${nfts.length}件のNFTを発見。トークンを確認中...`,
        }));

        // Step 2: Fetch tokens
        const tokens = await fetchTokenImages(address);

        setState((prev) => ({
          ...prev,
          progress: 85,
          message: "カードを準備中...",
        }));

        // Step 3: Build pool with demo fallback
        const pool = buildImagePool(nfts, tokens, pairsNeeded);
        allImagesRef.current = pool;
        fetchedRef.current = true;

        setState({
          images: pool,
          isLoading: false,
          progress: 100,
          message: `${pool.length}枚の画像を読み込みました`,
          error: null,
        });

        return pool;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          message: "読み込みエラー。デモ画像で進めます...",
        }));
        return allImagesRef.current;
      }
    },
    []
  );

  /**
   * Background-loads more images while the user is playing.
   * Called after a stage starts to prepare for the next stage.
   */
  const prefetchForNextStage = useCallback(
    async (address: string, nextPairsNeeded: number) => {
      if (allImagesRef.current.length >= nextPairsNeeded) return;
      // Silently extend the pool
      try {
        const nfts = await fetchNFTImages(address);
        const tokens = await fetchTokenImages(address);
        const pool = buildImagePool(nfts, tokens, nextPairsNeeded);
        allImagesRef.current = pool;
        setState((prev) => ({ ...prev, images: pool }));
      } catch {
        // Silently ignore prefetch errors
      }
    },
    []
  );

  const getImages = useCallback(() => allImagesRef.current, []);

  return { state, loadAssetsForStage, prefetchForNextStage, getImages };
}
