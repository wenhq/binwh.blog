module.exports = {
  title: 'Binary WareHouse',
  description: '数位仓库',
  head: [ // 注入到当前页面的 HTML <head> 中的标签
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 增加一个自定义的 favicon(网页标签的图标)
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
  ],
  base: '/', // 这是部署到github相关的配置
  permalink: '/:year/:month/:day/:slug.html',
  markdown: {
    lineNumbers: false // 代码块显示行号
  },

  // 插件
  plugins: [
    ["ribbon",
      {
        size: 80,     // width of the ribbon, default: 90
        opacity: 0.3, // opacity of the ribbon, default: 0.3
        zIndex: -1    // z-index property of the background, default: -1
      }
    ],
    ['@vuepress-reco/comments',
      {
        solution: 'valine',
        options: {
          appId: 'KJfvEmhipx1qHyU2dvFysApe-gzGzoHsz',// your appId
          appKey: 'TsvBn8z0Mv0shPBqWlpLA177', // your appKey
          placeholder: '说点啥好呢~',
          notify: false, //邮件提醒
          verify: true, //评论时是否有验证码，需要在Leancloud 设置->安全中心 中打开
          placeholder: '说点什么吧！', //评论框默认显示
          // avatar: hide, //评论者的头像,我这里设置的不显示
          guest_info: ['nick','mail'], // custom comment header
          pageSize: 10, // pagination size
       }
     }
   ]
  ],

  theme: 'reco',
  themeConfig: {
    type: 'blog',
    huawei: false,
    themePicker: false,
    logo:"/images/bin1.gif",
    nav:[ // 导航栏配置
      {text: 'BookMark', link: '/bookmark/', icon: 'reco-category'},
      {text: 'Message', link:'/message/',icon:'reco-message'},
      { text: 'Contact',icon:'reco-friend',
        items: [
          {text:'简书',link: 'https://www.jianshu.com/u/20e512b19b35', icon:'reco-jianshu'},
          {text:'GitHub',link: 'https://github.com/wenhq', icon:'reco-github'},
        ]
      },
      {text: 'About', link: '/about/', icon:'reco-account'},
    ],
    sidebar: 'auto', // 侧边栏配置
    sidebarDepth: 2, // 侧边栏显示2级
    // 作者
    author: 'Wenh Q',
    // 最后更新时间
    lastUpdated: 'Last Updated',
    // 项目开始时间
    startYear: '2019',
  }
};
