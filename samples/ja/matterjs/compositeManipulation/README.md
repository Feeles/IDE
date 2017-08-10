# スタック全体の操作


`Composite` を使うと、スタックにふくまれる  
全てのオブジェクトを同時に動かせるよ


## ![改造する](compositeManipulation/main.js)


### Composite.translate(stack, { x: `x`, y: `y` })

スタック全体を移動させる

パラメータ | 意味 | 単位
--- | --- | ---
x | 右に移動する量 | px
y | 下に移動する量 | px

### Composite.rotate(stack, `angle`, { x: `centerX`, y: `centerY` })

スタック全体を回転させる

パラメータ | 意味 | 単位
--- | --- | ---
angle | 現在の角度に **足し算** する角度 | *rad*
centerX | 回転の中心（ 0 ならスタックの左端） | px
centerY | 回転の中心（ 0 ならスタックの上端） | px

### Composite.scale(stack, `scaleX`, `scaleY`,  { x: `centerX`, y: `centerY` })

スタック全体を拡大させる

パラメータ | 意味 | 単位
--- | --- | ---
scaleX | 横方向に **かけ算** する大きさ ( 1 なら変化なし) | 倍
scaleY | 縦方向に **かけ算** する大きさ ( 1 なら変化なし) | 倍
centerX | 拡大の中心（ 0 ならスタックの左端） | px
centerY | 拡大の中心（ 0 ならスタックの上端） | px


[メニューに戻る](index.html)


