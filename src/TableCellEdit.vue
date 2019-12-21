<template>
  <div>
    <el-form inline style="height:20px;">
      <el-form-item style="margin-bottom: 0">
        <el-button class="custom-button-in-toolbar " type="primary" plain size="mini" icon="el-icon-refresh" @click="fetchData">刷新</el-button>
      </el-form-item>
      <el-form-item style="margin-bottom: 0">
        <el-button type="primary" plain size="mini" icon="el-icon-circle-plus" @click="addNewRowHandler">新增</el-button>
      </el-form-item>
      <el-form-item style="margin-bottom: 0">
        <el-button type="success" plain size="mini" icon="el-icon-success" @click="submitHandler">提交保存</el-button>
      </el-form-item>
      <el-form-item style="float:right;margin-bottom: 0">
        <el-popover trigger="hover" placement="bottom">
          <el-button slot="reference" type="warning" plain size="mini"><i class="el-icon-question"/>使用帮助</el-button>
          <div style="height: 25px">
            <span style="color:#ff7435;display: inline-block;font-weight: bold;">所有操作均在“提交保存”后生效</span>
          </div>
          <div style="height: 25px">
            <span style="display: inline-block;font-weight: bold;width: 70px">角标颜色</span>
            <el-tag style="font-size: 12px;margin-right: 5px" size="mini">预增加</el-tag>
            <el-tag style="font-size: 12px;margin-right: 5px" size="mini" type="warning">预修改</el-tag>
            <el-tag style="font-size: 12px;margin-right: 5px" size="mini" type="danger">预删除</el-tag>
          </div>
          <div style="height: 25px">
            <span style="font-weight: bold;color:#666">快捷键（编辑单元格时）：</span>
          </div>
          <div style="margin-left: 5px">
            <div style="height: 25px">
              <span style="display: inline-block;font-weight: bold;width: 80px">下一单元格</span>
              <el-tag style="font-size: 12px;margin:0 5px" size="mini">Tab</el-tag>
            </div>
            <div style="height: 25px">
              <span style="display: inline-block;font-weight: bold;width: 80px">上一单元格</span>
              <el-tag style="font-size: 12px;margin:0 5px" size="mini">Shift</el-tag>
              <span>+</span>
              <el-tag style="font-size: 12px;margin:0 5px" size="mini">Tab</el-tag>
            </div>
            <div style="height: 25px">
              <span style="display: inline-block;font-weight: bold;width: 80px">撤销修改</span>
              <el-tag style="font-size: 12px;margin:0 5px" size="mini">Shift</el-tag>
              <span>+</span>
              <el-tag style="font-size: 12px;margin:0 5px" size="mini">Backspace</el-tag>
            </div>
            <div style="height: 25px">
              <span style="display: inline-block;font-weight: bold;width: 80px">完成编辑</span>
              <el-tag style="font-size: 12px;margin:0 5px" size="mini">Esc</el-tag>
            </div>
          </div>
        </el-popover>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      ref="Table"
      border
      style="width: 100%"
      height="400px"
      :row-class-name="tableRowClassName"
      :cell-class-name="tableCellClassName"
    >
      <el-table-column fixed="left" type="index" width="50px" label="序号" align="center"/>
      <el-table-column v-for="item in columnOption" :min-width="item.minWidth" :width="item.width" :column-key="item.columnKey" :label="item.label" :key="item.prop" :prop="item.propText">
        <!--        <template slot="header" slot-scope="scope">-->
        <!--          <div style="float: left;">{{scope.column.label}}</div>-->
        <!--        </template>-->
        <template slot-scope="scope">
          <div @click="cellClickHandler(scope.row,item)" style="min-height: 30px" :style="{color:item.color}" v-show="!isEditingCell(scope.row._hiddenRowId,item.columnKey,item.editType)">
            <span>{{item.formatter?item.formatter(scope.row[item.propText]):scope.row[item.propText]}}</span>
          </div>
          <div style="display: table" v-if="isEditingCell(scope.row._hiddenRowId,item.columnKey,item.editType)">
            <div style="display: table-cell;width: 100%">
              <input v-if="item.editType==='Input'"
                     class="el-input el-input__inner"
                     style="width:100%"
                     @focus="editCellFocusHandler"
                     @blur="editCellBlurHandler"
                     :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
              />
              <input v-if="item.editType==='InputNumber'"
                     class="el-input el-input__inner"
                     style="width:100%"
                     type="Number"
                     @focus="editCellFocusHandler"
                     @blur="editCellBlurHandler"
                     :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
                     placeholder="输入数字"/>
              <el-date-picker v-if="item.editType==='DatePicker'"
                              style="width:100%"
                              @blur="editCellBlurHandler"
                              :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
                              v-model="scope.row[item.propId]"
                              :clearable="false" size="mini" prefix-icon=" " placeholder="选择日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd"/>
              <el-select v-if="item.editType==='Select'"
                         width="100%"
                         filterable
                         @blur="editCellBlurHandler"
                         @change="editCellBlurHandler"
                         :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
                         v-model="scope.row[item.propId]"
                         :automatic-dropdown="true"
                         placeholder="请选择">
                <el-option v-for="selectItem in item.selectList" :key="selectItem.value" :label="selectItem.label" :value="selectItem.value"/>
              </el-select>
              <!--              <el-select v-if="item.editType==='SelectGroup'"-->
              <!--                         width="100%"-->
              <!--                         filterable-->
              <!--                         @blur="editCellBlurHandler"-->
              <!--                         @change="editCellBlurHandler"-->
              <!--                         :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"-->
              <!--                         v-model="scope.row[item.propId]"-->
              <!--                         :automatic-dropdown="true"-->
              <!--                         placeholder="请选择">-->
              <!--                <el-option-group v-for="group in item.selectGroupList" :label="group.label" :key="group.value">-->
              <!--                  <el-option style="padding-left:40px" v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"/>-->
              <!--                </el-option-group>-->
              <!--              </el-select>-->
            </div>
            <div style="margin: 0;" :style="{width:getRowState(scope.row._hiddenRowId)==='add'?0:26+'px'}">
              <el-popconfirm placement="right" @onConfirm="revokeEditingValueHandler" title="确定撤销更改？">
                <el-button v-if="getRowState(scope.row._hiddenRowId)!=='add'" slot="reference" style="margin: 0;" title="撤销更改(Shift+Backspace)" type="danger" plain size="mini" icon="el-icon-refresh-left"/>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="120px" prop="selectValue" align="center" label="选择id(普通列)"/>
      <el-table-column width="120px" prop="selectName" align="center" label="选择值(普通列)"/>
      <el-table-column width="60px" fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button :title="getRowState(scope.row._hiddenRowId)==='delete'?'取消删除':'删除'" style="margin-left: -10px;font-size: 12px" :type="getRowState(scope.row._hiddenRowId)==='delete'?'success':'danger'" plain size="mini"
                     :icon="getRowState(scope.row._hiddenRowId)==='delete'?'el-icon-refresh-left':'el-icon-delete'"
                     @click="deleteRowHandler(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

  export default {
    name: 'TableCellEdit',
    data() {
      return {
        tableData: undefined,//table当前数据
        tableDataOrigin: [],//table原数据，做撤销时使用
        editingCellInfo: {//记录当前编辑中的单元格坐标信息
          rowId: undefined,
          columnId: undefined,
          columnOption: undefined
        },
        changedCellInfo: {// 已修改的单元格集合
          // 'rowId': {//行标识
          //   'columnId1': 'propId1',//列标识 ： 列的数据字段
          //   'columnId2': 'propId2',
          // }
        },
        columnOption: [ //列配置
          {
            columnKey: 'name',
            minWidth: "100px",
            label: '文字',
            propId: 'text',
            propText: 'text',
            editType: 'Input',
          }, {
            //以下为单元格编辑关键配置：
            columnKey: 'date',//列标识，随便写，不重复就行
            propId: 'date',//编辑时绑定的数据字段
            propText: 'date',//非编辑时展示的数据字段
            editType: 'DatePicker',//编辑类型，现有固定的几种Input，InputNumber，Select，DatePicker。没有editType则此列不能进入编辑模式。若有值且不是以上值则编辑出bug
            //以下为仅在组件中引用的配置参数或方法，可随意修改，不影响编辑功能：
            width: "150px",//element-ui表格组件的列宽（普通的配置引用这个值而已）
            minWidth: "150px",//element-ui表格组件的列最小宽度（普通的配置引用这个值而已）
            label: '时间编辑',//element-ui表格组件的列标题（普通的配置引用这个值而已）
            formatter: function (value) {
              try {
                let nowYear = new Date().getUTCFullYear();
                let dataYear = new Date(value).getUTCFullYear();
                if (nowYear - dataYear > 3) {
                  return "三年前"
                } else if (nowYear - dataYear > 2) {
                  return "两年前";
                } else if (nowYear - dataYear > 1) {
                  return "一年前";
                } else {
                  return value;
                }
              } catch (e) {
                return value;
              }
            }
          }, {
            columnKey: 'age',
            minWidth: "100px",
            label: '数字',
            propId: 'number',
            propText: 'number',
            editType: 'InputNumber',
          }, {
            columnKey: 'height',
            minWidth: "140px",
            label: '不能编辑',
            propId: 'textNoEdit',
            propText: 'textNoEdit',
          }, {
            columnKey: 'selectCell',
            minWidth: "100px",
            label: '选择',
            propId: 'selectValue',
            propText: 'selectName',
            editType: 'Select',
            selectList: [
              {
                value: 1,
                label: '1黄金糕'
              }, {
                value: 2,
                label: '2双皮奶'
              }, {
                value: 3,
                label: '3蚵仔煎'
              }, {
                value: 4,
                label: '4龙须面'
              }, {
                value: 5,
                label: '5北京烤鸭'
              }],
          },],
        //辅助参数，记录当前列表中最后一行的 行标识序号，新增时，新行参照这个序号继续增加
        newRowHiddenId: 1,
        //辅助参数，控制tab键一直按住，也不会重复触发切换单元格
        tabKeyAlreadyDown: false,
      };
    },
    mounted() {
    },
    created() {
      this.preventLeavingPage();
      this.fetchData();
    },

    methods: {
      fetchData() {
        if (JSON.stringify(this.changedCellInfo) !== ('{}')) {
          this.$confirm('检测到您有未提交保存的修改<br />刷新将<span style="color:#E6A23C;font-weight: bold">丢失未保存的修改</span>，是否继续？',
            {dangerouslyUseHTMLString: true})
            .then(() => {
              this.doFetchData();
            })
            .catch(() => {
            });
        } else {
          this.doFetchData();
        }
      },
      doFetchData() {
        this.resetCell();
        {//TODO 模拟获取数据，与后台接口对接后不使用
          if (this.tableData === undefined) {
            this.tableData = [
              {
                id: 1,
                date: '2016-05-02',
                text: '张三',
                number: 511,
                textNoEdit: '不能编辑的列',
                selectValue: 1,
                selectName: '1黄金糕',
              }, {
                id: 2,
                date: '2017-05-04',
                text: '李四',
                number: 11,
                textNoEdit: '11',
                selectValue: 2,
                selectName: '2双皮奶',
              }, {
                id: 3,
                date: '2019-01-01',
                text: '王五',
                number: 213,
                textNoEdit: '一段文字',
                selectValue: 3,
                selectName: '3蚵仔煎',
              }, {
                id: 4,
                date: '2019-05-03',
                text: '赵六',
                number: 151,
                textNoEdit: '另一段文字',
                selectValue: 4,
                selectName: '4龙须面',
              }];
            this.$nextTick(() => {
              this.tableData = JSON.parse(JSON.stringify(this.tableData));
            })
          } else {
            this.tableData = JSON.parse(JSON.stringify(this.tableDataOrigin));
          }
          this.initTableDataAndTableDataOrigin();
        }
      },
      // extraEditHandler(carId) {
      //   let row = this.getEditingRow();
      //   let carInfo = this.columnOption.find(e => e.columnKey === 'carId')
      //     .selectList
      //     .find(e => e.id === carId);
      //   if (this.columnOption.find(e => e.columnKey === 'driverId')
      //     .selectList
      //     .findIndex(e => e.value === carInfo.defaultDriverId) >= 0) {
      //     this.$set(row, 'driverId', carInfo.defaultDriverId);
      //     this.$set(row, 'driverName', carInfo.defaultDriverName);
      //     this.setEditingCellInfo(this.changedCellInfo, this.checkEditingValueIsChanged(['driverId']), 'driverId', 'driverId');
      //   }
      //   if (this.columnOption.find(e => e.columnKey === 'purposeId')
      //     .selectList
      //     .findIndex(e => e.value === carInfo.defaultCarPurposeId) >= 0) {
      //     this.$set(row, 'purposeId', carInfo.defaultCarPurposeId);
      //     this.$set(row, 'purposeName', carInfo.defaultCarPurposeName);
      //     this.setEditingCellInfo(this.changedCellInfo, this.checkEditingValueIsChanged(['purposeId']), 'purposeId', 'purposeId');
      //   }
      // },

      //---------------------------------------------以下为单元格编辑支持方法---------------------------------------------
      getRowState(_hiddenRowId) {
        if (!_hiddenRowId) {
          return '';
        } else if (_hiddenRowId.startsWith('D')) {
          return 'delete';
        } else if (_hiddenRowId.startsWith('A')) {
          return 'add';
        }
      },
      tableRowClassName({row, rowIndex}) {
        if (!row._hiddenRowId) {
          return '';
        } else if (row._hiddenRowId.startsWith('A')) {
          return 'pre-add-row';
        } else if (row._hiddenRowId.startsWith('D')) {
          return 'pre-delete-row';
        }
        return '';
      },
      tableCellClassName({row, column, rowIndex, columnIndex}) {
        let classNames = '';
        if (this.changedCellInfo[row._hiddenRowId] && this.changedCellInfo[row._hiddenRowId][column.columnKey]) {
          classNames += ' pre-update-cell';        //被修改的角标样式
        }
        return classNames;
      },
      buildNewRowHiddenId() {
        let newRowHiddenId = 'A' + (Array(16)
          .join('0') + this.newRowHiddenId).slice(-16);
        this.newRowHiddenId++;
        return newRowHiddenId;
      },
      //table原数据加自定义id列，留存副本 [需在获取数据后马上调用]
      initTableDataAndTableDataOrigin() {
        let i = 1;
        for (let row of this.tableData) {
          //_hiddenRowId为定位行的辅助参数，请求的数据中不能包含此字段
          row._hiddenRowId = (Array(16)
            .join('0') + i).slice(-16);
          i++;
        }
        this.tableDataOrigin = JSON.parse(JSON.stringify(this.tableData));
      },
      //通过行列坐标构建ref的方法
      buildCellRef(_hiddenRowId, columnId) {
        // console.log('buildCellRef',_hiddenRowId, columnId);
        return 'Cell_' + _hiddenRowId + '_' + columnId;
      },
      //单元格编辑状态 开关
      isEditingCell(rowId, columnId, editType) {
        return editType
          && this.editingCellInfo.rowId === rowId
          && this.editingCellInfo.columnId === columnId;
      },
      cellClickHandler(row, item) {
        // console.log('row, column', row, item);
        this.startEdit(row, item);
      },
      //开始编辑(设置编辑中单元格信息)
      startEdit(row, item) {
        this.setEditKeyListener(false);
        this.setEditKeyListener(true);
        {//设置编辑中单元格 定位参数
          if (row && row._hiddenRowId) {
            this.editingCellInfo.rowId = row._hiddenRowId;
          }
          if (item && item.columnKey) {
            this.editingCellInfo.columnId = item.columnKey;
          }
          if (item) {
            this.editingCellInfo.columnOption = item;
          }
        }
        this.editingCellFocusAndSelect();
        // console.log('开始编辑', column.columnKey);
      },
      //完成编辑（清除单元格编辑状态，清除按键监听事件）
      finishEdit() {
        this.editCellBlurHandler();
        this.editingCellInfo = {
          rowId: undefined,
          columnId: undefined,
          columnOption: undefined,
        };
        this.setEditKeyListener(false);
      },
      //编辑中单元格 行文字选中，焦点获取
      editingCellFocusAndSelect() {
        let _hiddenRowId = this.editingCellInfo.rowId;
        let columnId = this.editingCellInfo.columnId;
        this.$nextTick(() => {
          //以单元格row._hiddenRowId，column.id，发现单元格。
          let cellEditorELArray = this.$refs[this.buildCellRef(_hiddenRowId, columnId)];
          if (cellEditorELArray && cellEditorELArray.length > 0) {
            if (cellEditorELArray[0].focus) {
              cellEditorELArray[0].focus();
            }
            if (cellEditorELArray[0].select) {
              cellEditorELArray[0].select();
            }
          }
        });
      },
      editCellFocusHandler() {
        //input不再使用v-model绑定数值，避免实时更新导致渲染频繁问题
        this.$nextTick(() => {
          let cellValue = this.tableData.find(e => e._hiddenRowId === this.editingCellInfo.rowId)[this.editingCellInfo.columnOption.propId];
          this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].value = cellValue === undefined ? '' : cellValue;
        });
      },
      //编辑中单元格失去焦点事件
      editCellBlurHandler() {
        let columnOption = this.editingCellInfo.columnOption;
        if (columnOption) {
          let row = this.getEditingRow();
          switch (columnOption.editType) {
            case 'Input':
            case 'InputNumber':
              let changeValue = this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].value;
              this.$set(row, columnOption.propId, changeValue);
              break;
            case 'Select':
            case 'SelectGroup':
              let selectList = columnOption.selectList;
              let newText = null;
              for (let selectItem of selectList) {
                if (selectItem.value === row[columnOption.propId]) {
                  newText = selectItem.label;
                }
              }
              if (columnOption.selectList.findIndex(e => e.value === row[columnOption.propId]) >= 0) {
                this.$set(row, columnOption.propId, row[columnOption.propId]);
                this.$set(row, columnOption.propText, newText);
                if (columnOption.columnKey === 'carId') {
                  this.carExtraEditHandler(row[columnOption.propId]);
                }
                if (columnOption.columnKey === 'fleetId') {
                  this.currentUser.fleetId = row[columnOption.propId];
                  this.currentUser.fleetName = newText;
                }
              }
              break;
          }
        }
        this.setEditingCellInfo(this.changedCellInfo, this.checkEditingValueIsChanged());
      },
      //将编辑中单元格 还原到未修改时的值
      revokeEditingValueHandler() {
        let columnOption = this.editingCellInfo.columnOption;
        let propId = columnOption.propId;
        let propText = columnOption.propText;
        for (let rowOrigin of this.tableDataOrigin) {
          if (rowOrigin._hiddenRowId === this.editingCellInfo.rowId) {
            let row = this.getEditingRow();
            this.$set(row, propId, rowOrigin[propId]);
            this.$set(row, propText, rowOrigin[propText]);
            {//将input类型的编辑框中值也重置，因为没绑定变量，要手动重置
              switch (columnOption.editType) {
                case 'Input':
                case 'InputNumber':
                  this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].value = rowOrigin[propId];
                  break;
              }
            }
          }
        }

        this.finishEdit();//撤销完失去焦点
        // this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].focus();//撤销完保持焦点
      },
      //切换正在编辑的单元格
      switchEditColumnHandler(direction) {
        // console.log('Tab切换单元格', this.editingCellInfo.rowId, this.editingCellInfo.columnId, this.editingCellInfo.columnKey);
        let columnOptionOnlyCanEdit = this.columnOption.filter(e => e.editType);
        if (this.editingCellInfo.rowId && this.editingCellInfo.columnId) {
          for (let i = 0; i < columnOptionOnlyCanEdit.length; i++) {
            if (columnOptionOnlyCanEdit[i].columnKey === this.editingCellInfo.columnId) {
              let next = i;
              if (direction > 0) {
                next++;
              } else if (direction < 0) {
                next--;
              }

              if (direction > 0 && next < columnOptionOnlyCanEdit.length || direction < 0 && next >= 0) {
                //跳下一个单元格
                if (columnOptionOnlyCanEdit[next]) {
                  this.editCellBlurHandler();
                  this.startEdit(undefined, columnOptionOnlyCanEdit[next]);
                }
              } else {
                //跳行
                let rowIndex = 0;
                for (; rowIndex < this.tableData.length; rowIndex++) {
                  if (this.tableData[rowIndex]._hiddenRowId === this.editingCellInfo.rowId) {
                    break;
                  }
                }
                if (direction > 0) {
                  if (rowIndex >= this.tableData.length - 1) {
                    this.addNewRowHandler();//超过最后一行时增加新行
                  }
                  let nextRow = this.tableData[++rowIndex];
                  this.startEdit(nextRow, columnOptionOnlyCanEdit[0]);
                } else if (direction < 0) {
                  if (rowIndex > 0) {
                    let preRow = this.tableData[--rowIndex];
                    this.startEdit(preRow, columnOptionOnlyCanEdit.slice(-1)[0]);
                  } else {
                  }
                }
              }
              // this.editingCellFocusAndSelect();
              break;
            }
          }
        }
      },
      //添加/删除键盘监听事件
      setEditKeyListener(isAdd) {
        if (isAdd) {
          window.addEventListener('keydown', this.editCellKeyDownHandler, true);
          window.addEventListener('keyup', this.editCellKeyUpHandler, true);
        } else {
          try {
            window.removeEventListener('keydown', this.editCellKeyDownHandler, true);
            window.removeEventListener('keyup', this.editCellKeyUpHandler, true);
          } catch (e) {
          }
        }
      },
      //键盘事件
      editCellKeyUpHandler(event) {
        if ((event.key === 'Tab' || event.keyCode === 9)) {
          this.tabKeyAlreadyDown = false;
        }
      },
      editCellKeyDownHandler(event) {
        // console.log('按键值', event.key, event.keyCode);
        let needPreventDefault = false;
        //Tab切换单元格
        if ((event.key === 'Tab' || event.keyCode === 9) && !event.shiftKey) {
          needPreventDefault = true;
          if (!this.tabKeyAlreadyDown) {
            this.switchEditColumnHandler(1);
            this.tabKeyAlreadyDown = true;
          }
        }
        //Shift+Tab切换单元格
        if ((event.key === 'Tab' || event.keyCode === 9) && event.shiftKey) {
          needPreventDefault = true;
          if (!this.tabKeyAlreadyDown) {
            this.switchEditColumnHandler(-1);
            this.tabKeyAlreadyDown = true;
          }
        }
        //Esc完成编辑
        if ((event.key === 'Escape' || event.keyCode === 27)) {
          needPreventDefault = true;
          this.finishEdit();
        }
        //Shift+Backspace撤销
        if ((event.key === 'Backspace' || event.keyCode === 8) && event.shiftKey) {
          needPreventDefault = true;
          this.revokeEditingValueHandler();
        }
        if (needPreventDefault) {
          if (event.defaultPrevented) {
            return;
          }
          if (event.preventDefault) {
            event.preventDefault();
          } else {
            event.returnValue = false;
          }
        }
      },
      //检查编辑中单元格 新值与原值是否相同.customDataProps可以传入要检测的列标记，可检测自定义列
      checkEditingValueIsChanged(customDataProps) {
        if (customDataProps || this.editingCellInfo.columnOption) {
          let dataProps;
          if (customDataProps) {
            dataProps = customDataProps;
          } else {
            let columnOption = this.editingCellInfo.columnOption;
            // console.log('this.editingCellInfo', this.editingCellInfo);
            dataProps = [columnOption.propId, columnOption.propText];
          }
          let row = this.getEditingRow();
          if (!row) {
            return true;
          }
          let rowOrigin = this.getEditingRowOrigin();
          if (!rowOrigin) {
            return true;
          }
          for (let dataProp of dataProps) {
            if (rowOrigin[dataProp] === null && row[dataProp] === null ||
              rowOrigin[dataProp] === '' && row[dataProp] === '' ||
              rowOrigin[dataProp] === null && row[dataProp] === '' ||
              rowOrigin[dataProp] === '' && row[dataProp] === null
            ) {
              return false;
            }
            if (String(rowOrigin[dataProp]) !== String(row[dataProp])) {
              return true;
            }
          }
        }
        return false;
      },
      //获取编辑中行 现数据
      getEditingRow() {
        for (let row of this.tableData) {
          if (row._hiddenRowId === this.editingCellInfo.rowId) {
            return row;
          }
        }
        return {};
      },
      //获取编辑中行 原数据
      getEditingRowOrigin() {
        for (let row of this.tableDataOrigin) {
          if (row._hiddenRowId === this.editingCellInfo.rowId) {
            return row;
          }
        }
        return {};
      },
      //操作记录 被修改、值有误 等单元格集合。customColumnId, customDataPropId可以传入要检测的列标记，可添加自定义列
      setEditingCellInfo(cellArray, isAdd, customColumnId, customDataPropId) {
        if (this.editingCellInfo.columnOption) {
          let rowId = this.editingCellInfo.rowId;
          let columnId = customColumnId || this.editingCellInfo.columnId;
          // console.log('s1etEditingCellInfo!!', rowId, columnId);
          let propId = customDataPropId || this.editingCellInfo.columnOption.propId;//propId为要修改的数据。因为可能出现两列绑定同一个数据，列用columnKey区分，数据字段用propId记录
          if (!cellArray[rowId]) {
            cellArray[rowId] = {};
          }
          if (isAdd) {
            cellArray[rowId][columnId] = propId;
          } else {
            delete cellArray[rowId][columnId];
            if (Object.keys(cellArray[rowId]).length === 0) {
              delete cellArray[rowId];
            }
          }
        }
      },
      addNewRowHandler() {
        this.tableData.push(
          {
            _hiddenRowId: this.buildNewRowHiddenId(),
          }
        );
      },
      deleteRowHandler(row) {
        console.log('row._hiddenRowId', row._hiddenRowId)
        if (row._hiddenRowId.startsWith('A')) {
          for (let rowIndex = 0; rowIndex < this.tableData.length; rowIndex++) {
            if (this.tableData[rowIndex]._hiddenRowId === row._hiddenRowId) {
              this.tableData.splice(rowIndex, 1);
            }
          }
        } else if (row._hiddenRowId.startsWith('D')) {
          if (this.changedCellInfo[row._hiddenRowId]) {
            this.changedCellInfo[row._hiddenRowId.substring(1)] = JSON.parse(JSON.stringify(this.changedCellInfo[row._hiddenRowId]));
            delete this.changedCellInfo[row._hiddenRowId];
          }
          // this.$set(row,"_hiddenRowId",row._hiddenRowId.substring(1));
          row._hiddenRowId = row._hiddenRowId.substring(1);
        } else {
          if (this.changedCellInfo[row._hiddenRowId]) {
            this.changedCellInfo['D' + row._hiddenRowId] = JSON.parse(JSON.stringify(this.changedCellInfo[row._hiddenRowId]));
            delete this.changedCellInfo[row._hiddenRowId];
          }
          // this.$set(row, '_hiddenRowId', 'D' + row._hiddenRowId);
          row._hiddenRowId = 'D' + row._hiddenRowId;
        }
      },
      submitHandler() {
        this.finishEdit();
        let submitData = {
          update: [],
          add: [],
          delete: [],
        };
        this.tableData.forEach(item => {
          if (item && item._hiddenRowId && item._hiddenRowId.length > 0) {
            //update
            let itemTmp = JSON.parse(JSON.stringify(item));
            switch (item._hiddenRowId.substr(0, 1)) {
              case 'A':
                delete itemTmp._hiddenRowId;
                submitData.add.push(itemTmp);//收集添加对象集合
                break;
              case 'D':
                if (itemTmp.id !== undefined) {
                  submitData.delete.push(itemTmp.id);//收集删除id集合
                }
                break;
              default:
                for (let rowId in this.changedCellInfo) {
                  if (item._hiddenRowId === rowId) {
                    let itemTmp = {};
                    this.changedCellInfo[rowId]['id'] = 'id';//更新的行 附加id字段
                    for (let columnId in this.changedCellInfo[rowId]) {
                      if (this.changedCellInfo[rowId].hasOwnProperty(columnId)) {
                        let propId = this.changedCellInfo[rowId][columnId];
                        itemTmp[propId] = item[propId];
                      }
                    }
                    submitData.update.push(itemTmp);//收集更新对象集合
                  }
                }
                break;
            }
          }
        });
        console.log('提交了信息', submitData);
        this.$notify({
          title: '查看控制台',
          type: 'success'
        });
        {//TODO 模拟提交后数据结果，与后台交接后不使用
          if (!this.lastTableId) {
            for (let row of this.tableData) {
              if (row.id) {
                if (this.lastTableId) {
                  this.lastTableId = Math.max(this.lastTableId, row.id);
                } else {
                  this.lastTableId = row.id;
                }
              }
            }
          }
          this.tableData = this.tableData
            .filter(row => {
              return submitData.delete.indexOf(row.id) === -1;
            });

          this.tableData.forEach(row => {
            if (!row.id) {
              row.id = (++this.lastTableId);
            }
          });
          this.initTableDataAndTableDataOrigin();
        }
        this.resetCell();
        this.fetchData();
      },
      //重置记录单元格标记的对象
      resetCell() {
        this.finishEdit();
        this.changedCellInfo = {};
      },
      preventLeavingPage() {
        window.onbeforeunload = () => {
          if (JSON.stringify(this.changedCellInfo) !== ('{}')) {
            return '退出将不保存您填写的数据，确定退出吗？';
          }
        };
      },
    },
    //使用router时，路由跳转提示表单编辑未保存
    beforeRouteLeave(to, from, next) {
      if (JSON.stringify(this.changedCellInfo) !== ('{}')) {
        const answer = window.confirm('离开将丢失对表单的修改，确定离开本页？');
        if (answer) {
          next();
        } else {
          next(false);
        }
      } else {
        next();
      }
    },
    deactivated() {
      this.setEditKeyListener(false);
    },
    destroyed() {
      this.setEditKeyListener(false);
    },
  };
</script>

<style scoped>
  *, div, span, td, input {
    font-size: 14px;
    font-family: 'Arial', "Microsoft YaHei", serif;
  }

  /*去除表格的行中，上下padding，统一行高*/
  .el-table /deep/ td {
    padding: 0;
    line-height: 30px;
    height: 30px;
  }

  /*调整单元格模板中div与单元格一样大*/
  .el-table /deep/ .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 30px;
    padding: 0 0 0 10px;
  }

  /*去除element-ui编辑框的padding*/
  /deep/ .el-input__inner {
    padding: 0;
    font-size: 14px;
    box-sizing: border-box;
    height: 30px;
    line-height: 30px;
  }

  /*去除element-ui编辑框的各种小图标或按钮*/
  /deep/ .el-input__suffix {
    display: none;
  }

  /deep/ .el-input__prefix {
    display: none;
  }

  /*缩小button中的padding*/
  .el-button--mini, .el-button--mini.is-round {
    padding: 5px 5px;
  }

  /deep/ .pre-add-row /deep/ td {
    /*background-color: red !important;*/
    background-image: url('./static/img/grid/pre_add_corner.png') !important;
    background-position: 0 0;
    background-size: 8px;
    background-repeat: no-repeat;
  }

  /deep/ .pre-delete-row /deep/ td {
    /*background-color: red !important;*/
    background-image: url('./static/img/grid/pre_delete_corner.png') !important;
    background-position: 0 0;
    background-size: 8px;
    background-repeat: no-repeat;
  }

  /deep/ .pre-update-cell {
    /*background-color: red !important;*/
    background-image: url('./static/img/grid/pre_update_corner.png');
    background-position: 0 0;
    background-size: 8px;
    background-repeat: no-repeat;
  }

  /*input输入框为number类型时不显示箭头*/
  /deep/ input::-webkit-outer-spin-button,
  /deep/ input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  /deep/ input[type="number"] {
    -moz-appearance: textfield;
  }


</style>
