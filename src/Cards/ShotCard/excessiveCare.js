export default function excessiveCare(cm, change) {
  if (
    change.origin === '+input' ||
    change.origin === '*compose' /*||
    change.origin === "paste"*/
  ) {
    let matchFlag = false;
    const replaced = [];
    change.text.forEach(function(input) {
      if (input.match(/[！-～|”|’|、|。]/g)) {
        const han = input
          .replace(/[！-～]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
          })
          .replace(/”/g, '"')
          .replace(/’/g, "'")
          .replace(/、/g, ',')
          .replace(/。/g, '.');
        replaced.push(han);
        matchFlag = true;
      } else {
        replaced.push(input);
      }
    });
    if (matchFlag) {
      change.update(change.from, change.to, replaced, '');
    }
  }
}
