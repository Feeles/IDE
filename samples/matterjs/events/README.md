# イベント


ある出来事が起こったとき、  
あらかじめ設定しておいた関数を実行する仕組みのことを、  
イベントと呼ぶよ

このサンプルでは、  
- マウスでクリックされた
- ５秒たった（繰り返す）  
のどちらかの出来事が起こったとき、画面全体をシェイクするよ

## ![改造する](events/main.js)

## イベントの種類

誰が起こすイベントか | イベントの名前 | 意味
--- | --- | ---
world | afterAdd | オブジェクトやスタックが新しく追加されたとき
engine | beforeUpdate | 実行中は常に毎フレーム
engine | collisionStart | いずれかのオブジェクトがしょう突したとき
engine | collisionActive | いずれかのオブジェクトがしょう突し続けている間常に
engine | collisionEnd | しょう突が終わった（離れた）とき
mouseConstraint | mousedown | マウスが押されたとき
mouseConstraint | mouseup | マウスが離れたたとき
mouseConstraint | startdrag | マウスがドラッグを始めたとき
mouseConstraint | enddrag | マウスがドラッグを終えたとき


## console.log について

ある変数の中身を、コンソールという部分に表示する機能だよ  
確認するには、ブラウザの **開発者ツール** を開こう

- Windows の場合 F12 キー
- Mac の場合 Alt + Cmd + I キー


[メニューに戻る](index.html)


- - -

## 応用例

[スリングショット](slingshot/index.html)

