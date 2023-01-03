import React, { Component } from "react";
import { Button, notification } from "antd";
import { printMap } from "../common/mapviewer";
import Loader from "../loader";

class PrintMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // loading: false,
    };
  }
componentWillReceiveProps(){
  this.props.stopLoader();
}
  confirmationSaveAsImage = () => {
    const args = {
      description: "تم الحفظ بنجاح",
      duration: 3,
    };
    notification.open(args);
  };
  confirmationPrintMap = () => {
    const args = {
      description: "برجاء الانتظار... جاري الطباعة  ",
      duration: 5,
    };
    notification.open(args);
  };

  confirmationSaveMap = () => {
    const args = {
      description: "برجاء الانتظار... جاري الحفظ  ",
      duration: 5,
    };
    notification.open(args);
  };

  failedToPrintMap = () => {
    const args = {
      description: "  حدث خطأ وفشلت عملية الطباعة",
      duration: 4,
    };
    notification.open(args);
  };
  saveAsImage = (e) => {
    e.preventDefault();
    // this.setState({ loading: true });
    this.confirmationSaveMap()
    this.props.openLoader();
    let printTaskUrl =window.___printTaskURL__;

    function saveResultAsImage({ url }) {
      // window.open(e.url, "_blank");
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";
      xhr.onload = function () {
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement("a");
        tag.href = imageUrl;
        tag.download = "download.";
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
      };
      xhr.send();
      // this.setState({loading:false})
      console.log("Save Image Success", e);
    }
    function saveImageError(e) {
      // this.setState({loading:false})
      console.log("Save Image Error", e);
    }
    let settings = {
      exportOptions: {
        width: 800,
        height: 800,
        dpi: 96,
      },
      format: "png8",
      layout: "MAP_ONLY",
      preserveScale: false,
      showAttribution: false,
    };
    printMap(printTaskUrl, settings, saveResultAsImage, saveImageError).then(
      (task) => {
        if (task)  {
          this.props.stopLoader() //this.setState({ loading: false });
        this.confirmationSaveAsImage();
        this.props.closePrint();
        }else{
          this.props.stopLoader() //this.setState({ loading: false });
          this.props.closePrint();
          this.failedToPrintMap()
        }
      }
    );
  };
  printMap = (e) => {
    e.preventDefault();
    // this.setState({ loading: true });
    this.props.openLoader()
    let printTaskURL =window.___printTaskURL__;
    function printResult(e) {
      window.open(e.url, "_blank");
      console.log("Print Success", e);
    }
    function printError(e) {
      console.log("Print Error");
    }
    this.confirmationPrintMap();
    let settings = {
      exportOptions: {
        width: 500,
        height: 400,
        dpi: 96,
      },
      format: "PDF",
      layout: "MAP_ONLY",
      preserveScale: false,
      showAttribution: false,
    };
    printMap(printTaskURL, settings, printResult, printError).then((task) => {
      console.log(task);
      if (task) this.props.stopLoader() //this.setState({ loading: false });
      this.props.closePrint();
    });
  };

  render() {
    return (
      <>
        {this.state.loading ? <Loader /> : null}
        <Button
          onClick={this.saveAsImage}
          className="PrintBtn  mt-1"
          size="small"
          htmlType="submit"
        >
          حفظ كصورة<i className="fas fa-image px-2"></i>
        </Button>
        <hr />
        <Button
          onClick={this.printMap}
          className="PrintBtn mb-1"
          size="small"
          htmlType="submit"
        >
          طباعة<i className="fas fa-print px-2"></i>
        </Button>
      </>
    );
  }
}

export default PrintMenu;
