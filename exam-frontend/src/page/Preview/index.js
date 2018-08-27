import React from 'react';
import { Icon, Radio, Checkbox, Input, Button } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import './index.scss';
import $ from "jquery";
class PreviewContainer extends React.Component{

  state = {
    title: '商务知识管理',
    count: 20,
    total_grade: 100,
    pass_grade: 60,
    description: 'kdsfskdsfsldfksdfsdlfksdjflksdfskldfjsldfksdsldfksdlfkdsjflksdfsjdlkfldsfjskdsfsldfksdfsdlfksdjflksdfskldfjsldfksdsldfksdlfkdsjflksdfsjdlkfldsfjskdsfsldfksdfsdlfksdjflksdfskldfjsldfksdsldfksdlfkdsjflksdfsjdlkfldsfjskdsfsldfksdfsdlfksdjflksdfskldfjsldfksdsldfksdlfkdsjflksdfsjdlkfldsfjskdsfsldfksdfsdlfksdjflksdfskldfjsldfksdsldfksdlfkdsjflksdfsjdlkfldsfjsldfksdfsdlfksdjflksdfskldfjsldfksdsldfksdlfkdsjflksdfsjdlkfldsfjs',
    question: [],
    results: [
      {
          "markdown": "<problem>\n  <p>关于大数据特点下列陈述不正确的是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"关于大数据特点下列陈述不正确的是：\" type=\"MultipleChoice\">\n      <choice correct=\"false\">数据量大</choice>\n      <choice correct=\"false\">增长速度快</choice>\n      <choice correct=\"true\">价值密度高</choice>\n      <choice correct=\"false\">数据类型多样化</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>价值密度高不正确。价值密度低是大数据的特点，因为大量的数据往往掩盖了真正有用的信息。</p>\n    </div>\n  </solution>\n  <p>阅读百度文库上关于计算机存储容量计算单位换算的文章，请点击 <a href=\"http://wenku.baidu.com/link?url=nK0tD8yvoIG4XcqwAM0MZiLuULQqgkqW95T_SEW5wI0A1ejvJonwRo8h8rmgNGOp-GSeNg795WLDb5XoYvTNlJqxMc-ykIPE6OWpKcyVYY_ \" target=\"_blank\"><font color=\"blue\">“链接”</font></a>阅读文章。</p>\n  <p>如果1兆字节（MB）约相当于1本40万字的长篇小说电子书的容量，那么1泽字节（ZB）约相当于多少本这样的电子书的容量？\n</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"阅读百度文库上关于计算机存储容量计算单位换算的文章（http://wenku.baidu.com/link?url=nK0tD8yvoIG4XcqwAM0MZiLuULQqgkqW95T_SEW5wI0A1ejvJonwRo8h8rmgNGOp-GSeNg795WLDb5XoYvTNlJqxMc-ykIPE6OWpKcyVYY_）。 如果1兆字节（MB）约相当于1本40万字的长篇小说电子书的容量，那么1泽字节（ZB）约相当于多少本这样的电子书的容量？ \" type=\"MultipleChoice\">\n      <choice correct=\"false\">一百万</choice>\n      <choice correct=\"false\">十亿</choice>\n      <choice correct=\"false\">一万亿</choice>\n      <choice correct=\"true\">一千万亿</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>1ZB等于\\(2^{50}\\) （约\\(10^{15}\\)）MB。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@915e0a76b7aa457f8cf616284bbfba32",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>下列关于大数据的说法正确的是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"下列关于大数据的说法正确的是：\" type=\"MultipleChoice\">\n      <choice correct=\"false\">噪声的存在降低了提取数据有效信息的要求。</choice>\n      <choice correct=\"true\">应用分布式架构可以对大数据进行存储、查询和更新。</choice>\n      <choice correct=\"false\">大数据包括文本、数字、图片等结构化数据和音频、视频等非结构化数据。</choice>\n      <choice correct=\"false\">因为大数据价值密度很高，所以才掀起大数据分析处理技术的进步。</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>因为噪声的存在，所以对于提取数据背后的有效信息提出了更高的要求；文本属于非结构化数据；大数据的价值密度低，因为大量的数据掩盖了真正有用的信息。</p>\n    </div>\n  </solution>\n  <p>2016年全球数据总量为12____。</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"2016年全球数据总量为12____。\" type=\"MultipleChoice\">\n      <choice correct=\"true\">ZB</choice>\n      <choice correct=\"false\">EB</choice>\n      <choice correct=\"false\">PB</choice>\n      <choice correct=\"false\">TB</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>2016年全球数据总量为12ZB。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@54d11b7842234e57af9c4c8832d4a1e5",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>噪声的存在对大数据的影响是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"噪声的存在对大数据的影响是：\" type=\"MultipleChoice\">\n      <choice correct=\"false\">增加了大量非结构化数据。</choice>\n      <choice correct=\"false\">降低了数据的存储速度。</choice>\n      <choice correct=\"false\">增加了数据的多样性，使数据更加复杂。</choice>\n      <choice correct=\"true\">获取数据的有效信息难度更大。</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>噪声的存在对通过数据分析提取数据背后的规律和有效性提出了更高的要求，因此获取有效信息的难度更大。</p>\n    </div>\n  </solution>\n  <p>下列大数据存储单位由小到大排列正确的是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"下列大数据存储单位由小到大排列正确的是：\" type=\"MultipleChoice\">\n      <choice correct=\"false\">ZB＜PB＜EB＜GB</choice>\n      <choice correct=\"false\">GB＜EB＜TB＜PB</choice>\n      <choice correct=\"true\">TB＜PB＜EB＜ZB</choice>\n      <choice correct=\"false\">GB＜TB＜EB＜PB</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>GB＜TB＜PB＜EB＜ZB，为正确排序，依次相差\\(2^{10}\\)倍。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@8193535f24564ac1a17b0e3c0214a8fd",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>下列大数据存储单位由小到大排列正确的是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"下列大数据存储单位由小到大排列正确的是：\" type=\"MultipleChoice\">\n      <choice correct=\"true\">TB＜PB＜ZB＜YB </choice>\n      <choice correct=\"false\">ZB＜PB＜YB＜GB</choice>\n      <choice correct=\"false\">GB＜EB＜ZB＜PB</choice>\n      <choice correct=\"false\">GB＜TB＜EB＜PB</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>GB＜TB＜PB＜EB＜ZB，为正确排序，依次相差\\(2^{10}\\)倍。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@bbd27105cb3646f3ac6fc7ab547608e3",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>造成数据增长的主要原因，以下说法正确的是：</p>\n  <choiceresponse>\n    <checkboxgroup label=\"造成数据增长的主要原因，以下说法正确的是：\">\n      <choice correct=\"true\">传感器自动生成的诊断信息产生的海量数据需要实时存储和处理。</choice>\n      <choice correct=\"false\">移动电话、社交媒体和用于医疗诊断的影像技术等新业务产生大量的结构化和半结构化数据。</choice>\n      <choice correct=\"false\">企业数据存储库中的数据越来越庞大。</choice>\n      <choice correct=\"true\">基因测序工程是增长最快的数据源之一。</choice>\n    </checkboxgroup>\n  </choiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>移动电话、社交媒体和用于医疗诊断的影像技术等新业务产生大量的数据主要是视频、音频、文字、图片等，属于非结构化数据；大数据增长的主要来源是移动传感器、社交媒体、医学影像、基因测序、视频监控等等，企业数据存储库主要用于企业内部的报表存储分析，不属于数据增长的主要原因。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "choiceresponse",
          "id": "hello+hello+20180101+type@problem+block@d2960a93d52e49b0a87cc845a6984011",
          "name": "多选题"
      },
      {
          "markdown": "<problem>\n  <p>阅读百度文库上关于计算机存储容量计算单位换算的文章，请点击 <a href=\"http://wenku.baidu.com/link?url=nK0tD8yvoIG4XcqwAM0MZiLuULQqgkqW95T_SEW5wI0A1ejvJonwRo8h8rmgNGOp-GSeNg795WLDb5XoYvTNlJqxMc-ykIPE6OWpKcyVYY_ \" target=\"_blank\"><font color=\"blue\">“链接”</font></a>阅读文章。</p>\n  <p>如果1兆字节（MB）约相当于1本40万字的长篇小说电子书的容量，那么1太字节（1TB）约相当于多少本这样的电子书的容量？\n</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"阅读百度文库上关于计算机存储容量计算单位换算的文章（http://wenku.baidu.com/link?url=nK0tD8yvoIG4XcqwAM0MZiLuULQqgkqW95T_SEW5wI0A1ejvJonwRo8h8rmgNGOp-GSeNg795WLDb5XoYvTNlJqxMc-ykIPE6OWpKcyVYY_）。 如果1兆字节（MB）约相当于1本40万字的长篇小说电子书的容量，那么1泽字节（ZB）约相当于多少本这样的电子书的容量？ \" type=\"MultipleChoice\">\n      <choice correct=\"true\">一百万</choice>\n      <choice correct=\"false\">十亿</choice>\n      <choice correct=\"false\">一万亿</choice>\n      <choice correct=\"false\">一千万亿</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>1TB等于\\(2^{20}\\) （约\\(10^{6}\\)）MB。</p>\n    </div>\n  </solution>\n  <p>关于大数据特点下列陈述不正确的是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"关于大数据特点下列陈述不正确的是：\" type=\"MultipleChoice\">\n      <choice correct=\"false\">麦肯锡发布的全球报告说大数据是具有大规模、分布式、多样性、和/或时效性的数据。</choice>\n      <choice correct=\"true\">数据的增长越来越结构化。</choice>\n      <choice correct=\"false\">对于LinkIn和Facebook这类公司，数据本身就是其主要的产品。</choice>\n      <choice correct=\"false\">大数据中增长最快的数据源是社交媒体和基因测序。</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>数据的增长越来越非结构化，包括音频、图像、视频、文本等等，绝大多数数据都是非结构化数据。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@dd756d210573403b98cd8962ad601f02",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>对于课程中Target（塔吉特）的案例，可以推测建立的怀孕预测模型使用以下哪种历史数据筛选指示顾客怀孕的商品？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"对于课程中Target（塔吉特）的案例，可以推测建立的怀孕预测模型使用以下哪种历史数据筛选指示顾客怀孕的商品？\" type=\"MultipleChoice\">\n      <choice correct=\"false\">所有女性顾客的消费记录</choice>\n      <choice correct=\"false\">所有已婚顾客的消费记录</choice>\n      <choice correct=\"false\">所有顾客的消费记录</choice>\n      <choice correct=\"true\">所有孕妇的消费记录</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>模型根据所有孕妇的消费记录识别出孕妇经常购买的商品和不同孕期会购买的特殊商品，这样就可以根据某位消费者的消费记录与模型的匹配程度判断其是否怀孕并预测预产期。</p>\n    </div>\n  </solution>\n  <p>沃尔玛在飓风到来前向飓风沿途连锁商店配送大量啤酒和草莓味果塔饼干，其决策背后的主要依据是什么？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"沃尔玛在飓风到来前向飓风沿途连锁商店配送大量啤酒和草莓味果塔饼干，其决策背后的主要依据是什么？\" type=\"MultipleChoice\">\n      <choice correct=\"false\">直觉和经验</choice>\n      <choice correct=\"true\">数据驱动决策</choice>\n      <choice correct=\"false\">市场供需关系</choice>\n      <choice correct=\"false\">竞争对手的策略</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>沃尔玛根据历史数据发现飓风沿途连锁商店的啤酒和草莓味果塔饼干销量明显上升，因此数据驱动决策选项正确。</p>\n    </div>\n  </solution>\n  <p>以下哪一项是数据驱动决策的应用？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"以下哪一项是数据驱动决策的应用？\" type=\"MultipleChoice\">\n      <choice correct=\"true\">根据历史数据进行相似分析，筛选流失可能性高的顾客，有针对性地采取措施防止顾客流失。</choice>\n      <choice correct=\"false\">降价促销，以更低价格的商品吸引消费者。</choice>\n      <choice correct=\"false\">通过在媒体和网站上投放广告，增加品牌曝光率以拓展市场。</choice>\n      <choice correct=\"false\">提高服务效率，缩短服务时间，以更加人性化的服务防止顾客流失。</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>应用数据驱动决策防止顾客流失的常见做法是根据历史数据预测顾客流失的概率，识别其中可能流失的顾客，再采取针对性的措施。其它三项并不是数据驱动决策的应用。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@2063abde5edf48d486aef954116675fa",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>沃尔玛应用数据驱动决策技术，通过分析飓风来临前的销售数据，筛选需求显著上升的商品，以提高恶劣气象发生时的供应量。以下哪一种结果的发现可能出乎沃尔玛的“意料”？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"沃尔玛应用数据驱动决策技术,通过分析飓风来临前的销售数据，筛选需求显著上升的商品,以提高恶劣气象发生时的供应量。以下哪一种结果的发现可能出乎沃尔玛的“意料”？\" type=\"MultipleChoice\">\n      <choice correct=\"false\">飓风来临前手电筒的日销量是平时的三倍。</choice>\n      <choice correct=\"false\">飓风来临前瓶装矿泉水的销量是平时的四倍。</choice>\n      <choice correct=\"true\">飓风来临前草莓味果塔饼干的销量是平时的七倍。</choice>\n      <choice correct=\"false\">飓风来临前家用柴油发电机的销量是平时的八倍。</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>极端气象来临前对手电筒、矿泉水和发电机的需求增加比较好理解。而草莓味果塔饼干的销量上升是基于数据分析的发现，很难通过逻辑推理作出预判。</p>\n    </div>\n  </solution>\n  <p>下列哪一项不是数据支持决策自动化带来的益处？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"下列哪一项不是数据支持决策自动化带来的益处？\" type=\"MultipleChoice\">\n      <choice correct=\"false\">可加快交易处理，提高决策效率。</choice>\n      <choice correct=\"false\">大量历史记录使决策更加准确。</choice>\n      <choice correct=\"false\">实时数据可以使决策更具时效性。</choice>\n      <choice correct=\"true\">降低存储大规模数据的必要。</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>数据处理可以对订单进行自动评估，判断是否进行交易并且使得交易流程自动化，提高效率；数据驱动决策是基于数据而不是经验和直觉作出决策，所以更加准确；运用实时数据可以减少其它数据无法评估的不确定性，从而使决策更有针对性、时效性。</p>\n    </div>\n  </solution>\n  <p>对于课程中塔吉特（Target）案例，可以推测“孕妇预测”模型的目标变量是：</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"对于课程中塔吉特（Target）案例，可以推测“孕妇预测”模型的目标变量是：\" type=\"MultipleChoice\">\n      <choice correct=\"false\">顾客是否是“Target宝宝健康中心”的注册会员</choice>\n      <choice correct=\"true\">顾客是否怀孕</choice>\n      <choice correct=\"false\">顾客是否购买无香精的洗剂和维生素片</choice>\n      <choice correct=\"false\">购买孕妇装的顾客的特点</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>在课程案例中，“孕妇预测”模型用于预测某位顾客是否怀孕并估计预产期，所以目标变量是“顾客是否怀孕”。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@533e6b9ea6fb4066bfb6c5659da4e36a",
          "name": "单选题"
      },
      {
          "markdown": "<problem>\n  <p>运用存储、查询、更新及处理技术对大数据进行必要的操作，这属于数据工程的范畴。</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"运用存储、查询、更新及处理技术对大数据进行必要的操作，这属于数据工程的范畴。\" type=\"MultipleChoice\">\n      <choice correct=\"true\">对</choice>\n      <choice correct=\"false\">错</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>在企业数据处理与分析流程中，对大数据进行具体的操作属于数据工程和处理的范畴，因此该命题正确。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@9694416317e5464c8114918912f28c7f",
          "name": "判断题"
      },
      {
          "markdown": "<problem>\n  <p>沃尔玛通过分析飓风来临前的销售数据发现啤酒是销路最好的商品，因此在恶劣气象发生前会对受影响地区的连锁商店增加啤酒的配送量。以下哪种说法是对这种决策的正确描述？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"沃尔玛通过分析飓风来临前的销售数据发现啤酒是销路最好的商品，因此在恶劣气象发生前会对受影响地区的连锁商店增加啤酒的配送量。以下哪种说法是对这种决策的正确描述？\" type=\"MultipleChoice\">\n      <choice correct=\"false\">根据直觉和经验作出决策</choice>\n      <choice correct=\"false\">利用客户关系管理增加销售</choice>\n      <choice correct=\"true\">数据驱动决策的应用</choice>\n      <choice correct=\"false\">利用价格调节需求</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>沃尔玛通过分析历史数据对需求进行预测，以达到增加销售的目的。因此数据驱动决策选项正确。</p>\n    </div>\n  </solution>\n  <p>对于课程中美国运通（Amex）的案例，可以推测“顾客流失预测”模型的目标变量是</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"对于课程中美国运通（Amex）的案例，可以推测“顾客流失预测”模型的目标变量是\" type=\"MultipleChoice\">\n      <choice correct=\"true\">顾客是否流失</choice>\n      <choice correct=\"false\">顾客是否搬家</choice>\n      <choice correct=\"false\">顾客是否不再继续缴纳会员费用</choice>\n      <choice correct=\"false\">购物频率明显降低的顾客的特点</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>在课程案例中，“顾客流失预测”模型用来预测顾客流失的可能性，从而有充分的时间采取措施，挽留客户。所以目标变量是“顾客是否流失”。</p>\n    </div>\n  </solution>\n</problem>\n",
          "type": "multiplechoiceresponse",
          "id": "hello+hello+20180101+type@problem+block@e08c4d4357db4f52a9aa32de51f7a70d",
          "name": "单选题"
      }
    ]
  }

  componentDidMount() {
    // 获取试卷id
    // 获取编辑的试卷信息及题目ids

    /*
    question: [
      {
        type: 'radio',
        title: '要坚持看电视来减肥开始的法律是开发商的垃圾分类是的借款发生了地方看电视了______上课了的分解落实到焚枯食淡要坚持看电视来减肥开始的法律是开发商的垃圾分类是的借款发生了地方看电视了______上课了的分解落实到焚枯食淡要坚持看电视来减肥开始的法律是开发商的垃圾分类是的借款发生了地方看电视了______上课了的分解落实到焚枯食淡',
        grade: 5,
        options: ['时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是时空裂缝但是', '是否考虑的时刻', '上刊登了丰盛的', '放得开酸辣粉']
      }
    */
    // 解析xml
    const { results } = this.state;
    let xmlDoc = null;
    let arr = [];

    const domParser = new DOMParser();
    for (let i = 0; i < results.length; i++){

      xmlDoc = domParser.parseFromString(results[i].markdown, 'text/xml');
      const list = xmlDoc.childNodes[0].childNodes;
      for (let j = 0; j < list.length; j++){

        if (list[j].nodeName === 'multiplechoiceresponse' || list[j].nodeName === 'choiceresponse'){

          // 确定题目
          arr.push({
            title: list[j].childNodes[1].getAttribute('label'),
            type: results[i].type,
            grade: 5,
            options:[],
          });
          // arr[arr.length - 1].title = list[j].childNodes[1].getAttribute('label');
          // console.log(list[j])
          // console.log(list[j].childNodes[1].childNodes);

          // 确定选项
          const optionsElem = list[j].childNodes[1].childNodes;
          for (let k = 0; k < optionsElem.length; k++){
            if (optionsElem[k].nodeName === 'choice') {
              console.log(optionsElem[k].innerHTML)
              arr[arr.length - 1].options.push(optionsElem[k].innerHTML)
            }
          }
        }
      }
    }
    console.log(arr)
    this.setState({
      question: arr,
    })


    // 监听打印机事件
    const that = this;
    var beforePrint = function() {
    };

    var afterPrint = function() {
      that.setPrinting(false)
    };

    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(function(mql) {
        if (mql.matches) {
          beforePrint();
        } else {
          afterPrint();
        }
      });
    }

    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
  }

  setPrinting = (printing) => {
    if (printing) {
      $('.header').hide();
      $('.footer').hide();
      $('.print-btn').hide();
      window.print();
    } else {
      $('.header').show();
      $('.footer').show();
      $('.print-btn').show();
    }

  }

  backToTop() {
    $("html,body").animate({scrollTop:0},500)
  }

  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题

    return (
      <div style={{width:'100%', wordBreak:'break-word'}}>
        <div className="print-btn">
          <div style={{ textAlign: 'right', marginBottom: '20px'}}>
            <Button onClick={this.setPrinting.bind(this, true)}>打印试卷</Button>
          </div>
          {
            this.props.showBackToTop ?
              <div className="back-to-top" onClick={this.backToTop}>
                <Icon type="arrow-up" />
              </div>
            :
              null
          }
        </div>
        <div className="preview-block" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '16px'}}>{ this.state.title }</h1>
          <h2 style={{ margin: '20px 0'}}>共{ this.state.count }题目<span style={{ margin: '0 10px'}}>试题总分: {this.state.total_grade}分</span>及格分: {this.state.pass_grade}分</h2>
          <p>{this.state.description}</p>
        </div>
        {
          this.state.question.map((item, index) => {
            return (
              <div className="preview-block" key={index}>
                <div>
                  <p className="preview-title">
                    {index + 1}.
                    <span className="preview-type">
                      {
                        (() => {
                          switch (item.type) {
                            case 'multiplechoiceresponse':
                              return '[单选题]';
                            case 'choiceresponse':
                              return '[多选题]';
                            case 'fill':
                              return '[填空题]';
                            case 'judge':
                              return '[判断题]';
                            default:
                              return null;
                          }
                        })()
                      }
                    </span>
                    {item.title}
                    （{item.grade}分）
                  </p>
                  <div style={{ marginLeft: '18px'}}>
                    {
                      (() => {
                        switch (item.type) {
                          case 'multiplechoiceresponse':
                            return <Radio.Group style={{display:'block'}} defaultValue={null}>
                                {
                                  item.options.map((item, index) => {
                                    return <Radio style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Radio>
                                  })
                                }
                              </Radio.Group>;

                          case 'choiceresponse':
                            return <Checkbox.Group defaultValue={null}>
                              {
                                item.options.map((item, index) => {
                                  return <Checkbox style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Checkbox>
                                })
                              }
                            </Checkbox.Group>;

                          case 'fill':
                            return <div>
                              {
                                item.input.map((answer, index) => {
                                  return <div style={(index !== item.input.length - 1) ? { marginBottom: '20px'} : {} }>
                                    <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                                    <Input.TextArea
                                      autosize={{ minRows: 1, maxRows: 6 }}
                                      style={{ width: '400px', display:'inline-block', marginLeft: '15px', verticalAlign: 'text-top'}}
                                    />
                                  </div>
                                })
                              }
                            </div>


                          case 'judge':
                            return <Radio.Group style={{display:'block'}} defaultValue={null}>
                              <Radio style={{display:'block', height: '30px', lineHeight: '30px'}} value={true}>正确</Radio>
                              <Radio style={{display:'block', height: '30px', lineHeight: '30px'}} value={false}>错误</Radio>
                            </Radio.Group>;

                          default:
                              return null;
                        }
                      })()
                    }
                  </div>
                </div>
              </div>
            )
          })
        }

        {
          /*
          this.state.results.map((item, index) => {
            return (
              <div dangerouslySetInnerHTML = {{ __html:item.markdown }}></div>
            )
          })
          */
        }
      </div>
    )
  }
}


export default class Preview extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    showShadow: false,
  }

  componentDidMount(){
    const that = this;
    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

    $(document).scroll(() => {
      this.setState({
        showShadow: ($(window).height() !== $(document).height()) && $(document).scrollTop() > 0
      })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px', minWidth: '649px'}
    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>
          <PreviewContainer showBackToTop={this.state.showShadow} />
        </div>
        <Footer />
      </div>
    );
  }
}