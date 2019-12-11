#简介

> 使用vue-cli3、webpack4、elementui构建的简单系统管理页面  
> 可配合后台项目https://github.com/MissThee/springboot-mybatisplus-security-jwt-restful使用，是其项目中已包含的页面的源码
##项目结构
```
src
│  App.vue
│  main.js
│
├─api    //axios请求方法
│      data-dictionary-api.js
│      home-api.js
│      letter-clue-api.js
│      letter-clue-review-api.js
│      login-api.js
│      permission-api.js
│      role-api.js
│      unit-api.js
│      user-api.js
│
├─assets    //资源目录
│  │  logo.png
│  │
│  ├─css
│  │      custom.css
│  │      style.css
│  │
│  └─img
│      │  cipher.png
│      │  index.js
│      │  user.png
│      │  userAvatar.png
│      │
│      └─file-icon
│              excel.png
│              file-icon.js
│              icon7z.png
│              other.png
│              pdf.png
│              ppt.png
│              rar.png
│              tar.png
│              txt.png
│              word.png
│              wps.png
│              zip.png
│
├─router    //vue-router配置
│      index.js
│      routes.js
│
├─store    //vuex
│  │  getters.js
│  │  index.js
│  │  mutation-types.js
│  │
│  ├─actions
│  │      index.js
│  │
│  └─modules
│          home.js
│          index.js
│
├─utils    //通用工具
│      cascader-utils.js
│      cookies.js
│      global.js
│      operation-result-message.js
│      request.js
│
└─views    //页面文件
    │  Home.vue
    │  Login.vue
    │
    └─content
        ├─common    //通用
        │  │  Breadcrumb.vue    //面包屑
        │  │
        │  ├─Sidebar    //侧边栏
        │  │      index.vue
        │  │      SidebarItem.vue
        │  │
        │  └─TagsBar    //页签
        │      │  index.vue
        │      │
        │      └─ScrollPane
        │              index.vue
        │
        ├─homepage    //首页
        │      HomePage.vue
        │
        ├─letter    //表单测试
        │      LetterClue.vue
        │      LetterClueClassify.vue
        │
        └─systemManagement    //系统管理
            │  DataDictionary.vue    //数据字典（可影响LetterClue表单中下拉菜单内容）
            │  Role.vue    //角色管理
            │  User.vue    //用户管理
            │
            ├─Permission    //权限管理
            │      Index.vue
            │      PermissionDialog.vue
            │
            └─Unit    //单位管理
                    Index.vue
                    UnitDialog.vue
```
