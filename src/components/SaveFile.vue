<!--
 * @Author: WangLiwei
 * @Date: 2024-11-26 15:58:53
 * @LastEditors: WangLiwei
 * @LastEditTime: 2024-11-26 18:25:54
 * @Description: 
 * @FilePath: \appOl\src\components\SaveFile.vue
-->
<template>
  <el-dialog v-model="dialogFormVisible" title="标注管理" width="380" class="custom-dialog">
    <el-form :model="form">
      <el-form-item v-if="form.currentType !== 1" label="保存到：" :label-width="formLabelWidth">
        <el-select v-model="form.name" placeholder="请选择图层名" ref="lineOption" @click.native.stop="handleClick">
          <el-option v-for="(item, i) in form.allOption" :key="i" :label="item.resname" :value="item.resname"
            class="saveSelect-option" @mouseover="showEdit(item)">
            <div class="option-lines">
              <span v-if="!item.editing">{{ item.resname }}</span>
              <div class="rightBtn">
                <span v-if="item.showEditBtn && !item.editing" @click.stop="toEditFile(item)">//</span>
                <span v-if="item.showEditBtn && !item.editing" @click="toDeleteFile(item)">x</span>
              </div>

              <el-input v-model="fileName" v-if="item.editing" placeholder="请输入" @focus.stop="addName" @click.stop="addName" @change.stop="addName"></el-input>
              <span v-if="item.editing" @click="saveFileName(item)">保存</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="[1, 2].includes(form.currentType)" :label="form.currentType === 1 ? '新建图层名：' : '修改为图层名：'"
        :label-width="formLabelWidth">
        <el-input v-model="form.reName" autocomplete="off" placeholder="请输入图层名" />
      </el-form-item>
      <div class="btns">
        <el-button class="btn" :class="{ activeBtn: form.currentType === 1 }" @click="nameHandle(1)">新建</el-button>
        <el-button class="btn" :class="{ activeBtn: form.currentType === 2 }" @click="nameHandle(2)">编辑</el-button>
        <el-button class="btn" @click="nameHandle(3)">删除</el-button>
      </div>
    </el-form>
    <div>
      <div v-for="item in fakeList" :key="item">
        <span style="background: #dddddd4d; width: 100%">{{ item.name }}</span>
      </div>
    </div>

    <!-- <saveList :list="list"></saveList> -->
    <!-- <ListDetail
        :saveDrawFlag="props.saveDrawFlag"
        :drawArr="props.draw.checkSave"
        :drawEvent="props.saveDrawEvent"
        :draw="props.draw"
        @resetDrawBtn="emit('resetDrawBtn')"
      >
      </ListDetail> -->
    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHandle">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
//   import ListDetail from './ListDetail.vue'
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps({
  saveDrawFlag: Object,
  drawArr: Array,
  saveDrawEvent: Object,
  draw: Object,
});
const emit = defineEmits(["resetDrawBtn"]);
const fakeList = ref([
  { name: 1, check: false },
  { name: 2, check: false },
  { name: 3, check: false },
  { name: 4, check: false },
]);
const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
const form = reactive({
  name: "",
  reName: "",
  currentType: 0, //0选择图层即可 1新建 2编辑 3删除
  allOption: [
    {
      label: "xxx",
      value: "a",
      resname: "xxx",
      showEditBtn: false,
      editing: false,
    },
    {
      label: "yyy",
      value: "b",
      resname: "yyy",
      showEditBtn: false,
      editing: false,
    },
  ],
});
const lineOption = ref();
const fileName=ref('')
const setFlag = () => {
  dialogFormVisible.value = !dialogFormVisible.value;
};
defineExpose({
  dialogFormVisible,
  setFlag,
});
const saveFileName=(item)=>{
  form.allOption.map((_item) => {
    if (_item.value === item.value) {
      _item.resname = fileName.value
      _item.editing=false
    }
  });
}
const addName=()=>{
  console.log(555);
}
const nameHandle = (type) => {
  console.log(type);
  form.currentType = type;
};
const showEdit = (item) => {
  console.log(item);
  form.allOption.map((_item) => {
    if (_item.resname === item.resname) {
      _item.showEditBtn = true;
    } else {
      _item.showEditBtn = false;
    }
  });

};
const toEditFile = (item) => {
  form.allOption.map((_item) => {
    if (_item.resname === item.resname) {
      _item.editing = true;
    } else {
      _item.editing = false;
    }
  });
  console.log(lineOption.value);
};
const toDeleteFile = (item) => {

}
const handleClick = (event) => {
  // 阻止事件冒泡，防止select自动收起
  event.stopPropagation();
};
</script>
<style lang="scss">
.saveSelect-option {
  padding: 0;
  background: yellow;
  padding-inline: 0;
  padding: 0;
  margin: 0;

  //  background: red;
  .option-lines {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    background: green;
    .rightBtn{
      // background: red;
       display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    }
    
  }

  &:hover {
    background: rgba(#0f74fe, 0.8);
    color: #0f74fe;
  }
}

.custom-dialog {
  background: yellow;
  //   margin: 7.5vh auto;
  //   height: 85vh;
  overflow: auto;

  .el-dialog__header {
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
  }

  .el-dialog__header.show-close {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 0;

    .el-dialog__title {
      height: 25px;
      padding-left: 10px;
    }

    .el-dialog__headerbtn {
      height: 25px;
      width: 25px;
      //  background: red;
      position: relative;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  // box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
  box-shadow: 0 0 0 1px rgba($color: #000000, $alpha: 0.5) inset;
}

:deep(.el-select__wrapper) {
  // box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  box-shadow: 0 0 0 1px rgba($color: #000000, $alpha: 0.5) inset;
}

.btns {
  display: flex;
  justify-content: end;

  .activeBtn {
    background-color: var(--el-color-primary);
    color: #fff;
    border: none;
  }
}

.btn {
  border: 1px solid rgba($color: #000000, $alpha: 0.5);
}
</style>
