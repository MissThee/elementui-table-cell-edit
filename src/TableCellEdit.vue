<template>
  <div>
    <div style="padding: 5px">
      <el-button type="primary" plain size="mini" icon="el-icon-circle-plus" @click="addNewRowHandler">新增</el-button>
      <el-button type="success" plain size="mini" icon="el-icon-success" @click="submitHandler">提交保存</el-button>
      <el-popover trigger="hover" placement="bottom">
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
        <el-button slot="reference" type="warning" plain size="mini" style="float: right;"><i class="el-icon-question"/>使用帮助</el-button>
      </el-popover>
    </div>
    <el-table
      ref="Table"
      border
      :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
      style="width: 100%"
      :height="500"
      @cell-click="cellClickHandler"
      :row-class-name="tableRowClassName"
      :cell-class-name="tableCellClassName"
    >
      <el-table-column label="日期" prop="date"/>
      <el-table-column v-for="item in columnOption" :column-key="item.columnKey" :label="item.label" :key="item.prop" :prop="item.propText">
        <template slot="header" slot-scope="scope">
          <div style="float: left;width: 60px">{{scope.column.label}}</div>
          <!--        <div style="overflow: hidden">-->
          <!--          <el-input v-model="search" size="medium" placeholder="关键字过滤"/>-->
          <!--        </div>-->
        </template>
        <template slot-scope="scope">
          <!--style="background:url('main/img/grid/dirty.png') 0 0 no-repeat;"原打算用角落红标标识修改的单元单元格，但不能放置单元格左上角，暂不使用-->
          <div v-show="!(isEditingCell(scope)&&item.editType)">{{scope.row[item.propText]}}</div>
          <div style="display: table" v-if="isEditingCell(scope)&&item.editType">
            <div style="display: table-cell;width: 100%">
              <el-input v-if="item.editType==='Input'"
                        @blur="editCellBlurHandler"
                        :ref="buildCellRef(scope.row._hiddenRowId,scope.column.id)"
                        v-model="scope.row[item.propId]"/>
              <el-tooltip v-model="showValueCheckMsg" placement="top" manual content="此值需要为数字" effect="dark">
                <el-input v-if="item.editType==='InputNumber'"
                          @blur="editCellBlurHandler"
                          @focus="checkEditingValueIsNaN"
                          @input="checkEditingValueIsNaN"
                          :ref="buildCellRef(scope.row._hiddenRowId,scope.column.id)"
                          v-model="scope.row[item.propId]"
                          placeholder="输入数字" :min="0" :max="100000000" :controls="false"/>
              </el-tooltip>
              <el-date-picker v-if="item.editType==='DatePicker'"
                              @blur="editCellBlurHandler"
                              :ref="buildCellRef(scope.row._hiddenRowId,scope.column.id)"
                              v-model="scope.row[item.propId]"
                              :clearable="false" size="mini" prefix-icon=" " placeholder="选择日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd"/>

              <el-select v-if="item.editType==='Select'"
                         filterable
                         @blur="editCellBlurHandler"
                         @change="editCellBlurHandler"
                         :ref="buildCellRef(scope.row._hiddenRowId,scope.column.id)"
                         v-model="scope.row[item.propId]"
                         :automatic-dropdown="true"
                         placeholder="请选择">
                <el-option v-for="selectItem in item.selectList" :key="selectItem.value" :label="selectItem.label" :value="selectItem.value"/>
              </el-select>
            </div>
            <div style="margin: 0 0 0 3px;" :style="{width: 52/(scope.row._hiddenRowId.startsWith('A')?2:1)+'px'}">
              <el-popconfirm @onConfirm="revokeEditingValueHandler" title="确定撤销更改？">
                <el-button v-if="!scope.row._hiddenRowId.startsWith('A')" slot="reference" style="margin: 0;" title="撤销更改(Shift+Backspace)" type="danger" plain size="mini" icon="el-icon-refresh-left"/>
              </el-popconfirm>
              <el-button style="margin: 0;" title="完成编辑(Esc)" type="success" plain size="mini" icon="el-icon-check" @click="finishEdit"/>
              <!--@mousedown.native="onRevokeButtonMouseDown($event,scope)"用于Button可防止编辑单元格失去焦点，但在弹出式组件的按钮中无效-->
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="100px" label="选择-id" prop="selectValue"/>
      <el-table-column width="100px" label="选择-text" prop="selectName"/>
      <el-table-column width="100px" fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button style="font-size: 12px" :type="scope.row._hiddenRowId.startsWith('D')?'success':'danger'" plain size="mini" :icon="scope.row._hiddenRowId.startsWith('D')?'el-icon-refresh-left':'el-icon-delete'" @click="deleteRowHandler(scope.row)">
            {{scope.row._hiddenRowId.startsWith('D')?'取消':'删除'}}
          </el-button>
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
        hiddenRowIdProp: '_hiddenRowId',
        search: '',
        tableData: [],//table当前数据
        tableDataOrigin: [],//table原数据，做撤销时使用
        editingCellInfo: {//记录当前编辑中的单元格坐标信息
          rowId: undefined,
          columnId: undefined,
          columnKey: undefined
        },
        // 已修改的单元格集合
        changedCellInfo: {
          // 'rowId': {
          //   'columnId1': 'propId',
          //   'columnId2': 'propId',
          // }
        },
        // 错误值单元格集合，结构同上
        wrongCellInfo: {},
        tableColumnProperties: [],//table中各个列信息。配合Tab键切换单元格使用
        showValueCheckMsg: false,
        columnOption: [
          {
            columnKey: 'name',
            label: '名称',
            propId: 'name',
            propText: 'name',
            editType: 'Input',
          }, {
            columnKey: 'address',
            label: '住址',
            propId: 'address',
            propText: 'address',
            editType: 'Input',
          }, {
            columnKey: 'date',
            label: '时间编辑',
            propId: 'date',
            propText: 'date',
            editType: 'DatePicker',
          }, {
            columnKey: 'age',
            label: '年龄',
            propId: 'age',
            propText: 'age',
            editType: 'InputNumber',
          }, {
            columnKey: 'height',
            label: '身高',
            propId: 'height',
            propText: 'height',
          }, {
            columnKey: 'selectCell',
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
        newRowHiddenId: 1,
      };
    },
    created() {
      this.initCanEditColumns();
      this.requestTableData();
    },

    methods: {
      tableRowClassName({row, rowIndex}) {
        if (row._hiddenRowId.startsWith('A')) {
          return 'pre-add-row';
        }
        if (row._hiddenRowId.startsWith('D')) {
          return 'pre-delete-row';
        }
        return '';
      },
      tableCellClassName({row, column, rowIndex, columnIndex}) {
        let classNames = '';
        if (this.changedCellInfo[row._hiddenRowId] && this.changedCellInfo[row._hiddenRowId][column.id]) {
          classNames += ' pre-update-cell';        //被修改的角标样式
        }
        if (this.wrongCellInfo[row._hiddenRowId] && this.wrongCellInfo[row._hiddenRowId][column.id]) {
          classNames += ' wrong-cell-info';        //内容错误的文字样式
        }
        return classNames;
      },
      //数字变字符串左侧补充0，总长度为n
      pad(num, n) {
        let tbl = [];
        let len = n - num.toString().length;
        if (len <= 0) return num;
        if (!tbl[len]) tbl[len] = (new Array(len + 1)).join('0');
        return tbl[len] + num;
      },
      buildNewRowHiddenId() {
        let newRowHiddenId = 'A' + this.pad(this.newRowHiddenId, 16);
        this.newRowHiddenId++;
        return newRowHiddenId;
      },
      //table原数据加自定义id列，留存副本 [实际需在获取数据后马上调用]
      initTableDataAndTableDataOrigin() {
        let i = 1;
        for (let row of this.tableData) {
          //_hiddenRowId为定位行的辅助参数，请求的数据中不能包含此字段
          row._hiddenRowId = this.pad(i, 16);
          i++;
        }
        this.tableDataOrigin = JSON.parse(JSON.stringify(this.tableData));
      },

      //从实际渲染的组件中，获取各列信息，收集其中包含columnKey的列，为可编辑列信息集合
      initCanEditColumns() {
        this.tableColumnProperties = [];
        this.$nextTick(() => {
          for (let item of this.$refs.Table.columns) {
            if (item.columnKey) {
              this.tableColumnProperties.push(
                {
                  columnId: item.id,
                  columnKey: item.columnKey
                }
              );
            }
          }
        });
      },
      //通过行列坐标构建ref的方法
      buildCellRef(_hiddenRowId, columnId) {
        return 'Cell_' + _hiddenRowId + '_' + columnId;
      },
      //单元格编辑状态 开关
      isEditingCell(scope) {
        return this.editingCellInfo.rowId === scope.row._hiddenRowId
          && this.editingCellInfo.columnId === scope.column.id
          && this.editingCellInfo.columnKey === scope.column.columnKey;
      },
      cellClickHandler(row, column, cell, event) {
        this.startEdit(row, column);
      },
      //开始编辑(设置编辑中单元格信息)
      startEdit(row, column) {
        this.setEditKeyListener(false);
        this.setEditKeyListener(true);
        this.editingCellInfo.rowId = row._hiddenRowId;
        this.editingCellInfo.columnId = column.id;
        this.editingCellInfo.columnKey = column.columnKey;
        this.editingCellFocusAndSelect();
        // console.log('开始编辑', column.columnKey);
      },
      //完成编辑（清除单元格编辑状态，清除按键监听事件）
      finishEdit() {
        this.editingCellInfo = {
          rowId: undefined,
          columnId: undefined,
          columnKey: undefined,
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
            if (cellEditorELArray[0].select) {
              cellEditorELArray[0].select();
            } else if (cellEditorELArray[0].focus) {
              cellEditorELArray[0].focus();
            }
          }
        });
      },
      //编辑中单元格失去焦点事件
      editCellBlurHandler() {
        this.$nextTick(() => {//消除错误值提示
          this.showValueCheckMsg = false;
        });
        let props = this.getEditingCellProps();
        switch (props.editType) {
          case 'InputNumber':
            //检查值是否正确
            let isWrongCell = this.checkEditingValueIsNaN();
            this.setEditingCellInfo(this.wrongCellInfo, isWrongCell);
            break;
          case 'Select':
            let row = this.getEditingRow();
            let selectList = props.selectList;
            let newText = null;
            for (let selectItem of selectList) {
              if (selectItem.value === row[props.propId]) {
                newText = selectItem.label;
              }
            }
            this.$set(row, props.propId, row[props.propId]);
            this.$set(row, props.propText, newText);
            break;
        }
        this.setEditingCellInfo(this.changedCellInfo, this.checkEditingValueIsChanged());
      },
      //将编辑中单元格 还原到未修改时的值
      revokeEditingValueHandler() {
        let props = this.getEditingCellProps();
        let propId = props.propId;
        let propText = props.propText;
        for (let rowOrigin of this.tableDataOrigin) {
          if (rowOrigin._hiddenRowId === this.editingCellInfo.rowId) {
            let row = this.getEditingRow();
            this.$set(row, propId, rowOrigin[propId]);
            this.$set(row, propText, rowOrigin[propText]);
          }
        }
        this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].focus();

      },
      //阻止默认事件。（如阻止点击按钮时，input失去焦点）
      // preventNativeEvent(event) {
      //   if (event && event.preventDefault) { //现代浏览器阻止默认事件
      //     event.preventDefault();
      //   } else {//IE阻止默认事件
      //     window.event.returnValue = false;
      //   }
      //   return false;
      // },
      //切换正在编辑的单元格
      switchEditColumnHandler(direction) {
        // console.log('Tab切换单元格', this.editingCellInfo.rowId, this.editingCellInfo.columnId, this.editingCellInfo.columnKey);
        if (this.editingCellInfo.rowId && this.editingCellInfo.columnId && this.editingCellInfo.columnKey) {
          for (let i = 0; i < this.tableColumnProperties.length; i++) {
            if (this.tableColumnProperties[i].columnId === this.editingCellInfo.columnId) {
              let next = i;
              if (direction > 0) {
                next++;
              } else if (direction < 0) {
                next--;
              }
              if (direction > 0 && next < this.tableColumnProperties.length || direction < 0 && next >= 0) {
                if (this.tableColumnProperties[next]) {
                  this.editCellBlurHandler();
                  this.editingCellInfo.columnId = this.tableColumnProperties[next].columnId;
                  this.editingCellInfo.columnKey = this.tableColumnProperties[next].columnKey;

                  this.$nextTick(() => {
                    let cellEditorELArray = this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)];
                    if (cellEditorELArray && cellEditorELArray.length > 0) {
                      //可以检测到input框，不做任何操作
                    } else {
                      this.switchEditColumnHandler(direction);
                    }
                  });
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
                  this.editingCellInfo.rowId = nextRow._hiddenRowId;
                  this.editingCellInfo.columnId = this.tableColumnProperties[0].columnId;
                  this.editingCellInfo.columnKey = this.tableColumnProperties[0].columnKey;
                } else if (direction < 0) {
                  if (rowIndex > 0) {
                    let preRow = this.tableData[--rowIndex];
                    this.editingCellInfo.rowId = preRow._hiddenRowId;
                    this.editingCellInfo.columnId = this.tableColumnProperties.slice(-1)[0].columnId;
                    this.editingCellInfo.columnKey = this.tableColumnProperties.slice(-1)[0].columnKey;
                  } else {
                  }
                }
              }
              this.editingCellFocusAndSelect();
              break;
            }
          }
        }
      },
      //添加/删除键盘监听事件
      setEditKeyListener(isAdd) {
        if (isAdd) {
          window.addEventListener('keydown', this.editCellKeyDownHandler, true);
        } else {
          try {
            window.removeEventListener('keydown', this.editCellKeyDownHandler, true);
          } catch (e) {
          }
        }
      },
      //键盘事件
      editCellKeyDownHandler(event) {
        // console.log('按键值', event.key, event.keyCode);
        let needPreventDefault = false;
        //Tab切换单元格
        if ((event.key === 'Tab' || event.keyCode === 9) && !event.shiftKey) {
          needPreventDefault = true;
          this.switchEditColumnHandler(1);
        }
        //Shift+Tab切换单元格
        if ((event.key === 'Tab' || event.keyCode === 9) && event.shiftKey) {
          needPreventDefault = true;
          this.switchEditColumnHandler(-1);
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
      //检查编辑中单元格 数据是否为数字。 不是数字 返回true
      checkEditingValueIsNaN() {
        let row = this.getEditingRow();
        let propId = this.getEditingCellProps().propId;
        let newValue = row[propId];
        if (newValue && newValue !== '') {
          let result = isNaN(newValue);
          this.showValueCheckMsg = result;
          return result;
        }
      },
      //检查编辑中单元格 新值与原值是否相同
      checkEditingValueIsChanged() {
        let props = this.getEditingCellProps();
        let values = [...new Set(Object.values(props))];
        for (let value of values) {
          let prop = value;
          let rowOrigin = this.getEditingRowOrigin();
          if (!rowOrigin) {
            return true;
          }
          let row = this.getEditingRow();
          if (!row) {
            return true;
          }
          if (String(rowOrigin[prop]) !== String(row[prop])) {
            return true;
          }
        }
        return false;
      },
      //获取编辑中单元格 设置参数
      getEditingCellProps() {
        for (let item of this.columnOption) {
          if (item.columnKey === this.editingCellInfo.columnKey) {
            return item;
          }
        }
        return {};
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
      //操作记录 被修改、值有误 等单元格集合
      setEditingCellInfo(cellArray, isAdd) {
        let rowId = this.editingCellInfo.rowId;
        let columnId = this.editingCellInfo.columnId;
        let columnKey = this.editingCellInfo.columnKey;
        let propId = this.getEditingCellProps().propId;
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
      },
      addNewRowHandler() {
        this.tableData.push(
          {
            _hiddenRowId: this.buildNewRowHiddenId(),
          }
        );
      },
      deleteRowHandler(row) {
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
          row._hiddenRowId = row._hiddenRowId.substring(1);
        } else {
          if (this.changedCellInfo[row._hiddenRowId]) {
            this.changedCellInfo['D' + row._hiddenRowId] = JSON.parse(JSON.stringify(this.changedCellInfo[row._hiddenRowId]));
            delete this.changedCellInfo[row._hiddenRowId];
          }
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
        }

        this.requestTableData();
        this.resetCell();
      },
      //重置记录单元格标记的对象
      resetCell() {
        this.changedCellInfo = {};
        this.wrongCellInfo = {};
      },
      requestTableData() {
        if (this.tableData.length === 0) {//TODO 模拟获取数据，与后台交接后不使用
          this.tableData = [{
            id: 1,
            date: '2016-05-02',
            name: '王',
            address: '地址',
            age: 11,
            height: 11,
            selectValue: 1,
            selectName: '1黄金糕',
          }, {
            id: 2,
            date: '2016-05-04',
            name: '王小',
            address: '住的地方',
            age: 11,
            height: 11,
            selectValue: 2,
            selectName: '2双皮奶',
          }, {
            id: 3,
            date: '2016-05-01',
            name: '王小虎',
            address: '地球村',
            age: 11,
            height: 11,
            selectValue: 3,
            selectName: '3蚵仔煎',
          }, {
            id: 4,
            date: '2016-05-03',
            name: '王虎',
            address: '啊啊士大夫撒打发斯蒂芬',
            age: 11,
            height: 11,
            selectValue: 4,
            selectName: '4龙须面',
          }];
        }
        this.initTableDataAndTableDataOrigin();
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
  *, div, span, td {
    font-size: 14px;
  }

  /*去除表格的行中，上下padding，统一行高*/
  .el-table /deep/ td {
    padding: 0;
    line-height: 30px;
    height: 30px;
  }

  /*调整模板中div与td一样大*/
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


  /*.el-table /deep/ td div {*/
  /*  margin: 5px;*/
  /*}*/

  /*去除input中的padding*/
  /deep/ .el-input__inner {
    padding: 0;
    font-size: 14px;
    box-sizing: border-box;
    height: 30px;
  }

  /*缩小button中的padding*/
  .el-button--mini, .el-button--mini.is-round {
    padding: 5px 5px;
  }

  /*inputNumber样式*/
  .el-input-number.is-without-controls /deep/ .el-input__inner {
    padding: 0
  }

  /deep/ .el-input__inner {
    height: 30px;
  }

  .el-input-number /deep/ .el-input__inner {
    text-align: left;
  }

  .el-input-number {
    width: 100%;
    line-height: 30px;
  }

  /*dataPicker样式*/
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }

  /*select样式*/
  /deep/ .el-input__suffix {
    display: none;
  }

  /deep/ .wrong-cell-info {
    font-weight: bold;
    color: #F56C6C;
  }

  /*新行*/
  /deep/ .pre-add-row {
    /*stripe会覆盖这个颜色，不再使用stripe*/
  }

  /deep/ .pre-add-row /deep/ td {
    /*background-color: red !important;*/
    background-image: url('./static/img/grid/pre_add_corner.png') !important;
    background-position: 0 0;
    background-size: 8px;
    background-repeat: no-repeat;
  }

  .el-table /deep/ .pre-delete-row /deep/ td {
    /*background-color: red !important;*/
    background-image: url('./static/img/grid/pre_delete_corner.png') !important;
    background-position: 0 0;
    background-size: 8px;
    background-repeat: no-repeat;
  }

  .el-table /deep/ .pre-update-cell {
    /*background-color: red !important;*/
    background-image: url('./static/img/grid/pre_update_corner.png');
    background-position: 0 0;
    background-size: 8px;
    background-repeat: no-repeat;
  }


  /*表格头部*/
  .el-table /deep/ th {
    border-bottom-color: #DFDFDF;
    background-color: #F6F6F6;
  }

  .el-table /deep/ th:hover {
    background-color: #FFFFFF;
  }

  /*!*表格数据行边框*!*/
  /*.el-table /deep/ td {*/
  /*  border-color: #FFF;*/
  /*}*/

  /*!*表格数据行偶数行-白背景-变色底边*!*/
  /*.el-table /deep/ tr:nth-child(2n) /deep/ td {*/
  /*  border-right-color: #EFEFFE;*/
  /*  border-bottom-color: #EFEFFA;*/
  /*}*/

  /*!*表格数据行偶数行-变色背景-白色底边*!*/
  /*.el-table /deep/ tr:nth-child(2n+1) /deep/ td {*/
  /*  background-color: #eaf2ff;*/
  /*}*/


</style>
