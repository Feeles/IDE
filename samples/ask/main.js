import ask from 'ask';

// canvas size
for (const canvas of Array.from(document.getElementsByTagName('canvas'))) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

import talk1 from './talks/1';
talk1(ask);
