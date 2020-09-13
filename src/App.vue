<template>
  <div id="app">
    <div style="width:800px;margin:auto;">
      <div style="border:1px solid #ccc;padding:10px">
        <table-cell-edit/>
      </div>
      <div>
        <div>查看源码：</div>
        <div><a href="https://github.com/MissThee/elementui-table-cell-edit">https://github.com/MissThee/elementui-table-cell-edit</a></div>
      </div>
    </div>
  </div>
</template>

<script>
  import TableCellEdit from "./TableCellEdit";

  export default {
    name: 'App',
    components: {TableCellEdit},
    data() {
      return {};
    },
  };
</script>

