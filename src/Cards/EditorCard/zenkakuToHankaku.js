const regExp = /[！-～|”|’|、|。|ー]/;

let userWasCanceled = false;

export default function zenkakuToHankaku(cm, change) {
  if (userWasCanceled || change.origin !== '+input' && change.origin !== '*compose') return;

  // 全角の数字・記号が含まれているかどうか
  const hasZenkaku = regExp.test(change.text.join());
  if (!hasZenkaku) return;

  // 半角に変換する
  const text = change.text.map(text => {
    return text.split('').map(char => {
      if (regExp.test(char)) {
        const hankaku = char
          .replace(/[！-～]/, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
          })
          .replace(/”/, '"')
          .replace(/’/, '\'')
          .replace(/、/, ',')
          .replace(/。/, '.')
          .replace(/ー/, '-');
        // 置換するか聞く
        if (!userWasCanceled &&
          confirm(`全角の ${char} が入力されました。プログラミングではふつう半角の ${hankaku} を使います。 ${hankaku} にしますか？`)
        ) {
          alert('次からは、キーボードの【全角/半角】または【英数】キーを押して、半角入力にしておきましょう！');
          return hankaku;
        } else {
          // キャンセルされたらもう聞かない
          userWasCanceled = true;
        }
      }
      return char;
    }).join('');
  });

  change.update(change.from, change.to, text);
}