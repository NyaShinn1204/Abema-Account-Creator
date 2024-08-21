<h1 align="center">
  Abema君殴り倒しツール
</h1>

<h3 align="center">
  Mulpayの最悪な仕様を殴り倒すツールです
</h3>

## Announce
はい、トライアル自体は7/21に終了されましたが、 :nerd_face:

**バカな運営のせいで**APIが残ったままなのでまだ使えます。 :skull:

追記: 429エラーで作成できないこともありますが、ぶっちゃけ時間置けばまた作れます

## Installation

~~**※ Go 1.22.3 以上のバージョンが必要です。**~~

**※ 残高0円でもいいので KYASH以外のバンドルカードもしくはクレジットカードが必要です。何で使えないのかは下に書いてあります**

依存関係はgo runすればインストールしてくれます。

> [!TIP]
> 開発バージョンです! 正式リリースなんてありません

```bash
git clone https://github.com/NyaShinn1204/Abema-Account-Creator.git

nyagenv2.exe
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


### Paymentについて
paymentは自分のカードを使ってくださいね。 (チェックは激アマなので変な奴で通りますけど)

※決して他人のカードを使うことは推奨しません。

動作するであろうバンドルカード一覧

- [x] Ultra pay
- [x] モッピー
- [x] Line pay
- [ ] Kyash ※遊んで単一ccで数千アカウント作ったらロックかかりました。GG
