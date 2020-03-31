<template>
  <div>
    <el-form inline style="height:20px;">
      <el-form-item style="margin-bottom: 0">
        <el-button class="custom-button-in-toolbar " type="primary" plain size="mini" icon="el-icon-refresh"
                   @click="refreshData">刷新
        </el-button>
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
      <el-table-column v-for="item in columnOption" :min-width="item.minWidth" :width="item.width"
                       :column-key="item.columnKey" :label="item.label" :key="item.prop" :prop="item.propText">
        <template slot-scope="scope">
          <div @click="cellClickHandler(scope.row,item)" style="min-height: 30px" :style="{color:item.color}"
               v-show="!isEditingCell(scope.row._hiddenRowId,item.columnKey,item.editType)">
            <span>{{scope.row[item.propText]}}</span>
          </div>
          <div style="display: table" v-if="isEditingCell(scope.row._hiddenRowId,item.columnKey,item.editType)">
            <div style="display: table-cell;width: 100%">
              <input v-if="item.editType==='Input'"
                     class="el-input el-input__inner"
                     style="width:100%"
                     @blur="editCellBlurHandler"
                     :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
              />
              <input v-if="item.editType==='InputNumber'"
                     class="el-input el-input__inner"
                     style="width:100%"
                     type="Number"
                     @blur="editCellBlurHandler"
                     :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
                     placeholder="输入数字"/>
              <el-date-picker v-if="item.editType==='DatePicker'"
                              style="width:100%"
                              @blur="editCellBlurHandler"
                              :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
                              v-model="scope.row[item.propId]"
                              :clearable="false" size="mini" prefix-icon=" " placeholder="选择日期" format="yyyy-MM-dd"
                              value-format="yyyy-MM-dd"/>
              <el-select v-if="item.editType==='Select'"
                         width="100%"
                         filterable
                         @blur="editCellBlurHandler"
                         @change="editCellBlurHandler"
                         :ref="buildCellRef(scope.row._hiddenRowId,item.columnKey)"
                         v-model="scope.row[item.propId]"
                         :automatic-dropdown="true"
                         placeholder="请选择">
                <el-option v-for="selectItem in item.selectList" :key="selectItem.value" :label="selectItem.label"
                           :value="selectItem.value"/>
              </el-select>
            </div>
            <div style="margin: 0;" :style="{width:getRowState(scope.row._hiddenRowId)==='add'?0:26+'px'}">
              <el-popconfirm placement="right" @onConfirm="revokeEditingValueHandler" title="确定撤销更改？">
                <el-button v-if="getRowState(scope.row._hiddenRowId)!=='add'" slot="reference" style="margin: 0;"
                           title="撤销更改(Shift+Backspace)" type="danger" plain size="mini" icon="el-icon-refresh-left"/>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="120px" prop="selectValue" align="center" label="选择id(普通列)"/>
      <el-table-column width="120px" prop="selectName" align="center" label="选择值(普通列)"/>
      <el-table-column width="60px" fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button :title="getRowState(scope.row._hiddenRowId)==='delete'?'取消删除':'删除'"
                     style="margin-left: -10px;font-size: 12px"
                     :type="getRowState(scope.row._hiddenRowId)==='delete'?'success':'danger'" plain size="mini"
                     :icon="getRowState(scope.row._hiddenRowId)==='delete'?'el-icon-refresh-left':'el-icon-delete'"
                     @click="deleteRowHandler(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import axios from 'axios'

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
        changedCellInfo: {// 记录已修改单元格的集合
          // 'rowId': {//行标识
          //   'columnId1': 'propId1',//列标识 ： 列的数据字段
          //   'columnId2': 'propId2',//列标识 ： 列的数据字段
          // }
        },
        dataPrimaryKey: "id",//数据的主键字段，即区分每行数据的标识字段
        columnOption: [ //列配置
          {
            columnKey: "column1",
            minWidth: "100px",
            label: '文字',
            propId: 'text',
            propText: 'text',
            editType: 'Input',
          }, {
            columnKey: "column2",
            minWidth: "100px",
            label: '文字1',
            propId: 'text1',
            propText: 'text1',
            editType: 'Input',
          }, {
            //以下为单元格编辑关键配置：
            columnKey: "column3",//列标识，每列互相不重复即可。
            propId: 'date',   //编辑时绑定的数据字段（这个字段需要为数据中的字段名，并且也是本列编辑后回传的字段名）
            propText: 'date', //非编辑时展示的数据字段（这个字段需要为数据中的字段名）
            editType: 'DatePicker',//编辑类型，现有固定的几种Input，InputNumber，Select，DatePicker。没有editType则此列不能进入编辑模式。若有值且不是以上值则编辑出bug
            //以下为element-ui的table原有的列配置字段引用的值。（只是在el-table-column中引用了值）
            width: "150px",
            minWidth: "150px",
            label: '时间编辑',
          }, {
            columnKey: "column4",
            minWidth: "100px",
            label: '数字',
            propId: 'number',
            propText: 'number',
            editType: 'InputNumber',
          }, {
            columnKey: "column5",
            minWidth: "140px",
            label: '不能编辑',
            propId: 'textNoEdit',
            propText: 'textNoEdit',
          }, {
            columnKey: "column6",
            minWidth: "100px",
            label: '选择',
            propId: 'selectValue',
            propText: 'selectName',
            editType: 'Select',
            selectList: [//选择列表，需要在此提供列表数据
              {
                value: 10,
                label: '这个选项会被fetchSelectListData()方法中的值覆盖'
              },
            ],
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
      this.fetchSelectListData()
    },

    methods: {
      refreshData() {
        if (JSON.stringify(this.changedCellInfo) !== ('{}')) {
          this.$confirm('检测到您有未提交保存的修改<br />刷新将<span style="color:#E6A23C;font-weight: bold">丢失未保存的修改</span>，是否继续？',
            {dangerouslyUseHTMLString: true})
            .then(() => {
              this.fetchData();
            })
            .catch(() => {
            });
        } else {
          this.fetchData();
        }
      },
      fetchData() {// 获取数据
        axios.post('/getTableDataApi').then(({data}) => {
          this.setTableData(data.tableData);
        })
      },
      fetchSelectListData() {// 获取下拉列表数据
        axios.post('/getSelectListDataApi').then(({data}) => {
          this.columnOption.forEach(e => {
            if (e.columnKey === 'column6') {
              e.selectList = data.selectListData;
            }
          })
        })
      },
      submitHandler() {//提交结果
        let submitData = this.getEditResult();
        axios.post('/setTableDataApi', submitData).then(({data}) => {
          if (data.result) {
            this.fetchData();
            console.info('提交了信息', submitData);
            this.$notify({
              title: '提交成功，查看控制台',
              type: 'success'
            });
          }
        })
      },
      //---------------------------------------------以下为单元格编辑支持方法---------------------------------------------
      setTableData(tableData) {//设置表格数据
        this.resetCell();
        this.tableData = tableData;
        this.initTableDataAndTableDataOrigin();
      },
      getRowState(_hiddenRowId) {//使用_hiddenRowId获取当前行的状态，
        // 已有数据初始或被修改过值得行，_hiddenRowId均为纯数字
        // 被删除的行_hiddenRowId值为字母D开头
        // 新增加的行_hiddenRowId值为字母A开头
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
          classNames += ' pre-update-cell';        //被修改的单元格角标样式
        }
        return classNames;
      },
      buildNewRowHiddenId() {
        let newRowHiddenId = 'A' + (Array(16)
          .join('0') + this.newRowHiddenId).slice(-16);
        this.newRowHiddenId++;
        return newRowHiddenId;
      },
      //table原数据加自定义_hiddenRowId列，单元格编辑的辅助定位参数。并留存原数据副本tableDataOrigin，用以编辑时撤销编辑，恢复内容[需在获取数据后马上调用]
      initTableDataAndTableDataOrigin() {
        let i = 1;
        for (let row of this.tableData) {
          //_hiddenRowId为定位行的辅助参数，请求的数据中不能包含此字段
          this.$set(row, '_hiddenRowId', (Array(16).join('0') + i).slice(-16));
          i++;
        }
        this.tableDataOrigin = JSON.parse(JSON.stringify(this.tableData));
      },
      //通过行列坐标构建ref值的方法
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
      //编辑中单元格 焦点获取,文字选中
      editingCellFocusAndSelect() {
        let _hiddenRowId = this.editingCellInfo.rowId;
        let columnId = this.editingCellInfo.columnId;
        this.$nextTick(() => {
          //以row._hiddenRowId，column.columnKey，发现单元格。
          if (this.editingCellInfo.columnOption) {
            switch (this.editingCellInfo.columnOption.editType) {
              case 'Input':
              case 'InputNumber':
                let cellValue = this.tableData.find(e => e._hiddenRowId === this.editingCellInfo.rowId)[this.editingCellInfo.columnOption.propId];
                this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].value = cellValue === undefined ? '' : cellValue;
            }
          }
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
      //编辑中单元格失去焦点事件
      editCellBlurHandler() {
        // console.log("blur!!")
        this.setEditingValueToTableData();
        this.setEditingCellInfoToChangedCellInfo(this.checkEditingValueIsChanged());
      },
      setEditingValueToTableData() {
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
              }
              break;
          }
        }
      },
      //记录 被修改、值有误 等单元格信息到this.changedCellInfo中。
      setEditingCellInfoToChangedCellInfo(isAdd) {
        if (this.editingCellInfo.columnOption) {
          let rowId = this.editingCellInfo.rowId;
          let columnId = this.editingCellInfo.columnId;
          let propId = this.editingCellInfo.columnOption.propId;//propId为要修改的数据。因为可能出现两列绑定同一个数据，列用columnKey区分，数据字段用propId记录
          if (!this.changedCellInfo[rowId]) {
            this.changedCellInfo[rowId] = {};
          }
          if (isAdd) {
            this.changedCellInfo[rowId][columnId] = propId;
          } else {
            delete this.changedCellInfo[rowId][columnId];
            if (Object.keys(this.changedCellInfo[rowId]).length === 0) {
              delete this.changedCellInfo[rowId];
            }
          }
        }
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
            {//将input类型的编辑框中值也重置，因为没使用v-model绑定变量，要手动重置
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
      //切换正在编辑的单元格到下一个（direction>0）或上一个（direction<0）。
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
                  this.$refs[this.buildCellRef(this.editingCellInfo.rowId, this.editingCellInfo.columnId)][0].blur();
                  if (this.editingCellInfo.columnOption.editType === 'DatePicker') {
                    //焦点到el-date-picker控件，使用方向键修改日期后，不使用回车选中，而是直接tab切换下一单元格不会触发blur事件，但选中的时间已经修改
                    //在此直接调用一次blur事件
                    //(el-select控件使用以上操作方式也不会触发blur，但其选中的值不会被改变，无需将其做类似处理)
                    this.editCellBlurHandler();
                  }
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
      // 添加/删除键盘监听事件（目的是为了仅在表格进入编辑状态时，才进行按键事件监听）
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
        if (event.key === 'Tab' || event.keyCode === 9) {
          this.tabKeyAlreadyDown = false;
        }
      },
      //键盘事件。表格编辑快捷键操作
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
      //检查编辑中单元格 新值与原值是否相同。customDataProps可以传入要检测的列标记，可检测自定义列（此示例未使用此参数）
      checkEditingValueIsChanged(customDataProps) {
        if (customDataProps || this.editingCellInfo.columnOption) {
          let dataProps;
          if (customDataProps) {
            dataProps = customDataProps;
          } else {
            let columnOption = this.editingCellInfo.columnOption;
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

      addNewRowHandler() {
        this.tableData.push({_hiddenRowId: this.buildNewRowHiddenId()});
      },
      deleteRowHandler(row) {
        if (row._hiddenRowId.startsWith('A')) {
          for (let rowIndex = 0; rowIndex < this.tableData.length; rowIndex++) {
            if (this.tableData[rowIndex]._hiddenRowId === row._hiddenRowId) {
              this.tableData.splice(rowIndex, 1);
            }
          }
          return;
        }
        if (row._hiddenRowId.startsWith('D')) {
          if (this.changedCellInfo[row._hiddenRowId]) {
            this.$set(this.changedCellInfo, row._hiddenRowId.substring(1), JSON.parse(JSON.stringify(this.changedCellInfo[row._hiddenRowId])));
            this.$delete(this.changedCellInfo, row._hiddenRowId);
          }
          this.$set(row, "_hiddenRowId", row._hiddenRowId.substring(1));
        } else {
          if (this.changedCellInfo[row._hiddenRowId]) {
            this.$set(this.changedCellInfo, 'D' + row._hiddenRowId, JSON.parse(JSON.stringify(this.changedCellInfo[row._hiddenRowId])));
            this.$delete(this.changedCellInfo, row._hiddenRowId);
          }
          this.$set(row, '_hiddenRowId', 'D' + row._hiddenRowId);
        }
      },
      //获取编辑修改的结果
      getEditResult() {
        this.finishEdit();
        let submitData = {
          update: [],//更新的内容
          add: [],//增加的内容
          delete: [],//删除的内容
        };
        this.tableData.forEach(item => {
          if (item && item._hiddenRowId && item._hiddenRowId.length > 0) {
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
                    this.changedCellInfo[rowId]['_dataPrimaryKey'] = this.dataPrimaryKey;
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
        return submitData;
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
