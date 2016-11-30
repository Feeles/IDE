import _File from './_File';


export default class BinaryFile extends _File {

  static defaultProps = {
    blob: null,
  };

  constructor(props) {
    if (props.blob && !props.blobURL) {
      const blobURL = URL.createObjectURL(props.blob);
      props = Object.assign({}, props, { blobURL });
    }

    super(props);
  }

  isText() {
    return false;
  }

  get blob() {
    return this.props.blob;
  }

  get blobURL() {
    return this.props.blobURL;
  }

  set(change) {
    if (change.blob && this.blobURL) {
      URL.revokeObjectURL(this.blobURL);
    }
    const seed = Object.assign({}, {
      blob: this.blob,
      blobURL: this.blobURL,
    }, change);

    return new BinaryFile(seed);
  }

  compose() {
    return new Promise((resolve, reject) => {
      const serialized = this.serialize();
      const reader = new FileReader();
      reader.onload = (e) => {
        const { result } = e.target;
        serialized.composed = result.substr(result.indexOf(',') + 1);
        resolve(serialized);
      };
      reader.readAsDataURL(this.blob);
    });
  }

}
