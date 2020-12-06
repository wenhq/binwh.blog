module.exports = {
  title: 'Binary WareHouse',
  description: '数位仓库blog',
  head: [ // 注入到当前页面的 HTML <head> 中的标签
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 增加一个自定义的 favicon(网页标签的图标)
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
  ],
  base: '/', // 这是部署到github相关的配置
  permalink: '/:year/:month/:day/:slug.html',
  markdown: {
    lineNumbers: false // 代码块显示行号
  },

  locales: {
      '/': {
        lang: 'zh-CN',
      }
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
   ],
    ['@vuepress-reco/vuepress-plugin-rss',
    {
      site_url: 'https://www.binwh.com', // required
      copyright: '${$themeConfig.author} ${$themeConfig.startYear}', // optional
      // filter some post
      //filter: (frontmatter) => { return [true|false] },
      // How much articles
      count: 20
      }
    ],
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-47366244-1' // UA-00000000-0
      }
    ],
    [
      "@mr-hope/seo",
      {
        hostname: 'https://www.binwh.com'
      },
    ],
    [
      "@mr-hope/sitemap",
      {
        hostname: 'https://www.binwh.com',
        changefreq: 'daily'
      },
    ],
  ],

  theme: 'reco',
  themeConfig: {
    type: 'blog',
    huawei: false,
    themePicker: false,
    logo:"/images/bin1.gif",
    nav:[ // 导航栏配置
      {text: 'BookMark', link: '/bookmark/', icon: 'reco-category'},
      {text: 'AppMark', link: '/appmark/', icon: 'reco-up'},
      //{text: 'Message', link:'/message/',icon:'reco-message'},
      {text: 'About', link: '/about/', icon:'reco-account'},
      {text: 'RSS', link: 'https://www.binwh.com/rss.xml', icon:'reco-rss'},
      { text: 'Contact',icon:'reco-friend',
        items: [
          {text:'简书',link: 'https://www.jianshu.com/u/20e512b19b35', icon:'reco-jianshu'},
          {text:'GitHub',link: 'https://github.com/wenhq', icon:'reco-github'},
        ]
      }
    ],
    sidebar: 'auto', // 侧边栏配置
    sidebarDepth: 2, // 侧边栏显示2级
    // 作者
    author: 'Wenh Q',
    // 头像
    authorAvatar: '/images/Wo03.jpg',
    // 项目开始时间
    startYear: '2019',
    // 更新时间中文
    lastUpdated: '上次更新',
    // 你的 Git 项目地址，添加后会在导航栏的最后追加
    // repo: 'wenhq/binwh.blog',
    // 启用编辑
    editLinks: true,
    // 编辑按钮的 Text
    editLinkText: '在 GitHub 上编辑此页',
    // 编辑文档的所在目录
    docsDir: 'docs',
  }
};
