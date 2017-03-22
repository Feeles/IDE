# HackforPlay Open Source 🏫  


> Original (日本語) <https://github.com/Feeles/IDE/blob/master/README-ja.md>

In the world, there are people who educate with various purposes.  
However, there are not so many people who can make teaching materials by themselves.  
Many educators are drawing correct image of education in their minds.  
If there is a way to make it easy to embody, the possibility of new education should spread innumerable.

So we are going to do "HackforPlay-like education"  
Tailor it as a tool that the educator can use easily,  
By helping all educators make their own teaching materials (education)  
We promote better educational quest.  


## Feeles

An open source IDE for giving code to people.  

> Feeles: "Feel *ES*".  
ES: ECMA Script, The standardized modern javascript

Try it out!
- [Empty Feeles (latest version)](https://feeles.github.io/IDE/dist/)
(English or Japanese 🍔)
- [HackforPlay on Feeles](https://feeles.github.io/IDE/dist/hack-rpg.html)
(Japanese only 🍣)
- [Pixi.js (in development)](https://tenonno.github.io/RPG-2/)
(Japanese only 🍣)


## Features

- Work on browser (Chrome/FireFox/Safari/Opera/~~IE11~~) 💻
  - **Standalone**. Just open HTML and it works.
  - If you put the file inside, it behaves like a web server. 🎩
- Clone itself to share it 💌
  - All files can be exported to a single HTML.
  - I say it again, Just open HTML and it works! 😆
- Modern syntax 💄
  - You can write ES6 and use import/export by default.
  - Inside `Babel` and `require.js` are included. 👀
- Record what someone wrote (Respect the original author!)
- Save and load in your browser's `IndexedDB`
- Markdown file can be displayed as README
- Create visual snippets called assets with JSON files
- Change the theme color according to your mood
and more…


## Contribute

1. Clone or Fork this repo.
2. `cd (installed directory)`
3. `npm install && npm start`
4. `open http://localhost:(port)` usually port is 8080.

- `src/`
  - An application students use made with React.js.
- `mount/`
  - An application students **modify** and run on Feeles.

> *Translated by <https://translate.google.com>*
