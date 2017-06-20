function rgbToLab(r, g, b) {
	//https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
	var r = r / 255;
	var g = g / 255;
	var b = b / 255;

	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	//https://en.wikipedia.org/wiki/Lab_color_space#CIELAB-CIEXYZ_conversions
	var L;
	var a;
	var b;

	x *= 100;
	y *= 100;
	z *= 100;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (4 / 29);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (4 / 29);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (4 / 29);

	L = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [L, a, b];
}

function ciede2000(L1, a1, b1, L2, a2, b2, kL = 1, kC = 1, kH = 1) {
	//http://en.wikipedia.org/wiki/Color_difference#CIEDE2000
	var radianToDegree = function(radian) {
		return radian * (180 / Math.PI);
	};
	var degreeToRadian = function(degree) {
		return degree * (Math.PI / 180);
	};

	var deltaLp = L2 - L1;
	var L_ = (L1 + L2) / 2;
	var C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
	var C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
	var C_ = (C1 + C2) / 2;
	var ap1 = a1 + (a1 / 2) *
		(1 - Math.sqrt(
			Math.pow(C_, 7) /
			(Math.pow(C_, 7) + Math.pow(25, 7))
		));
	var ap2 = a2 + (a2 / 2) *
		(1 - Math.sqrt(
			Math.pow(C_, 7) /
			(Math.pow(C_, 7) + Math.pow(25, 7))
		));
	var Cp1 = Math.sqrt(Math.pow(ap1, 2) + Math.pow(b1, 2));
	var Cp2 = Math.sqrt(Math.pow(ap2, 2) + Math.pow(b2, 2));
	var Cp_ = (Cp1 + Cp2) / 2;
	var deltaCp = Cp2 - Cp1;

	var hp1;
	if (b1 == 0 && ap1 == 0) {
		hp1 = 0;
	} else {
		hp1 = radianToDegree(Math.atan2(b1, ap1));
		if (hp1 < 0) {
			hp1 = hp1 + 360;
		}
	}
	var hp2;
	if (b2 == 0 && ap2 == 0) {
		hp2 = 0;
	} else {
		hp2 = radianToDegree(Math.atan2(b2, ap2));
		if (hp2 < 0) {
			hp2 = hp2 + 360;
		}
	}

	var deltahp;
	if (C1 == 0 || C2 == 0) {
		deltahp = 0;
	} else if (Math.abs(hp1 - hp2) <= 180) {
		deltahp = hp2 - hp1;
	} else if (hp2 <= hp1) {
		deltahp = hp2 - hp1 + 360;
	} else {
		deltahp = hp2 - hp1 - 360;
	}

	var deltaHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(degreeToRadian(deltahp) / 2);

	var Hp_;
	if (Math.abs(hp1 - hp2) > 180) {
		Hp_ = (hp1 + hp2 + 360) / 2
	} else {
		Hp_ = (hp1 + hp2) / 2
	};

	var T = 1 -
		0.17 * Math.cos(degreeToRadian(Hp_ - 30)) +
		0.24 * Math.cos(degreeToRadian(2 * Hp_)) +
		0.32 * Math.cos(degreeToRadian(3 * Hp_ + 6)) -
		0.20 * Math.cos(degreeToRadian(4 * Hp_ - 63));

	var SL = 1 + (
		(0.015 * Math.pow(L_ - 50, 2)) /
		Math.sqrt(20 + Math.pow(L_ - 50, 2))
	);
	var SC = 1 + 0.045 * Cp_;
	var SH = 1 + 0.015 * Cp_ * T;

	var RT = -2 *
		Math.sqrt(
			Math.pow(Cp_, 7) /
			(Math.pow(Cp_, 7) + Math.pow(25, 7))
		) *
		Math.sin(degreeToRadian(
			60 * Math.exp(-Math.pow((Hp_ - 275) / 25, 2))
		));

	return Math.sqrt(
		Math.pow(deltaLp / (kL * SL), 2) +
		Math.pow(deltaCp / (kC * SC), 2) +
		Math.pow(deltaHp / (kH * SH), 2) +
		RT * (deltaCp / (kC * SC)) * (deltaHp / (kH * SH))
	);
}





export async function drawImage(mc, src, _x, _y, _z, relative = true, scale = 1.0) {

	let image;

	if (src instanceof HTMLCanvasElement) {
		image = src;
	} else {
		const image = await feeles.fetchDataURL(src).then((url) => {
			return new Promise((resolve) => {
				const image = new Image();
				image.onload = () => {
					resolve(image);
				};
				image.onerror = (e) => {
					// console.error(e);
				};
				image.src = url;
			});
		});
	}



	const minecraft = mc;

	const canvas = document.createElement('canvas');

	const w = (image.width * scale) | 0;
	const h = (image.height * scale) | 0;

	canvas.width = w;
	canvas.height = h;

	const context = canvas.getContext('2d');


	context.fillStyle = '#fff';
	context.fillRect(0, 0, w, h);

	context.drawImage(image, 0, 0, w, h);

	const imageData = context.getImageData(0, 0, w, h);


	function rgb(colorName) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 1;
		const context = canvas.getContext('2d');
		context.fillStyle = colorName;
		context.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
		return {
			r,
			g,
			b,
			a
		};
	}




	const colors = [
		'white',
		'orange',
		'magenta',
		'lightblue',
		'yellow',
		'lime',
		'pink',
		'gray',
		'lightgray',
		'cyan',
		'purple',
		'blue',
		'brown',
		'green',
		'red',
		'black'
	].map((color) => {
		return rgb(color);
	});



	for (let x = 0; x < w; ++x) {
		for (let y = 0; y < h; ++y) {

			const __x = _x + x;
			const __y = _y;
			const __z = _z + y;

			minecraft.setBlock('stone', __x, __y, __z, relative);


			await new Promise((resolve) => setTimeout(resolve, 0));


			let r = imageData.data[x * 4 + y * w * 4 + 0];
			let g = imageData.data[x * 4 + y * w * 4 + 1];
			let b = imageData.data[x * 4 + y * w * 4 + 2];


			const data = colors.map((c, index) => {



				var [L1, a1, b1] = rgbToLab(c.r, c.g, c.b);
				var [L2, a2, b2] = rgbToLab(r, g, b);

				var distance = ciede2000(L1, a1, b1, L2, a2, b2);


				return {
					index,
					value: distance
				};
			}).sort((a, b) => {
				return a.value - b.value;
			})[0].index;

			// console.log(data);

			const block = `concrete:${data}`;


			minecraft.setBlock(block, __x, __y, __z, relative);


		}
	}

	// document.body.appendChild(canvas);

};


export function way(way, radius) {

	const result = [];

	for (let i = 0; i < way; ++i) {

		const angle = Math.PI * 2 / way * i;

		const x = (Math.sin(angle) * radius) | 0;
		const y = (Math.cos(angle) * radius) | 0;

		result.push([x, y]);

	}

	return result;

};


export function capture(mc, x, y, z, scale = 0.3) {

	const canvas = document.querySelector('canvas');

	// プレイヤーを 0, 110, 0 の位置に移動させる
	mc.locateTo(x, y + 10, z);

	// ゲーム画面のスクショを
	// 0, 100, 0 の位置（絶対座標）に
	// 0.3 倍の大きさで描画する
	drawImage(mc, canvas, x, y, z, false, scale);

};

export function wait(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}



export async function setInterval(promise, time) {

	await promise();

	await wait(time);

	setInterval(promise, time);

}
