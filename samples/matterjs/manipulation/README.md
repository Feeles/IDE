# オブジェクトを直接操作する

`Body` を使えば、オブジェクトの位置や速度を  
直接操作することができるよ

静止している（`isStatic`）物体を動かしたいときも、  
この方法が使えるよ


## ![改造する](manipulation/main.js)


### Body.setPosition(`body`, { x: `x`, y: `y` })
指定した位置にオブジェクトを移動する

パラメータ | 意味 | 単位 | 最小 | 最大 
--- | --- | --- | --- | ---
body | 操作したいオブジェクト |  |  |  
x | 動かしたい位置（横） | px | 0 | 800
y | 動かしたい位置（縦） | px | 0 | 600 

### Body.setVelocity(`body`, { x: `x`, y: `y` })
指定した速度でオブジェクトを移動させる

パラメータ | 意味 | 単位 | 最小 | 最大 
--- | --- | --- | --- | ---
body | 操作したいオブジェクト |  |  |  
x | 速度（右向き） | *px / s* | -Infinity | Infinity
y | 速度（下向き） | *px / s* | -Infinity | Infinity 

### Body.setAngle(`body`, `angle`)
指定した角度にオブジェクトを回転する

パラメータ | 意味 | 単位 | 最小 | 最大 
--- | --- | --- | --- | ---
body | 操作したいオブジェクト |  |  |  
angle | 角度 | *rad* | -Math.PI | Math.PI

### Body.setAngularVelocity(`body`, `angularVelocity`)
指定した角速度でオブジェクトを回転させる

パラメータ | 意味 | 単位 | 最小 | 最大 
--- | --- | --- | --- | ---
body | 操作したいオブジェクト |  |  |  
angularVelocity | 角速度 | *rad / s* | -Infinity | Infinity 


[メニューに戻る](index.html)

