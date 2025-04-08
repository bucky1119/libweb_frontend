<template>
  <div class="dashboard-container">
    <el-row>
      
      <!-- 网站介绍 -->
      <div class="first-part">
        <div class="web-title">科学前沿港</div>
        <div class="web-title-en">Science Frontiers Hub</div>
      </div>

      <!-- 新闻列表展示区 -->
      <el-col :span="16">
        <!-- 搜索框 -->
        <div>
          <div>
            <i class="el-icon-search"></i>
            <span> 搜索您感兴趣的内容</span>
            <span style="float: right;">为您检索到{{total}}条记录</span>
          </div>
          <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="searchForm.text" @change="handleSearch">
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
            </el-input>
          </div>
        </div>
        <!-- 导出按钮 -->
        <div class="export-button-container" v-if="userToken">
          <el-button type="primary" @click="exportArticles" :disabled="!selectedArticles.length">
            导出选中的文章
          </el-button>
        </div>
        <!-- 新闻列表 -->
        <div class="article-container" v-loading="loading">
          <div v-for="item in tableList" :key="item.id" class="article-card">
            <!-- 选择框 -->
            <el-checkbox v-model="item.selected" v-if="userToken" @change="handleSelectionChange(item)">
              选择
            </el-checkbox>
            <div class="card-title">
              <!-- 原标题 -->
              <a :href="item.linkUrl" target="_blank">{{item.title}}</a>
            </div>
            <div class="card-title_cn" v-if="item.translatedTitle">
              <!-- 中文标题 -->
              {{ item.translatedTitle }}
            </div>
            <div class="card-tags">
              <!-- 日期、地区、机构、期刊名称 -->
              <span class="tag">{{item.date}}</span>
              <span class="tag">{{item.nation}}</span>
              <span class="tag">{{item.postAgency}}</span>
            </div>
            <div class="card-abstract">
              <!-- 摘要 -->
              {{item.text}}
            </div>
            <el-row class="card-actions">
              <el-col>
                <a :href="item.linkUrl" target="_blank" class="blue-text-underline">
                  read more
                </a>
              </el-col>
              <el-col>
                <span class="action2" @click="goMark(item.id)" v-if="userRole=='EXPERT' || userRole=='ADMIN' ||userRole=='LIBRARIAN'">
                  评分>>>
                </span>
                <span class="btn-del" @click="handleDelete(item.id)"
                  v-if="userRole=='LIBRARIAN' ||userRole=='ADMIN'">删除</span>
                <span class="btn-edit" @click="handleUpdate(item)"
                  v-if="userRole=='LIBRARIAN' ||userRole=='ADMIN'">编辑</span>
                  <!-- 翻译按钮 -->
                <el-button @click="handleTranslate(item)" type="text" class="btn-translate">翻译</el-button> 
              </el-col>
            </el-row>
          </div>
          <!-- 分页 -->
          <div>
            <el-pagination :current-page.sync="searchForm.pageNumber" :page-size="12" layout="prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </div>

      </el-col>
      <!-- 搜索区 -->
      <el-col :span="8">
        <div class="search-part">
          <el-card>
            <el-divider>更多搜索</el-divider>
            <!-- 操作按钮 -->
            <!-- <div class="action-btns">
            <el-button>重置</el-button>
            <el-button>查询</el-button>
          </div> -->
            <!-- 价值度、信息类型、发布机构、国家地区、年度、领域、学科 -->
            <div>
              <el-form label-position="left" ref="form" v-model="searchForm" label-width="80px">
                <el-form-item label="日期">
                  <el-date-picker v-model="daterange" type="daterange" align="right" unlink-panels range-separator="至" 
                  start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="标题">
                  <el-input v-model="searchForm.title"></el-input>
                </el-form-item>
                <el-form-item label="作者">
                  <el-input v-model="searchForm.author"></el-input>
                </el-form-item>
                <el-form-item label="发布机构">
                  <el-input v-model="searchForm.postAgency"></el-input>
                </el-form-item>
                <el-form-item label="国家地区">
                  <el-input v-model="searchForm.nation"></el-input>
                </el-form-item>
                <!-- <el-form-item label="近期文章">
                  <el-input></el-input>
                </el-form-item> -->
                <!-- 点击组件 -->
                <el-form-item label="信息类型" v-if="typeList.length">
                  <el-radio-group v-model="searchForm.info_type" @click.native="pendingRes_type($event)">
                    <el-radio v-for="item in typeList" :key="item.value" 
                    :label="item.value">{{item.label}}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="学科" v-if="subjectList.length">
                  <el-radio-group v-model="searchForm.subject" @click.native="pendingRes_subject($event)">
                    <el-radio v-for="item in subjectList" :key="item.value"
                      :label="item.value">{{item.label}}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="领域" v-if="domainList.length">
                  <el-radio-group v-model="searchForm.domain" @click.native="pendingRes_domain($event)">
                    <el-radio v-for="item in domainList" :key="item.value" 
                    :label="item.value">{{item.label}}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>

      </el-col>
    </el-row>
    <!-- 编辑文章弹窗 -->
    <el-dialog title="编辑" :visible.sync="updateDialog" width="80%" :before-close="handleClose">
      <div>
        <el-form ref="updateForm" :model="updateForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="updateForm.title"></el-input>
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="updateForm.author"></el-input>
          </el-form-item>
          <el-form-item label="发布机构">
            <el-input v-model="updateForm.postAgency"></el-input>
          </el-form-item>
          <el-form-item label="网址">
            <el-input v-model="updateForm.linkUrl"></el-input>
          </el-form-item>
          <el-form-item label="国家地区">
            <el-input v-model="updateForm.nation"></el-input>
          </el-form-item>
          <el-form-item label="信息类型" v-if="typeList.length">
            <el-radio-group v-model="updateForm.infoType">
              <el-radio v-for="item in typeList" :key="item.value" :label="item.value">{{item.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="领域" v-if="domainList.length">
            <el-radio-group v-model="updateForm.domain">
              <el-radio v-for="item in domainList" :key="item.value" :label="item.value">{{item.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="学科" v-if="subjectList.length">
            <el-radio-group v-model="updateForm.subject">
              <el-radio v-for="item in subjectList" :key="item.value" :label="item.value">{{item.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- <el-form-item label="正文">
            <el-input v-model="updateForm.text" type="text"></el-input>
          </el-form-item> -->
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateArticle">提 交</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
  import { mapGetters,mapState } from 'vuex'
  import { typeList, domainList, subjectList } from "@/utils/constant.js";
  import { convertDateToISO, param2Obj } from '@/utils/index.js';
  import { getRole } from "@/utils/auth";
  import { getArticleList, deleteArticle, updateArticle, rateArticle, getAverScore, 
  getHistoryRate, exportArticlesToExcel, translateTitle } from '@/api/dashboard'; // 确保导入了所有需要的函数
  import { saveAs } from 'file-saver';
  import Vue from 'vue';

  export default {
    name: 'Dashboard',
    computed: {
      ...mapState({
      userToken: state => state.user.token // 获取用户登录状态的 token
    }),
      ...mapGetters([
        'articleList'
      ])
    },
    data ()
    {
      return {
        userRole: '',
        loading: false,
        daterange: '',
        // date: '',
        typeList: typeList,
        domainList: domainList,
        subjectList: subjectList,
        searchForm: {
          postAgency: '',
          startDate: '',
          endDate: '',
          title: '',
          author: '',
          text: '',
          info_type: '',
          nation: '',
          domain: '',
          subject: '',
          pageNumber: 1,
          pageSize: 12,
        },
        total: 0,
        tableList: [],
        updateDialog: false,
        updateForm: {
          id: '',
          postAgency: '',
          title: '',
          author: '',
          text: '',
          infoType: '',
          nation: '',
          domain: '',
          subject: '',
          date: '',
          linkUrl: '',

        },
        selectedArticles: [], // 选中的文章数组
        // 最近日期快捷选项
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          },{
            text: '最近半年',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
              picker.$emit('pick', [start, end]);
            }
          },{
            text: '最近一年',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
      }
    },

    // 监听搜索表单，表单字段值修改即触发查询，更新数据
    watch: {
      "searchForm.author":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          // 实现input连续输入，只发一次请求
          clearTimeout(this.timeout)
          this.timeout = setTimeout(() =>
          {
            if (newVal != oldVal) {
              this.handleSearch()
            }
          }, 500)
        }
      },
      "searchForm.title":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          // 实现input连续输入，只发一次请求
          clearTimeout(this.timeout)
          this.timeout = setTimeout(() =>
          {
            if (newVal != oldVal) {
              this.handleSearch()
            }
          }, 500)
        },
      },
      "searchForm.postAgency":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          // 实现input连续输入，只发一次请求
          clearTimeout(this.timeout)
          this.timeout = setTimeout(() =>
          {
            if (newVal != oldVal) {
              this.handleSearch()
            }
          }, 500)
        }
      },
      "searchForm.nation":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          // 实现input连续输入，只发一次请求
          clearTimeout(this.timeout)
          this.timeout = setTimeout(() =>
          {
            if (newVal != oldVal) {
              this.handleSearch()
            }
          }, 500)
        }
      },
      daterange (newVal, oldVal)
      {
        if (newVal) {
          if (newVal.length || newVal != oldVal) {
            this.searchForm.startDate = convertDateToISO(newVal[0]);
            this.searchForm.endDate = convertDateToISO(newVal[1]);
            this.handleSearch();
          }
        } else {
          this.searchForm.startDate = '';
          this.searchForm.endDate = '';
          this.handleSearch();
        }
      },
      "searchForm.info_type": 
      {
        deep: true,
        handler (newVal, oldVal)
        {
          if (newVal || newVal != oldVal) {
            this.handleSearch();
          }
        }
      },
      "searchForm.subject":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          if (newVal || newVal != oldVal) {
            this.handleSearch();
          }
        }
      },
      "searchForm.domain":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          if (newVal || newVal != oldVal) {
            this.handleSearch();
          }
        }
      },
      "searchForm.pageNumber":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          if (newVal || newVal != oldVal) {
            this.handleSearch();
          }
        }
      },
      "searchForm.pageSize":
      {
        deep: true,
        handler (newVal, oldVal)
        {
          if (newVal || newVal != oldVal) {
            this.handleSearch();
          }
        }
      },
    },

    methods: {
      // 处理文章选择
      handleSelectionChange(item) {
        if (item.selected) {
          if (!this.selectedArticles.includes(item.id)) {
            this.selectedArticles.push(item.id);
          }
        } else {
          this.selectedArticles = this.selectedArticles.filter(id => id !== item.id);
        }
      },

      // 导出选中的文章
    async exportArticles() {
      try {
        // 调用接口获取导出的文件数据
        const response = await exportArticlesToExcel(this.selectedArticles, {
        responseType: 'blob' // 确保响应类型设置为 Blob
        });
        // 检查 response 是否包含数据
        if (response && response.data) {
          // 打印接收到的响应（用于调试）
          console.log("Export response: ", response);

          // 创建一个 Blob 对象，将 response 数据作为 Blob 的内容
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          // // 使用 file-saver 库保存文件到本地，指定文件名
          // saveAs(blob, "exported_articles.xlsx");

          // 使用 window.URL.createObjectURL 创建下载 URL
          const downloadUrl = window.URL.createObjectURL(blob);
          // 创建一个 <a> 标签，并设置其 href 为 Blob 的 URL
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', 'exported_articles.xlsx'); // 设置下载文件的名称
          // 将链接加入到 DOM 中，然后模拟点击，最后移除链接
          document.body.appendChild(link);
          link.click();

          // 移除链接，释放资源
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl); // 释放内存

          // 显示成功消息
          this.$message.success('文章导出成功！');
        } else {
          throw new Error('导出失败，未收到有效数据');
        }
      } catch (error) {
        // 错误处理，显示错误消息
        console.error('导出文章出错:', error);
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误响应状态:', error.response.status);
        }
        this.$message.error('导出失败，请稍后再试');
      }
    },

      // 翻译文章标题
      async handleTranslate(item) {
        try {
          // 单独传递参数 title 和 targetLanguage
          const response = await translateTitle(item.title, 'zh'); 
          // 使用 Vue.set 来确保属性是响应式的
          Vue.set(item, 'translatedTitle', response.data);
          this.$message({
            type: 'success',
            message: '翻译成功！'
          });
        } catch (error) {
          this.$message({
            type: 'error',
            message: '翻译失败，请稍后再试'
          });
        }
      },

      // 文章列表初始化
      async init() {
        await this.getArticles();
      },

      // 获取文章列表
      async getArticles() {
        this.loading = true;  // 请求开始前设置 loading 为 true
        try {
          const response = await getArticleList(this.searchForm);
          this.tableList = response.data.records;
          this.total = response.data.total;
        } catch (error) {
          console.error('获取文章列表出错:', error);
          this.$message.error('加载文章列表失败，请稍后重试');
        } finally {
          this.loading = false;  // 请求结束后设置 loading 为 false，不论成功或失败
        }
      },

      // 点击搜索
      async handleSearch() {
        await this.getArticles();
      },

      // 删除文章
      async handleDelete(id) {
        try {
          await deleteArticle(id);
          this.$message.success('删除成功!');
          this.handleSearch();
        } catch (error) {
          this.$message.error('删除失败，请稍后再试');
        }
      },

      // 编辑文章
      async updateArticle() {
        try {
          await updateArticle(this.updateForm.id, this.updateForm);
          this.$message.success('更新成功!');
          this.updateDialog = false;
          this.handleSearch();
        } catch (error) {
          this.$message.error('更新失败，请稍后再试');
        }
      },

      // 点击编辑
      handleUpdate(item) {
        this.updateDialog = true;
        this.updateForm = { ...item };
      },

      // 关闭弹窗
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => { });
      },

      // 点击评分，跳转至评分页面
      goMark(id) {
        this.$router.push(`/articleMark/${id}`);
      }
    },

    created() {
      this.init();
      this.userRole = getRole();
    }
  }
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 20px 68px;
    }
  }

  .first-part {
    display: flex;
    height: 160px;
    padding: 100px 20px 12px 20px;
    background-color: #327442;
    margin-bottom: 18px;

    .web-title {
      font-size: 40px;
      color: white;
      font-weight: 800;
    }

    .web-title-en {
      margin-left: 18px;
      font-size: 32px;
      color: #dcd8a3;
      font-weight: 400;
      align-content: end;
      padding-left: 10px;
      border-left-style: solid;
    }
  }

  .article-container {
    margin-top: 18px;
  }

  .article-card {
    margin-bottom: 20px;
    background: #c9e0bf;
    transition-duration: 0.5s;
    padding: 18px;
    border-radius: 2px;
  }

  .article-card:hover {
    -webkit-box-shadow: #ccc 0px 10px 10px;
    -moz-box-shadow: #ccc 0px 10px 10px;
    box-shadow: #ccc 0px 10px 10px;
  }

  .card-title {
    margin-bottom: 8px;
  }

  .card-title:hover {
    color: #409EFF;
    text-decoration: underline;
  }

  .card-title_cn {
    margin-bottom: 8px;
    font-weight: 200;
  }

  .card-tags {
    margin-bottom: 12px;
  }

  .tag {
    background-color: #919392;
    color: white;
    padding: 5px;
    font-size: 12px;
    border-radius: 10px;
    margin-right: 12px;
  }

  .card-abstract {
    margin-bottom: 12px;
    border-left-style: solid;
    padding-left: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }

  .card-actions {
    display: flex;
  }

  .action2 {
    float: right;
    cursor: pointer;
  }

  .btn-edit {
    float: right;
    cursor: pointer;
    color: #409EFF;
    margin-right: 20px;
  }

  .btn-del {
    float: right;
    cursor: pointer;
    color: red;
    margin-right: 20px;
  }

  .blue-text-underline {
    color: #409EFF;
    /* 设置字体颜色为蓝色 */
    text-decoration: underline;
    /* 添加下划线 */
    cursor: pointer;
  }

  .search-part {
    margin-left: 12px;
    padding: 12px 0 0 12px;
    /* margin-top: 12px; */
  }

  .action-btns {
    width: 100%;
    margin-bottom: 20px;
    text-align: right;
  }

  .el-date-editor--daterange.el-input__inner {
    width: 100%;
  }
</style>