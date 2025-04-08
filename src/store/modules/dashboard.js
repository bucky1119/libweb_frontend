import {
  getArticleList,
  deleteArticle,
  updateArticle,
  rateArticle,
  getAverScore,
  getHistoryRate,
} from "@/api/dashboard";

const getState = () => {
  return {
    articleList: [],
    averageScore: {},
    ratingHist: [],
  };
};

const state = getState();

const mutations = {
  SET_ARTICLELIST: (state, articleList) => {
    state.articleList = articleList;
  },
  SET_AVERAGESCORE: (state, averageScore) => {
    state.averageScore = averageScore;
  },
  SET_RATINGHISTORY: (state, ratingHist) => {
    state.ratingHist = ratingHist;
  },
};

const actions = {
  // 获取文章列表
  getArticleList({ commit }, searchForm) {
    const {
      postAgency,
      startDate,
      endDate,
      title,
      author,
      text,
      nation,
      domain,
      subject,
      info_type,
      pageNumber,
      pageSize,
    } = searchForm;
    return new Promise((resolve, reject) => {
      getArticleList({
        postAgency: postAgency,
        startDate: startDate,
        endDate: endDate,
        title: title,
        author: author,
        text: text,
        nation: nation,
        domain: domain,
        subject: subject,
        info_type: info_type,
        pageNumber: pageNumber,
        pageSize: pageSize,
      })
        .then((response) => {
          const { data } = response;
          commit("SET_ARTICLELIST", data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // 删除文章
  deleteArticle({ commit }, articleId) {
    // const { id } = articleId;
    return new Promise((resolve, reject) => {
      deleteArticle(articleId)
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // 编辑文章
  updateArticle({ commit }, updateForm) {
    const {
      author,
      date,
      domain,
      id,
      infoType,
      linkUrl,
      nation,
      postAgency,
      subject,
      text,
      title,
    } = updateForm;
    return new Promise((resolve, reject) => {
      updateArticle(id, {
        author: author,
        date: date,
        domain: domain,
        id: id,
        infoType: infoType,
        linkUrl: linkUrl,
        nation: nation,
        postAgency: postAgency,
        subject: subject,
        text: text,
        title: title,
      })
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // 文章打分
  rateArticle({ commit }, rateForm) {
    const {
      expertId,
      articleId,
      create_tag,
      overturn_tag,
      frontier_tag,
      influence_tag,
      additional_tag,
    } = rateForm;
    return new Promise((resolve, reject) => {
      rateArticle(articleId, {
        disruptionScore: overturn_tag,
        expertId: expertId,
        frontierScore: frontier_tag,
        industryImpactScore: influence_tag,
        innovationScore: create_tag,
        additionalScore: additional_tag,
      })
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          console.error("评分提交失败:", error);
          reject(error);
        });
    });
  },

  // 获取文章平均分
  getAverScore({ commit }, id) {
    return new Promise((resolve, reject) => {
      getAverScore(id)
        .then((response) => {
          const { data } = response;
          commit("SET_AVERAGESCORE", data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  // 获取历史打分记录
  getHistoryRate({ commit }, id) {
    return new Promise((resolve, reject) => {
      getHistoryRate(id)
        .then((response) => {
          const { data } = response;
          commit("SET_RATINGHISTORY", data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  // 翻译文章标题
  async translateTitle({ commit }, { title, targetLanguage }) {
    // 假设使用后端的翻译 API 进行翻译
    const response = await this.$axios.post('/api/translate/title', { title, targetLanguage });
    return response; // 返回翻译后的内容
  },

  // 导出选中的文章
  async exportArticles({ commit }, { articleIds }) {
    const response = await this.$axios.get('/api/articles/export', {
      params: { articleIds: articleIds.join(',') },
      responseType: 'blob' // 设置响应类型为 blob，适用于文件下载
    });

    // 生成下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'articles.xlsx');
    document.body.appendChild(link);
    link.click();
  }


};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
