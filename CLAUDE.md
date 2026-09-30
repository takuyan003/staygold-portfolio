# staygold-portfolio

STAYGOLD（ステイゴールド合同会社）の制作スタジオ用ポートフォリオ。

- 公開URL: https://studio.staygoldltd.co.jp/
- 配信: GitHub Pages（`main` ブランチのルート／`CNAME` で独自ドメイン）
- 構成: 素の HTML + CSS + JS。ビルド工程なし・外部ライブラリなし
- 主要ファイル: `index.html` / `assets/style.css` / `assets/main.js` / `img/`
- CSS・JS は `?v=N` のクエリでキャッシュを破棄している。**変更したら `index.html` の `v=` を上げる**

会社本体のサイト（www.staygoldltd.co.jp）とは別物。本体は不動産事業用で、入口を分けてある。

## Git Safety Rules

このリポジトリは、複数の Claude Code セッション、Codex、手動編集などから同時に更新される可能性がある。
そのため commit / push / pull / merge / rebase を行う際は、**既存のリモート変更を壊さないこと**を最優先する。

### Push 前の必須確認

push の前に必ず以下を実行する。

```
git fetch origin
git status
git log --oneline HEAD..origin/main
```

必要に応じて以下も確認する。

```
git log --oneline origin/main..HEAD
git diff HEAD..origin/main
```

### origin/main が進んでいる場合

`origin/main` にローカルが持っていないコミットが存在する場合は、**そのまま push しない**。
まずリモート側の変更内容を確認し、特に次の点を見る。

- 同一ファイルの変更
- HTML 本文
- プロジェクトの並び順
- Status
- URL
- OGP
- CNAME
- SEO 関連
- 公開設定
- 他セッションによる変更

**リモートの最新変更を保持した状態で、自分の変更を再適用する。**

### Force Push

以下は原則禁止。

```
git push --force
git push --force-with-lease
```

ユーザーから明示的に指示された場合のみ使用可能。

### Conflict

競合発生時は、local / remote の片方を機械的に採用しない。
両方の変更意図を確認し、最新の情報を失わない形で統合する。
特に `index.html`、設定ファイル、SEO 関連ファイルは慎重に扱う。

### Reset

`git reset --hard` を使う場合、必要に応じて事前に変更を退避する。

```
git branch backup-<identifier>
```

または

```
git stash
```

未保存の変更を消さないこと。

### Push 直前

実際に push する直前に、もう一度以下を確認する。

```
git fetch origin
git status
git log --oneline HEAD..origin/main
```

新しいリモートコミットが見つかった場合は push を中止し、再度統合する。

### Push 後

push 後は以下を確認する。

```
git status
git log -1 --oneline
```

GitHub Pages の対象リポジトリでは、可能な範囲で公開環境も確認する。

### 基本原則

**Speed より Safety。**
早く push することより、既存変更を壊さないことを優先する。
リモートが進んでいた場合は、force push で上書きするのではなく、最新状態を確認して安全に統合する。
