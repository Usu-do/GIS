<!--
 * @Author: 
 * @Date: 2024-04-09 20:28:12
 * @LastEditors: WangLiwei
 * @LastEditTime: 2024-11-26 16:19:44
 * @FilePath: \appOl\src\App.vue
 * @Description: 
-->
<template>
  <div
    style="
      position: absolute;
      z-index: 6000;
      width: 50px;
      height: 50px;
      background-color: red;
      left: 100px;
      top: 500px;
    "
    :title="666666"
  ></div>
  <div id="map">
    <div class="btnBord">
      <span class="btn" @click="toOver">打开</span>
      <span class="btn" @click="drawArrow">箭头</span>
      <span class="btn" @click="textMark">文字</span>
      <span class="btn" @click="drawG">绘图</span>
      <span class="btn" @click="downLoadMap">下载</span>
      <span class="btn" @click="saveFile">保存</span>
    </div>
    <div style="position: absolute; z-index: 2000">
      <input type="text" name="inputRect" id="" ref="inputRect" />
    </div>

    <!-- style="position: absolute; top: 300px; left: 100px; z-index: 2000" -->
    <!-- <div class="bord" @mousedown="drag($event)" ref="bord">
        <img
      src="./assets/202404111113314568.png"
      alt=""/>
    </div> -->
  </div>
  <div v-if="over" id="overMap">
    <span class="btn" @click="closeOver">关闭</span>
  </div>
  <SaveFile ref="saveRef" :saveDrawFlag="saveDrawFlag" :drawArr="drawArr" :saveDrawEvent="saveDrawEvent" :draw="draw" @resetDrawBtn="resetDrawBtn"></SaveFile>
</template>
<script setup>
import proj4 from "proj4";
import { unByKey } from "ol/Observable";
import { Map, View } from "ol";
import { register } from "ol/proj/proj4";
import {
  Projection,
  addProjection,
  transformExtent,
  fromLonLat,
  toLonLat,
  transform,
} from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import { createBox } from "ol/interaction/Draw";
import {
  Circle,
  Circle as CircleStyle,
  Icon,
  Fill,
  Stroke,
  Style,
  Text,
} from "ol/style";
import { fromCircle } from "ol/geom/Polygon";
import { Draw, defaults as interactionDefaults } from "ol/interaction";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import ZoomSlider from "ol/control/ZoomSlider";
import { defaults as defaultControls } from "ol/control";
import { Vector as VectorLayer } from "ol/layer";
import { OSM, Source, Vector as VectorSource } from "ol/source";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { Polygon } from "ol/geom";
import { getArea, getLength } from "ol/sphere.js";
import { OverviewMap } from "ol/control.js";
import Overlay from "ol/Overlay.js";
import gaode from "./tools/gaode";
import { onMounted, reactive, ref } from "vue";
import CMap from "./tools/mapAction";
import {
  Modify,
  Select,
  defaults as defaultInteractions,
} from "ol/interaction";
import WebGLVectorLayerRenderer from "ol/renderer/webgl/VectorLayer.js";
import Layer from "ol/layer/Layer.js";
import datass from "./assets/666.json";
import { callbackdata } from "./tools/htmlCanvas";
import SaveFile from "./components/SaveFile.vue";
// class WebGLLayer extends Layer {
//   createRenderer() {
//     return new WebGLVectorLayerRenderer(this, {
//       className: this.getClassName(),
//       style,
//     });
//   }
// }
const saveDrawEvent = reactive({
  drawItem: [],
})
const draw=reactive({
  checkSave:[],
  
})
const drawArr=reactive([])
// 通过 ref 获取子组件实例
const saveRef = ref(null);
const saveDrawFlag = ref(false);
const bord = ref();
const inputRect = ref();
let url = "src/assets/try.json";
let inter = reactive({
  strokeWidth: 8,
  offset: 0,
  capType: "butt",
  joinType: "miter",
  miterLimit: 10, // ratio
  dashLength1: 25,
  dashLength2: 15,
  dashLength3: 15,
  dashLength4: 15,
  patternSpacing: -20,
  strokeColor: "",
  // strokeColor: 'rgba(249, 0, 0, 1)',
  dashEnabled: false,
  patternEnabled: true,
  dashOffset: 20,
});
let map, oMap;
const over = ref(false);
const textParam = reactive({
  textPosition: [],
  textContent: "",
  showing: false,
  color: "#FF0000",
  fontFamily: "微软雅黑",
  size: 16,
  layer: {},
  featureArr: [],
  getFeature: [],
  featureCollect: [],
});
const drawParam = reactive({
  featureArr: [],
  layer: {},
  featureCollect: [],
});
var high_style = new Style({
  fill: new Fill({
    color: "blue",
  }),
  stroke: new Stroke({
    color: "#3399CC",
    width: 2,
  }),
});
const vector = new VectorLayer({
  // background: "white",
  source: new VectorSource({
    // url: "./assets/try.json",
    url,
    format: new GeoJSON(),
    wrapX: true,
  }),
  style: high_style,
  opacity: 0.5,
  zIndex: 5,
  name: "矢量",
});
const resetDrawBtn = () => {
  const markBtn = document.querySelectorAll('.markBtnGroups')
  quitFlag.value = true
  nextTick(() => {
    markBtn.forEach((item) => {
      item.style.background = '#EEEEEE'
      item.style.color = '#000000'
    })
  })
}
const saveFile=()=>{
  saveDrawFlag.value =!saveDrawFlag.value
  saveRef.value.setFlag() // 调用子组件的方法
}
const drawG = () => {
  CMap.getMapInstance().drawGeometrys("LineString");
};
const initMap = () => {
  const select = new Select({
    wrapX: false,
  });

  const modify = new Modify({
    features: select.getFeatures(),
  });
  map = new Map({
    interactions: defaultInteractions().extend([select, modify]),
    //地图容器ID
    target: "map",
    //引入地图
    layers: [gaode, vector],
    loadTilesWhileAnimating: true,
    view: new View({
      //地图中心点
      // center: [180, 50],
      projection: "EPSG:4326",
      center: [114.4223966107246, 23.2956904628679],
      // projection: "EPSG:4547",
      // {"x":561138.7575866597,"y":2545398.615163024}
      // center: [543692.303, 2560215.363],
      zoom: 4,
      minZoom: 4, // 地图缩放最小级别
      maxZoom: 19,
    }),
  });
  CMap.getMapInstance().map = map;
  drawParam.layer = vector;
  textParam.layer = vector;

  console.log(datass);
  let featureArr = [];
  datass.features.forEach((item, index) => {
    const feature = new Feature({
      geometry: new LineString(item.geometry.coordinates),
      properties: { imgName: item.properties.imgName },
      id: index + 1,
    });
    console.log(feature);
    featureArr.push(feature);
  });
  let bigFeature = [];
  bigFeature.push(featureArr, [], []);
  console.log(bigFeature);
  bigFeature.forEach((item) => {
    item.length >= 1 &&
      item.forEach((_item, index) => {
        reset(index);
        // const name = _item.values_.properties.imgName;
        // const url = getImageUrl(name);
        // const vector = initWebGLLine(map, inter, name, url, index);

        // vector.getSource().addFeature(_item)
      });
  });
  // for (let i = 0; i < featureArr.length; i++) {
  //   console.log(i);
  function reset(i) {
    const name = featureArr[i].values_.properties.imgName;
    const url = getImageUrl(name);
    const vector = initWebGLLine(map, inter, name, url, i);
    const res = map
      .getLayers()
      .getArray()
      .find((item) => item.values_.name === name);
    if (res) {
      const sameFeature = res
        .getSource()
        .getFeatures()
        .find((item) => item.id === featureArr[i].id);
      console.log(sameFeature);
      if (sameFeature) {
        console.log(5555);
        return;
      } else {
        res.getSource().addFeature(featureArr[i]);
        console.log(666);
        return;
      }
    }
  }
  // const last3 = map.getLayers().getArray()[4];
  // console.log(last3);
  // console.log(last3.getSource().getFeatures());

  // const last = map.getLayers().getArray()[3];
  // console.log(last);
  // console.log(last.getSource().getFeatures());
  // const last2 = map.getLayers().getArray()[2];
  // console.log(last2);
  // console.log(last2.getSource().getFeatures());

  // console.log(map.getLayers().getArray());
  // addTxt();
  // console.log(CMap.getMapInstance().map, drawParam.layer);
};
const getImageUrl = (name) => {
  return new URL(`./assets/${name}.svg`, import.meta.url).href;
};
const downLoadMap = () => {
  const ref = document.querySelector("#map"); // 截图区域
  html2canvas(ref, {
    backgroundColor: "#e8f4ff",
    useCORS: true, // 如果截图的内容里有图片,可能会有跨域的情况,加上这个参数,解决文件跨域问题
  }).then((canvas) => {
    const dataURL = canvas.toDataURL("image/png");
    const creatDom = document.createElement("a");
    document.body.appendChild(creatDom);
    creatDom.href = dataURL;
    creatDom.download = "图片";
    creatDom.click();
  });
};

const getStyle = (dash, pattern, name, url, inter, type) => {
  let newStyle = {
    variables: {
      width: 12,
      offset: 0,
      capType: "butt",
      joinType: "miter",
      miterLimit: 10, // ratio
      dashLength1: 25,
      dashLength2: 15,
      dashLength3: 15,
      dashLength4: 15,
      dashOffset: 0,
      patternSpacing: -20,
    },
    "stroke-width": inter.strokeWidth,
    "stroke-color": inter.strokeColor,
    "stroke-offset": inter.offset,
    "stroke-miter-limit": inter.miterLimit,
    "stroke-line-cap": inter.capType,
    "stroke-line-join": inter.joinType,
  };
  if (dash) {
    newStyle = {
      ...newStyle,
      "stroke-line-dash": [
        inter.dashLength1,
        inter.dashLength2,
        inter.dashLength3,
        inter.dashLength4,
      ],
      "stroke-line-dash-offset": inter.offset,
    };
  }
  if (pattern) {
    delete newStyle["stroke-color"];
    newStyle = {
      ...newStyle,
      "stroke-pattern-src": url,
      "stroke-pattern-spacing": inter.patternSpacing,
    };
    if (name === "箭头14") {
      newStyle = {
        ...newStyle,
        "stroke-width":
          name !== "箭头14" ? inter.strokeWidth : inter.strokeWidth,
        "stroke-pattern-src": url,
        "stroke-pattern-spacing": 10,
        "stroke-color": inter.strokeColor,
      };
    }
    if (type === "strokeColor") {
      if (inter.strokeColor === "原色") {
        delete newStyle["stroke-color"];
        newStyle = {
          ...newStyle,
          "stroke-width":
            name !== "箭头14" ? inter.strokeWidth : inter.strokeWidth,
          "stroke-pattern-src": url,
          "stroke-pattern-spacing":
            name !== "箭头14" ? inter.patternSpacing : 10,
        };
      } else {
        newStyle = {
          ...newStyle,
          "stroke-width":
            name !== "箭头14" ? inter.strokeWidth : inter.strokeWidth,
          "stroke-pattern-src": url,
          "stroke-pattern-spacing":
            name !== "箭头14" ? inter.patternSpacing : 10,
          // "stroke-pattern-color": inter.strokeColor,
          "stroke-color": inter.strokeColor,
        };
      }
    }
    if (type === "strokeWidth") {
      if (inter.strokeColor) {
        newStyle = {
          ...newStyle,
          "stroke-color": inter.strokeColor,
          "stroke-width":
            name !== "箭头14" ? inter.strokeWidth : inter.strokeWidth,
          "stroke-pattern-src": url,
        };
      } else {
        newStyle = {
          ...newStyle,
          // 'stroke-color': inter.strokeColor,
          "stroke-width":
            name !== "箭头14" ? inter.strokeWidth : inter.strokeWidth,
          "stroke-pattern-src": url,
        };
      }
    }
  }
  return newStyle;
};
const initWebGLLine = async (map, inter, name, url, index) => {
  console.log(name);
  let vector;
  const res = map
    .getLayers()
    .getArray()
    .find((item) => item.name && item.name === name);
  console.log(res);
  if (res) {
    vector = res;
    console.log(111);
    return vector;
  } else {
    const style = getStyle("", true, name, url, inter);
    console.log(style);
    class WebGLLayer extends Layer {
      createRenderer() {
        return new WebGLVectorLayerRenderer(this, {
          className: this.getClassName(),
          style,
        });
      }
    }
    const sources = new VectorSource({});
    vector = new WebGLLayer({
      source: sources,
      name: name,
      zIndex: 4000 + index,
    });
    map.addLayer(vector);
    console.log(222);
    return vector;
  }
};
const addTxt = () => {
  let feature = new Feature({
    geometry: new Point([124, 23]),
  });
  let textStyle = new Style({
    text: new Text({
      font: `${48}px Microsoft YaHei` || `16px Microsoft YaHei`,
      text: "svfdbdbd111111",
      textAlign: "left",
      offsetX: 0,
      offsetY: 0, //向下偏移
      // textBaseline: 'bottom',
      textBaseline: "center",
      fill: new Fill({
        color: textParam.color || "#FF0000",
      }),
    }),
  });
  feature.setStyle(textStyle);
  feature.setId("text_");
  textParam.layer.getSource().addFeature(feature);
  const selectStyle = new Style({
    stroke: new Stroke({
      color: "green",
      width: 3,
    }),
    fill: new Fill({
      color: "rgba(0, 255, 0, 0.1)",
    }),
    image: new CircleStyle({
      fill: new Fill({
        color: "rgba(224,17,95,0.5)",
      }),
      radius: 10,
    }),
    text: new Text({
      font: `${48}px Microsoft YaHei` || `16px Microsoft YaHei`,
      text: "svfdbdbd111111",
      textAlign: "left",
      offsetX: 0,
      offsetY: 0, //向下偏移
      // textBaseline: 'bottom',
      textBaseline: "center",
      fill: new Fill({
        color: textParam.color || "#00FF00",
      }),
    }),
  });
  const selectFeature = new Select({
    wrapX: false,
    // restorePreviousStyle: true,
    // applySelectedStyle: true,
    style: selectStyle,
  });
  CMap.getMapInstance().map.addInteraction(selectFeature);
  // console.log(selectFeature);
  selectFeature.on("select", function (evt) {
    // console.log(evt);
    const feature = evt.selected.filter((item) => item.id_ === "text_");
    // console.log(evt.target.style_);
    // 为新选中的要素设置样式
    // selectFeature.setStyle(evt.selected);
    evt.target.applySelectedStyle_();
    // evt.target.restorePreviousStyle_(feature[0]);
    // evt.target.restorePreviousStyle_(evt.selected[0]);
    // feature && feature[0] && evt.target.restorePreviousStyle_(feature[0]);
    // // console.log(evt.target);
    // console.log(evt.selected);
    evt.selected.forEach((item) => {
      console.log(item);
      item.setStyle(selectStyle);
    });
  });
};
const drawArrow = () => {
  CMap.getMapInstance().drawFree(drawParam, "closeBtn");
};
const textMark = () => {
  CMap.getMapInstance().mapClick(textParam, "inputRect", inputRect);
};
const toOver = () => {
  over.value = !over.value;
  newMap();
};
const closeOver = () => {
  over.value = !over.value;
  const layer = oMap
    .getLayers()
    .getArray()
    .find((item) => {
      console.log(item.values_);
      if (item.values_.name === "右边") {
        return item;
      }
    });
  console.log(layer);
  const feature = layer.getSource().getFeatures();
  feature.forEach((item) => {
    layer.getSource().removeFeature(item);
  });
  oMap.removeLayer(gaode);
};
const drag = (e) => {
  startDrag(e, bord);
  bord.value.style.transition = "auto";
};
const startDrag = (e, positionDom) => {
  const x = e.pageX - positionDom.value.offsetLeft;
  const y = e.pageY - positionDom.value.offsetTop;
  function move(e) {
    positionDom.value.style.left = e.pageX - x + "px";
    positionDom.value.style.top = e.pageY - y + "px";
    console.log(e.pageX - x, e.pageY - y);
  }
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", function (event) {
    document.removeEventListener("mousemove", move);
  });
};
const newMap = () => {
  const gaodes = new TileLayer({
    title: "高德地图-矢量图层",
    source: new XYZ({
      url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
      wrapX: false,
      /* 地图下载需要添加跨域参数 */
      crossOrigin: "Anonymous",
    }),
  });
  const allLayers = map.getLayers().getArray();
  // console.log(allLayers);
  const layer = map
    .getLayers()
    .getArray()
    .find((item) => {
      console.log(item.values_);
      if (item.values_.name === "矢量") {
        return item;
      }
    });
  console.log(layer);
  const feature = layer.getSource().getFeatures();
  console.log(feature);
  const curView = map.getView();
  console.log(curView);
  oMap = new Map({
    //地图容器ID
    target: "overMap",
    //引入地图
    layers: [gaodes],
    loadTilesWhileAnimating: true,
    view: new View({
      //地图中心点
      // center: [180, 50],
      center: curView.getCenter(),
      zoom: curView.getZoom(),
      maxZoom: curView.getMaxZoom(),
      minZoom: curView.getMinZoom(),
      projection: curView.getProjection().getCode(),
    }),
  });
  const vectors = new VectorLayer({
    // background: "white",
    source: new VectorSource({
      wrapX: true,
    }),
    style: high_style,
    opacity: 1,
    zIndex: 6,
    name: "右边",
  });
  oMap.addLayer(vectors);
  feature.forEach((item) => {
    vectors.getSource().addFeature(item);
  });
};
onMounted(() => {
  initMap();
  inputRect.value.focus();
});
</script>
<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.page {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2000;
  width: 500px;
  height: 500px;
  background: red;
}
.closeBtn {
  width: 18px;
  height: 18px;
  padding: 0;
  font-size: 12px;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.4);
  color: #fff;
  text-align: center;
  position: absolute;
  top: 4px;
  left: 4px;
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 0, 0, 1);
  }
}
#map {
  .ol-rotate {
    display: none;
  }
  .ol-zoom {
    width: 48px;
    display: flex;
    flex-direction: column;
    background: transparent;
    margin-left: 15px;
    margin-top: 85px;
    border-radius: 4px;
    button {
      height: 48px;
      width: 48px;
      border: none;
      background: #ffffff;
      color: #333333;
      font-size: 26px;
      font-weight: 700;
      cursor: pointer;
      :hover {
        color: #0072f9;
      }
    }
    .ol-zoom-in {
      border-radius: 4px 4px 0px 0px;
    }
    .ol-zoom-out {
      border-radius: 0px 0px 4px 4px;
    }
  }
}
// #overMap {
//   .ol-rotate {
//     display: none;
//   }
//   .ol-zoom {
//     display: none;
//   }
// }
</style>
<style lang="scss" scoped>
#map {
  // position: relative;
  // width: 958px;
  height: calc(100vh - 5px);
  // height: 100%;
  flex: 100%;
  overflow: hidden;
  :deep(.box) {
    right: unset;
    left: 15px;
    width: 48px;
    height: 48px;
    z-index: 99;
    .box-left {
      .exit {
        display: none;
      }
    }
    .tag_arrows {
      left: 0px;
    }
    .tag_arrows::after {
      left: 20px;
    }
    .list-tree {
      left: 0px;
    }
  }
  .btnBord {
    position: absolute;
    top: 20px;
    left: 200px;
    z-index: 4000;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    .btn {
      border-radius: 8px;
      background: gray;
      padding: 10px 20px;
      color: #fff;
      cursor: pointer;
      &:hover {
        background: rgb(48, 48, 48);
      }
    }
  }

  .bord {
    position: absolute;
    top: 200px;
    left: 50px;
    z-index: 1000;
    width: 120%;
    height: 2000px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 11px 0 rgba(0, 0, 0, 0.24);
    transition: all 0.5s ease;
    img {
      pointer-events: none;
    }
  }
}
#overMap {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 7000;
  // height: 100vh;
  width: 100%;
  height: calc(100vh - 5px);
  // flex: 50%;
  background: red;
  .btn {
    position: absolute;
    top: 20px;
    left: 200px;
    z-index: 4000;
    border-radius: 8px;
    background: gray;
    padding: 10px 20px;
    color: #fff;
  }
}
</style>
