import Tile from "ol/Tile";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { TileWMS, Vector as VectorSource, XYZ } from "ol/source";

var gaode = new TileLayer({
    title: "高德地图-矢量图层",
    source: new XYZ({
        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
        wrapX: false,
        /* 地图下载需要添加跨域参数 */
        crossOrigin: "Anonymous"
    }),

});
export default gaode