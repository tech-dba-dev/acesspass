import { User, Company, ValidationLog } from './types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    slug: 'burger-king-partners',
    name: 'Burger King Partners',
    description: 'The best burgers in town with exclusive access.',
    benefit: '20% OFF on all Combo Meals',
    address: 'Av. Paulista, 1000 - SP',
    image: 'https://picsum.photos/400/300?random=1',
  },
  {
    id: 'c2',
    slug: 'fitlife-gym',
    name: 'FitLife Gym',
    description: 'Premium fitness center for your daily workout.',
    benefit: 'Free enrollment + 10% monthly discount',
    address: 'Rua Augusta, 500 - SP',
    image: 'https://picsum.photos/400/300?random=2',
  },
  {
    id: 'c3',
    slug: 'cinema-cineart',
    name: 'Cinema Cineart',
    description: 'Watch the latest movies in 4K.',
    benefit: '50% OFF on tickets (Mon-Thu)',
    address: 'Shopping Center Mall, 3rd Floor',
    image: 'https://picsum.photos/400/300?random=3',
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Super Admin',
    email: 'admin@pass.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    avatar: 'https://picsum.photos/100/100?random=10',
  },
  {
    id: 'comp1',
    name: 'Manager Burger',
    email: 'manager@burger.com',
    password: 'company123',
    role: 'company',
    companyId: 'c1',
    isActive: true,
    avatar: 'https://picsum.photos/100/100?random=11',
  },
  {
    id: 'client1',
    name: 'John Doe',
    email: 'john@client.com',
    password: 'client123',
    role: 'client',
    isActive: true,
    memberCode: 'PASS-8821-X',
    avatar: 'https://picsum.photos/100/100?random=12',
  },
  {
    id: 'client2',
    name: 'Jane Smith',
    email: 'jane@client.com',
    password: 'client123',
    role: 'client',
    isActive: false, // Inactive example
    memberCode: 'PASS-9900-Y',
    avatar: 'https://picsum.photos/100/100?random=13',
  },
];

export const MOCK_LOGS: ValidationLog[] = [
  {
    id: 'l1',
    companyId: 'c1',
    companyName: 'Burger King Partners',
    clientId: 'client1',
    clientName: 'John Doe',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'success',
  }
];