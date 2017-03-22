# HackforPlay Open Source 🏫  


世の中には、様々な目的をもって教育を行う人々がいます。  
しかし、自分たちで教材を作れる人はそう多くありません。  
多くの教育者は、胸の内で正しい教育の姿を描いています。  
それを容易に具現化する方法があれば、新しい教育の可能性は無数に広がっていくはずです。  

そこで私たちは、今まで行ってきた「 HackforPlay ライクな教育」を  
教育者が利用しやすい形のツールとして仕立て直し、  
すべての教育者が自分たちで教材を（教育を）作る手助けをすることで  
よりよい教育の探求を促進します。  


## Feeles

人々にコードをプレゼントするためのオープンソース IDE

> Feeles: "Feel *ES*".  
ES: ECMA Script, 規格化されたモダンな JavaScript , その総称

Try it out!
- [空の Feeles (最新版)](https://feeles.github.io/IDE/dist)
(日本語/英語対応 🍔)
- [HackforPlay on Feeles](https://feeles.github.io/IDE/dist/hack-rpg.html)
(日本語のみ 🍣)
- [Pixi.js (制作中)](https://tenonno.github.io/RPG-2/)
(日本語のみ 🍣)


## できること

- ブラウザ (Chrome/FireFox/Safari/Opera/~~IE11~~) で動きます 💻
  - **スタンドアロン** で動作します。HTML ファイルを開くだけ。
  - IDE の中にファイルを入れると、 Web サーバーのようにふるまいます 🎩
- クローンしてシェアできます
  - 全てのファイルをひとつの HTML に書き出せます。
  - もう一度言いますが、 HTML ファイルを開くだけで動きます! 😆
- モダンな文法
  - ES2015 を書くことができ、 import/export もそのまま動きます。
  - つまり、中に `Babel` と `require.js` が入っているんです 👀
- 誰がコードを書いたのか記録できます（原作者をリスペクトするのだ！）
- ブラウザの `IndexedDB` を使用してセーブ・ロードできます
- Markdown ファイルが README のように表示されます
- アセットと呼んでいるビジュアルスニペットを JSON 形式で作れます
- 気分に合わせてテーマカラーを変更できます
などなど…

## IDE を作成する

1. このリポジトリを Fork または Clone します
2. ディレクトリを移動します `cd (installed directory)`
3. npm コマンドを実行します `npm install && npm start`
4. localhost をブラウザで開きます `open http://localhost:(port)` ポートは通常 8080 です

- `src/`
  - 生徒が使うアプリケーションで、 React.js で作られています
- `mount/`
  - 生徒が **作り変えて**、Feeles 上で動作するアプリケーションです

> この文章（日本語）が原文です  
English: <https://github.com/teramotodaiki/h4p/blob/master/README.md>
