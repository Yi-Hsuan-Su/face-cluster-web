import React from "react";

type State = {};
type Props = {
  updateObj: Function;
};
export default class ObjUploadButton extends React.Component<Props, State> {
  buttonCss: {};

  constructor(props: any) {
    super(props);
    this.buttonCss = {
      position: "relative",
      top: "0",
      left: "0",
      zindex: "100",
    };
  }

  handleObjChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.readAsText(file);
    reader.onloadend = (e) => {
      const text = e.target.result;
      this.props.updateObj(text);
    };
  }

  render() {
    return (
      <div className="ObjUpload" style={this.buttonCss}>
        <form>
          <input
            accept=".obj,.glb"
            className="fileInput"
            type="file"
            onChange={(e) => this.handleObjChange(e)}
          />
        </form>
      </div>
    );
  }
}
