import html2canvas from "html2canvas";

//  byh 截取图片 主方法 直接调用
/**
 * @description: param:'.mapDiv'
 * @return {*}
 */
const callbackdata = (domName) => {
  PrtScn(domName).then((result) => {
    // console.log();
    //下载图片
    download(result, "image.png");
  });
};

/* 截图核心方法封装，获取base64 */
function PrtScn(domName) {
  if (null == domName || "" == domName) {
    throw "dom name should not be null";
  }
  if ("#" != domName.charAt(0) && "." != domName.charAt(0)) {
    throw "dom element only supports id or class";
  }
  let domIsNull = null;
  switch (domName.charAt(0)) {
    case "#":
      domIsNull = document.getElementById(domName.substr(1));
      break;
    case ".":
      domIsNull = document.getElementsByClassName(domName.substr(1))[0];
      break;
    default:
      break;
  }
  if (null == domIsNull) {
    throw "dom element should not be null";
  }
  // svg转canvas
  let nodesToRecover = [];
  let nodesToRemove = [];
  let svgElem;
  switch (domName.charAt(0)) {
    case "#":
      svgElem = document
        .getElementById(domName.substr(1))
        .getElementsByTagName("svg");
      break;
    case ".":
      svgElem = document
        .getElementsByClassName(domName.substr(1))[0]
        .getElementsByTagName("svg");
      break;
    default:
      break;
  }
  let prepare = [];
  for (let i = 0; i < svgElem.length; i++) {
    prepare.push(0);
  }
  for (let i = 0; i < svgElem.length; i++) {
    let parentNode = svgElem[i].parentNode;
    let canvas = document.createElement("canvas");
    canvas.style.position = svgElem[i].style.position;
    canvas.width = parseInt(svgElem[i].style.width);
    canvas.height = parseInt(svgElem[i].style.height);
    canvas.style.left = 0;
    canvas.style.top = 0; // 生成与svg对应尺寸的canvas
    let ctx = canvas.getContext("2d");
    let svg_xml = new XMLSerializer().serializeToString(svgElem[i]);
    let img = new Image();
    img.src = "data:image/svg+xml;base64," + window.btoa(svg_xml);
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      prepare[i] = 1;
      //download(canvas.toDataURL("image/png")); // 调试用
    };
    parentNode.appendChild(canvas); // 使用canvas代替svg进行截图
    nodesToRemove.push({
      // 完成截图后删除canvas
      parent: parentNode,
      child: canvas,
    });
    nodesToRecover.push({
      // 完成截图后恢复svg
      parent: parentNode,
      child: svgElem[i],
    });
    parentNode.removeChild(svgElem[i]); // 暂时移除svg
  }
  return new Promise((resolve) => {
    let waitInterval = setInterval(() => {
      let isComplete = true; // 创建定时器，等待上面img.onload的异步操作
      for (let i = 0; i < prepare.length; i++) {
        if (prepare[i] == 0) {
          isComplete = false;
          break;
        }
      }
      if (isComplete) {
        clearInterval(waitInterval);
        // div转canvas截图
        let domElem;
        switch (domName.charAt(0)) {
          case "#":
            domElem = document.getElementById(domName.substr(1));
            break;
          case ".":
            domElem = document.getElementsByClassName(domName.substr(1))[0];
            break;
          default:
            break;
        }
        html2canvas(domElem, {
          useCORS: true,
          foreignObjectRendering: true,
          allowTaint: false,
          taintTest: true,
          scale: 1,
        }).then((cnv) => {
          let imgUrl = cnv.toDataURL("image/png"); // 将canvas转换成img的src流，base64
          for (let i = 0; i < nodesToRecover.length; i++) {
            nodesToRecover[i].parent.appendChild(nodesToRecover[i].child);
          }
          for (let i = 0; i < nodesToRemove.length; i++) {
            nodesToRemove[i].parent.removeChild(nodesToRemove[i].child);
          }
          resolve(imgUrl);
        });
      }
    }, 5);
  });
}

/* 下载图片的方法 */
// function download(url) {
//   let a = document.createElement('a')
//   a.style.display = 'none'
//   document.body.appendChild(a)
//   let triggerDownload = $(a).attr('href', url).attr('download', 'order-1111111111.png')
//   triggerDownload[0].click()
//   document.body.removeChild(a)
// }
const download = (url, filename) => {
  const urlObject = window.URL || window.webkitURL || window;
  // const export_blob = new Blob([data])
  const link = document.createElement("a");
  // link.href = urlObject.createObjectURL(export_blob)
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export { callbackdata, download, PrtScn };
