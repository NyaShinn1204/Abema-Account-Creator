<h1 align="center">
  Abema君殴り倒しツール
</h1>

<h3 align="center">
  Mulpayの最悪な仕様を殴り倒すツールです
</h3>

## Installation

**※ Go 1.22.3 以上のバージョンが必要です。**
**※ 残高0円でもいいので KYASH以外のクレジットカードが必要です。何で使えないのかは下に書いてあります**

依存関係はgo runすればインストールしてくれます。

> [!TIP]
> 開発バージョンです! 正式リリースなんてありません

```bash
git clone https://github.com/NyaShinn1204/Abema-Account-Creator.git

go run main.go
```

## コンフィグについて

デフォルトには
```
[general]
threads = 1
delay   = 5.0  # recommended 5.0!!!  
debug   = false

[tempmail]
service            = "" # m.kuku.lu or tempmail.lol or tempmail.io
poipoi_token       = ""
poipoi_sessionhash = ""

[payment]
cc_number    = ""
cc_exp_month = ""
cc_exp_year  = ""
cc_name      = ""
cc_cvv       = ""
```
となっています。お好みに変えてください。
threadsを3以上にすると、凄まじい爆音とともにプログラムが強制終了します。
delayは0.2で一度試しましたが、無事死にました。(スペルミスは知らないです)

paymentは自分のカードを使ってくださいね。
※決して他人のカードを使うことは推奨しません。

動作するであろうバンドルカード一覧

- [x] Ultra pay
- [x] モッピー
- [x] Line pay
- [ ] Kyash ※遊んで数万アカウント作ったらロックかかりました。GG