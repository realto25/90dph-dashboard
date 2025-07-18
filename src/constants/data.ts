import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  // {
  //   title: 'Product',
  //   url: '/dashboard/product',
  //   icon: 'product',
  //   shortcut: ['p', 'p'],
  //   isActive: false,
  //   items: [] // No child items
  // },
  {
    title: 'Plots',
    url: '/dashboard/plots',
    icon: 'plots',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Notifications',
    url: '/dashboard/notifications',
    icon: 'bell',
    shortcut: ['n', 'N'],
    isActive: false,
    hasNew: true,
    items: [] // No child items
  },
  {
    title: 'Requests',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'requests',
    isActive: true,

    items: [
      {
        title: 'Visit Request',
        url: '/dashboard/visit-requests',
        icon: 'userPen',
        shortcut: ['v', 'V'],
        hasNew: true
      },
      {
        title: 'Buy Request',
        shortcut: ['B', 'b'],
        url: '/dashboard/buy-requests',
        icon: 'login',
        hasNew: true
      },
      {
        title: 'Sell Request',
        shortcut: ['S', 's'],
        url: '/dashboard/sell-requests',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Client Management',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'clientManagement',
    isActive: true,

    items: [
      {
        title: 'Assign Camera',
        url: '/dashboard/assign-camera',
        icon: 'userPen',
        shortcut: ['C', 'c']
      },
      {
        title: 'Assigned Lands',
        url: '/dashboard/owned-lands',
        icon: 'plots',
        shortcut: ['L', 'l']
      }
      // {
      //   title: 'Login',
      //   shortcut: ['l', 'l'],
      //   url: '/',
      //   icon: 'login'
      // }
    ]
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'account',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Manager',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'manager',
    isActive: true,

    items: [
      {
        title: 'Assign Office ',
        url: '/dashboard/managers',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Leave Requests',
        shortcut: ['l', 'l'],
        url: '/dashboard/leave-requests',
        icon: 'login'
      },
      {
        title: 'Attendance List',
        url: '/dashboard/attendance',
        icon: 'userPen',
        shortcut: ['A', 'a']
      }
    ]
  },
   {
    title: 'All Users',
    url: '/dashboard/all-users',
    icon: 'allUsers',
    shortcut: ['U', 'u'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Feedback',
    url: '/dashboard/feedback',
    icon: 'feedback',
    shortcut: ['F', 'f'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [] // No child items
  },
 
   {
    title: 'Admins',
    url: '/dashboard/admins',
    icon: 'allUsers',
    shortcut: ['A', 'a'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Banner Ads',
    url: '/dashboard/banner-ads',
    icon: 'media',
    shortcut: ['B', 'a'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'All Cameras',
    url: '/dashboard/cameras',
    icon: 'camera',
    shortcut: ['C', 'a'],
    isActive: false,
    items: []
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
