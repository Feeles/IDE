// ダイヤ (img src="")
const btn = document.querySelector('.diamond');
btn.onclick = async e => {
  const response = await fetch('http://localhost:8080/give?player=@p&itemName=diamond&amount=1');
  console.log(response);
};

// 石（feeles.fetch)
(async () => {

  const response = await feeles.fetch('images/stone.png');
  const blob = await response.blob();

  const btn = document.querySelector('.stone');
  btn.src = URL.createObjectURL(blob);
  btn.onclick = async e => {
    const response = await fetch('http://localhost:8080/give?player=@p&itemName=stone&amount=1');
    console.log(response);
  };

})();
