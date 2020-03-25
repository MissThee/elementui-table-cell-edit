import Mock from 'mockjs';

// 如果是get请求，可以在options.url中获取到，
// 如果是post请求，可以在options.body中获取到。
// Mock.mock('url','get',(options)=>{
//   console.log(options)
// })
// Mock.mock( url, post/get , 返回的数据)；
let selectListData = [
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
  }];

Mock.mock('/getSelectListDataApi', 'post',
  {
    selectListData
  }
);
let tableData = [
  {
    id: 10001,
    date: '2016-05-02',
    text: '张三',
    text1: 'ff',
    number: 511,
    textNoEdit: '不能编辑的列',
    selectValue: 1,
    selectName: '1黄金糕',
  }, {
    id: 10002,
    date: '2017-05-04',
    text: '李四',
    text1: 'vv',
    number: 11,
    textNoEdit: '11',
    selectValue: 2,
    selectName: '2双皮奶',
  }, {
    id: 10003,
    date: '2019-01-01',
    text: '王五',
    text1: 'cc',
    number: 213,
    textNoEdit: '一段文字',
    selectValue: 3,
    selectName: '3蚵仔煎',
  }, {
    id: 10004,
    date: '2019-05-03',
    text: '赵六',
    text1: 'aa',
    number: 151,
    textNoEdit: '另一段文字',
    selectValue: 4,
    selectName: '4龙须面',
  }];
Mock.mock('/getTableDataApi', 'post', options => {
    return {tableData}
  }
);
let lastTableId = 0;
let initLastTableId = false;
Mock.mock('/setTableDataApi', 'post', options => {
    let submitData = JSON.parse(options.body);
    if (!initLastTableId) {
      for (let row of tableData) {
        if (row.id !== undefined) {
          lastTableId = Math.max(lastTableId, row.id);
        }
      }
      initLastTableId = true
    }
    //增加
    submitData.add.forEach(row => {
      if (!row.id) {
        row.id = (++lastTableId);
      }
    });
    tableData.push(...submitData.add);
    //删除
    tableData = tableData.filter(row => {
      return submitData.delete.indexOf(row.id) === -1;
    });
    //修改
    for (let submitDataUpdateRow of submitData.update) {
      for (let tableDataRow of tableData) {
        if (tableDataRow.id === submitDataUpdateRow.id) {
          for (let key in submitDataUpdateRow) {
            if (submitDataUpdateRow.hasOwnProperty(key)) {
              tableDataRow[key] = submitDataUpdateRow[key];
            }
          }
        }
      }
    }

    return {result: true};
  }
);
