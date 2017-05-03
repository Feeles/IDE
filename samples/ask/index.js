import ask from './ask';
self.ask = ask;

import internet from './internet';
self.internet = internet;

import icon from './icon';
self.icon = icon;

document.querySelector('.root').classList.remove('loading');

import main from './main';
main();
