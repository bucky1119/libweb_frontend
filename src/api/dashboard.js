import request from "@/utils/request";

export function getArticleList(data) {
  return request({
    url: "/api/homepage",
    method: "post",
    data,
  });
}

export function deleteArticle(params) {
  return request({
    url: `/api/articles/${params}`,
    method: "delete",
    // params,
  });
}

export function updateArticle(params, data) {
  return request({
    url: `/api/articles/${params}`,
    method: "put",
    data,
  });
}

export function rateArticle(params, data) {
  return request({
    url: `/api/ratings/${params}`,
    method: "post",
    data,
  });
}

export function getAverScore(params) {
  return request({
    url: `/api/ratings/average/${params}`,
    method: "get",
  });
}

export function getHistoryRate(params) {
  return request({
    url: `/api/ratings/history/${params}`,
    method: "get",
  })

}

// 添加导出文章的接口，使用 GET 请求
export function exportArticlesToExcel(articleIds) {
  if (!articleIds || articleIds.length === 0) {
    return Promise.reject(new Error("No articles selected for export"));
  }
  
  const params = articleIds.join(",");
  return request({
    url: `/api/articles/export`,
    method: 'get',
    params: { articleIds: params },
    responseType: 'blob'
  });
}



// 翻译文章标题接口
export function translateTitle(title, targetLanguage) {
  return request({
    url: "/api/translate/title",
    method: "post",
    params: {
      title,
      targetLanguage,
    },
  });
}
