import { PrintSize, PaperType, FrameType, MatType, RoomEnvironment } from '../types';

export const PRINT_SIZES: PrintSize[] = [
  {
    id: 'size-small',
    name: 'Bản Nhỏ Sưu Tầm',
    names: {
      vi: 'Bản Nhỏ Sưu Tầm',
      en: 'Collector Small',
      fr: 'Petit Format Collection',
    },
    dimensionsCm: '30 × 45 cm',
    dimensionsInches: '12 × 18 in',
    priceMultiplier: 1.0,
    shippingClass: 'standard',
  },
  {
    id: 'size-classic',
    name: 'Bản Tiêu Chuẩn Phòng Tranh',
    names: {
      vi: 'Bản Tiêu Chuẩn Phòng Tranh',
      en: 'Classic Gallery Edition',
      fr: 'Format Classique Galerie',
    },
    dimensionsCm: '50 × 75 cm',
    dimensionsInches: '20 × 30 in',
    priceMultiplier: 1.85,
    shippingClass: 'standard',
  },
  {
    id: 'size-exhibition',
    name: 'Bản Triển Lãm Cao Cấp',
    names: {
      vi: 'Bản Triển Lãm Cao Cấp',
      en: 'Exhibition Master Edition',
      fr: 'Grand Format Exposition',
    },
    dimensionsCm: '70 × 105 cm',
    dimensionsInches: '28 × 42 in',
    priceMultiplier: 2.9,
    shippingClass: 'express',
  },
  {
    id: 'size-grand',
    name: 'Bản Hoàng Gia Cực Đại',
    names: {
      vi: 'Bản Hoàng Gia Cực Đại',
      en: 'Imperial Grand Statement',
      fr: 'Format Impérial Monumental',
    },
    dimensionsCm: '100 × 150 cm',
    dimensionsInches: '40 × 60 in',
    priceMultiplier: 4.4,
    shippingClass: 'oversized',
  },
];

export const PAPER_TYPES: PaperType[] = [
  {
    id: 'paper-hahnemuhle',
    name: 'Hahnemühle Photo Rag',
    subname: '308 gsm • 100% Cotton Rag',
    subnames: {
      vi: '308 gsm • 100% Sợi Bông Cotton Tự Nhiên',
      en: '308 gsm • 100% Pure Cotton Rag',
      fr: '308 g/m² • 100% Coton Pur Chiffon',
    },
    weightGsm: 308,
    finish: 'Mịn Nhung Chống Lóa',
    finishes: {
      vi: 'Mịn Nhung Chống Lóa',
      en: 'Smooth Velvety Matte',
      fr: 'Mat Velouté Sans Reflet',
    },
    description: 'Chuẩn mực vàng của các bảo tàng thế giới. Sợi cotton tự nhiên với chiều sâu màu đen tuyền tuyệt hảo và độ bền màu trên 100 năm.',
    descriptions: {
      vi: 'Chuẩn mực vàng của các bảo tàng thế giới. Sợi cotton tự nhiên với chiều sâu màu đen tuyền tuyệt hảo và độ bền màu trên 100 năm.',
      en: 'The global museum gold standard. Pure cotton with an exquisite felt structure, extraordinary depth of blacks, and 100+ year archival permanence.',
      fr: 'La référence absolue des musées internationaux. Pur coton offrant une profondeur exceptionnelle des noirs et une tenue des pigments sur plus de 100 ans.',
    },
    surchargeUSD: 0,
  },
  {
    id: 'paper-canson',
    name: 'Canson Infinity Platine',
    subname: '310 gsm • Pure White Lustre',
    subnames: {
      vi: '310 gsm • Ánh Luster Trắng Tinh Khiết',
      en: '310 gsm • Pure White Satin Lustre',
      fr: '310 g/m² • Blanc Pur Satiné Baryté',
    },
    weightGsm: 310,
    finish: 'Bóng Mờ Baryta Truyền Thống',
    finishes: {
      vi: 'Bóng Mờ Baryta Truyền Thống',
      en: 'Satin Baryta Lustre',
      fr: 'Lustré Baryté Traditionnel',
    },
    description: 'Tái hiện cảm giác phòng tối tráng bạc cổ điển. Chuyển sắc màu mượt mà cho kiến trúc cung đình và mặt nước lung linh.',
    descriptions: {
      vi: 'Tái hiện cảm giác phòng tối tráng bạc cổ điển. Chuyển sắc màu mượt mà cho kiến trúc cung đình và mặt nước lung linh.',
      en: 'True photographic darkroom silver-halide feel with subtle reflective luster. Incredible tonal gradations for architecture and waterscapes.',
      fr: 'Rendu argentique traditionnel de chambre noire avec un éclat subtil. Dégradés de tons parfaits pour l’architecture royale et les scènes aquatiques.',
    },
    surchargeUSD: 25,
  },
  {
    id: 'paper-washi',
    name: 'Awagami Kozo FineArt Washi',
    subname: '110 gsm • Mulberry Fibre',
    subnames: {
      vi: '110 gsm • Sợi Vỏ Dâu Tằm Thủ Công',
      en: '110 gsm • Handcrafted Mulberry Fibre',
      fr: '110 g/m² • Fibres Artisanales de Mûrier',
    },
    weightGsm: 110,
    finish: 'Vân Giấy Hữu Cơ Tự Nhiên',
    finishes: {
      vi: 'Vân Giấy Hữu Cơ Tự Nhiên',
      en: 'Artisanal Organic Deckle',
      fr: 'Texture Organique Faite Main',
    },
    description: 'Giấy dó Washi thủ công Nhật Bản với thớ sợi dâu tằm tự nhiên. Mang lại vẻ mờ ảo, bồng bềnh tựa tranh thủy mặc cho sông Hương.',
    descriptions: {
      vi: 'Giấy dó Washi thủ công Nhật Bản với thớ sợi dâu tằm tự nhiên. Mang lại vẻ mờ ảo, bồng bềnh tựa tranh thủy mặc cho sông Hương.',
      en: 'Traditional Japanese mulberry paper handcrafted with visible organic fibers. Imparts a poetic, ethereal dreaminess to Hue’s misty mornings.',
      fr: 'Papier traditionnel japonais fabriqué à la main avec des fibres végétales visibles. Confère une douceur vaporeuse aux matins brumeux de Hué.',
    },
    surchargeUSD: 45,
  },
  {
    id: 'paper-canvas',
    name: 'Vải Toan Canvas Lưu Trữ',
    subname: '400 gsm • OBA-Free Cotton-Poly',
    subnames: {
      vi: '400 gsm • Toan Mỹ Thuật Căng Khung Gỗ',
      en: '400 gsm • Museum Stretched Canvas',
      fr: '400 g/m² • Toile Canvas Montée sur Châssis',
    },
    weightGsm: 400,
    finish: 'Bề Mặt Dệt Mỹ Thuật Phủ Lớp Bảo Vệ',
    finishes: {
      vi: 'Bề Mặt Dệt Mỹ Thuật Phủ Lớp Bảo Vệ',
      en: 'Fine Woven Satin Texture',
      fr: 'Texture Toilée Satinée Protectrice',
    },
    description: 'Căng sẵn trên khung gỗ sấy khô không cong vênh. Bề mặt phủ lớp bảo vệ UV chống ẩm mốc, sẵn sàng treo không cần mặt kính.',
    descriptions: {
      vi: 'Căng sẵn trên khung gỗ sấy khô không cong vênh. Bề mặt phủ lớp bảo vệ UV chống ẩm mốc, sẵn sàng treo không cần mặt kính.',
      en: 'Stretched over kiln-dried hardwood with UV protective satin seal, ready to hang without glass reflection.',
      fr: 'Montée sur châssis en bois séché au four, avec vernis de protection anti-UV, prête à être accrochée sans reflet de verre.',
    },
    surchargeUSD: 60,
  },
];

export const FRAME_TYPES: FrameType[] = [
  {
    id: 'frame-none',
    name: 'Bản In Cuộn Ống Lưu Trữ',
    names: {
      vi: 'Bản In Cuộn Ống Lưu Trữ (Không Khung)',
      en: 'Unframed Archival Print in Tube',
      fr: 'Tirage Roulé en Tube d’Archivage',
    },
    colorName: 'Đóng gói trong ống chuyên dụng',
    material: 'Giấy glassine chống ẩm & găng tay cotton',
    materials: {
      vi: 'Giấy glassine chống ẩm & găng tay cotton',
      en: 'Acid-free glassine wrapping & cotton gloves',
      fr: 'Papier glassine neutre & gants de manipulation',
    },
    borderHex: 'transparent',
    surchargeUSD: 0,
    description: 'Được đóng gói bảo lưu cẩn thận trong ống carton cứng chuyên dụng, sẵn sàng để quý khách tùy chọn đóng khung riêng.',
    descriptions: {
      vi: 'Được đóng gói bảo lưu cẩn thận trong ống carton cứng chuyên dụng, sẵn sàng để quý khách tùy chọn đóng khung riêng.',
      en: 'Shipped rolled in a heavy-duty archival tube with handling cotton gloves and Certificate of Authenticity.',
      fr: 'Expédié roulé dans un tube d’archivage renforcé avec gants de manipulation et Certificat d’Authenticité.',
    },
    frameWidthPx: 0,
  },
  {
    id: 'frame-natural-oak',
    name: 'Gỗ Sồi Trắng Tự Nhiên',
    names: {
      vi: 'Gỗ Sồi Trắng Tự Nhiên',
      en: 'Solid Natural White Oak',
      fr: 'Chêne Blanc Massif Naturel',
    },
    colorName: 'Mộc Mạc Bắc Âu & Japandi',
    material: 'Gỗ Sồi châu Âu nguyên khối chuẩn FSC',
    materials: {
      vi: 'Gỗ Sồi châu Âu nguyên khối chuẩn FSC',
      en: 'FSC-certified solid European Oak',
      fr: 'Chêne massif européen certifié FSC',
    },
    borderHex: '#d8b688',
    surchargeUSD: 120,
    description: 'Vân gỗ tự nhiên thanh thoát phủ sáp mờ hữu cơ. Rất hài hòa với không gian tường sáng, nội thất mây tre và phong cách Zen thiền định.',
    descriptions: {
      vi: 'Vân gỗ tự nhiên thanh thoát phủ sáp mờ hữu cơ. Rất hài hòa với không gian tường sáng, nội thất mây tre và phong cách Zen thiền định.',
      en: 'Warm, minimalist timber grain with subtle wax finish. Pairs organically with natural linen walls and zen interiors.',
      fr: 'Grain de bois chaleureux et épuré avec finition cirée subtile. Idéal avec des murs clairs et une décoration zen contemporaine.',
    },
    frameWidthPx: 14,
  },
  {
    id: 'frame-kyoto-walnut',
    name: 'Gỗ Óc Chó Sẫm Sang Trọng',
    names: {
      vi: 'Gỗ Óc Chó Sẫm Sang Trọng',
      en: 'Deep Kyoto American Walnut',
      fr: 'Noyer Américain Foncé Profond',
    },
    colorName: 'Nâu Trầm Quý Phái',
    material: 'Gỗ Óc Chó đen Bắc Mỹ nguyên khối',
    materials: {
      vi: 'Gỗ Óc Chó đen Bắc Mỹ nguyên khối',
      en: 'Solid American Black Walnut',
      fr: 'Noyer noir américain massif',
    },
    borderHex: '#3d2b1f',
    surchargeUSD: 145,
    description: 'Tông gỗ nâu sô-cô-la trầm ấm quý phái. Tôn vinh nét cổ kính của kiến trúc cung đình hoàng thành và vẻ huyền bí của lăng tẩm.',
    descriptions: {
      vi: 'Tông gỗ nâu sô-cô-la trầm ấm quý phái. Tôn vinh nét cổ kính của kiến trúc cung đình hoàng thành và vẻ huyền bí của lăng tẩm.',
      en: 'Luxurious dark hardwood with deep chocolate undertones. Anchors imperial architecture and twilight photography with timeless gravity.',
      fr: 'Bois précieux aux reflets chocolat profond. Sublime l’architecture impériale et les clichés crépusculaires avec une solennité intemporelle.',
    },
    frameWidthPx: 16,
  },
  {
    id: 'frame-gallery-black',
    name: 'Đen Mờ Kiến Trúc Triển Lãm',
    names: {
      vi: 'Đen Mờ Kiến Trúc Triển Lãm',
      en: 'Architectural Matte Black',
      fr: 'Noir Mat Architectural Galerie',
    },
    colorName: 'Đen Tinh Tế Chuẩn Triển Lãm',
    material: 'Hợp kim nhôm xước mạ anodized & lõi gỗ',
    materials: {
      vi: 'Hợp kim nhôm xước mạ anodized & lõi gỗ',
      en: 'Anodized brushed aluminum & wood core',
      fr: 'Aluminium brossé anodisé et âme en bois',
    },
    borderHex: '#141416',
    surchargeUSD: 110,
    description: 'Thiết kế hiện đại thanh mảnh được sử dụng tại các bảo tàng mỹ thuật đương đại quốc tế, tôn trọn vẹn điểm nhìn vào tác phẩm.',
    descriptions: {
      vi: 'Thiết kế hiện đại thanh mảnh được sử dụng tại các bảo tàng mỹ thuật đương đại quốc tế, tôn trọn vẹn điểm nhìn vào tác phẩm.',
      en: 'Sleek, contemporary profile used in international fine-art exhibitions. Crisp shadowline that lets the photograph command the room.',
      fr: 'Profil contemporain ultra-épuré plébiscité par les galeries internationales. Laisse la photographie rayonner au cœur de la pièce.',
    },
    frameWidthPx: 14,
  },
  {
    id: 'frame-floating-white',
    name: 'Trắng Sứ Bảo Tàng',
    names: {
      vi: 'Trắng Sứ Bảo Tàng',
      en: 'Museum Crisp Gallery White',
      fr: 'Blanc Pur Galerie de Musée',
    },
    colorName: 'Trắng Tinh Khôi Mở Rộng Không Gian',
    material: 'Gỗ Phong phủ sơn mài mờ cao cấp',
    materials: {
      vi: 'Gỗ Phong phủ sơn mài mờ cao cấp',
      en: 'Lacquered solid maple',
      fr: 'Érable massif laqué satiné',
    },
    borderHex: '#eae7df',
    surchargeUSD: 120,
    description: 'Tạo hiệu ứng bay bổng thoáng đãng, mang lại cảm giác không gian rộng mở và thanh khiết cho bức ảnh.',
    descriptions: {
      vi: 'Tạo hiệu ứng bay bổng thoáng đãng, mang lại cảm giác không gian rộng mở và thanh khiết cho bức ảnh.',
      en: 'Pristine, airy gallery frame with deep interior bevel. Creates an expansive float effect against contemporary light walls.',
      fr: 'Cadre épuré et lumineux avec biseau intérieur profond. Crée une impression de légèreté aérienne sur les murs contemporains.',
    },
    frameWidthPx: 14,
  },
];

export const MAT_TYPES: MatType[] = [
  {
    id: 'mat-none',
    name: 'Tràn Viền (Không Bo)',
    names: {
      vi: 'Tràn Viền (Không Bo)',
      en: 'Full Bleed (No Mat)',
      fr: 'Plein Format (Sans Passe-Partout)',
    },
    colorHex: 'transparent',
    surchargeUSD: 0,
  },
  {
    id: 'mat-ivory',
    name: 'Trắng Ngà Bảo Tồn (6cm)',
    names: {
      vi: 'Trắng Ngà Bảo Tồn (6cm)',
      en: 'Archival Warm Ivory (6cm)',
      fr: 'Ivoire Chaud d’Archivage (6cm)',
    },
    colorHex: '#f6f3eb',
    surchargeUSD: 35,
  },
  {
    id: 'mat-museum-charcoal',
    name: 'Xám Than Đậm (6cm)',
    names: {
      vi: 'Xám Than Đậm (6cm)',
      en: 'Museum Deep Charcoal (6cm)',
      fr: 'Gris Anthracite Muséal (6cm)',
    },
    colorHex: '#1f2127',
    surchargeUSD: 35,
  },
];

export const ROOM_PRESETS: RoomEnvironment[] = [
  {
    id: 'room-living',
    name: 'Phòng Khách Tối Giản Hiện Đại',
    names: {
      vi: 'Phòng Khách Tối Giản Hiện Đại',
      en: 'Zen Minimalist Living Room',
      fr: 'Salon Épuré Minimaliste Zen',
    },
    sceneImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1400&q=80',
    wallColor: '#e8e3d8',
    accentNote: 'Sofa vải lanh tự nhiên, bàn đá travertine, ánh sáng ban chiều dịu nhẹ',
  },
  {
    id: 'room-study',
    name: 'Phòng Làm Việc & Thư Viện Sang Trọng',
    names: {
      vi: 'Phòng Làm Việc & Thư Viện Sang Trọng',
      en: 'Contemporary Executive Study',
      fr: 'Cabinet de Travail & Bibliothèque',
    },
    sceneImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
    wallColor: '#2b2f38',
    accentNote: 'Kệ sách gỗ óc chó, đèn đọc sách đồng thau, không gian tĩnh lặng trầm tư',
  },
  {
    id: 'room-dining',
    name: 'Phòng Ăn Japandi Ấm Cúng',
    names: {
      vi: 'Phòng Ăn Japandi Ấm Cúng',
      en: 'Kyoto Japandi Dining Space',
      fr: 'Espace Salle à Manger Japandi',
    },
    sceneImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
    wallColor: '#f1eee7',
    accentNote: 'Bàn ăn gỗ sồi tự nhiên, đồ gốm thủ công, ánh nắng ban mai nhẹ nhàng',
  },
  {
    id: 'room-gallery',
    name: 'Không Gian Triển Lãm Bảo Tàng',
    names: {
      vi: 'Không Gian Triển Lãm Bảo Tàng',
      en: 'Museum Exhibition Salon',
      fr: 'Salon d’Exposition de Galerie',
    },
    sceneImage: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1400&q=80',
    wallColor: '#17191e',
    accentNote: 'Đèn chiếu điểm chuyên dụng, sàn bê tông mài, tôn vinh tác phẩm tuyệt đối',
  },
];
