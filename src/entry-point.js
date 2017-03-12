import chromosome from '!raw-loader!../dist/main';

// Insert chromosome as an element
const script = document.createElement('script');
script.id = INLINE_SCRIPT_ID;
script.textContent = chromosome;
document.body.appendChild(script);
