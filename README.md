# 税理士試験 学習アプリ

社会人が限られた学習時間で税理士試験に合格するための PWA 学習アプリ。
仕様の全体像は [`SPEC.md`](./SPEC.md) を参照。

## 現在のフェーズ: 雛形 + 暗記カード MVP

実装済み:

- Vite + React + Tailwind CSS の雛形
- PWA 対応（`vite-plugin-pwa` による Service Worker / manifest 自動生成）
- IndexedDB スキーマ（`dexie`）と初回起動時のサンプルコンテンツ投入
- 暗記カード機能（SM-2 間隔反復、スワイプ評価）
- 会計 2 科目（簿記論・財務諸表論）のサンプルカード 計 6 枚
- Settings 画面での Claude API Key 保存（IndexedDB、平文）
- GitHub Actions による GitHub Pages 自動デプロイ

未実装（後続イテレーション）:

- Claude API の実呼び出し（弱点補強問題・論点解説）
- 問題演習（Level 1〜3）・過去問・模擬試験
- ダッシュボード・ストリーク・週次レポート
- 税法科目
- API Key の暗号化保存・データエクスポート/インポート

## 開発

```bash
npm install
npm run dev       # 開発サーバー（http://localhost:5173/zeirishi/）
npm run build     # 本番ビルド
npm run preview   # dist をローカル確認
```

## ディレクトリ

```
content/            # 内蔵コンテンツ（JSON）
  subjects.json
  cards/
    bookkeeping/ch01.json
    financial_statements/ch01.json
src/
  components/       # FlashCard, Layout
  pages/            # Home, Cards, Settings
  hooks/            # useSRS, useApiKey
  db/               # Dexie スキーマ + seed
  utils/            # SM-2
public/icons/       # PWA アイコン
.github/workflows/  # GitHub Pages デプロイ
```

## 操作

- **暗記カード画面**: タップで表裏切替、スワイプで評価
  - 右スワイプ or 「覚えた」 = grade 4
  - 左スワイプ or 「もう一度」 = grade 2（翌日に再出題）
  - 上スワイプ or 「自信あり」 = grade 5
- **設定画面**: Claude API Key を保存。今後の AI 機能拡張に備える。

## デプロイ

`main` ブランチへの push で GitHub Actions が自動ビルドし、GitHub Pages に
`/zeirishi/` パスでデプロイされる。リポジトリ設定で Pages のソースを
「GitHub Actions」に変更する必要がある。
