/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Menu, 
  ArrowRight, 
  CheckCircle2, 
  Instagram, 
  Facebook, 
  Mail,
  Phone,
  MapPin,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  tags: string[];
  locationHint: string;
  date: string;
}

interface Order {
  id: string;
  items: { productId: number; quantity: number; size: string; price: number }[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    note?: string;
  };
  paymentMethod: string;
  total: number;
  timestamp: number;
}

// --- Mock Data ---

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Sương Trên Sông Hương",
    price: 1250000,
    description: "Một buổi sáng sớm mờ ảo trên dòng sông Hương thơ mộng, nơi những chiếc thuyền rồng ẩn hiện trong làn sương giăng.",
    imageUrl: "https://picsum.photos/seed/hue1/800/1000",
    tags: ["Sông Hương", "Sương mù", "Bình minh"],
    locationHint: "Bờ sông Hương",
    date: "2024-01-15"
  },
  {
    id: 2,
    title: "Cầu Trường Tiền Lúc Hoàng Hôn",
    price: 1500000,
    description: "Vẻ đẹp rực rỡ của cây cầu biểu tượng xứ Huế khi ánh mặt trời cuối ngày nhuộm đỏ cả một vùng trời.",
    imageUrl: "https://picsum.photos/seed/hue2/800/1000",
    tags: ["Cầu Trường Tiền", "Hoàng hôn", "Biểu tượng"],
    locationHint: "Cầu Trường Tiền",
    date: "2024-02-10"
  },
  {
    id: 3,
    title: "Mưa Nhẹ Ở Đại Nội",
    price: 1850000,
    description: "Những giọt mưa xuân nhẹ nhàng rơi trên mái ngói rêu phong của Kinh thành Huế, tạo nên một không gian trầm mặc.",
    imageUrl: "https://picsum.photos/seed/hue3/800/1000",
    tags: ["Đại Nội", "Mưa", "Kiến trúc"],
    locationHint: "Kinh Thành Huế",
    date: "2024-03-05"
  },
  {
    id: 4,
    title: "Sen Hồ Tịnh Tâm",
    price: 950000,
    description: "Vẻ đẹp thanh khiết của những đóa sen hồng nở rộ trong hồ Tịnh Tâm, nơi từng là ngự uyển của các vị vua triều Nguyễn.",
    imageUrl: "https://picsum.photos/seed/hue4/800/1000",
    tags: ["Hoa sen", "Hồ Tịnh Tâm", "Mùa hè"],
    locationHint: "Hồ Tịnh Tâm",
    date: "2023-06-20"
  },
  {
    id: 5,
    title: "Lăng Khải Định Uy Nghi",
    price: 2200000,
    description: "Sự kết hợp độc đáo giữa kiến trúc Á - Âu tại lăng Khải Định, được ghi lại dưới góc nhìn nghệ thuật tinh tế.",
    imageUrl: "https://picsum.photos/seed/hue5/800/1000",
    tags: ["Lăng tẩm", "Khải Định", "Kiến trúc"],
    locationHint: "Lăng Khải Định",
    date: "2024-01-20"
  },
  {
    id: 6,
    title: "Hoàng Hôn Trên Phá Tam Giang",
    price: 1350000,
    description: "Khung cảnh bao la và bình yên của vùng đầm phá lớn nhất Đông Nam Á khi chiều buông.",
    imageUrl: "https://picsum.photos/seed/hue6/800/1000",
    tags: ["Phá Tam Giang", "Thiên nhiên", "Hoàng hôn"],
    locationHint: "Quảng Điền",
    date: "2023-11-12"
  },
  {
    id: 7,
    title: "Cổng Ngọ Môn Rực Rỡ",
    price: 1650000,
    description: "Cổng chính vào Hoàng Thành Huế hiện lên đầy kiêu hãnh dưới ánh nắng vàng óng ả.",
    imageUrl: "https://picsum.photos/seed/hue7/800/1000",
    tags: ["Ngọ Môn", "Hoàng Thành", "Lịch sử"],
    locationHint: "Đại Nội",
    date: "2024-02-25"
  },
  {
    id: 8,
    title: "Nón Lá Xứ Huế",
    price: 850000,
    description: "Hình ảnh chiếc nón bài thơ gắn liền với vẻ đẹp duyên dáng của người con gái cố đô.",
    imageUrl: "https://picsum.photos/seed/hue8/800/1000",
    tags: ["Con người", "Văn hóa", "Nón lá"],
    locationHint: "Chợ Đông Ba",
    date: "2023-12-05"
  },
  {
    id: 9,
    title: "Chùa Thiên Mụ Cổ Kính",
    price: 1450000,
    description: "Tháp Phước Duyên soi bóng bên dòng sông Hương, một biểu tượng tâm linh lâu đời của vùng đất thần kinh.",
    imageUrl: "https://picsum.photos/seed/hue9/800/1000",
    tags: ["Chùa Thiên Mụ", "Tâm linh", "Sông Hương"],
    locationHint: "Hương Long",
    date: "2024-03-01"
  },
  {
    id: 10,
    title: "Mùa Thu Ở Cung An Định",
    price: 1750000,
    description: "Vẻ đẹp lãng mạn và hoài cổ của cung An Định khi những hàng cây thay lá.",
    imageUrl: "https://picsum.photos/seed/hue10/800/1000",
    tags: ["Cung An Định", "Mùa thu", "Kiến trúc"],
    locationHint: "Phan Đình Phùng",
    date: "2023-10-15"
  },
  {
    id: 11,
    title: "Đêm Hoàng Cung",
    price: 2500000,
    description: "Ánh đèn lung linh huyền ảo chiếu sáng các cung điện trong đêm hội Hoàng cung.",
    imageUrl: "https://picsum.photos/seed/hue11/800/1000",
    tags: ["Đêm", "Lễ hội", "Đại Nội"],
    locationHint: "Đại Nội",
    date: "2024-04-20"
  },
  {
    id: 12,
    title: "Làng Hương Thủy Xuân",
    price: 1150000,
    description: "Sắc màu rực rỡ của những bó hương xòe hoa tại làng nghề truyền thống Thủy Xuân.",
    imageUrl: "https://picsum.photos/seed/hue12/800/1000",
    tags: ["Làng nghề", "Màu sắc", "Thủy Xuân"],
    locationHint: "Thủy Xuân",
    date: "2024-01-10"
  },
  {
    id: 13,
    title: "Bình Minh Trên Cầu Gỗ Lim",
    price: 1200000,
    description: "Không gian hiện đại hòa quyện cùng nét cổ kính bên bờ sông Hương lúc rạng đông.",
    imageUrl: "https://picsum.photos/seed/hue13/800/1000",
    tags: ["Sông Hương", "Bình minh", "Cầu gỗ lim"],
    locationHint: "Bờ sông Hương",
    date: "2024-02-15"
  },
  {
    id: 14,
    title: "Lăng Minh Mạng Trầm Mặc",
    price: 1950000,
    description: "Sự tĩnh lặng tuyệt đối và vẻ đẹp hài hòa giữa thiên nhiên và kiến trúc tại lăng Minh Mạng.",
    imageUrl: "https://picsum.photos/seed/hue14/800/1000",
    tags: ["Lăng tẩm", "Minh Mạng", "Thiên nhiên"],
    locationHint: "Hương Thọ",
    date: "2023-12-20"
  },
  {
    id: 15,
    title: "Chợ Đông Ba Nhộn Nhịp",
    price: 900000,
    description: "Nhịp sống hối hả và đầy màu sắc tại ngôi chợ lâu đời nhất xứ Huế.",
    imageUrl: "https://picsum.photos/seed/hue15/800/1000",
    tags: ["Chợ Đông Ba", "Con người", "Đời thường"],
    locationHint: "Trần Hưng Đạo",
    date: "2024-03-10"
  },
  {
    id: 16,
    title: "Cầu Ngói Thanh Toàn",
    price: 1300000,
    description: "Nét kiến trúc độc đáo của cây cầu ngói cổ xưa giữa vùng quê yên bình.",
    imageUrl: "https://picsum.photos/seed/hue16/800/1000",
    tags: ["Cầu Ngói", "Thanh Toàn", "Nông thôn"],
    locationHint: "Thủy Thanh",
    date: "2024-01-05"
  },
  {
    id: 17,
    title: "Hoàng Hôn Trên Đồi Thiên An",
    price: 1100000,
    description: "Vẻ đẹp thơ mộng của rừng thông Thiên An khi ánh nắng chiều xuyên qua kẽ lá.",
    imageUrl: "https://picsum.photos/seed/hue17/800/1000",
    tags: ["Thiên An", "Rừng thông", "Hoàng hôn"],
    locationHint: "Thủy Bằng",
    date: "2023-11-25"
  },
  {
    id: 18,
    title: "Cung Diên Thọ Tĩnh Lặng",
    price: 1600000,
    description: "Nơi ở của các Hoàng thái hậu triều Nguyễn với vẻ đẹp trang nghiêm và tinh xảo.",
    imageUrl: "https://picsum.photos/seed/hue18/800/1000",
    tags: ["Cung Diên Thọ", "Hoàng cung", "Lịch sử"],
    locationHint: "Đại Nội",
    date: "2024-02-12"
  },
  {
    id: 19,
    title: "Mưa Đêm Cố Đô",
    price: 1400000,
    description: "Ánh đèn đường hắt hiu trên những con phố cổ kính của Huế trong một đêm mưa buồn.",
    imageUrl: "https://picsum.photos/seed/hue19/800/1000",
    tags: ["Đêm", "Mưa", "Phố cổ"],
    locationHint: "Lê Lợi",
    date: "2024-03-15"
  },
  {
    id: 20,
    title: "Vẻ Đẹp Trường Hai",
    price: 1800000,
    description: "Khung cảnh hùng vĩ của đèo Hải Vân nhìn từ phía Huế, nơi mây trời gặp gỡ biển xanh.",
    imageUrl: "https://picsum.photos/seed/hue20/800/1000",
    tags: ["Hải Vân", "Biển", "Mây"],
    locationHint: "Lăng Cô",
    date: "2024-04-05"
  }
];

const SIZES = [
  { label: 'A4 (21x30cm)', multiplier: 1 },
  { label: 'A3 (30x42cm)', multiplier: 1.5 },
  { label: 'A2 (42x60cm)', multiplier: 2.2 }
];

// --- Components ---

const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10C50 10 35 35 35 55C35 75 50 90 50 90C50 90 65 75 65 55C65 35 50 10 50 10Z" opacity="0.8" />
    <path d="M50 25C50 25 20 45 20 65C20 85 40 95 50 95C60 95 80 85 80 65C80 45 50 25 50 25Z" opacity="0.4" />
    <path d="M50 40C50 40 5 55 5 75C5 95 30 100 50 100C70 100 95 95 95 75C95 55 50 40 50 40Z" opacity="0.2" />
  </svg>
);

const BridgeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 50" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M0 45 Q 25 10, 50 45 Q 75 10, 100 45 Q 125 10, 150 45 Q 175 10, 200 45" />
    <line x1="0" y1="45" x2="200" y2="45" />
  </svg>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [language, setLanguage] = useState<'vi' | 'en' | 'fr'>('vi');
  const [view, setView] = useState<'main' | 'checkout'>('main');
  const [checkoutData, setCheckoutData] = useState<{ productId: number; sizeIndex: number; quantity: number } | null>(null);

  const t = useMemo(() => {
    const translations = {
      vi: {
        nav: { gallery: 'Bộ sưu tập', about: 'Giới thiệu', howToBuy: 'Cách mua', contact: 'Liên hệ' },
        hero: { title: 'Nghệ Thuật Nhiếp Ảnh', subtitle: 'In Ấn Từ Huế', desc: 'Ghi lại linh hồn thơ mộng của cố đô. Từ làn sương trên sông Hương đến nét rêu phong của Đại Nội.', viewGallery: 'Xem Bộ Sưu Tập', howToBuy: 'Cách Mua Hàng' },
        gallery: { title: 'Bộ Sưu Tập', sortBy: 'Sắp xếp theo:', newest: 'Mới nhất', priceAsc: 'Giá: Thấp đến Cao', priceDesc: 'Giá: Cao đến Thấp' },
        about: { label: 'Câu chuyện của chúng tôi', title: 'Ghi Lại Linh Hồn Cố Đô', desc1: 'Hue Art Prints ra đời từ tình yêu sâu sắc với vẻ đẹp thơ mộng và trầm mặc của Huế. Sứ mệnh của chúng tôi là mang nét thanh tao vượt thời gian của cố đô vào không gian sống hiện đại.', desc2: 'Mỗi bức ảnh trong bộ sưu tập là kết quả của sự kiên nhẫn—chờ đợi làn sương hoàn hảo trên sông Hương, khoảnh khắc ánh nắng chạm vào rêu phong Đại Nội, hay nét tĩnh lặng của đóa sen hồ Tịnh Tâm.', desc3: 'Chúng tôi tin rằng nhiếp ảnh nghệ thuật không chỉ là một hình ảnh; đó là cửa sổ nhìn vào một thời gian và không gian khác. Mỗi bản in được sản xuất với vật liệu chất lượng cao nhất để đảm bảo màu sắc và cảm xúc của Huế luôn sống động qua nhiều thế hệ.', quote: '"Huế không chỉ là một thành phố, đó là một cảm xúc."', trusted: 'Được tin dùng bởi hơn 500+ người yêu nghệ thuật' },
        howToBuy: { title: 'Làm Sao Để Mang Huế Về Nhà', subtitle: 'Các bước đơn giản để sở hữu một phần di sản Việt Nam.', step1: { title: 'Chọn Tác Phẩm', desc: 'Duyệt qua bộ sưu tập và chọn bức ảnh chạm đến tâm hồn bạn.' }, step2: { title: 'Chọn Kích Thước', desc: 'Chọn từ A4, A3 hoặc A2. Tất cả đều được in trên giấy mỹ thuật cao cấp.' }, step3: { title: 'Thanh Toán An Toàn', desc: 'Thanh toán qua Chuyển khoản, MoMo, ZaloPay hoặc chọn COD cho đơn hàng trong nước.' } },
        footer: { desc: 'Mang vẻ đẹp thơ mộng của Huế đến với thế giới qua nhiếp ảnh nghệ thuật. Mỗi bản in là một câu chuyện, một kỷ niệm và một phần di sản.', contact: 'Liên hệ', info: 'Thông tin', policy: 'Chính sách vận chuyển', returns: 'Đổi trả & Hoàn tiền', privacy: 'Chính sách bảo mật', terms: 'Điều khoản dịch vụ', rights: '© 2026 Hue Art Prints. Bảo lưu mọi quyền.', handcrafted: 'Được chế tác thủ công với tình yêu tại Huế, Việt Nam.' },
        product: { location: 'Địa điểm', selectSize: 'Chọn kích thước', quantity: 'Số lượng', basePrice: 'Giá gốc', placeOrder: 'Đặt hàng ngay', secureCheckout: 'Thanh toán an toàn' },
        checkout: { title: 'Thanh Toán', subtitle: 'Vui lòng cung cấp thông tin giao hàng và thanh toán.', fullName: 'Họ và tên', phone: 'Số điện thoại', email: 'Email (Không bắt buộc)', address: 'Địa chỉ giao hàng', payment: 'Phương thức thanh toán', confirm: 'Xác nhận đơn hàng', back: 'Quay lại', summary: 'Tóm tắt đơn hàng', total: 'Tổng cộng', item: 'Sản phẩm', size: 'Kích thước', qty: 'Số lượng' },
        success: { title: 'Đặt hàng thành công!', desc: 'Cảm ơn bạn đã ủng hộ Hue Art Prints. Mã đơn hàng của bạn là', instructions: 'Hướng dẫn thanh toán', bank: 'Ngân hàng', account: 'Số tài khoản', name: 'Chủ tài khoản', content: 'Nội dung', momoZalo: 'Chúng tôi sẽ liên hệ sớm qua điện thoại/email để cung cấp mã QR thanh toán.', cod: 'Đơn hàng sẽ được giao đến địa chỉ của bạn. Vui lòng thanh toán khi nhận hàng.', return: 'Quay lại bộ sưu tập' }
      },
      en: {
        nav: { gallery: 'Gallery', about: 'About', howToBuy: 'How to Buy', contact: 'Contact' },
        hero: { title: 'Fine-Art Photography', subtitle: 'Prints from Hue', desc: 'Capture the poetic soul of the ancient capital. From the mist of Perfume River to the rêu phong of Imperial City.', viewGallery: 'View Gallery', howToBuy: 'How to Buy' },
        gallery: { title: 'The Collection', sortBy: 'Sort by:', newest: 'Newest First', priceAsc: 'Price: Low to High', priceDesc: 'Price: High to Low' },
        about: { label: 'Our Story', title: 'Capturing the Soul of the Ancient Capital', desc1: 'Hue Art Prints was born from a deep love for the poetic and melancholic beauty of Hue. Our mission is to bring the timeless elegance of the Nguyen Dynasty\'s capital into modern living spaces.', desc2: 'Every photograph in our collection is a result of patient waiting—waiting for the perfect mist on the Perfume River, the exact moment the sun hits the rêu phong of the Imperial City, or the quiet grace of a lotus bloom in Tịnh Tâm lake.', desc3: 'We believe that fine-art photography is more than just an image; it\'s a window into a different time and space. Each print is produced with the highest quality materials to ensure the colors and emotions of Hue remain vivid for generations.', quote: '"Hue is not just a city, it\'s a feeling."', trusted: 'Trusted by 500+ art lovers worldwide' },
        howToBuy: { title: 'How to Bring Hue Home', subtitle: 'Simple steps to own a piece of Vietnamese heritage.', step1: { title: 'Choose Your Art', desc: 'Browse our curated gallery and select the photograph that speaks to your soul.' }, step2: { title: 'Select Size & Format', desc: 'Pick from A4, A3, or A2 sizes. All prints come on premium archival paper.' }, step3: { title: 'Secure Checkout', desc: 'Pay via Bank Transfer, MoMo, ZaloPay or choose COD for domestic orders.' } },
        footer: { desc: 'Bringing the poetic beauty of Hue to the world through fine-art photography. Each print is a story, a memory, and a piece of heritage.', contact: 'Contact Us', info: 'Information', policy: 'Shipping Policy', returns: 'Returns & Exchanges', privacy: 'Privacy Policy', terms: 'Terms of Service', rights: '© 2026 Hue Art Prints. All rights reserved.', handcrafted: 'Handcrafted with love in Hue, Vietnam.' },
        product: { location: 'Location', selectSize: 'Select Size', quantity: 'Quantity', basePrice: 'Base Price', placeOrder: 'Place Order', secureCheckout: 'Secure Checkout' },
        checkout: { title: 'Checkout', subtitle: 'Please provide your shipping and payment information.', fullName: 'Full Name', phone: 'Phone Number', email: 'Email (Optional)', address: 'Shipping Address', payment: 'Payment Method', confirm: 'Confirm Order', back: 'Back', summary: 'Order Summary', total: 'Total', item: 'Item', size: 'Size', qty: 'Qty' },
        success: { title: 'Order Successful!', desc: 'Thank you for supporting Hue Art Prints. Your order ID is', instructions: 'Payment Instructions', bank: 'Bank', account: 'Account', name: 'Name', content: 'Content', momoZalo: 'We will contact you shortly via phone/email to provide the QR payment link.', cod: 'Your order will be shipped to your address. Please pay upon delivery.', return: 'Return to Gallery' }
      },
      fr: {
        nav: { gallery: 'Galerie', about: 'À Propos', howToBuy: 'Comment Acheter', contact: 'Contact' },
        hero: { title: 'Photographie d\'Art', subtitle: 'Tirages de Hué', desc: 'Capturez l\'âme poétique de l\'ancienne capitale. De la brume de la rivière des Parfums au rêu phong de la Cité Impériale.', viewGallery: 'Voir la Galerie', howToBuy: 'Comment Acheter' },
        gallery: { title: 'La Collection', sortBy: 'Trier par:', newest: 'Plus Récents', priceAsc: 'Prix: Croissant', priceDesc: 'Prix: Décroissant' },
        about: { label: 'Notre Histoire', title: 'Capturer l\'Âme de l\'Ancienne Capitale', desc1: 'Hue Art Prints est né d\'un amour profond pour la beauté poétique et mélancolique de Hué. Notre mission est d\'apporter l\'élégance intemporelle de la capitale de la dynastie Nguyen dans les espaces de vie modernes.', desc2: 'Chaque photographie de notre collection est le résultat d\'une attente patiente—attendre la brume parfaite sur la rivière des Parfums, le moment exact où le soleil frappe le rêu phong de la Cité Impériale, ou la grâce tranquille d\'une fleur de lotus dans le lac Tịnh Tâm.', desc3: 'Nous pensons que la photographie d\'art est plus qu\'une simple image ; c\'est une fenêtre sur un temps et un espace différents. Mỗi tirage est produit avec des matériaux de la plus haute qualité pour garantir que les couleurs et les émotions de Hué restent vives pendant des générations.', quote: '"Hué n\'est pas seulement une ville, c\'est un sentiment."', trusted: 'Approuvé par plus de 500 amateurs d\'art dans le monde' },
        howToBuy: { title: 'Comment Ramener Hué chez Soi', subtitle: 'Des étapes simples pour posséder un morceau du patrimoine vietnamien.', step1: { title: 'Choisissez votre Art', desc: 'Parcourez notre galerie et sélectionnez la photographie qui parle à votre âme.' }, step2: { title: 'Sélectionnez Taille & Format', desc: 'Choisissez parmi les tailles A4, A3 hoặc A2. Tous les tirages sont sur papier d\'archivage de qualité supérieure.' }, step3: { title: 'Paiement Sécurisé', desc: 'Payez par virement bancaire, MoMo, ZaloPay ou choisissez le contre-remboursement pour les commandes nationales.' } },
        footer: { desc: 'Apporter la beauté poétique de Hué au monde à travers la photographie d\'art. Chaque tirage est une histoire, một souvenir et un morceau de patrimoine.', contact: 'Contactez-nous', info: 'Informations', policy: 'Politique d\'Expédition', returns: 'Retours & Échanges', privacy: 'Politique de Confidentialité', terms: 'Conditions d\'Utilisation', rights: '© 2026 Hue Art Prints. Tous droits réservés.', handcrafted: 'Fabriqué avec amour à Hué, Vietnam.' },
        product: { location: 'Emplacement', selectSize: 'Choisir la Taille', quantity: 'Quantité', basePrice: 'Prix de Base', placeOrder: 'Commander', secureCheckout: 'Paiement Sécurisé' },
        checkout: { title: 'Paiement', subtitle: 'Veuillez fournir vos informations d\'expédition et de paiement.', fullName: 'Nom Complet', phone: 'Numéro de Téléphone', email: 'Email (Optionnel)', address: 'Adresse de Livraison', payment: 'Mode de Paiement', confirm: 'Confirmer la Commande', back: 'Retour', summary: 'Résumé de la Commande', total: 'Total', item: 'Article', size: 'Taille', qty: 'Qté' },
        success: { title: 'Commande Réussie !', desc: 'Merci de soutenir Hue Art Prints. Votre numéro de commande est', instructions: 'Instructions de Paiement', bank: 'Banque', account: 'Compte', name: 'Nom', content: 'Contenu', momoZalo: 'Nous vous contacterons sous peu par téléphone/e-mail pour vous fournir le lien de paiement QR.', cod: 'Votre commande sera expédiée à votre adresse. Veuillez payer à la livraison.', return: 'Retour à la Galerie' }
      }
    };
    return translations[language];
  }, [language]);

  const itemsPerPage = 10;

  // Handle Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product-')) {
        const id = parseInt(hash.replace('#product-', ''));
        const product = PRODUCTS.find(p => p.id === id);
        if (product) setSelectedProduct(product);
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sortedProducts = useMemo(() => {
    const sorted = [...PRODUCTS];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted;
  }, [sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(PRODUCTS.length / itemsPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const product = view === 'checkout' && checkoutData 
      ? PRODUCTS.find(p => p.id === checkoutData.productId)
      : selectedProduct;

    if (!product) return;

    const sizeIndex = parseInt(formData.get('size') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const price = product.price * SIZES[sizeIndex].multiplier;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [{
        productId: product.id,
        quantity,
        size: SIZES[sizeIndex].label,
        price
      }],
      customer: {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        note: (formData.get('note') as string) || '',
      },
      paymentMethod: formData.get('payment') as string,
      total: price * quantity,
      timestamp: Date.now()
    };

    // Store in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('hue_art_orders') || '[]');
    localStorage.setItem('hue_art_orders', JSON.stringify([...existingOrders, newOrder]));

    setOrderSuccess(newOrder);
  };

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavScrolled || view === 'checkout' ? 'glass-nav py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              setView('main'); 
              window.location.hash = ''; 
            }} 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <LotusIcon className="w-8 h-8 text-hue-purple group-hover:rotate-12 transition-transform" />
            <span className="font-serif text-2xl font-semibold tracking-tight text-hue-ink">Hue Art Prints</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {view === 'main' ? (
              [
                { key: 'gallery', href: '#gallery', label: t.nav.gallery },
                { key: 'about', href: '#about', label: t.nav.about },
                { key: 'howToBuy', href: '#how-to-buy', label: t.nav.howToBuy },
                { key: 'contact', href: '#contact', label: t.nav.contact }
              ].map((item) => (
                <a 
                  key={item.key} 
                  href={item.href}
                  className="text-sm font-medium text-hue-ink/70 hover:text-hue-purple transition-colors uppercase tracking-widest"
                >
                  {item.label}
                </a>
              ))
            ) : (
              <button 
                onClick={() => setView('main')}
                className="text-sm font-medium text-hue-ink/70 hover:text-hue-purple transition-colors flex items-center gap-2 uppercase tracking-widest cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> {t.checkout.back}
              </button>
            )}
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 ml-4 border-l border-hue-ink/10 pl-4">
              {(['vi', 'en', 'fr'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs font-bold uppercase tracking-tighter w-8 h-8 rounded-full transition-all cursor-pointer ${language === lang ? 'bg-hue-purple text-hue-paper shadow-sm' : 'text-hue-ink/40 hover:text-hue-purple hover:bg-hue-mist'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="md:hidden text-hue-ink p-1 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-hue-paper pt-24 px-6 md:hidden flex flex-col justify-between pb-12"
          >
            <div className="flex flex-col gap-6 text-center">
              {view === 'main' ? (
                [
                  { key: 'gallery', href: '#gallery', label: t.nav.gallery },
                  { key: 'about', href: '#about', label: t.nav.about },
                  { key: 'howToBuy', href: '#how-to-buy', label: t.nav.howToBuy },
                  { key: 'contact', href: '#contact', label: t.nav.contact }
                ].map((item) => (
                  <a 
                    key={item.key} 
                    href={item.href}
                    className="text-2xl font-serif text-hue-ink hover:text-hue-purple transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))
              ) : (
                <button 
                  onClick={() => { setView('main'); setIsMobileMenuOpen(false); }}
                  className="text-2xl font-serif text-hue-ink hover:text-hue-purple transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" /> {t.checkout.back}
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-6 border-t border-hue-ink/10">
              {(['vi', 'en', 'fr'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setIsMobileMenuOpen(false); }}
                  className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all cursor-pointer ${language === lang ? 'bg-hue-purple text-hue-paper shadow-sm' : 'bg-hue-mist text-hue-ink/60'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'checkout' && checkoutData ? (
        (() => {
          const product = PRODUCTS.find(p => p.id === checkoutData.productId);
          if (!product) return null;
          const size = SIZES[checkoutData.sizeIndex] || SIZES[0];
          const itemPrice = product.price * size.multiplier;
          const total = itemPrice * checkoutData.quantity;

          return (
            <div className="flex-1 pt-32 pb-20 px-6">
              <div className="max-w-4xl mx-auto w-full">
                <button 
                  onClick={() => setView('main')}
                  className="flex items-center gap-2 text-hue-ink/50 hover:text-hue-purple transition-colors mb-8 group cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> {t.checkout.back}
                </button>

                <div className="grid md:grid-cols-3 gap-12">
                  <div className="md:col-span-2">
                    <h1 className="font-serif text-4xl text-hue-ink mb-2">{t.checkout.title}</h1>
                    <p className="text-hue-ink/50 mb-10">{t.checkout.subtitle}</p>

                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-hue-ink/40">{t.checkout.fullName}</label>
                          <input required name="name" type="text" className="w-full bg-hue-mist border border-hue-ink/10 rounded-lg p-4 focus:ring-2 focus:ring-hue-purple/20 outline-none" placeholder="Nguyen Van A" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-hue-ink/40">{t.checkout.phone}</label>
                          <input required name="phone" type="tel" className="w-full bg-hue-mist border border-hue-ink/10 rounded-lg p-4 focus:ring-2 focus:ring-hue-purple/20 outline-none" placeholder="0905 123 456" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-hue-ink/40">{t.checkout.email}</label>
                        <input name="email" type="email" className="w-full bg-hue-mist border border-hue-ink/10 rounded-lg p-4 focus:ring-2 focus:ring-hue-purple/20 outline-none" placeholder="email@example.com" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-hue-ink/40">{t.checkout.address}</label>
                        <textarea required name="address" rows={3} className="w-full bg-hue-mist border border-hue-ink/10 rounded-lg p-4 focus:ring-2 focus:ring-hue-purple/20 outline-none resize-none" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-hue-ink/40">{t.checkout.payment}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'bank', label: language === 'vi' ? 'Chuyển khoản Vietcombank' : language === 'fr' ? 'Virement Bancaire (Vietcombank)' : 'Bank Transfer (Vietcombank)' },
                            { id: 'momo', label: 'Ví MoMo' },
                            { id: 'zalopay', label: 'Ví ZaloPay' },
                            { id: 'cod', label: language === 'vi' ? 'COD (Thanh toán khi nhận hàng)' : language === 'fr' ? 'COD (Paiement à la livraison)' : 'COD (Cash on Delivery)' }
                          ].map(method => (
                            <label key={method.id} className="flex items-center gap-4 p-4 bg-hue-mist rounded-xl cursor-pointer hover:bg-hue-purple/5 transition-all border border-transparent has-[:checked]:border-hue-purple/30 has-[:checked]:bg-hue-purple/5">
                              <input required type="radio" name="payment" value={method.id} defaultChecked={method.id === 'bank'} className="w-4 h-4 text-hue-purple focus:ring-hue-purple" />
                              <span className="text-sm font-semibold text-hue-ink/70">{method.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Hidden fields for order processing */}
                      <input type="hidden" name="size" value={checkoutData.sizeIndex} />
                      <input type="hidden" name="quantity" value={checkoutData.quantity} />

                      <div className="pt-6">
                        <button 
                          type="submit"
                          className="w-full py-5 bg-hue-ink text-hue-paper rounded-2xl font-bold uppercase tracking-widest hover:bg-hue-purple transition-all shadow-xl shadow-hue-purple/20 text-lg flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <ShoppingBag className="w-5 h-5" /> {t.checkout.confirm} • {formatPrice(total)}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="md:col-span-1">
                    <div className="bg-hue-paper border border-hue-ink/10 rounded-3xl p-8 sticky top-32 shadow-sm">
                      <h3 className="font-serif text-2xl text-hue-ink mb-6">{t.checkout.summary}</h3>
                      
                      <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                          <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-hue-mist">
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-serif text-lg text-hue-ink leading-tight mb-1">{product.title}</h4>
                            <p className="text-xs text-hue-purple uppercase tracking-widest font-medium mb-1">{product.locationHint}</p>
                            <p className="text-xs text-hue-ink/40 uppercase tracking-widest">{t.checkout.size}: {size.label}</p>
                            <p className="text-xs text-hue-ink/40 uppercase tracking-widest">{t.checkout.qty}: {checkoutData.quantity}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-hue-ink/5 space-y-4">
                        <div className="flex justify-between text-sm text-hue-ink/50">
                          <span>{t.checkout.item}</span>
                          <span>{formatPrice(itemPrice)} × {checkoutData.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm text-hue-ink/50">
                          <span>{language === 'vi' ? 'Vận chuyển' : language === 'fr' ? 'Livraison' : 'Shipping'}</span>
                          <span className="text-emerald-700 font-medium">{language === 'vi' ? 'Miễn phí' : language === 'fr' ? 'Gratuit' : 'Free'}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-hue-ink pt-2 border-t border-hue-ink/5">
                          <span>{t.checkout.total}</span>
                          <span className="text-hue-purple">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <>

      {/* --- Hero Section --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-hue-purple/10 via-hue-blue/5 to-hue-paper" />
          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10">
            <BridgeIcon className="w-full h-full text-hue-ink" />
          </div>
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2 }}
            src="https://picsum.photos/seed/hue-hero/1920/1080?blur=5" 
            alt="Hue Mist"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-hue-ink mb-6 leading-tight">
              {t.hero.title} <br />
              <span className="italic text-hue-purple">{t.hero.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-hue-ink/60 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.hero.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#gallery" 
                className="px-10 py-4 bg-hue-ink text-hue-paper rounded-full font-medium hover:bg-hue-purple transition-all flex items-center justify-center gap-2 group"
              >
                {t.hero.viewGallery} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#how-to-buy" 
                className="px-10 py-4 border border-hue-ink/20 text-hue-ink rounded-full font-medium hover:bg-hue-ink/5 transition-all"
              >
                {t.hero.howToBuy}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Gallery Section --- */}
      <section id="gallery" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-serif text-4xl text-hue-ink mb-2">{t.gallery.title}</h2>
            <div className="w-20 h-1 bg-hue-purple/30" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-hue-ink/60">
              <Filter className="w-4 h-4" />
              <span>{t.gallery.sortBy}</span>
            </div>
            <select 
              className="bg-transparent border-b border-hue-ink/20 py-1 text-sm focus:outline-none focus:border-hue-purple"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="newest">{t.gallery.newest}</option>
              <option value="price-asc">{t.gallery.priceAsc}</option>
              <option value="price-desc">{t.gallery.priceDesc}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {paginatedProducts.map((product) => (
            <motion.div 
              layout
              key={product.id}
              className="art-card group cursor-pointer"
              onClick={() => window.location.hash = `#product-${product.id}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg mb-4">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-hue-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <p className="text-hue-paper text-sm font-light italic line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>
              <h3 className="font-serif text-lg text-hue-ink group-hover:text-hue-purple transition-colors">{product.title}</h3>
              <p className="text-hue-ink/50 text-sm font-medium">{formatPrice(product.price)}</p>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-full border border-hue-ink/10 disabled:opacity-30 hover:bg-hue-ink/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-hue-ink text-hue-paper' : 'hover:bg-hue-ink/5'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-full border border-hue-ink/10 disabled:opacity-30 hover:bg-hue-ink/5 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-24 bg-hue-mist">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/hue-about/800/800" 
                alt="Artist in Hue" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-hue-paper p-4 rounded-2xl shadow-xl hidden lg:block">
              <div className="w-full h-full border border-hue-purple/20 rounded-xl flex items-center justify-center text-center p-4">
                <p className="font-serif italic text-hue-purple">{t.about.quote}</p>
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-hue-purple font-medium tracking-widest uppercase text-sm mb-4 block">{t.about.label}</span>
            <h2 className="font-serif text-4xl md:text-5xl text-hue-ink mb-8">{t.about.title}</h2>
            <div className="space-y-6 text-hue-ink/70 leading-relaxed text-lg">
              <p>{t.about.desc1}</p>
              <p>{t.about.desc2}</p>
              <p>{t.about.desc3}</p>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-hue-paper overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Customer" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-hue-ink/50 font-medium tracking-wide">{t.about.trusted}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- How to Buy Section --- */}
      <section id="how-to-buy" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-hue-ink mb-4">{t.howToBuy.title}</h2>
          <p className="text-hue-ink/50 max-w-xl mx-auto">{t.howToBuy.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { step: "01", title: t.howToBuy.step1.title, desc: t.howToBuy.step1.desc },
            { step: "02", title: t.howToBuy.step2.title, desc: t.howToBuy.step2.desc },
            { step: "03", title: t.howToBuy.step3.title, desc: t.howToBuy.step3.desc }
          ].map((item, i) => (
            <div key={i} className="relative p-8 rounded-2xl border border-hue-ink/5 hover:border-hue-purple/20 transition-colors group">
              <span className="font-serif text-6xl text-hue-purple/10 absolute top-4 right-8 group-hover:text-hue-purple/20 transition-colors">{item.step}</span>
              <h3 className="font-serif text-2xl text-hue-ink mb-4 relative z-10">{item.title}</h3>
              <p className="text-hue-ink/60 leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer id="contact" className="bg-hue-ink text-hue-paper py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <LotusIcon className="w-8 h-8 text-hue-purple" />
              <span className="font-serif text-2xl font-semibold tracking-tight">Hue Art Prints</span>
            </div>
            <p className="text-hue-paper/50 max-w-md mb-8 leading-relaxed">
              {t.footer.desc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-hue-paper/10 flex items-center justify-center hover:bg-hue-paper hover:text-hue-ink transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-hue-paper/10 flex items-center justify-center hover:bg-hue-paper hover:text-hue-ink transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">{t.footer.contact}</h4>
            <ul className="space-y-4 text-hue-paper/60 text-sm">
              <li className="flex items-center gap-3"><Mail className="w-4 h-4" /> vinhhuong119@gmail.com</li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> +(84)778480911</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> 273 Điện Biên Phủ, Thành Phố Huế</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">{t.footer.info}</h4>
            <ul className="space-y-4 text-hue-paper/60 text-sm">
              <li><a href="#" className="hover:text-hue-paper transition-colors">{t.footer.policy}</a></li>
              <li><a href="#" className="hover:text-hue-paper transition-colors">{t.footer.returns}</a></li>
              <li><a href="#" className="hover:text-hue-paper transition-colors">{t.footer.privacy}</a></li>
              <li><a href="#" className="hover:text-hue-paper transition-colors">{t.footer.terms}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-hue-paper/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-hue-paper/30 uppercase tracking-widest">
          <p>{t.footer.rights}</p>
          <p>{t.footer.handcrafted}</p>
        </div>
      </footer>
      </>
      )}

      {/* --- Product Detail Modal / View --- */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10"
          >
            <div className="absolute inset-0 bg-hue-ink/90 backdrop-blur-sm" onClick={() => window.location.hash = ''} />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-hue-paper w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                className="absolute top-6 right-6 z-10 p-2 bg-hue-paper/80 rounded-full text-hue-ink hover:bg-hue-ink hover:text-hue-paper transition-all"
                onClick={() => window.location.hash = ''}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-full md:w-1/2 h-[400px] md:h-auto bg-hue-mist">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                <div className="mb-8">
                  <span className="text-hue-purple text-xs font-bold tracking-widest uppercase mb-2 block">{selectedProduct.locationHint}</span>
                  <h2 className="font-serif text-4xl text-hue-ink mb-4">{selectedProduct.title}</h2>
                  <p className="text-hue-ink/60 leading-relaxed italic mb-6">"{selectedProduct.description}"</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-hue-mist text-hue-purple text-xs rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>

                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  const formData = new FormData(e.currentTarget);
                  setCheckoutData({
                    productId: selectedProduct.id,
                    sizeIndex: parseInt(formData.get('size') as string),
                    quantity: parseInt(formData.get('quantity') as string)
                  });
                  setSelectedProduct(null);
                  setView('checkout');
                  window.location.hash = '';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} className="mt-auto space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-hue-ink/40 mb-3">{t.product.selectSize}</label>
                      <select name="size" className="w-full bg-transparent border-b border-hue-ink/20 py-2 focus:outline-none focus:border-hue-purple text-sm">
                        {SIZES.map((size, i) => (
                          <option key={i} value={i}>{size.label} - {formatPrice(selectedProduct.price * size.multiplier)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-hue-ink/40 mb-3">{t.product.quantity}</label>
                      <input 
                        type="number" 
                        name="quantity" 
                        defaultValue={1} 
                        min={1} 
                        className="w-full bg-transparent border-b border-hue-ink/20 py-2 focus:outline-none focus:border-hue-purple text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-hue-ink/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-hue-ink/40 uppercase tracking-widest mb-1">{t.product.basePrice}</p>
                      <p className="text-2xl font-serif text-hue-ink">{formatPrice(selectedProduct.price)}</p>
                    </div>
                    <button 
                      type="submit"
                      className="w-full sm:w-auto px-10 py-4 bg-hue-ink text-hue-paper rounded-full font-medium hover:bg-hue-purple transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" /> {t.product.secureCheckout}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Success Modal --- */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-hue-ink/95 backdrop-blur-xl" />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-hue-paper w-full max-w-lg rounded-2xl shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h2 className="font-serif text-3xl text-hue-ink mb-2">{t.success.title}</h2>
              <p className="text-hue-ink/50 mb-8">{t.success.desc} <span className="font-bold text-hue-ink">#{orderSuccess.id}</span></p>

              <div className="bg-hue-mist p-6 rounded-xl text-left mb-8 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-hue-purple">{t.success.instructions}</h4>
                
                {orderSuccess.paymentMethod === 'bank' && (
                  <div className="text-sm text-hue-ink/70 space-y-2">
                    <p>{t.success.bank}: <span className="font-bold">Vietcombank</span></p>
                    <p>{t.success.account}: <span className="font-bold">0161000042240</span></p>
                    <p>{t.success.name}: <span className="font-bold">VINH HUONG</span></p>
                    <p>{t.success.content}: <span className="font-bold">HUEART {orderSuccess.id} {orderSuccess.customer.name}</span></p>
                  </div>
                )}

                {(orderSuccess.paymentMethod === 'momo' || orderSuccess.paymentMethod === 'zalopay') && (
                  <p className="text-sm text-hue-ink/70">{t.success.momoZalo}</p>
                )}

                {orderSuccess.paymentMethod === 'cod' && (
                  <p className="text-sm text-hue-ink/70">{t.success.cod}</p>
                )}
              </div>

              <button 
                onClick={() => { 
                  setOrderSuccess(null); 
                  setCheckoutData(null); 
                  setSelectedProduct(null); 
                  setView('main'); 
                  window.location.hash = ''; 
                }}
                className="w-full py-4 border border-hue-ink/10 text-hue-ink rounded-xl font-bold uppercase tracking-widest hover:bg-hue-ink hover:text-hue-paper transition-all cursor-pointer"
              >
                {t.success.return}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
