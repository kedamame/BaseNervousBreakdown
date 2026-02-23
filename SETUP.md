# Base神経衰弱 - セットアップガイド

## 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成してください:

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key    # Alchemyダッシュボードから取得
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...      # スマートコントラクトデプロイ後に設定
NEXT_PUBLIC_URL=https://your-app.vercel.app
```

## 2. スマートコントラクトのデプロイ

1. [Remix IDE](https://remix.ethereum.org/) を開く
2. `contracts/MemoryGame.sol` をアップロード
3. Compiler: `0.8.20`, EVM: `paris`
4. MetaMaskをBase Mainnetに接続
5. Deploy & Transactions → "Deploy"をクリック
6. デプロイ後のアドレスを `NEXT_PUBLIC_CONTRACT_ADDRESS` に設定

## 3. ローカル開発

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

Farcasterでテストする場合は [ngrok](https://ngrok.com/) を使用:
```bash
ngrok http 3000
```

## 4. Vercelへのデプロイ

1. [Vercel](https://vercel.com) でプロジェクトをインポート
2. Environment Variables に `.env.local` の内容を設定
3. デプロイ後、Farcaster Developer Tools でプレビュー確認:
   https://farcaster.xyz/~/settings/developer-tools

## 5. Farcaster Manifestの設定

デプロイ後、`app/.well-known/farcaster/route.ts` の `accountAssociation` を更新:

1. https://farcaster.xyz/~/settings/developer-tools を開く
2. "Generate Manifest" をクリック
3. 生成されたJWT（header/payload/signature）を `route.ts` に貼り付け

## 6. プロジェクト構造

```
├── app/
│   ├── layout.tsx          # fc:miniapp メタデータ
│   ├── page.tsx            # ゲームメインページ
│   └── .well-known/farcaster/route.ts  # Manifest
├── components/
│   ├── providers/Web3Provider.tsx
│   ├── Game/{LoadingScreen,Card,GameBoard,StageComplete}.tsx
│   └── ui/ScoreBoard.tsx
├── contracts/MemoryGame.sol  # Base Mainnetにデプロイ
├── hooks/{useAlchemy,useGame,useScore}.ts
├── lib/{types,constants,alchemy,gameLogic,wagmiConfig}.ts
└── public/demo-cards/       # フォールバック用SVG画像 (20枚)
```

## ゲームルール

- ステージ1: 4枚 (2ペア)
- ステージ2: 8枚 (4ペア)
- ステージ3以降: ステージごとに8枚増加
- カードはウォレット内のNFT・トークン画像を使用
- 画像が不足する場合はデモカードで補充
- クリア時の手数をBase Mainnetのコントラクトに記録
