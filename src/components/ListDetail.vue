<!-- <template>
    <div>
      <span class="result">
        <slot name="note"></slot>
      </span>
      <div class="detailBlock">
        <span
          class="detailTitles"
          ref="detailTitles"
          :class="[props.saveDrawFlag ? 'newGrid' : '', markDrawFlag && !props.saveDrawFlag ? 'markGrid' : '']"
        >
          <el-checkbox
            v-model="props.drawEvent.checkedAll"
            size="large"
            @change="changeChecked(props.drawEvent)"
            v-if="!props.saveDrawFlag"
          />
          <p class="textName">类型</p>
          <div v-if="props.saveDrawFlag"></div>
          <p class="textName">名称</p>
          <p class="textName" v-if="markDrawFlag">属性</p>
          <p class="textName" v-if="!markDrawFlag">面积<span style="font-size: 12px">(m²)</span></p>
          <p class="textName operate" @click="showOperate" v-if="!props.saveDrawFlag">操作</p>
          <div class="operation" v-show="showOperateFlag">
           
            <div class="operationList" @click="deleteDraw(props.drawEvent)">
     
             <span>x</span>
              <span>删除</span>
            </div>
          </div>
  
          <div></div>
        </span>
        <div class="detailList" ref="detailList">
          <div class="everyList" ref="everyList">
            <span
              v-for="item in props.drawEvent.drawItem"
              :key="item"
              class="everyListDetail"
              :class="[props.saveDrawFlag ? 'newGrid' : '', markDrawFlag && !props.saveDrawFlag ? 'markGrid' : '']"
            >
              <el-checkbox
                v-model="item.checked"
                size="large"
                style="height: 24px"
                v-if="!props.saveDrawFlag"
                @change="toggleItem(item, props.drawEvent)"
              />
              <el-icon color="var(--text-color5)" v-if="!markDrawFlag"><Management /></el-icon>
              <SvgIcon :isActive="true" :name="item.name" size="12px" v-if="markDrawFlag">
                <IconBaseLineMark v-if="item.type === 'LineString'" />
                <IconBasePointMark v-if="item.type === 'Point'" />
                <IconBasePolygonMark v-if="item.type === 'Polygon'" />
              </SvgIcon>
              <div v-if="props.saveDrawFlag"></div>
              <p class="itemName" @click="showItem(item, props.drawEvent)" style="margin-left: 4px">
                <OverflowTooltip :content="item.name + item.id" :units="''" :max-width="overflowWidth" />
              </p>
              <p class="textName" v-if="!markDrawFlag">
                <OverflowTooltip :content="item.square" :units="''" :max-width="overflowWidth" />
              </p>
              <p class="textName" v-if="markDrawFlag">
                <OverflowTooltip :content="item.property" :units="''" :max-width="overflowWidth" />
              </p>
            
              <p class="textName operate" @click="showItemOperation(item, $event)" v-if="!props.saveDrawFlag">操作</p>
            </span>
          </div>
        </div>
        <div class="operation" v-show="chooseItem.operate" ref="listOperateDom">
          <div class="operationList" @click="showPosition(chooseItem)" v-if="!props.saveDrawFlag && !markDrawFlag">
           
            <span>*</span>
            <span>信息</span>
          </div>
          <div class="operationList" @click="deleteItem(chooseItem, props.drawEvent)" v-if="!componentStore.orderPlotReShow">
       
           <span>x</span>
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { onMounted, watch, ref, inject, computed, nextTick } from 'vue'
 const props=defineProps({
    drawEvent:Object,
 })
  </script>
  <style lang="scss" scoped>
  .result {
    width: 64px;
    align-self: baseline;
    font-size: var(--font-size2);
    // font-size: 16px;
    // font-family: PingFangSC-Regular;
    font-family: var(--font-family-yahei);
    color: #000000;
    line-height: 20px;
    font-weight: 400;
    padding: 14px 0;
  }
  .textName {
    align-self: baseline;
    margin: 0;
    padding: 0;
    // font-size: 12px;
    // font-family: PingFangSC-Regular;
    font-size: var(--font-size5);
    font-family: var(--font-family-yahei);
    color: #000000;
    line-height: 20px;
    font-weight: 400;
    overflow: hidden;
    line-height: 20px;
    text-align: center;
    span {
      // width: 50px;
      // overflow: hidden;
      // font-size: 12px;
      // font-family: PingFangSC-Regular;
      text-align: left;
      font-size: var(--font-size4);
      font-family: var(--font-family-yahei);
      color: #000000;
      line-height: 20px;
      font-weight: 400;
    }
  }
  .detailBlock {
    // margin: 8px 4px 20px 0;
    // height: 120px;
    margin-left: 6px;
  
    .detailTitles {
      height: 32px;
      margin: 0;
      display: grid;
      grid-template-columns: 10% 10% 20% 30% 10%;
      place-items: center;
      align-items: center;
      width: 318px;
      .el-text,
      .textName,
      .el-icon,
      .el-checkbox,
      .el-button,
      a {
        align-self: center;
      }
      a {
        // color: var(--text-color3);
        font-size: var(--font-size5);
        font-family: var(--font-family-yahei);
        color: #000000;
        line-height: 20px;
        font-weight: 400;
        &:hover {
          color: var(--text-color4);
        }
      }
      .el-text,
      .textName {
        // font-size: 12px;
        // font-family: PingFangSC-Regular;
        align-self: center;
        font-size: var(--font-size5);
        font-family: var(--font-family-yahei);
        color: #000000;
        line-height: 20px;
        font-weight: 400;
      }
      .textName.operate {
        text-decoration: underline;
        color: var(--text-color3);
        cursor: pointer;
        &:hover {
          color: var(--text-color3);
        }
      }
      .operation {
        position: absolute;
        z-index: 5;
        top: 35px;
        left: 100%;
        // width: 70px;
        // height: 68px;
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        padding: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        .operationList {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: row;
          gap: 6px;
          cursor: pointer;
          &:first-child {
            border: none;
            padding: 0;
            span {
              font-size: 14px;
            }
          }
          img {
            align-self: center;
            width: 14px;
            height: 14px;
            cursor: pointer;
            // margin-right: -9px;
          }
        }
        .el-icon:hover {
          color: var(--text-color4);
        }
      }
  
      :deep(.el-checkbox) {
        // --el-checkbox-checked-icon-color: #000000;
        // --el-checkbox-checked-bg-color: #fff;
        // --el-checkbox-checked-input-border-color: #000000;
        --el-checkbox-input-border: 1px solid #000000;
        --el-checkbox-input-border-color-hover: #000000;
        height: 24px;
      }
    }
    .newGrid {
      padding: 7px 0px 9px 0px;
      margin: 0;
      // display: grid;
      // grid-template-columns: 10% 20% 50%;
      place-items: left;
      align-items: center;
      height: 32px;
    }
    .markGrid {
      padding: 7px 0px 9px 0px;
      margin: 0;
      display: grid;
      // grid-template-columns: 10% 10% 30% 40% 10%;
      grid-template-columns: 10% 10% 30% 15% 20%;
      place-items: center;
      align-items: center;
      height: 32px;
    }
    .detailList {
      // height: 20px;
      height: 96px;
      padding: 0;
      box-sizing: content-box;
      // padding-bottom:5px;
      overflow-x: hidden;
      margin: 0 0 5px 0;
      overflow-y: auto;
      scrollbar-color: var(--text-color3);
      // scrollbar-color: transparent transparent;
      scroll-behavior: smooth;
      position: relative;
      margin-right: 3px;
  
      &::-webkit-scrollbar-thumb {
        background-color: transparent;
      }
      &:hover {
        ::-webkit-scrollbar {
          width: 3px; /* Chrome/Safari */
          margin-left: 0;
        }
        ::-webkit-scrollbar-thumb {
          /*滚动条里面小方块*/
          border-radius: 3px;
          -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
          background: var(--bg-color5);
        }
        ::-webkit-scrollbar-track {
          /*滚动条里面轨道*/
          -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
          border-radius: 0;
          background: var(--text-color6);
        }
      }
      .everyList {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0;
        margin: 0;
        width: 318px;
  
        // overflow: hidden;
        .everyListDetail {
          padding: 7px 0px 9px 0px;
          margin: 0;
          display: grid;
          // grid-template-columns: 10% 10% 22% 38% 10% 10%;
          grid-template-columns: 10% 10% 20% 30% 10%;
          place-items: center;
          align-items: center;
          height: 32px;
          :deep(.el-checkbox) {
            // --el-checkbox-checked-icon-color: #000000;
            // --el-checkbox-checked-bg-color: #fff;
            // --el-checkbox-input-checked-border-color: #000000;
            --el-checkbox-input-border: 1px solid #000000;
            --el-checkbox-input-border-color-hover: #000000;
            height: 24px;
          }
          .itemName,
          .textName {
            align-self: center;
            justify-self: center;
            font-size: 14px;
            font-family: var(--font-family-yahei);
            letter-spacing: 0;
            line-height: 20px;
            font-weight: 400;
            width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            text-align: center;
          }
  
          .itemName,
          .textName.operate {
            text-decoration: underline;
            color: var(--text-color3);
            cursor: pointer;
            &:hover {
              color: var(--text-color3);
            }
          }
          // img {
          //   // margin-right: -9px;
          //   width: 14px;
          //   height: 14px;
          //   cursor: pointer;
          // }
        }
        .newGrid {
          padding: 7px 0px 9px 0px;
          margin: 0;
          display: grid;
          // grid-template-columns: 10% 10% 40%;
          place-items: left;
          align-items: center;
          height: 32px;
          width: 320px;
        }
        .markGrid {
          padding: 7px 0px 9px 0px;
          margin: 0;
          display: grid;
          grid-template-columns: 10% 10% 30% 15% 20%;
          place-items: center;
          align-items: center;
          height: 32px;
        }
      }
    }
    .operation {
      position: absolute;
      z-index: 5;
      top: 80px;
      left: 100%;
      // top: 100%;
      // left: 100%;
      // transform: translate(-50%,-50%);
      width: 70px;
      height: 68px;
      background: #ffffff;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 0px;
      .operationList {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        gap: 6px;
        padding: 4px 0;
        cursor: pointer;
        &:hover {
          color: var(--text-color3);
          background: #bbb;
        }
        &:first-child {
          border-bottom: 1px solid #ddd;
        }
        span {
          font-size: 14px;
        }
      }
      .el-icon:hover {
        color: var(--text-color4);
      }
      img {
        align-self: center;
        width: 14px;
        height: 14px;
        cursor: pointer;
        // margin-right: -9px;
      }
    }
    /* 自定义滚动条样式 */
    ::-webkit-scrollbar {
      width: 3px; /* Chrome/Safari */
      margin-left: 0;
    }
    ::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      border-radius: 3px;
      -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
      background: var(--bg-color5);
    }
    ::-webkit-scrollbar-track {
      /*滚动条里面轨道*/
      -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
      border-radius: 0;
      background: var(--text-color6);
    }
  
    // ::-webkit-scrollbar {
    //   /*滚动条整体样式*/
    //   /*高宽分别对应横竖滚动条的尺寸*/
    //   width: 5px;
    //   height: 80px;
    // }
    ::-webkit-scrollbar-button {
      display: none;
    }
    // ::-webkit-scrollbar-button{
    //     display: none;
    //   }
    // .detailList::-webkit-scrollbar-button {
    //   display: none;
    // }
  }
  </style>
   -->