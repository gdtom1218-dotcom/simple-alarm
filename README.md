# ⏰ Simple Alarm

すごくシンプルな、ブラウザだけで動くアラームアプリです。
HTML / CSS / Vanilla JavaScript のみ。ビルド不要・依存ゼロ。

## 機能

- リアルタイム時計表示（時:分:秒）
- 時刻を選んで複数アラームをセット
- アラーム一覧の表示・削除
- 設定時刻になるとフルスクリーン表示＋ビープ音で通知
- `localStorage` に保存されるのでリロードしても消えへん

## 使い方

```bash
# クローンして index.html をブラウザで開くだけ
open index.html

# もしくは簡易サーバで
python3 -m http.server 8000
# → http://localhost:8000
```

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | 画面のマークアップ |
| `style.css` | スタイル（ダークテーマ） |
| `app.js` | 時計・アラームのロジック |

## ライセンス

MIT
