# バネ

バネっぽい動きを作ってみた

[メニューに戻る](index.html)


## 改造してみる

![ここから始める](constraint/main.js)

**Constraint.create({  
　　bodyA: `1`,  
　　pointB: {  
　　　　x: `2`,  
　　　　y: `3`,  
　　},  
　　stiffness: `4`,  
});**

|| 意味 | はんい
--- | --- | --- 
1 | オブジェクト | なし
2 | 左からのキョリ | 0 ~ 800
3 | 上からのキョリ | 0 ~ 600
4 | バネの強さ | 0 ~ 1.0


もっと改造
![設定](constraint/setting.js)

## コラム 「フックの法則」

フックの法則によると バネ が元に戻ろうとする力は、  
バネが伸びた長さに、ある定数をかけたものなんだ  
伸びた長さが倍になれば、戻ろうとする力も倍になるんだね

ある定数のことを **バネ定数** と言って、  
パラメータでは `stiffness` のことだよ

- - -

## 応用例

[スリングショット](slingshot/index.html)
[モンケーン](wreckingBall/index.html)
[ブリッジ](bridge/index.html)
[発射台](catapult/index.html)
