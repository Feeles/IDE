export default function ask(message) {

  if (typeof message === 'string') {

    return new Promise((resolve, reject) => {
      alert(message);
      resolve();
    });

  } else {

    return new Promise((resolve, reject) => {
      resolve(prompt(''));
    });

  }

}
