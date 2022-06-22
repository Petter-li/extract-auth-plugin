const authRoutes = [
  {
    path: '/sales-welcome',
    name: 'sales-welcome',
    icon: 'smile',
    component: './SalesWelcome',
    cName: '欢迎页'
  },
  {
    path: '/op',
    name: 'op',
    icon: 'smile',
    cName: '运营',
    routes: [
      {
        path: '/op/sop',
        name: 'sopManage',
        component: './Op/Sop',
        cName: 'SOP管理'
      }
    ]
  },
]
module.exports = authRoutes;