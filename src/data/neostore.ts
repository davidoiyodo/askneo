export interface BundleItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

export const bundleCatalog: BundleItem[] = [
  // Feeding
  { id: 'bi-bottles',       name: 'Feeding bottles (4-pack)',             category: 'Feeding',  price: 3500,  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80' },
  { id: 'bi-pump-manual',   name: 'Manual breast pump',                   category: 'Feeding',  price: 8000,  image: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&q=80' },
  { id: 'bi-pump-electric', name: 'Electric breast pump',                 category: 'Feeding',  price: 22000, image: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&q=80' },
  { id: 'bi-nursing-bras',  name: 'Nursing bras (2-pack)',                category: 'Feeding',  price: 4500,  image: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=400&q=80' },
  { id: 'bi-nipple-cream',  name: 'Nipple cream',                         category: 'Feeding',  price: 2000,  image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80' },
  { id: 'bi-milk-bags',     name: 'Breast milk storage bags (30)',         category: 'Feeding',  price: 3000,  image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=400&q=80' },
  // Clothing
  { id: 'bi-onesies',       name: 'Newborn onesies (5-pack, 0–3 months)', category: 'Clothing', price: 5000,  image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80' },
  { id: 'bi-sleepsuits',    name: 'Sleepsuits (3-pack)',                   category: 'Clothing', price: 4000,  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80' },
  { id: 'bi-swaddles',      name: 'Swaddle blankets (2-pack)',             category: 'Clothing', price: 3500,  image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=400&q=80' },
  { id: 'bi-socks',         name: 'Baby socks (6-pack)',                   category: 'Clothing', price: 1500,  image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80' },
  { id: 'bi-hats',          name: 'Baby hats (3-pack)',                    category: 'Clothing', price: 1800,  image: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=400&q=80' },
  // Hygiene
  { id: 'bi-bath-set',      name: 'Baby bath set (tub, wash & lotion)',    category: 'Hygiene',  price: 7500,  image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=400&q=80' },
  { id: 'bi-wipes',         name: 'Baby wipes (3 packs)',                  category: 'Hygiene',  price: 2500,  image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80' },
  { id: 'bi-diapers',       name: 'Newborn diapers (10-pack, size 0–1)',   category: 'Hygiene',  price: 3000,  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80' },
  { id: 'bi-rash-cream',    name: 'Nappy rash cream',                      category: 'Hygiene',  price: 2200,  image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80' },
  { id: 'bi-cotton-wool',   name: 'Cotton wool balls',                     category: 'Hygiene',  price: 800,   image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=400&q=80' },
  // Health
  { id: 'bi-thermometer',   name: 'Digital thermometer',                   category: 'Health',   price: 4500,  image: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=400&q=80' },
  { id: 'bi-aspirator',     name: 'Nasal aspirator',                       category: 'Health',   price: 2000,  image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80' },
  { id: 'bi-nail-set',      name: 'Baby nail file & scissors set',         category: 'Health',   price: 1800,  image: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=400&q=80' },
  { id: 'bi-saline',        name: 'Saline nasal drops',                    category: 'Health',   price: 1500,  image: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&q=80' },
  // Comfort
  { id: 'bi-pacifiers',     name: 'Pacifiers (2-pack)',                    category: 'Comfort',  price: 2500,  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80' },
  { id: 'bi-carrier',       name: 'Baby carrier wrap',                     category: 'Comfort',  price: 9000,  image: 'https://images.unsplash.com/photo-1560328055-e938bb2ed50a?w=400&q=80' },
  { id: 'bi-nursing-pillow',name: 'Nursing pillow',                        category: 'Comfort',  price: 6500,  image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80' },
  // Sleep
  { id: 'bi-sleeping-bag',  name: 'Baby sleeping bag',                     category: 'Sleep',    price: 6000,  image: 'https://images.unsplash.com/photo-1560328055-e938bb2ed50a?w=400&q=80' },
  { id: 'bi-night-light',   name: 'Portable night light',                  category: 'Sleep',    price: 3500,  image: 'https://images.unsplash.com/photo-1584946669010-1d41e2b00e08?w=400&q=80' },
  { id: 'bi-sound-machine', name: 'White noise machine',                   category: 'Sleep',    price: 12000, image: 'https://images.unsplash.com/photo-1560328055-e938bb2ed50a?w=400&q=80' },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  tag?: string;
  items?: string[];
  images?: string[];
  p2p?: boolean;
  p2pUser?: string;
  p2pLocation?: string;
  logisticsPrice?: number;  // P2P only — item is free, user pays this for delivery
}

export const bundles: Product[] = [
  {
    id: 'bundle-newborn',
    name: 'Newborn Essentials Bundle',
    description: 'Everything you need for baby\'s first 8 weeks. Curated by our paediatric advisors for Nigerian and Ghanaian new parents.',
    price: 45000,
    currency: '₦',
    tag: 'Neo Approved',
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&q=80',
      'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=600&q=80',
    ],
    items: [
      '10× newborn diapers (size 0–1)',
      'Soft cotton onesies (pack of 5)',
      'Swaddle blankets (2)',
      'Baby bath set (tub, wash, lotion)',
      'Digital thermometer',
      'Nasal aspirator',
      'Baby nail file & scissors set',
      'Feeding bottles (4)',
    ],
  },
  {
    id: 'bundle-nicu',
    name: 'NICU Mom Support Pack',
    description: 'Designed for families navigating the NICU. Practical support items for you and your premature or hospitalised baby.',
    price: 28000,
    currency: '₦',
    tag: 'Community Favourite',
    images: [
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
    ],
    items: [
      'Manual breast pump',
      'Breast milk storage bags (30)',
      'Preemie clothing set (3 pieces)',
      'Kangaroo care wrap',
      'NICU journal & tracker',
      'Comfort care items for mum (eye mask, snacks)',
    ],
  },
  {
    id: 'bundle-pregnancy',
    name: 'Pregnancy Prep Starter',
    description: 'Third trimester essentials to prepare you and your home for baby\'s arrival.',
    price: 32000,
    currency: '₦',
    tag: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
      'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=600&q=80',
    ],
    items: [
      'Folic acid & prenatal vitamins (3-month supply)',
      'Maternity pillow',
      'Hospital bag checklist guide',
      'Perineal comfort spray',
      'Nursing bras (2)',
      'Nipple cream',
      'Belly support band',
    ],
  },
  {
    id: 'bundle-custom',
    name: 'Build Your Own Bundle',
    description: 'Select exactly what you need. Optimised for your budget and stage.',
    price: 0,
    currency: '₦',
    tag: 'Custom',
    images: [
      'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=600&q=80',
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
    ],
    items: [],
  },
];

export const p2pItems: Product[] = [
  {
    id: 'p2p-01',
    name: 'Newborn Clothing Set',
    description: 'Lightly worn 0–3 month onesies and sleepsuits. Baby outgrew before wearing most of them. Washed and clean.',
    price: 0,
    currency: '₦',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    ],
    p2p: true,
    p2pUser: 'Funmilayo A.',
    p2pLocation: 'Lekki, Lagos',
    logisticsPrice: 2500,
  },
  {
    id: 'p2p-02',
    name: 'Baby Bouncer Chair',
    description: 'Used for 4 months. In excellent condition. Vibration function still works perfectly.',
    price: 0,
    currency: '₦',
    images: [
      'https://images.unsplash.com/photo-1584946669010-1d41e2b00e08?w=600&q=80',
      'https://images.unsplash.com/photo-1560328055-e938bb2ed50a?w=600&q=80',
    ],
    p2p: true,
    p2pUser: 'Abena K.',
    p2pLocation: 'East Legon, Accra',
    logisticsPrice: 3500,
  },
  {
    id: 'p2p-03',
    name: 'Manual Breast Pump',
    description: 'Barely used. Sterilised and good as new. Perfect for occasional pumping.',
    price: 0,
    currency: '₦',
    images: [
      'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=600&q=80',
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&q=80',
    ],
    p2p: true,
    p2pUser: 'Chidinma O.',
    p2pLocation: 'GRA, Enugu',
    logisticsPrice: 1800,
  },
  {
    id: 'p2p-04',
    name: 'Baby Monitor Set',
    description: 'Works perfectly. Selling as we moved to a smaller apartment and no longer need it.',
    price: 0,
    currency: '₦',
    images: [
      'https://images.unsplash.com/photo-1560328055-e938bb2ed50a?w=600&q=80',
      'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=600&q=80',
    ],
    p2p: true,
    p2pUser: 'Adaeze M.',
    p2pLocation: 'Victoria Island, Lagos',
    logisticsPrice: 4000,
  },
];
