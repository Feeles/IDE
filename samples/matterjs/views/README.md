# ズームとスクロール


ゲームでよくある、画面のスクロールを作ってみたよ  
`Bounds.translate` を使うと、領域(りょういき)を移動させることができるんだ

ここでいう領域とは、端が四つあるもののことだよ。  
見た目の画面や、ワールドの画面なども、領域を持っているんだ


## ![改造する](views/main.js)


### Bounds.translate(`bounds`, { x: `x`, y: `y` });
パラメータ | 意味 | 単位 | 最小 | 最大 
--- | --- | --- | --- | ---
bounds | 移動したい領域 |  |  | 
x | 右に移動する量 | px | -Infinity | Infinity
y | 下に移動する量 | px | -Infinity | Infinity


[メニューに戻る](index.html)

