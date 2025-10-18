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
// import { Draw, defaults as interactionDefaults } from "ol/interaction";
import { Draw, Modify, Snap } from "ol/interaction.js";
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
import WebGLVectorLayerRenderer from "ol/renderer/webgl/VectorLayer.js";
// import { BOUNDARY_ROAD } from '../config/mapServerConfig'
import * as turf from "@turf/turf";
import Overlay from "ol/Overlay.js";
import Layer from 'ol/layer/Layer.js';
let style;
class WebGLLayer extends Layer {
  createRenderer() {
    return new WebGLVectorLayerRenderer(this, {
      className: this.getClassName(),
      style,
    });
  }
}
export default class CMap {
  static instance = null;
  /**
   * @description 获取当前唯一实例
   * @return
   */
  static getMapInstance() {
    if (!CMap.instance) {
      CMap.instance = new CMap();
    }
    return CMap.instance;
  }
  constructor() {
    this.olMapInstance = null;
    this.toggleKey = null;
    this.popup = null;
    this.map = null;
    this.drawMove = null;
    this.Click = null;
    // this.style = null;
    this.snap = null;
  }
  getStyle(dash, pattern) {
    let newStyle = {
      variables: style
        ? style.variables
        : {
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
            patternSpacing: 0,
          },
      "stroke-width": ["var", "width"],
      "stroke-color": "rgba(24,86,34,0.7)",
      "stroke-offset": ["var", "offset"],
      "stroke-miter-limit": ["var", "miterLimit"],
      "stroke-line-cap": ["var", "capType"],
      "stroke-line-join": ["var", "joinType"],
    };
    if (dash) {
      newStyle = {
        ...newStyle,
        "stroke-line-dash": [
          ["var", "dashLength1"],
          ["var", "dashLength2"],
          ["var", "dashLength3"],
          ["var", "dashLength4"],
        ],
        "stroke-line-dash-offset": ["var", "dashOffset"],
      };
    }
    if (pattern) {
      console.log("../assets/箭线.svg");
      delete newStyle["stroke-color"];
      newStyle = {
        ...newStyle,
        "stroke-pattern-src": "../assets/箭线.svg",
        "stroke-pattern-spacing": 23,
        "stroke-width": 20,
        "stroke-line-cap": "butt",
        "stroke-line-join": "miter",
        "stroke-color": "rgba(24,86,34,0.7)",
        "stroke-offset": 0,
        "stroke-miter-limit": 8,
      };
    }
    return newStyle;
  }

  // 图上箭头标记(正在使用)
  drawFree(drawParam, classStyle) {
    let self = this;
    self.toggleKey && unByKey(self.toggleKey);
    self.popup && self.popup.setPosition(undefined);

    let sectorEnd,
      point = [],
      movePoint = [],
      sector;
    const projCode = CMap.getMapInstance()
      .map.getView()
      .getProjection()
      .getCode();
    // console.log(projCode)
    console.log(self.map);
    self.drawKey = self.map.on(
      "singleclick",
      function (evt) {
        const coor = evt.coordinate;
        const center = transform(coor, projCode, "EPSG:4326");
        point.push(center);
        movePoint.push(point[0]);
        self.createMove(
          self,
          movePoint,
          sector,
          sectorEnd,
          projCode,
          drawParam
        );
        if (point.length >= 2) {
          const last = drawParam.featureArr.pop();
          drawParam.layer.getSource().removeFeature(last.poly);
          const { id, poly } = self.createArrow(
            point,
            sector,
            sectorEnd,
            projCode,
            drawParam
          );
          //   console.log(id);
          //   console.log(drawParam.featureArr[drawParam.featureArr.length - 1].id);
          const unionPoly = poly;
          const format = new GeoJSON();
          const properties = unionPoly.getProperties();
          // 修改属性值
          // properties.text = '修改后的测试'
          // properties.color = '#40FF0000'
          // console.log(drawParam.drawColor)
          properties.color = drawParam.drawColor || "#FF0000";
          // （描边）颜色码，例 （#FF0000，#FF0000FF）
          // properties.strokeColor ='#FFFFFFBB'
          // 描边线宽，例如1
          // properties.strokeWidth =2
          // 更新Feature的属性
          unionPoly.setProperties(properties);
          //按钮
          const closeBtn = document.createElement("div");
          closeBtn.innerHTML = "×";
          closeBtn.classList.add(classStyle);
          const lastId =
            drawParam.featureArr[drawParam.featureArr.length - 1].id;
          closeBtn.id = lastId;
          //   closeBtn.style.width=18+'px'
          //   closeBtn.style.height=18+'px'
          //   closeBtn.style.padding=0
          //   closeBtn.style.fontSize=12+'px'
          //   closeBtn.style.borderRadius='50%'
          //   closeBtn.style.backgroundColor='rgba(255,0,0,0.4)'
          //   closeBtn.style.color='#fff'
          //   closeBtn.style.textAlign='center'
          //   closeBtn.style.position='absolute'
          //   closeBtn.style.top=4+'px'
          //   closeBtn.style.left=4+'px'
          const popup = new Overlay({
            element: closeBtn,
          });
          self.map.addOverlay(popup);
          popup.setPosition(evt.coordinate);
          self.popup = popup;

          closeBtn.addEventListener("click", () => {
            let index;
            drawParam.featureArr.forEach((item, _index) => {
              console.log(item);
              console.log(closeBtn.id);
              if (item.id === Number(closeBtn.id)) {
                console.log(item.id);
                popup.setPosition(undefined);
                drawParam.layer.getSource().removeFeature(item.poly);
                index = _index;
              }
            });
            drawParam.featureArr.splice(index, 1);
          });

          const featureCollection4547Trans = JSON.parse(
            format.writeFeature(unionPoly)
          );
          // 逆转坐标
          const coorTans = featureCollection4547Trans.geometry.coordinates.map(
            (items) => items.reverse()
          );
          const featureCollection4547 = {
            type: "Feature",
            geometry: {
              type: featureCollection4547Trans.geometry.type,
              coordinates: coorTans,
            },
            properties: featureCollection4547Trans.properties,
          };
          drawParam.featureCollect.push({
            id: id,
            featureCollection4547: featureCollection4547,
          });
          point = [];
          movePoint = [];
        }
      }.bind(self)
    );
    // 单击结束绘制
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.code === "Escape") {
          self.drawKey && unByKey(self.drawKey);
          self.drawMove && unByKey(self.drawMove);
        }
        // self.map.removeInteraction(draw)
      },
      false
    );
  }
  // 鼠标动态
  createMove(self, movePoint, sector, sectorEnd, projCode, drawParam) {
    self.drawMove = self.map.on(
      "pointermove",
      function (e) {
        const coor = e.coordinate;
        const center = transform(coor, projCode, "EPSG:4326");
        if (movePoint.length === 1) {
          movePoint.push(center);
          self.createArrow(movePoint, sector, sectorEnd, projCode, drawParam);
          self.evtCoor = center;
        }
        if (movePoint.length === 2 && self.evtCoor !== center) {
          const last = drawParam.featureArr.pop();
          drawParam.layer &&
            drawParam.layer.getSource().removeFeature(last.poly);
          movePoint.splice(movePoint.length - 1, 1);
          movePoint.push(center);
          self.createArrow(movePoint, sector, sectorEnd, projCode, drawParam);
          self.evtCoor = center;
        }
      }.bind(self)
    );
  }
  // 箭头
  createArrow(point, sector, sectorEnd, projCode, drawParam) {
    const styles = [
      new Style({
        stroke: new Stroke({
          color: drawParam.drawColor || "#FF0000",
          width: 1,
        }),
        fill: new Fill({
          color: drawParam.drawColor || "#FF0000",
        }),
      }),
    ];
    let point1 = turf.point(point[0]);
    let point2 = turf.point(point[1]);
    let bearing = turf.bearing(point2, point1);
    const bearingEnd = turf.bearing(point1, point2);

    let from = turf.point(point[0]);
    let to = turf.point(point[1]);
    let options = { units: "miles" };
    let distance = turf.distance(from, to, options);

    let radius = distance / 2;
    let bearing1 = bearing - 15;
    let bearing2 = bearing + 15;

    const radiusEnd = distance * 1.2;
    const bearingEnd1 = bearingEnd - 3;
    const bearingEnd2 = bearingEnd + 3;
    let arr = [],
      arrEnd = [];
    sector = turf.sector(point[1], radius, bearing1, bearing2);
    sectorEnd = turf.sector(point[0], radiusEnd, bearingEnd1, bearingEnd2);
    sector &&
      sector.geometry.coordinates[0].forEach((item) => {
        const newPosition = transform(item, "EPSG:4326", projCode);
        arr.push(newPosition);
      });
    sectorEnd &&
      sectorEnd.geometry.coordinates[0].forEach((item) => {
        const newPosition = transform(item, "EPSG:4326", projCode);
        arrEnd.push(newPosition);
      });
    let polygon, polygonEnd;
    if (arr.length >= 1) {
      polygon = turf.polygon([arr]);
    }
    if (arrEnd.length >= 1) {
      polygonEnd = turf.polygon([arrEnd]);
    }

    // 计算并集
    let union = turf.union(polygon, polygonEnd);
    const unionPoly = new GeoJSON().readFeature(union);
    drawParam.layer.getSource().addFeature(unionPoly);
    unionPoly.setStyle(styles);
    const items = { id: Date.now(), poly: unionPoly };
    drawParam.featureArr.push(items);
    // console.log(items);
    return items;
  }
  // 图上定位
  mapClick(textParam, id, inputRect) {
    let self = this;
    self.drawKey && unByKey(self.drawKey);
    self.toggleKey = self.map.on(
      "singleclick",
      function (evt) {
        self.textPoint &&
          textParam.layer.getSource().removeFeature(self.textPoint);
        self.Click = evt.coordinate;
        const popup = new Overlay({
          element: document.getElementById(id),
        });
        self.map.addOverlay(popup);
        popup.setPosition(evt.coordinate);
        self.popup = popup;
        self.textPoint = new Feature({
          name: "textPoint",
          geometry: new Point(evt.coordinate),
        });
        self.textPoint.setStyle(self.newStyle);
        textParam.layer.getSource().addFeature(self.textPoint);
        textParam.textPosition = evt.coordinate;
        // textParam.textPixel.x = evt.pixel[1]
        // textParam.textPixel.y = evt.pixel[0]
        if (textParam.textPosition) {
          textParam.showing = true;
        }
        // console.log(inputRect);
        inputRect.value.focus();
      }.bind(self)
    );
  }
  // 图上文字标记
  textMark(textParam) {
    let self = this;
    let feature = new Feature({
      geometry: new Point(self.Click),
    });
    if (textParam !== "") {
      let textStyle = new Style({
        text: new Text({
          font: `${textParam.size}px Microsoft YaHei` || `16px Microsoft YaHei`,
          text: textParam.textContent,
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
      const format = new GeoJSON();
      const properties = self.textPoint.getProperties();
      // 修改属性值
      properties.text = textParam.textContent;
      properties.fontSize = textParam.size;
      // properties.color = '#40FF0000'
      properties.color = textParam.color || "#FF0000";
      // （描边）颜色码，例 （#FF0000，#FF0000FF）
      // properties.strokeColor=
      // 描边线宽，例如1
      // properties.strokeWidth=
      // 更新Feature的属性
      feature.setProperties(properties);
      const featureCollection4547 = JSON.parse(format.writeFeature(feature));
      const id = Date.now();
      const point = feature.getGeometry().getCoordinates();
      textParam.featureCollect.push({
        id: id,
        featureCollection4547: featureCollection4547,
        point: point,
        lastPoint: point,
      });
      const items = { id: id, poly: feature };
      textParam.featureArr.push(items);
      textParam.getFeature.push(items);
      self.textArr.push({ id: id, poly: feature });
      textParam.layer.getSource().addFeature(feature);
      textParam.layer.getSource().removeFeature(self.textPoint);
      self.popup.setPosition(undefined);
      textParam.textContent = "";
      feature.setId("textMark_" + id);
    }
  }
  // 画点 画多段线 画面形
  drawGeometrys(type) {
    const self = this;
    style = this.getStyle(false, true);

    // // 创建矢量图层
    // const layerV = self.map
    //   .getLayers()
    //   .getArray()
    //   .filter((item) => item.get("name") === "draw");
    // if (
    //   (!layerV[0] && !drawEvent.initLayer && self.map) ||
    //   !drawEvent.initLayer
    // ) {
    //   drawEvent.initLayer = self.createVectorLayer(
    //     self.map,
    //     "draw",
    //     34,
    //     self.newStyle
    //   );
    // }
    // const vectorLayer = drawEvent.initLayer;
    // const source = vectorLayer && vectorLayer.getSource();
    // self.toggleKey && unByKey(self.toggleKey);
    // let positions = [];
    // let pixel, lastLength;
    // self.drawLayers.push(vectorLayer);
    // draw.vectorLayer.push(vectorLayer);
    // 创建画笔
    // if (self.type !== type) {
    //   self.map.removeInteraction(self.draw);
    // }
    const vectorLayer = self.createVectorLayer(self.map, "绘图", 35, style);
    const source = vectorLayer && vectorLayer.getSource();
    let vector = new WebGLLayer({
      source,
    });
    this.snap = new Snap({ source: source });
    this.map.addInteraction(this.snap);
    self.draw = new Draw({
      source: source,
      type: type,
      //画笔样式
      style: self.drawStyle || "",
    });

    self.map.addInteraction(self.draw);
    self.map.removeLayer(vector);
    // vector = new WebGLLayer({
    //   source,
    // });
    self.map.addLayer(vector);
    // 鼠标样式
    // const res = self.getImageUrl("cursor-pen");
    // self.map.getTargetElement().style.cursor = "none";
    // self.map.getTargetElement().style.cursor = `url(${res}) 0 24,auto`;

    self.type = type;
    let area, bufferFeature, bufferFeature4547, length, propertyGeo, names;
    self.draw.on("drawend", async (evt) => {
      // drawEvent.temporaryEvt = evt.feature;
      // self.geometryLayer = evt.feature.getGeometry();
      // const positions4547 = evt.feature.getGeometry().getCoordinates();
      // const format = new GeoJSON();
      // const code_ = vectorLayer.get("map").getView().getProjection().code_;
      // const formatOption = {
      //   dataProjection: "EPSG:4326",
      //   featureProjection: code_,
      // };
      // const feature_json_4326 = JSON.parse(
      //   format.writeFeature(evt.feature, formatOption)
      // );
      // if (self.type === "Point") {
      //   const newPositions = transform(positions4547, code_, "EPSG:4326");
      //   positions.push(...newPositions);
      // } else {
      //   if (self.type === "Polygon") {
      //     positions = [];
      //     positions4547[0].forEach((item) => {
      //       const newPositions = transform(item, code_, "EPSG:4326");
      //       positions.push(newPositions);
      //     });
      //     const poly = turfPolygon([positions]);
      //     drawEvent.kinks = turfKinks(poly);
      //     if (drawEvent.kinks && drawEvent.kinks.features.length >= 1) {
      //       ElMessage("请勿绘制交叉多边形");
      //     }
      //     const coor = evt.feature.getGeometry().getCoordinates();
      //     for (let i = 0; i < coor[0].length - 2; i++) {
      //       const xminus = coor[0][i][0] - coor[0][i + 1][0];
      //       const yminus = coor[0][i][1] - coor[0][i + 1][1];
      //       if (xminus === 0 && yminus === 0) {
      //         ElMessage("绘制多边形的点不能重叠");
      //         drawEvent.online = true;
      //       }
      //     }
      //   } else if (self.type === "LineString") {
      //     positions = [];
      //     positions4547.forEach((item) => {
      //       const newPositions = transform(item, code_, "EPSG:4326");
      //       positions.push(newPositions);
      //     });
      //   }
      // }
      // if (!markDrawFlag.value) {
      //   names = "绘制";
      //   if (!drawEvent.online) {
      //     const bufferItem = bufferF_N(
      //       evt.feature,
      //       vectorLayer,
      //       bufferWidth,
      //       selectValue
      //     );
      //     bufferFeature = bufferItem[0];
      //     bufferFeature4547 = bufferItem[1];
      //   }
      //   const bufferLayer = bufferFeature4547
      //     ? bufferFeature4547.getGeometry()
      //     : "";
      //   if (self.type === "Point") {
      //     area = Math.PI * bufferWidth * bufferWidth;
      //   } else {
      //     if (bufferLayer) {
      //       area = self.formatArea(bufferLayer, selectValue);
      //     } else {
      //       area = 0;
      //     }
      //   }
      // } else {
      //   const geometryChineseName = {
      //     Point: "点",
      //     LineString: "线",
      //     Polygon: "面",
      //     MultiLineString: "多线",
      //     MultiPolygon: "多面",
      //   };
      //   names = "标" + geometryChineseName[self.type];
      //   if (self.type === "Polygon") {
      //     area = self.formatArea(evt.feature.getGeometry(), selectValue);
      //     if (area >= 10000) {
      //       propertyGeo = self.formatSum(area / 10000) + "公顷";
      //     } else {
      //       propertyGeo = self.formatSum(area) + "平方米";
      //     }
      //   } else if (self.type === "Point") {
      //     propertyGeo = "点位";
      //     // self.imageShow('draw-location', evt.feature)
      //     // evt.feature.set('name', 'draw-location')
      //     self.imageShow(iconName, evt.feature);
      //     evt.feature.set("name", iconName);
      //   } else if (self.type === "LineString") {
      //     length = self.formatLength(evt.feature.getGeometry(), selectValue);
      //     if (length >= 1000) {
      //       propertyGeo = self.formatSum(length / 1000) + "千米";
      //     } else {
      //       propertyGeo = self.formatSum(length) + "米";
      //     }
      //   }
      // }
      // const propertiesEvt = evt.feature.getProperties();
      // propertiesEvt.color = "#FF000000";
      // evt.feature.setProperties(propertiesEvt);
      // const featureCollection = JSON.parse(format.writeFeature(evt.feature));
      // const properties = bufferFeature4547
      //   ? bufferFeature4547.getProperties()
      //   : evt.feature.getProperties();
      // properties.color = "#FFFFFF4D";
      // properties.strokeColor = "#FF0000";
      // properties.strokeWidth = 2;
      // if (type === "Point" && markDrawFlag.value) {
      //   // properties.imgName = 'draw-location'
      //   properties.imgName = iconName;
      // }
      // let featureCollection4547;
      // bufferFeature4547
      //   ? bufferFeature4547.setProperties(properties)
      //   : evt.feature.setProperties(properties);
      // if (!markDrawFlag.value && !drawEvent.online) {
      //   featureCollection4547 = self.reversePoly(bufferFeature4547);
      // } else if (markDrawFlag && type === "Polygon") {
      //   featureCollection4547 = self.reversePoly(evt.feature);
      // }
      // const featureCollect = self.turfCollect(positions, type);
      // drawEvent.length += 1;
      // drawEvent.drawItem.push({
      //   id: drawEvent.length,
      //   checked: true,
      //   type: type,
      //   bufferWidth: bufferWidth,
      //   name: names,
      //   square: self.formatSum(area, 2),
      //   property: propertyGeo,
      //   layer: vectorLayer,
      //   feature: bufferFeature ? bufferFeature : evt.feature,
      //   feature4547: bufferFeature4547 ? bufferFeature4547 : evt.feature,
      //   featureCol: featureCollect,
      //   forCollection: featureCollection,
      //   forCollectionBuffer: featureCollection4547,
      //   evt: evt.feature,
      //   event: evt,
      //   pixel: pixel,
      // });
      // self.copyDrawItem = drawEvent.drawItem;
      // draw.flag = true;
      // if (markDrawFlag.value) {
      //   markBoardFlag.value = true;
      //   self.quit();
      // }
    });
    // self.quitMouseAction();
  }
  // 坐标整理
  turfCollect(coordinate, type) {
    const dim = getArrayDimensions(coordinate);
    let feature;
    if (type === "Point") {
      feature = turfPoint(coordinate);
    } else if (type === "LineString" && dim === 2) {
      feature = turfLineString(coordinate);
    } else if (type === "LineString" && dim === 3) {
      feature = turfLineString(coordinate[0]);
    } else if (type === "Polygon" && dim === 2) {
      feature = turfPolygon([coordinate]);
    } else if (type === "Polygon" && dim === 3) {
      feature = turfPolygon(coordinate);
    } else if (type === "MultiPolygon") {
      feature = turfMultiPolygon([coordinate]);
    } else if (type === "MultiLineString") {
      feature = turfMultiLineString([coordinate]);
    }
    return feature;
  }
  // 创建矢量图层
  createVectorLayer(map, names, zIndexs, style) {
    const source = new VectorSource({ wrapX: true });
    const vectorLayer = new VectorLayer({
      source: source,
      style: style,
      zIndex: zIndexs,
      opacity: 1,
      name: names,
    });
    map.addLayer(vectorLayer);
    return vectorLayer;
  }
  formatArea(polygon, selectValue) {
    const area = getArea(polygon, {
      projection: this.map.getView().getProjection().getCode(),
    });
    let output;
    if (selectValue === "kilometers") {
      // output = Math.round(area * 100 * 10000 * 1000 * 1000) / 100
      output = Math.round((area / 10000) * 10000) / 10000;
      return output;
    } else {
      output = Math.round(area * 100) / 100;
      return output;
    }
  }
  //按键Esc 退出
  quitMouseAction() {
    let self = this;
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.code === "Escape") {
          self.map.removeInteraction(self.draw);
          self.draw = null;
          self.toggleKey && unByKey(self.toggleKey);
          self.toggleKey = null;
          // self.map.getTargetElement().style.cursor = "";
        }
      },
      false
    );
    self.sigleChoose = false;
    self.toggleKey && unByKey(self.toggleKey);
  }
}
