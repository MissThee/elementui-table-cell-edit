<template>
  <div id="app">
    <div style="text-align: center">element-ui v2.15.1 table 组件行内编辑</div>
    <div style="width:800px;margin:auto;border:1px solid #ccc;padding:10px">
      <table-cell-edit
        @refresh="refreshHandler"
        @submit="submitHandler"
        :columns="columnOption"
        :data="tableData"
      />
    </div>
    <div style="text-align: center">
      <div>(element-ui的table组件配置属性/方法/事件等暂未暴露，需自行添加)</div>
      <div>查看源码：</div>
      <div><a href="https://github.com/MissThee/elementui-table-cell-edit">https://github.com/MissThee/elementui-table-cell-edit</a></div>
    </div>
  </div>
</template>

<script>
import TableCellEdit from "./components/TableCellEdit";
import axios from 'axios'

export default {
  name: 'App',
  components: {TableCellEdit},
  data() {
    return {
      //table数据
      tableData: [],
      //table列配置
      columnOption: [
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
              // value: 10,
              // label: '选项'
            },
          ],
        }
      ]
    };
  },
  created() {
    this.fetchSelectList()
    this.fetchData()
  },
  methods: {
    refreshHandler() {
      this.fetchData()
    },
    submitHandler(result) {
      axios.post('/setTableDataApi', result).then(({data}) => {
        if (data.result) {
          console.info('提交了信息', result);
          this.fetchData()
          this.$notify({
            title: '提交成功，查看控制台',
            type: 'success'
          });
        }
      })
    },
    fetchData() {
      axios.post('/getTableDataApi').then(({data}) => {
        this.tableData = data.tableData
      })
    },
    fetchSelectList() {
      axios.post('/getSelectListDataApi').then(({data}) => {
        this.columnOption.forEach(e => {
          if (e.columnKey === 'column6') {
            e.selectList = data.selectListData;
          }
        })
      })
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app, html, body {
  height: 100%;
  width: 100%;
}
</style>
