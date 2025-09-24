<template>
  <div class="app-container page-bg">
    <!-- 顶部平均价值度与各指标均值 -->
    <el-card shadow="never" class="top-card">
      <div class="top-line">
        <div class="value-label" v-if="valueScore.averageValueScore">平均价值度</div>
        <div class="value">{{ valueScore.averageValueScore ? formatScore(valueScore.averageValueScore) : '暂无评分' }}</div>
      </div>
      <div class="metrics-chips" v-if="hasAnyAverage">
        <div class="chip" v-if="valueScore.averageInnovationScore">创新度 {{ formatScore(valueScore.averageInnovationScore) }}</div>
        <div class="chip" v-if="valueScore.averageDisruptionScore">颠覆性 {{ formatScore(valueScore.averageDisruptionScore) }}</div>
        <div class="chip" v-if="valueScore.averageFrontierScore">前沿性 {{ formatScore(valueScore.averageFrontierScore) }}</div>
        <div class="chip" v-if="valueScore.averageIndustryImpactScore">产业影响 {{ formatScore(valueScore.averageIndustryImpactScore) }}</div>
        <div class="chip" v-if="valueScore.averageAdditionalScore">附加分 {{ formatScore(valueScore.averageAdditionalScore) }}</div>
      </div>
    </el-card>

    <el-row :gutter="20" class="content-row">
      <!-- 评分记录 -->
      <el-col :span="9">
        <el-card shadow="never" class="card">
          <div class="title-part">评分记录</div>
          <div class="list-wrapper">
            <el-scrollbar wrap-class="scrollbar-wrapper" class="scroll">
              <div v-if="valueList.length">
                <div v-for="(item, index) in valueList" :key="index" class="record-item">
                  <div class="user-info">
                    <div class="logo"></div>
                    <div class="username">{{ item.expertId }}</div>
                  </div>
                  <div class="value-part">
                    <div class="metric"><span>创新度</span><el-slider class="read-slider" v-model="item.innovationScore" :max="10" disabled /></div>
                    <div class="metric"><span>颠覆性</span><el-slider class="read-slider" v-model="item.disruptionScore" :max="10" disabled /></div>
                    <div class="metric"><span>前沿性</span><el-slider class="read-slider" v-model="item.frontierScore" :max="10" disabled /></div>
                    <div class="metric"><span>产业影响</span><el-slider class="read-slider" v-model="item.industryImpactScore" :max="10" disabled /></div>
                    <div class="metric"><span>附加分</span><el-slider class="read-slider" v-model="item.additionalScore" :max="10" disabled /></div>
                  </div>
                </div>
              </div>
              <div v-else class="empty">暂无记录</div>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>

      <!-- 文章评分 -->
      <el-col :span="15">
        <el-card shadow="never" class="card">
          <div class="title-part" style="cursor: pointer;">
            <span style="margin-right: 18px;">文章评分</span>
            <el-button type="text" @click="applyAverage" v-if="hasAnyAverage">一键填入平均值</el-button>
          </div>
          <el-form label-position="top" class="rate-form">
            <el-form-item label="创新度">
              <el-input-number v-model="rateForm.create_tag" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="颠覆性">
              <el-input-number v-model="rateForm.overturn_tag" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="前沿性">
              <el-input-number v-model="rateForm.frontier_tag" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="产业影响">
              <el-input-number v-model="rateForm.influence_tag" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="附加分">
              <el-input-number v-model="rateForm.additional_tag" :min="1" :max="10" />
            </el-form-item>
          </el-form>
          <div class="submit-row">
            <el-button class="btn" type="primary" @click="onSubmit">提交</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { valueList } from "@/utils/constant.js";
  import { getUserId } from '@/utils/auth'
  import { mapState } from 'vuex';
  export default {
    name: 'ArticleMark',
    computed: {
      ...mapState('dashboard', {
      ratingHist: state => state.ratingHist,
      averageScore: state => state.averageScore,
      })
      ,
      // 是否存在任一平均分
      hasAnyAverage () {
        const v = this.valueScore;
        return !!(v.averageValueScore || v.averageInnovationScore || v.averageDisruptionScore || v.averageFrontierScore || v.averageIndustryImpactScore || v.averageAdditionalScore)
      }
    },
    data ()
    {
      return {
        id: '',
        userId: '',
        valueScore: {
          
          averageDisruptionScore: 0,
          averageFrontierScore: 0,
          averageIndustryImpactScore: 0,
          averageInnovationScore: 0,
          averageValueScore: 0,
          averageAdditionalScore:0,
        },
        valueList: [],
        rateForm: {
          create_tag: 0,
          overturn_tag: 0,
          frontier_tag: 0,
          influence_tag: 0,
          additional_tag: 0,
          expertId: '',
          articleId: '',
        },
        settingDialog: false,
        
      }
    },
    methods: {
      // 分数格式化
      formatScore (n) {
        if (n === null || n === undefined || n === '') return ''
        const num = Number(n)
        if (Number.isNaN(num)) return ''
        return num.toFixed(1)
      },
      // 一键填入平均值
      applyAverage () {
        const a = this.valueScore
        if (a.averageInnovationScore) this.rateForm.create_tag = a.averageInnovationScore
        if (a.averageDisruptionScore) this.rateForm.overturn_tag = a.averageDisruptionScore
        if (a.averageFrontierScore) this.rateForm.frontier_tag = a.averageFrontierScore
        if (a.averageIndustryImpactScore) this.rateForm.influence_tag = a.averageIndustryImpactScore
        if (a.averageAdditionalScore) this.rateForm.additional_tag = a.averageAdditionalScore
      },
      // 评分信息初始化
      async init ()
      {
        // todo:查询价值度
        await this.getValue();
        // todo:查询评分记录
        await this.getRateHist();
      },
      // 提交评分
      onSubmit ()
      {
        // todo:修改并提交评分
        this.$store.dispatch('dashboard/rateArticle', this.rateForm).then(async () =>
        {
          await this.getValue();
          this.$message({
            text: '提交成功!',
            type: 'success'
          })
        }).catch(() =>
        {
          this.$message.error('提交失败，请稍后重试')
        })
      },
      // 查询价值度
      getValue ()
      {
        // todo:调用价值度接口
        this.$store.dispatch('dashboard/getAverScore', this.id).then(() =>
        {
          this.valueScore.averageValueScore = this.averageScore.averageValueScore;
          this.valueScore.averageDisruptionScore = this.averageScore.averageDisruptionScore;
          this.valueScore.averageFrontierScore = this.averageScore.averageFrontierScore;
          this.valueScore.averageIndustryImpactScore = this.averageScore.averageIndustryImpactScore;
          this.valueScore.averageInnovationScore = this.averageScore.averageInnovationScore;
          this.valueScore.averageAdditionalScore = this.averageScore.averageAdditionalScore;
          
          // 打分区展示平均分
          this.rateForm.create_tag = this.averageScore.averageInnovationScore;
          this.rateForm.overturn_tag = this.averageScore.averageDisruptionScore;
          this.rateForm.frontier_tag = this.averageScore.averageFrontierScore;
          this.rateForm.influence_tag = this.averageScore.averageIndustryImpactScore;
          this.rateForm.additional_tag = this.averageScore.averageAdditionalScore;
        })
      },
      // 查询评分记录
      getRateHist ()
      {
        // todo:调用评分记录接口
        this.$store.dispatch('dashboard/getHistoryRate', this.id).then(() =>
        {
          this.valueList = this.ratingHist;
        })
      },
      // 打开价值度指标设置弹窗
      handleRateSetting ()
      {
        this.settingDialog = true;
      },
      // 关闭弹窗
      handleClose (done)
      {
        this.$confirm('确认关闭？')
          .then(_ =>
          {
            done();
          })
          .catch(_ => { });
      }
    },
    created ()
    {
      this.id = this.$route.params.id;
      this.rateForm.articleId = this.$route.params.id;
      this.rateForm.expertId = getUserId();
      this.init()
    }
  }
  
</script>

<style scoped>
  .page-bg { background: #f6f7f2; min-height: 100vh; padding-bottom: 24px; }

  .top-card { margin-bottom: 16px; border-radius: 8px; }
  .top-line { display: flex; align-items: baseline; gap: 16px; }
  .value-label { font-size: 18px; font-weight: 600; color: #6c6c67; }
  .value { font-size: 40px; font-weight: 700; color: #327442; }
  .metrics-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .chip { background: #eef6ea; color: #2c6e3f; border: 1px solid #d7ead8; padding: 4px 10px; border-radius: 14px; font-size: 12px; }

  .content-row { margin-top: 8px; }
  .card { border-radius: 8px; }
  .title-part { color: #8a8a86; font-weight: 600; margin-bottom: 12px; }

  .list-wrapper { height: 520px; }
  .scroll { height: 100%; padding-right: 8px; }
  .record-item { padding: 8px 0 16px; border-bottom: 1px dashed #eee; }

  .user-info { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .logo { width: 36px; height: 36px; border-radius: 50%; background: #327442; }
  .username { color: #666; font-weight: 600; }

  .value-part { padding: 0 12px; }
  .metric { display: flex; align-items: center; gap: 10px; color: #9a9a96; }
  .metric > span { width: 64px; flex: 0 0 auto; }

  .rate-form { max-width: 420px; }
  .submit-row { display: flex; justify-content: flex-end; margin-top: 8px; }
  .btn { color: #fff; background: #327442; border-color: #327442; }

  .read-slider>>>.el-slider__runway { margin: 6px 0; height: 3px; width: 100%; }
  .read-slider>>>.el-slider__bar { height: 3px; }
  .read-slider>>>.el-slider__button-wrapper { top: -16; }
  .read-slider>>>.el-slider__button { width: 8px; height: 8px; }

  .empty { color: #aaa; text-align: center; padding: 48px 0; }
</style>