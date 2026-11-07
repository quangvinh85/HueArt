export type Language = 'vi' | 'en' | 'fr';

export interface Translations {
  topBanner: string;
  brandSubtitle: string;
  nav: {
    gallery: string;
    collections: string;
    heritage: string;
    curator: string;
    submit: string;
    searchPlaceholder: string;
    saved: string;
    bag: string;
  };
  hero: {
    tag: string;
    titlePart1: string;
    titleHighlight: string;
    description: string;
    exploreBtn: string;
    roomBtn: string;
    curatorBtn: string;
    badges: {
      paper: { title: string; subtitle: string };
      editions: { title: string; subtitle: string };
      auth: { title: string; subtitle: string };
      transit: { title: string; subtitle: string };
    };
  };
  filter: {
    sectionTag: string;
    sectionTitle: string;
    showingText: string;
    printsCount: string;
    allEditions: string;
    allEditionsSub: string;
    imperialEchoes: string;
    imperialEchoesSub: string;
    perfumeRiver: string;
    perfumeRiverSub: string;
    livingTraditions: string;
    livingTraditionsSub: string;
    poeticMonochrome: string;
    poeticMonochromeSub: string;
    formatLabel: string;
    allFormats: string;
    landscape: string;
    portrait: string;
    panoramic: string;
    atmosphereLabel: string;
    allMoods: string;
    imperialGold: string;
    etherealMist: string;
    meditative: string;
    vibrantSun: string;
    nocturne: string;
    sortCurator: string;
    sortScarcity: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortNewest: string;
    activeFilter: string;
    savedFilter: string;
    keywordFilter: string;
    resetAll: string;
    noResultsTitle: string;
    noResultsText: string;
  };
  card: {
    edition: string;
    curatorChoice: string;
    fromPrice: string;
    viewEdition: string;
    configureFrame: string;
    wallPreview: string;
  };
  modal: {
    editionBadge: string;
    archivalNote: string;
    loupePrompt: string;
    viewOnWall: string;
    tabConfigure: string;
    tabStory: string;
    tabCamera: string;
    stepSize: string;
    stepPaper: string;
    stepFrame: string;
    stepMat: string;
    included: string;
    customDedicationLabel: string;
    customDedicationPlaceholder: string;
    optional: string;
    photographerNote: string;
    historicalSignificance: string;
    viewCertificateSample: string;
    cameraBody: string;
    cameraLens: string;
    exposureSettings: string;
    coordinates: string;
    capturedTime: string;
    rawNote: string;
    totalInvestment: string;
    freeInsuredNote: string;
    roomWallBtn: string;
    addedToBag: string;
    addEditionToBag: string;
  };
  visualizer: {
    title: string;
    subtitle: string;
    stepRoom: string;
    stepWallColor: string;
    stepFrame: string;
    customizeEditionBtn: string;
    prevArt: string;
    nextArt: string;
  };
  curatorModal: {
    title: string;
    subtitle: string;
    themesLabel: string;
    inputLabel: string;
    inputPlaceholder: string;
    consultBtn: string;
    evaluating: string;
    evaluationTitle: string;
    recommendedArtworks: string;
    scaleLabel: string;
    framingLabel: string;
    configureArtBtn: string;
  };
  cart: {
    title: string;
    freeShippingUnlocked: string;
    addMoreForFreeShipping: string;
    emptyTitle: string;
    emptyText: string;
    exploreCollectionBtn: string;
    subtotal: string;
    shipping: string;
    complimentary: string;
    totalInvestment: string;
    guaranteeNote: string;
    proceedCheckoutBtn: string;
  };
  checkout: {
    title: string;
    confirmedTitle: string;
    editionsInAcquisition: string;
    totalAmount: string;
    detailsHeader: string;
    fullNameLabel: string;
    emailLabel: string;
    streetLabel: string;
    countryLabel: string;
    giftBoxOption: string;
    encryptedBadge: string;
    confirmAcquisitionBtn: string;
    processing: string;
    thankYou: string;
    orderReference: string;
    dispatchTitle: string;
    dispatchText: string;
    viewCertificateBtn: string;
    returnGalleryBtn: string;
    paymentMethodLabel: string;
    momo: string;
    momoSub: string;
    zalopay: string;
    zalopaySub: string;
    bankTransfer: string;
    bankTransferSub: string;
    card: string;
    cardSub: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
    scanToPay: string;
    copied: string;
    copy: string;
    paymentNote: string;
    selectedMethod: string;
  };
  certificate: {
    title: string;
    printPdfBtn: string;
    studioHeader: string;
    mainTitle: string;
    subtitleVi: string;
    statement: string;
    artworkTitleLabel: string;
    editionLabel: string;
    dimensionsLabel: string;
    paperMediumLabel: string;
    locationGpsLabel: string;
    registeredToLabel: string;
    issuedLabel: string;
    artistTitle: string;
  };
  about: {
    tag: string;
    titlePart1: string;
    titleHighlight: string;
    p1: string;
    p2: string;
    stat1Number: string;
    stat1Desc: string;
    stat2Number: string;
    stat2Desc: string;
    calloutBadge: string;
    calloutDesc: string;
    themesTag: string;
    themesTitle: string;
    pI_tag: string;
    pI_title: string;
    pI_desc: string;
    pII_tag: string;
    pII_title: string;
    pII_desc: string;
    pIII_tag: string;
    pIII_title: string;
    pIII_desc: string;
    explorePortfolio: string;
    museumSpecsTag: string;
    museumSpecsTitle: string;
    spec1Title: string;
    spec1Desc: string;
    spec2Title: string;
    spec2Desc: string;
    spec3Title: string;
    spec3Desc: string;
  };
  footer: {
    brandText: string;
    atelierLocation: string;
    portfoliosTitle: string;
    gazetteTitle: string;
    gazetteDesc: string;
    emailPlaceholder: string;
    joinBtn: string;
    joinSuccess: string;
    guaranteeText: string;
    rights: string;
  };
  submitModal: {
    menuLabel: string;
    modalTitle: string;
    modalSubtitle: string;
    dropzoneTitle: string;
    dropzoneSubtitle: string;
    changeImage: string;
    artworkDetailsTitle: string;
    titleViLabel: string;
    titleEnLabel: string;
    collectionLabel: string;
    yearLabel: string;
    locationLabel: string;
    coordinatesLabel: string;
    storyLabel: string;
    storyPlaceholder: string;
    historyLabel: string;
    historyPlaceholder: string;
    cameraSectionTitle: string;
    cameraBodyLabel: string;
    lensLabel: string;
    exposureSettingsLabel: string;
    orientationLabel: string;
    moodLabel: string;
    pricingSectionTitle: string;
    basePriceLabel: string;
    editionLimitLabel: string;
    authorSectionTitle: string;
    authorNameLabel: string;
    authorEmailLabel: string;
    authorPhoneLabel: string;
    authorSocialLabel: string;
    submitButton: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    emailDestination: string;
    submissionRef: string;
    previewOnWall: string;
    closeBtn: string;
    requiredFieldsNote: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  vi: {
    topBanner: "Giao Hàng Bảo Đảm Toàn Cầu • Bản In Giới Hạn Ký Tên Đánh Số • Giấy Cotton Lưu Trữ 100 Năm",
    brandSubtitle: "Thừa Thiên Huế • Việt Nam",
    nav: {
      gallery: "Phòng Trưng Bày",
      collections: "Bộ Sưu Tập",
      heritage: "Di Sản & Chế Tác",
      curator: "Giám Tuyển AI",
      submit: "Gửi Tác Phẩm",
      searchPlaceholder: "Tìm kiếm: Hoàng thành, Sông Hương, làng hương...",
      saved: "Đã Lưu",
      bag: "Giỏ Tác Phẩm",
    },
    hero: {
      tag: "Nhiếp Ảnh Mỹ Thuật Phiên Bản Giới Hạn",
      titlePart1: "Artistic photography",
      titleHighlight: "NHIẾP ẢNH NGHỆ THUẬT HUẾ",
      description: "Những tuyệt tác nhiếp ảnh chuẩn bảo tàng quốc tế, lưu giữ vẻ đẹp trầm mặc của dòng Hương giang, rêu phong hoàng thành và hồn cốt văn hóa nghìn năm của xứ Huế thơ mộng.",
      exploreBtn: "Khám Phá Bộ Sưu Tập",
      roomBtn: "Ướm Tranh Lên Tường",
      curatorBtn: "Tư Vấn Giám Tuyển AI",
      badges: {
        paper: { title: "Giấy Hahnemühle Rag", subtitle: "100% Cotton 308gsm" },
        editions: { title: "Bản In Giới Hạn", subtitle: "Đánh số & Ký tên tay" },
        auth: { title: "Chứng Nhận Độc Bản", subtitle: "Kèm tem niêm phong" },
        transit: { title: "Vận Chuyển Toàn Cầu", subtitle: "Bảo hiểm 100%" },
      },
    },
    filter: {
      sectionTag: "Tuyển Tập Tác Phẩm Chuẩn Bảo Tàng",
      sectionTitle: "Những Góc Nhìn Tuyệt Đẹp Về Huế",
      showingText: "Đang hiển thị",
      printsCount: "bản in mỹ thuật cao cấp",
      allEditions: "Tất Cả Tác Phẩm",
      allEditionsSub: "Toàn bộ lưu trữ",
      imperialEchoes: "Dấu Ấn Hoàng Thành",
      imperialEchoesSub: "Đại Nội & Lăng Tẩm",
      perfumeRiver: "Hương Giang Êm Đềm",
      perfumeRiverSub: "Sông Hương & Đầm Chuồn",
      livingTraditions: "Làng Nghề & Nét Đẹp Huế",
      livingTraditionsSub: "Hương Trầm, Hoa Sen & Lụa",
      poeticMonochrome: "Sắc Trắng Đen Hoài Niệm",
      poeticMonochromeSub: "Tông Bạc Tinh Tế",
      formatLabel: "Khung Hình:",
      allFormats: "Tất Cả",
      landscape: "Khổ Ngang",
      portrait: "Khổ Dọc",
      panoramic: "Toàn Cảnh",
      atmosphereLabel: "Sắc Thái:",
      allMoods: "Tất Cả Sắc Thái",
      imperialGold: "Hoàng Gia Cổ Kính",
      etherealMist: "Sương Khói Mơ Màng",
      meditative: "Thiền Tịnh",
      vibrantSun: "Rực Rỡ Hương Trầm",
      nocturne: "Đêm Huyền Diệu",
      sortCurator: "Giám Tuyển Đề Xuất",
      sortScarcity: "Số Bản Còn Lại Ít Nhất",
      sortPriceLow: "Giá: Từ Thấp Đến Cao",
      sortPriceHigh: "Giá: Từ Cao Đến Thấp",
      sortNewest: "Tác Phẩm Mới Nhất",
      activeFilter: "Bộ lọc đang kích hoạt:",
      savedFilter: "Tác Phẩm Đã Lưu",
      keywordFilter: "Từ khóa",
      resetAll: "Đặt Lại Bộ Lọc",
      noResultsTitle: "Không tìm thấy tác phẩm phù hợp",
      noResultsText: "Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc đặt lại bộ lọc để khám phá toàn bộ bộ sưu tập ảnh Huế.",
    },
    card: {
      edition: "Bản in",
      curatorChoice: "Lựa Chọn Của Giám Tuyển",
      fromPrice: "Giá từ",
      viewEdition: "Chi Tiết Bản In",
      configureFrame: "Tùy Biến Khung Tranh",
      wallPreview: "Xem Lên Tường",
    },
    modal: {
      editionBadge: "Phiên Bản Giới Hạn",
      archivalNote: "In Sắc Tố Lưu Trữ Trên Giấy 100% Cotton Rag",
      loupePrompt: "Rê chuột qua ảnh để soi vân giấy và hạt ảnh sắc nét",
      viewOnWall: "Xem Trên Tường",
      tabConfigure: "Tùy Biến Bản In",
      tabStory: "Câu Chuyện Lịch Sử",
      tabCamera: "Thông Số Nhiếp Ảnh",
      stepSize: "1. Kích Thước Bản In",
      stepPaper: "2. Loại Giấy Mỹ Thuật Bảo Tàng",
      stepFrame: "3. Khung Gỗ Tự Nhiên Thủ Công",
      stepMat: "4. Bo Viền Bảo Tồn (Passe-partout)",
      included: "Đã bao gồm",
      customDedicationLabel: "Lời Đề Tặng Riêng Trên Giấy Chứng Nhận",
      customDedicationPlaceholder: "Ví dụ: Trân trọng lưu giữ tại Không gian Nghệ thuật Gia đình",
      optional: "Không bắt buộc",
      photographerNote: "Lời Tự Sự Của Nhiếp Ảnh Gia",
      historicalSignificance: "Ý Nghĩa Lịch Sử & Văn Hóa Cố Đô",
      viewCertificateSample: "Xem Mẫu Giấy Chứng Nhận Độc Bản",
      cameraBody: "Thân Máy Ảnh",
      cameraLens: "Ống Kính Quang Học",
      exposureSettings: "Thông Số Phơi Sáng",
      coordinates: "Tọa Độ Địa Lý",
      capturedTime: "Thời Điểm Ghi Hình",
      rawNote: "File ảnh RAW medium format nguyên bản, bảo toàn tối đa độ sâu màu quang học và chiều sâu sắc thái Huế.",
      totalInvestment: "Giá Trị Sưu Tầm",
      freeInsuredNote: "Bao bì bảo lưu chuyên dụng • Ký tên & đóng dấu chứng nhận",
      roomWallBtn: "Ướm Phòng",
      addedToBag: "Đã Thêm Vào Giỏ!",
      addEditionToBag: "Thêm Tác Phẩm Vào Giỏ",
    },
    visualizer: {
      title: "Ướm Tranh Tương Tác Lên Không Gian Phòng",
      subtitle: "Thử nghiệm tỉ lệ thực tế, màu tường nội thất và các loại khung gỗ tự nhiên",
      stepRoom: "1. Không Gian Nội Thất",
      stepWallColor: "2. Sắc Màu Sơn Tường",
      stepFrame: "3. Kiểu Dáng Khung Gỗ",
      customizeEditionBtn: "Tùy Biến Tác Phẩm Này",
      prevArt: "Tác phẩm trước",
      nextArt: "Tác phẩm sau",
    },
    curatorModal: {
      title: "Giám Tuyển Nghệ Thuật AI",
      subtitle: "Đề xuất tác phẩm phù hợp với phong cách kiến trúc, ánh sáng và bảng màu phòng bạn",
      themesLabel: "Chủ Đề Không Gian Gợi Ý",
      inputLabel: "Mô Tả Căn Phòng, Ánh Sáng & Tông Màu Nội Thất",
      inputPlaceholder: "Ví dụ: Phòng khách phong cách Đông Dương với sofa màu be, bàn gỗ óc chó sẫm màu và ánh nắng sớm buổi sáng...",
      consultBtn: "Nhận Lời Khuyên",
      evaluating: "Đang phân tích bảng màu và phong thủy không gian...",
      evaluationTitle: "Đánh Giá Của Giám Tuyển",
      recommendedArtworks: "Tác Phẩm Được Đề Xuất Cho Bạn",
      scaleLabel: "Kích thước khuyên dùng:",
      framingLabel: "Khung hoàn hảo:",
      configureArtBtn: "Chọn & Tùy Biến Tác Phẩm Này",
    },
    cart: {
      title: "Giỏ Tác Phẩm Sưu Tầm",
      freeShippingUnlocked: "Bạn đã đủ điều kiện nhận Giao Hàng Bảo Đảm Toàn Cầu Miễn Phí!",
      addMoreForFreeShipping: "Thêm để nhận miễn phí giao hàng toàn cầu.",
      emptyTitle: "Giỏ tác phẩm hiện đang trống",
      emptyText: "Hãy khám phá những tác phẩm giới hạn ghi lại vẻ đẹp hoàng thành và dòng sông Hương.",
      exploreCollectionBtn: "Khám Phá Tác Phẩm",
      subtotal: "Tạm tính",
      shipping: "Vận chuyển bảo đảm quốc tế",
      complimentary: "Miễn Phí",
      totalInvestment: "Tổng Giá Trị Sưu Tầm",
      guaranteeNote: "Bao gồm Giấy chứng nhận độc bản có dấu nổi và găng tay lụa chuyên dụng",
      proceedCheckoutBtn: "Tiến Hành Đặt Mua Tác Phẩm",
    },
    checkout: {
      title: "Xác Nhận Đặt Mua Tác Phẩm",
      confirmedTitle: "Xác Nhận Đặt Tác Phẩm Thành Công",
      editionsInAcquisition: "Danh Sách Tác Phẩm Đặt Mua",
      totalAmount: "Tổng Cộng (Đã gồm bảo hiểm toàn cầu):",
      detailsHeader: "Thông Tin Người Nhận & Chứng Nhận Bản Quyền",
      fullNameLabel: "Họ và Tên Người Sưu Tầm / Người Được Đề Tặng",
      emailLabel: "Email Nhận Mã Theo Dõi & Chứng Nhận Số",
      streetLabel: "Địa Chỉ Nhận Hàng",
      countryLabel: "Quốc Gia",
      giftBoxOption: "Kèm hộp quà cao cấp dập nổi và găng tay cotton chuyên dụng bảo quản",
      encryptedBadge: "Thanh Toán Bảo Mật SSL 256-Bit",
      confirmAcquisitionBtn: "Xác Nhận Mua Tác Phẩm",
      processing: "Đang bảo lưu số thứ tự phiên bản giới hạn...",
      thankYou: "Trân Trọng Cảm Ơn Quý Nhà Sưu Tầm",
      orderReference: "Mã Đơn Hàng Sưu Tầm:",
      dispatchTitle: "Quy Trình Chế Tác & Giao Hàng",
      dispatchText: "Tác phẩm của bạn đang được hoàn thiện tỉ mỉ trong môi trường phòng lab nghệ thuật chuẩn bảo tàng. Bạn sẽ nhận thông báo theo dõi mã vận đơn qua email ngay khi hoàn tất kiểm định niêm phong.",
      viewCertificateBtn: "Xem Giấy Chứng Nhận Độc Bản",
      returnGalleryBtn: "Quay Lại Phòng Trưng Bày",
      paymentMethodLabel: "Phương Thức Thanh Toán Hỗ Trợ",
      momo: "Ví Điện Tử MoMo",
      momoSub: "Quét mã MoMo QR thanh toán tức thì",
      zalopay: "Ví Điện Tử ZaloPay",
      zalopaySub: "Quét mã qua ví ZaloPay hoặc app Zalo",
      bankTransfer: "Chuyển Khoản Ngân Hàng (VietQR 24/7)",
      bankTransferSub: "Quét mã QR từ mọi ứng dụng ngân hàng tự động điền",
      card: "Thẻ Quốc Tế (Visa / Mastercard)",
      cardSub: "Thanh toán bảo mật cổng thẻ quốc tế",
      bankName: "Ngân Hàng",
      accountNumber: "Số Tài Khoản",
      accountName: "Chủ Tài Khoản",
      transferContent: "Nội Dung Chuyển Khoản",
      scanToPay: "Quét Mã QR Để Thanh Toán",
      copied: "Đã sao chép!",
      copy: "Sao chép",
      paymentNote: "Hệ thống sẽ tự động xác nhận đơn hàng ngay khi nhận được thanh toán thành công.",
      selectedMethod: "Phương thức thanh toán đã chọn",
    },
    certificate: {
      title: "Giấy Chứng Nhận Độc Bản Chuẩn Bảo Tàng",
      printPdfBtn: "In / Tải Xuống Bản PDF",
      studioHeader: "Hội Nhiếp Ảnh Huế • 273 Điện Biên Phủ, TP. Huế",
      mainTitle: "Certificate of Authenticity",
      subtitleVi: "Giấy Chứng Nhận Tác Phẩm Nhiếp Ảnh Mỹ Thuật Cố Đô Huế",
      statement: "Chứng thư này xác nhận tác phẩm nhiếp ảnh đi kèm là bản in mỹ thuật giới hạn nguyên gốc, được chế tác dưới sự giám sát trực tiếp của nghệ sĩ với tiêu chuẩn lưu trữ bảo tàng bền màu trên 100 năm.",
      artworkTitleLabel: "Tên Tác Phẩm",
      editionLabel: "Phiên Bản",
      dimensionsLabel: "Kích Thước",
      paperMediumLabel: "Chất Liệu Giấy",
      locationGpsLabel: "Tọa Độ Chụp",
      registeredToLabel: "Được lưu trữ vĩnh viễn mang tên",
      issuedLabel: "Ngày Cấp",
      artistTitle: "Nghệ Sĩ Nhiếp Ảnh & Giám Tuyển",
    },
    about: {
      tag: "Di Sản & Tầm Nhìn Nghệ Thuật",
      titlePart1: "Gìn Giữ Hơi Thở",
      titleHighlight: "Vĩnh Cửu Của Cố Đô",
      p1: "Nằm nép mình bên dòng sông Hương thơ mộng của miền Trung Việt Nam, Huế từng là kinh đô của mười ba triều vua Nguyễn từ năm 1802 đến năm 1945. Đó là một thành phố mang vẻ đẹp hoài niệm độc nhất vô nhị — nơi sự uy nghiêm của cung điện hòa quyện với rêu phong cổ kính, nơi tiếng chuông chùa Thiên Mụ tan vào sương sớm, và nơi những điệu thơ hoàng tộc vẫn vang vọng qua từng mái ngói lưu ly.",
      p2: "Mỗi tác phẩm trong bộ sưu tập đều được sáng tác với sự kiên nhẫn và tĩnh lặng tuyệt đối. Chúng tôi chờ đợi những khoảnh khắc quý giá khi nắng chiều ngả vàng ấm áp, khi mưa Huế phủ màn sương nhung lên mái Đại Nội, và khi những bó hương Thủy Xuân nở bung rực rỡ dưới ánh dương.",
      stat1Number: "100+ Năm",
      stat1Desc: "Cam kết bền màu chuẩn bảo tàng quốc tế, không phai mờ theo thời gian.",
      stat2Number: "30 đến 50",
      stat2Desc: "Giới hạn nghiêm ngặt mỗi tác phẩm trên toàn thế giới. Không bao giờ tái bản.",
      calloutBadge: "Tiêu Chuẩn Phòng Tối Nghệ Thuật",
      calloutDesc: "In ấn độc quyền với hệ 12 màu mực khoáng UltraChrome trên giấy mỹ thuật 100% cotton rag tự nhiên.",
      themesTag: "Ba Hướng Tiếp Cận Độc Đáo",
      themesTitle: "Những Bộ Sưu Tập Hoàng Triều",
      pI_tag: "Bộ Sưu Tập I",
      pI_title: "Dấu Ấn Hoàng Thành",
      pI_desc: "Cửa Ngọ Môn lầu Ngũ Phụng, những gờ mái rồng khảm sành và các lăng tẩm hoàng gia uy nghiêm.",
      pII_tag: "Bộ Sưu Tập II",
      pII_title: "Hương Giang Êm Đềm",
      pII_desc: "Thuyền độc mộc giữa sương sớm, lưới chài buông trên phá Tam Giang và hoa đăng đêm thanh bình.",
      pIII_tag: "Bộ Sưu Tập III",
      pIII_title: "Làng Nghề & Nét Đẹp Huế",
      pIII_desc: "Bó hương trầm rực rỡ Thủy Xuân, hoa sen thanh khiết hồ Tịnh Tâm và tà áo dài tím thướt tha.",
      explorePortfolio: "Khám Phá Bộ Sưu Tập →",
      museumSpecsTag: "Quy Chuẩn Kỹ Thuật Bảo Tàng",
      museumSpecsTitle: "Đẳng Cấp Bảo Tồn Lưu Trữ Thế Kỷ",
      spec1Title: "Giấy Cotton Hahnemühle 308gsm",
      spec1Desc: "Sản xuất tại Đức từ 100% sợi cotton tự nhiên không chứa hóa chất tẩy trắng huỳnh quang (OBA). Bề mặt mịn nhung chống lóa tuyệt đối trong mọi không gian nội thất.",
      spec2Title: "Khung Gỗ Tự Nhiên Tuyển Chọn",
      spec2Desc: "Khung tranh được chế tác thủ công từ gỗ Sồi Trắng, Gỗ Óc Chó và Gỗ Phong cao cấp đạt chuẩn FSC, phủ sáp ong tự nhiên và lót bìa chống ẩm không acid.",
      spec3Title: "Kính Mica Acrylic Lọc Tia UV",
      spec3Desc: "Mặt kính quang học cao cấp lọc 99% tia cực tím gây hại, mang lại độ trong suốt tuyệt đối và độ an toàn chịu lực vượt trội khi vận chuyển.",
    },
    footer: {
      brandText: "Các phiên bản nhiếp ảnh mỹ thuật tôn vinh vẻ đẹp trầm mặc và thi vị của Huế, Việt Nam. Chế tác thủ công dành cho các nhà sưu tập tinh hoa trên toàn thế giới.",
      atelierLocation: "NHIẾP ẢNH NGHỆ THUẬT HUẾ",
      portfoliosTitle: "Bộ Sưu Tập Tiêu Biểu",
      gazetteTitle: "Tập San Người Sưu Tầm",
      gazetteDesc: "Đăng ký nhận thư mời riêng cho các đợt phát hành phiên bản giới hạn mới và ghi chép mỹ thuật từ cố đô Huế.",
      emailPlaceholder: "Nhập địa chỉ email của bạn",
      joinBtn: "Đăng Ký",
      joinSuccess: "Chào mừng bạn gia nhập sổ lưu danh nhà sưu tầm Hue Art Prints.",
      guaranteeText: "Cam kết bền màu 100 năm • Giấy chứng nhận độc bản • Bảo hiểm vận chuyển toàn cầu",
      rights: "Bản quyền thuộc về Hội Nhiếp Ảnh Huế. Mọi quyền được bảo lưu.",
    },
    submitModal: {
      menuLabel: "Gửi Tác Phẩm",
      modalTitle: "Gửi Tác Phẩm Nhiếp Ảnh Cố Đô Huế",
      modalSubtitle: "Dành cho các nhiếp ảnh gia và người yêu Huế. Tác phẩm gửi sẽ được Hội Nhiếp Ảnh Huế & Quản trị viên duyệt và đăng tải lên triển lãm trực tuyến.",
      dropzoneTitle: "Kéo thả tác phẩm độ phân giải cao hoặc bấm để chọn ảnh",
      dropzoneSubtitle: "Hỗ trợ định dạng JPG, PNG, WebP hoặc TIFF (tối đa 25MB)",
      changeImage: "Đổi ảnh khác",
      artworkDetailsTitle: "1. Thông Tin & Hồ Sơ Tác Phẩm",
      titleViLabel: "Tên tác phẩm (Tiếng Việt)",
      titleEnLabel: "Tên tác phẩm (Tiếng Anh - nếu có)",
      collectionLabel: "Thuộc Bộ Sưu Tập",
      yearLabel: "Năm sáng tác",
      locationLabel: "Địa danh / Bối cảnh tại Huế",
      coordinatesLabel: "Tọa độ GPS (nếu có, VD: 16.4698° N, 107.5794° E)",
      storyLabel: "Cảm hứng & Câu chuyện sáng tác",
      storyPlaceholder: "Chia sẻ khoảnh khắc bấm máy, ánh sáng, cảm xúc hoặc câu chuyện phía sau bức ảnh...",
      historyLabel: "Ghi chú di sản / Lịch sử địa danh",
      historyPlaceholder: "Ý nghĩa văn hóa, lịch sử của đền đài, dòng sông hoặc làng nghề nơi chụp...",
      cameraSectionTitle: "2. Thông Số Kỹ Thuật Máy Ảnh (EXIF)",
      cameraBodyLabel: "Thân máy ảnh (Body)",
      lensLabel: "Ống kính (Lens)",
      exposureSettingsLabel: "Thông số phơi sáng (Tiêu cự • Khẩu độ • Tốc độ • ISO)",
      orientationLabel: "Bố cục khung hình",
      moodLabel: "Sắc thái / Phong cách ảnh",
      pricingSectionTitle: "3. Đề Xuất Bản In & Phiên Bản",
      basePriceLabel: "Giá bản in đề xuất (VNĐ)",
      editionLimitLabel: "Giới hạn số lượng ấn bản (Ví dụ: 30 bản)",
      authorSectionTitle: "4. Thông Tin Tác Giả / Nhiếp Ảnh Gia",
      authorNameLabel: "Họ và tên nhiếp ảnh gia",
      authorEmailLabel: "Email nhận thông báo duyệt",
      authorPhoneLabel: "Số điện thoại liên hệ (Zalo)",
      authorSocialLabel: "Liên kết Portfolio / Facebook / Instagram",
      submitButton: "Gửi Tác Phẩm Đến Admin (vinhhuong119@gmail.com)",
      submitting: "Đang nộp hồ sơ...",
      successTitle: "Tác Phẩm Đã Được Gửi Thành Công!",
      successDesc: "Hồ sơ và file ảnh đã được chuyển tiếp đến ban quản trị Hội Nhiếp Ảnh Huế qua email: vinhhuong119@gmail.com. Chúng tôi sẽ phản hồi trong vòng 24 - 48 giờ.",
      emailDestination: "Hộp thư tiếp nhận quản trị: vinhhuong119@gmail.com",
      submissionRef: "Mã hồ sơ gửi:",
      previewOnWall: "Xem thử tranh trên tường phòng",
      closeBtn: "Đóng cửa sổ",
      requiredFieldsNote: "(*) Vui lòng điền đầy đủ các thông tin quan trọng để ban giám tuyển đối chiếu.",
    },
  },

  en: {
    topBanner: "Worldwide Insured Express Delivery • Hand-Signed Limited Editions • 100-Year Archival Cotton",
    brandSubtitle: "Thừa Thiên Huế • Vietnam",
    nav: {
      gallery: "Gallery",
      collections: "Collections",
      heritage: "Heritage & Craft",
      curator: "AI Curator",
      submit: "Submit Photo",
      searchPlaceholder: "Search: Citadel, river, incense...",
      saved: "Saved",
      bag: "Collector’s Bag",
    },
    hero: {
      tag: "Limited Edition Fine Art Photography",
      titlePart1: "Artistic photography",
      titleHighlight: "NHIẾP ẢNH NGHỆ THUẬT HUẾ",
      description: "Rare, museum-grade photographic prints capturing the melancholic mist of the Perfume River, weathered terracotta dynasties, and living artisanal heritage of Vietnam’s royal capital.",
      exploreBtn: "Explore The Collection",
      roomBtn: "Interactive Wall Preview",
      curatorBtn: "Consult AI Curator",
      badges: {
        paper: { title: "Hahnemühle Rag", subtitle: "100% Cotton 308gsm" },
        editions: { title: "Limited Editions", subtitle: "Numbered & Hand-Signed" },
        auth: { title: "Authenticity", subtitle: "Hologram Certificate" },
        transit: { title: "Global Transit", subtitle: "100% Insured Delivery" },
      },
    },
    filter: {
      sectionTag: "Curated Fine-Art Editions",
      sectionTitle: "Selected Artworks from Hue",
      showingText: "Showing",
      printsCount: "museum-grade prints",
      allEditions: "All Editions",
      allEditionsSub: "Complete Archive",
      imperialEchoes: "Imperial Echoes",
      imperialEchoesSub: "Citadel & Royal Tombs",
      perfumeRiver: "Perfume River",
      perfumeRiverSub: "Sông Hương & Lagoons",
      livingTraditions: "Living Traditions",
      livingTraditionsSub: "Incense, Lotus & Silk",
      poeticMonochrome: "Poetic Monochrome",
      poeticMonochromeSub: "Silver Gelatin Tone",
      formatLabel: "Format:",
      allFormats: "All Formats",
      landscape: "Landscape",
      portrait: "Portrait",
      panoramic: "Panoramic",
      atmosphereLabel: "Atmosphere:",
      allMoods: "All Moods",
      imperialGold: "Imperial Gold",
      etherealMist: "Ethereal Mist",
      meditative: "Meditative",
      vibrantSun: "Incense & Sun",
      nocturne: "Nocturne",
      sortCurator: "Curator’s Choice",
      sortScarcity: "Fewest Editions Remaining",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      sortNewest: "Latest Release",
      activeFilter: "Active Filter:",
      savedFilter: "Saved Editions",
      keywordFilter: "Keyword",
      resetAll: "Reset All Filters",
      noResultsTitle: "No matching artworks found",
      noResultsText: "Try adjusting your search criteria or resetting filters to explore the full photographic collection of Hue.",
    },
    card: {
      edition: "Edition",
      curatorChoice: "Curator’s Choice",
      fromPrice: "From",
      viewEdition: "View Edition",
      configureFrame: "Configure Frame",
      wallPreview: "Preview On Wall",
    },
    modal: {
      editionBadge: "Limited Edition",
      archivalNote: "Archival Pigment Print on 100% Cotton Rag",
      loupePrompt: "Hover image to inspect paper texture & film grain",
      viewOnWall: "View On Wall",
      tabConfigure: "Configure Print",
      tabStory: "Historical Story",
      tabCamera: "Shooting Data",
      stepSize: "1. Edition Size",
      stepPaper: "2. Museum Archival Paper",
      stepFrame: "3. Handcrafted Frame",
      stepMat: "4. Conservation Mat Board",
      included: "Included",
      customDedicationLabel: "Personalized Certificate Dedication",
      customDedicationPlaceholder: "e.g., Dedicated to the Gallery of Minh Nguyen",
      optional: "Optional",
      photographerNote: "Photographer’s Narrative",
      historicalSignificance: "Historical Significance of Hue",
      viewCertificateSample: "View Official Certificate Sample",
      cameraBody: "Camera Body",
      cameraLens: "Lens Glass",
      exposureSettings: "Exposure & Settings",
      coordinates: "Coordinates",
      capturedTime: "Captured Time",
      rawNote: "Original RAW medium format capture processed with zero AI manipulation to preserve authentic chromatic fidelity and optical atmosphere.",
      totalInvestment: "Total Collector Investment",
      freeInsuredNote: "Free insured packaging • Hand-signed & stamped",
      roomWallBtn: "Room Wall",
      addedToBag: "Added To Bag!",
      addEditionToBag: "Add Edition To Bag",
    },
    visualizer: {
      title: "Interactive Room & Wall Visualizer",
      subtitle: "Test scale, custom framing, and interior wall palettes at 1:1 gallery proportion",
      stepRoom: "1. Interior Room",
      stepWallColor: "2. Wall Paint Tint",
      stepFrame: "3. Hardwood Frame",
      customizeEditionBtn: "Customize This Edition",
      prevArt: "Previous artwork",
      nextArt: "Next artwork",
    },
    curatorModal: {
      title: "Hue Art AI Curator",
      subtitle: "Tailored architectural & poetic recommendations for your interior space",
      themesLabel: "Curatorial Themes",
      inputLabel: "Describe Your Space, Lighting & Palette",
      inputPlaceholder: "e.g. A Japandi living room with light oak flooring, natural linen curtains, and afternoon western sunlight...",
      consultBtn: "Consult",
      evaluating: "Evaluating imperial compositions & tonal palettes...",
      evaluationTitle: "Curator’s Evaluation",
      recommendedArtworks: "Recommended Artworks",
      scaleLabel: "Recommended scale:",
      framingLabel: "Recommended framing:",
      configureArtBtn: "Configure This Artwork",
    },
    cart: {
      title: "Collector’s Bag",
      freeShippingUnlocked: "You’ve unlocked Free Insured Global Delivery!",
      addMoreForFreeShipping: "more to unlock Free Insured Worldwide Delivery.",
      emptyTitle: "Your bag is currently empty",
      emptyText: "Explore our limited edition photography from the ancient citadel and tranquil waters of Hue.",
      exploreCollectionBtn: "Explore Collection",
      subtotal: "Subtotal",
      shipping: "Insured Global Shipping",
      complimentary: "Complimentary",
      totalInvestment: "Total Investment",
      guaranteeNote: "Includes embossed Certificate of Authenticity & white handling gloves",
      proceedCheckoutBtn: "Proceed To Collector Checkout",
    },
    checkout: {
      title: "Collector Checkout & Acquisition",
      confirmedTitle: "Acquisition Confirmed",
      editionsInAcquisition: "Editions in Acquisition",
      totalAmount: "Total (incl. Worldwide Insurance):",
      detailsHeader: "Delivery & Authentication Details",
      fullNameLabel: "Collector / Beneficiary Full Name",
      emailLabel: "Email for Certificate & Tracking",
      streetLabel: "Street Address",
      countryLabel: "Country",
      giftBoxOption: "Include complimentary embossed gift casing & handling gloves",
      encryptedBadge: "256-Bit SSL Encrypted",
      confirmAcquisitionBtn: "Confirm Acquisition",
      processing: "Securing Limited Edition Reservation...",
      thankYou: "Thank You, Collector",
      orderReference: "Order Reference:",
      dispatchTitle: "Museum Courier Dispatch",
      dispatchText: "Your print is being prepared under archival conditions. You will receive real-time courier tracking via email upon final inspection and sealing.",
      viewCertificateBtn: "View Official Certificate",
      returnGalleryBtn: "Return to Gallery",
      paymentMethodLabel: "Payment Methods Supported",
      momo: "MoMo E-Wallet",
      momoSub: "Scan MoMo QR for instant payment",
      zalopay: "ZaloPay E-Wallet",
      zalopaySub: "Scan QR via ZaloPay or Zalo app",
      bankTransfer: "VietQR 24/7 Bank Transfer",
      bankTransferSub: "Instant QR scan from any Vietnamese banking app",
      card: "Credit / Debit Card (Visa / Master)",
      cardSub: "Secure international payment gateway",
      bankName: "Bank Name",
      accountNumber: "Account Number",
      accountName: "Account Holder",
      transferContent: "Transfer Reference",
      scanToPay: "Scan QR Code To Pay",
      copied: "Copied!",
      copy: "Copy",
      paymentNote: "Your order will be verified automatically as soon as payment is confirmed.",
      selectedMethod: "Selected Payment Method",
    },
    certificate: {
      title: "Museum Certificate of Authenticity",
      printPdfBtn: "Print / Save PDF",
      studioHeader: "Hue Photography Association • 273 Dien Bien Phu, Hue",
      mainTitle: "Certificate of Authenticity",
      subtitleVi: "Giấy Chứng Nhận Tác Phẩm Nhiếp Ảnh Mỹ Thuật Cố Đô Huế",
      statement: "This document certifies that the accompanying photographic work is an authentic limited-edition archival print, produced under the direct supervision of the artist with museum permanence standards guaranteed for over 100 years.",
      artworkTitleLabel: "Artwork Title",
      editionLabel: "Edition",
      dimensionsLabel: "Dimensions",
      paperMediumLabel: "Paper Medium",
      locationGpsLabel: "Location GPS",
      registeredToLabel: "Registered in the permanent archive for",
      issuedLabel: "Issued Date",
      artistTitle: "Master Artist & Photographer",
    },
    about: {
      tag: "Heritage & Vision",
      titlePart1: "Preserving the",
      titleHighlight: "Timeless Whisper of Hue",
      p1: "Nestled along the serene curve of the Perfume River in Central Vietnam, Hue served as the imperial capital under the thirteen Nguyen Emperors from 1802 until 1945. It is a city defined by a distinctive melancholy—where imperial grandeur meets ancient moss, where temple bells dissolve into morning river fog, and where centuries of aristocratic verse still linger in palace courtyards.",
      p2: "Every photograph in this collection is created with contemplative slowness. We wait for the elusive moments when the tropical light turns amber, when rain draws velvet brushstrokes over imperial roofs, and when the artisans of Thủy Xuân dye incense under the midday sun.",
      stat1Number: "100+ Years",
      stat1Desc: "Guaranteed museum print permanence without fading or discoloration.",
      stat2Number: "30 to 50",
      stat2Desc: "Strict limited edition cap per artwork worldwide. Never reprinted.",
      calloutBadge: "Artisanal Darkroom Standard",
      calloutDesc: "Printed exclusively with 12-channel archival pigment inksets on 100% acid-free cotton rag.",
      themesTag: "Three Curated Themes",
      themesTitle: "Portfolios of the Royal Realm",
      pI_tag: "Portfolio I",
      pI_title: "Imperial Echoes",
      pI_desc: "The Citadel’s meridian gates, dragon roof ridges, and melancholic royal mausoleums.",
      pII_tag: "Portfolio II",
      pII_title: "Perfume River",
      pII_desc: "Sampans gliding through morning mist, Tam Giang fishing nets, and twilight lanterns.",
      pIII_tag: "Portfolio III",
      pIII_title: "Living Traditions",
      pIII_desc: "Scented incense bouquets of Thủy Xuân, sacred lotuses of Tịnh Tâm, and imperial silk.",
      explorePortfolio: "Explore Portfolio →",
      museumSpecsTag: "Museum Specifications",
      museumSpecsTitle: "Conservation Grade Archival Integrity",
      spec1Title: "Hahnemühle 308gsm Rag",
      spec1Desc: "Milled in Germany from 100% pure cotton fibres without optical brightening agents (OBAs). Velvety matte surface ensuring zero unwanted reflections in brightly lit residences.",
      spec2Title: "Solid European Timber",
      spec2Desc: "Frames are precision-milled from sustainably harvested American Walnut, White Oak, and Maple, sealed with natural beeswax and fitted with acid-free backing boards.",
      spec3Title: "TrueColor UV Acrylic",
      spec3Desc: "Glazed with optical-grade museum acrylic filtering 99% of destructive UV rays while maintaining crystal-clear chromatic clarity and shatterproof transport safety.",
    },
    footer: {
      brandText: "Fine-art photography editions inspired by the poetic beauty of Hue, Vietnam. Dedicated to capturing the soul of imperial monuments, ancient craft villages, and misty waters for discerning international collectors.",
      atelierLocation: "NHIẾP ẢNH NGHỆ THUẬT HUẾ",
      portfoliosTitle: "Curated Portfolios",
      gazetteTitle: "The Collector's Gazette",
      gazetteDesc: "Receive private invitations to new limited-edition releases, printmaking notes, and historical dispatches from Hue.",
      emailPlaceholder: "Enter collector email address",
      joinBtn: "Join",
      joinSuccess: "Welcome to the Hue Art Prints private register.",
      guaranteeText: "100-Year Lightfast Guarantee • Signed Certificate of Authenticity • Free Global Insurance",
      rights: "Hue Photography Association. All rights reserved.",
    },
    submitModal: {
      menuLabel: "Submit Photo",
      modalTitle: "Submit Your Fine Art Hue Photograph",
      modalSubtitle: "For photographers capturing the soul of Hue. Submissions are reviewed by the Hue Photography Association & admin before being published on the platform.",
      dropzoneTitle: "Drag & drop high-resolution photo or click to browse",
      dropzoneSubtitle: "Supports JPG, PNG, WebP or TIFF (up to 25MB)",
      changeImage: "Change image",
      artworkDetailsTitle: "1. Artwork Information & Heritage Details",
      titleViLabel: "Artwork Title (Vietnamese)",
      titleEnLabel: "Artwork Title (English)",
      collectionLabel: "Target Collection",
      yearLabel: "Year Created",
      locationLabel: "Location in Hue",
      coordinatesLabel: "GPS Coordinates (e.g. 16.4698° N, 107.5794° E)",
      storyLabel: "Artist Inspiration & Story",
      storyPlaceholder: "Describe the lighting, patience, atmosphere or story behind the shutter click...",
      historyLabel: "Historical / Heritage Context",
      historyPlaceholder: "Cultural background of the monument, temple, river, or craft village...",
      cameraSectionTitle: "2. Technical Gear & Camera EXIF",
      cameraBodyLabel: "Camera Body",
      lensLabel: "Lens",
      exposureSettingsLabel: "Exposure Settings (Focal Length • Aperture • Shutter • ISO)",
      orientationLabel: "Framing Orientation",
      moodLabel: "Visual Tone / Mood",
      pricingSectionTitle: "3. Proposed Edition & Sizing",
      basePriceLabel: "Proposed Base Price (VND)",
      editionLimitLabel: "Strict Edition Limit (e.g., 30 copies)",
      authorSectionTitle: "4. Photographer Contact Info",
      authorNameLabel: "Photographer Full Name",
      authorEmailLabel: "Notification Email",
      authorPhoneLabel: "Phone Number (WhatsApp/Zalo)",
      authorSocialLabel: "Portfolio / Instagram / Social Link",
      submitButton: "Send Submission to Admin (vinhhuong119@gmail.com)",
      submitting: "Submitting...",
      successTitle: "Artwork Successfully Submitted!",
      successDesc: "Your artwork and metadata dossier have been dispatched to Hue Photography Association admin at vinhhuong119@gmail.com. We will review and reach out within 24-48 hours.",
      emailDestination: "Admin receiving inbox: vinhhuong119@gmail.com",
      submissionRef: "Dossier ID:",
      previewOnWall: "Preview on Virtual Gallery Wall",
      closeBtn: "Close",
      requiredFieldsNote: "(*) Please provide required information for curator evaluation.",
    },
  },

  fr: {
    topBanner: "Livraison Mondiale Assurée • Éditions Limitées Signées & Numérotées • Coton d'Archivage 100 Ans",
    brandSubtitle: "Thừa Thiên Hué • Viêt Nam",
    nav: {
      gallery: "Galerie",
      collections: "Collections",
      heritage: "Patrimoine & Savoir-faire",
      curator: "Curateur IA",
      submit: "Soumettre",
      searchPlaceholder: "Rechercher: Citadelle, fleuve, encens...",
      saved: "Sauvegardés",
      bag: "Panier d'Art",
    },
    hero: {
      tag: "Photographie d'Art en Édition Limitée",
      titlePart1: "Artistic photography",
      titleHighlight: "NHIẾP ẢNH NGHỆ THUẬT HUẾ",
      description: "Tirages photographiques rares de qualité musée, capturant la brume mélancolique de la Rivière des Parfums, les dynasties de terre cuite patinée et l'héritage artisanal vivant de l'ancienne capitale royale du Viêt Nam.",
      exploreBtn: "Explorer la Collection",
      roomBtn: "Aperçu Mural Interactif",
      curatorBtn: "Consulter le Curateur IA",
      badges: {
        paper: { title: "Papier Hahnemühle Rag", subtitle: "100% Coton 308g/m²" },
        editions: { title: "Éditions Limitées", subtitle: "Numéroté & Signé à la main" },
        auth: { title: "Certificat d'Origine", subtitle: "Sceau d'authenticité inclus" },
        transit: { title: "Livraison Mondiale", subtitle: "Assurance intégrale 100%" },
      },
    },
    filter: {
      sectionTag: "Éditions Rares de Qualité Musée",
      sectionTitle: "Regards Choisis sur Hué",
      showingText: "Affichage de",
      printsCount: "tirages d'art d'exception",
      allEditions: "Toutes les Œuvres",
      allEditionsSub: "Archives complètes",
      imperialEchoes: "Échos Impériaux",
      imperialEchoesSub: "Citadelle & Mausolées",
      perfumeRiver: "Rivière des Parfums",
      perfumeRiverSub: "Sông Hương & Lagunes",
      livingTraditions: "Traditions Vivantes",
      livingTraditionsSub: "Encens, Lotus & Soie",
      poeticMonochrome: "Monochromes Poétiques",
      poeticMonochromeSub: "Tons gélatino-argentiques",
      formatLabel: "Format:",
      allFormats: "Tous les Formats",
      landscape: "Paysage",
      portrait: "Portrait",
      panoramic: "Panoramique",
      atmosphereLabel: "Atmosphère:",
      allMoods: "Toutes les Atmosphères",
      imperialGold: "Or Impérial",
      etherealMist: "Brume Céleste",
      meditative: "Méditatif",
      vibrantSun: "Soleil & Encens",
      nocturne: "Nocturne",
      sortCurator: "Choix du Curateur",
      sortScarcity: "Rareté (Moins d'exemplaires)",
      sortPriceLow: "Prix: Croissant",
      sortPriceHigh: "Prix: Décroissant",
      sortNewest: "Dernière Sortie",
      activeFilter: "Filtre actif:",
      savedFilter: "Œuvres Sauvegardées",
      keywordFilter: "Mot-clé",
      resetAll: "Réinitialiser les Filtres",
      noResultsTitle: "Aucune œuvre trouvée",
      noResultsText: "Veuillez modifier vos critères de recherche ou réinitialiser les filtres pour découvrir l'intégralité de la collection d'art de Hué.",
    },
    card: {
      edition: "Édition",
      curatorChoice: "Choix du Curateur",
      fromPrice: "À partir de",
      viewEdition: "Voir l'Édition",
      configureFrame: "Personnaliser le Cadre",
      wallPreview: "Aperçu Mural",
    },
    modal: {
      editionBadge: "Édition Limitée",
      archivalNote: "Tirage Pigmentaire d'Archivage sur Coton Rag 100%",
      loupePrompt: "Survolez l'image pour admirer la texture du papier d'art et le grain argentique",
      viewOnWall: "Voir Sur Votre Mur",
      tabConfigure: "Configurer le Tirage",
      tabStory: "Récit Historique",
      tabCamera: "Données de Prise de Vue",
      stepSize: "1. Format de l'Édition",
      stepPaper: "2. Papier d'Art de Musée",
      stepFrame: "3. Encadrement en Bois Massif",
      stepMat: "4. Passe-Partout de Conservation",
      included: "Inclus",
      customDedicationLabel: "Dédicace Personnalisée sur le Certificat",
      customDedicationPlaceholder: "ex: Dédié à la Collection Privée de la Famille Laurent",
      optional: "Facultatif",
      photographerNote: "Carnet du Photographe",
      historicalSignificance: "Signification Historique de Hué",
      viewCertificateSample: "Voir un Spécimen de Certificat",
      cameraBody: "Boîtier Photographique",
      cameraLens: "Objectif Optique",
      exposureSettings: "Exposition & Réglages",
      coordinates: "Coordonnées GPS",
      capturedTime: "Heure de Prise de Vue",
      rawNote: "Capture originale au format moyen RAW, développée sans altération par IA pour préserver la véracité optique et chromatique de Hué.",
      totalInvestment: "Valeur de Collection",
      freeInsuredNote: "Emballage d'archivage sécurisé • Signé & timbré à la main",
      roomWallBtn: "Voir au Mur",
      addedToBag: "Ajouté au Panier !",
      addEditionToBag: "Ajouter au Panier d'Art",
    },
    visualizer: {
      title: "Simulateur Mural & Ambiance Intérieure",
      subtitle: "Évaluez l'échelle, les essences de bois et les teintes murales à proportion réelle 1:1",
      stepRoom: "1. Espace Intérieur",
      stepWallColor: "2. Teinte du Mur",
      stepFrame: "3. Essence du Cadre",
      customizeEditionBtn: "Personnaliser Cette Œuvre",
      prevArt: "Œuvre précédente",
      nextArt: "Œuvre suivante",
    },
    curatorModal: {
      title: "Curateur d'Art IA de Hué",
      subtitle: "Recommandations architecturales et chromatiques adaptées à votre intérieur",
      themesLabel: "Inspirations Thématiques",
      inputLabel: "Décrivez Votre Pièce, Luminosité & Palette",
      inputPlaceholder: "ex: Un salon Japandi avec parquet en chêne clair, rideaux de lin naturel et lumière rasante de fin d'après-midi...",
      consultBtn: "Consulter",
      evaluating: "Harmonisation des tons et des compositions impériales...",
      evaluationTitle: "Avis du Curateur",
      recommendedArtworks: "Œuvres Conseillées",
      scaleLabel: "Format suggéré:",
      framingLabel: "Cadre idéal:",
      configureArtBtn: "Configurer Cette Œuvre",
    },
    cart: {
      title: "Panier du Collectionneur",
      freeShippingUnlocked: "Vous bénéficiez de la Livraison Mondiale Assurée Offerte !",
      addMoreForFreeShipping: "supplémentaires pour obtenir la livraison offerte.",
      emptyTitle: "Votre panier est vide",
      emptyText: "Découvrez nos éditions photographiques limitées de la cité impériale et des eaux paisibles de Hué.",
      exploreCollectionBtn: "Explorer la Collection",
      subtotal: "Sous-total",
      shipping: "Livraison d'art avec assurance",
      complimentary: "Offerte",
      totalInvestment: "Investissement Global",
      guaranteeNote: "Comprend le Certificat d'Authenticité gaufré et des gants de manipulation en coton",
      proceedCheckoutBtn: "Finaliser l'Acquisition",
    },
    checkout: {
      title: "Acquisition & Commande d'Art",
      confirmedTitle: "Acquisition Confirmée avec Succès",
      editionsInAcquisition: "Œuvres en Cours d'Acquisition",
      totalAmount: "Total (Assurance internationale incluse):",
      detailsHeader: "Coordonnées de Livraison & d'Authenticité",
      fullNameLabel: "Nom Complet du Collectionneur / Destinataire",
      emailLabel: "Adresse E-mail pour Suivi & Certificat",
      streetLabel: "Adresse de Livraison",
      countryLabel: "Pays",
      giftBoxOption: "Inclure le coffret de présentation de luxe gaufré et les gants de coton",
      encryptedBadge: "Chiffrement SSL 256-Bit Sécurisé",
      confirmAcquisitionBtn: "Confirmer l'Acquisition d'Art",
      processing: "Attribution du numéro d'édition limitée...",
      thankYou: "Tous Nos Remerciements, Cher Collectionneur",
      orderReference: "Référence de Commande:",
      dispatchTitle: "Préparation & Expédition par Transporteur d'Art",
      dispatchText: "Votre tirage est conditionné selon des règles strictes de conservation muséale. Vous recevrez un numéro de suivi dès le scellement définitif du colis.",
      viewCertificateBtn: "Consulter le Certificat Officiel",
      returnGalleryBtn: "Retourner à la Galerie",
      paymentMethodLabel: "Modes de Paiement Acceptés",
      momo: "Portefeuille MoMo",
      momoSub: "Scan QR MoMo pour paiement instantané",
      zalopay: "Portefeuille ZaloPay",
      zalopaySub: "Scan QR via l'application ZaloPay ou Zalo",
      bankTransfer: "Virement Bancaire VietQR 24/7",
      bankTransferSub: "Scan QR automatique depuis toute banque vietnamienne",
      card: "Carte Bancaire (Visa / Mastercard)",
      cardSub: "Passerelle de paiement internationale sécurisée",
      bankName: "Banque",
      accountNumber: "Numéro de Compte",
      accountName: "Titulaire du Compte",
      transferContent: "Motif du Virement",
      scanToPay: "Scanner le QR Code pour Payer",
      copied: "Copié !",
      copy: "Copier",
      paymentNote: "Votre commande sera vérifiée automatiquement dès confirmation du paiement.",
      selectedMethod: "Mode de paiement sélectionné",
    },
    certificate: {
      title: "Certificat d'Authenticité Muséale",
      printPdfBtn: "Imprimer / Enregistrer en PDF",
      studioHeader: "Association de Photographie de Hué • 273 Dien Bien Phu, Hué",
      mainTitle: "Certificate of Authenticity",
      subtitleVi: "Giấy Chứng Nhận Tác Phẩm Nhiếp Ảnh Mỹ Thuật Cố Đô Huế",
      statement: "Ce document officiel atteste que l'œuvre photographique ci-jointe est un tirage d'art original en édition limitée, réalisé sous la supervision directe de l'artiste selon des normes de conservation muséale garanties plus de 100 ans.",
      artworkTitleLabel: "Titre de l'Œuvre",
      editionLabel: "Édition",
      dimensionsLabel: "Dimensions",
      paperMediumLabel: "Support Papier",
      locationGpsLabel: "Coordonnées GPS",
      registeredToLabel: "Inscrit dans les registres permanents au nom de",
      issuedLabel: "Date d'Émission",
      artistTitle: "Artiste Photographe & Curateur",
    },
    about: {
      tag: "Patrimoine & Vision",
      titlePart1: "Préserver le",
      titleHighlight: "Murmure Éternel de Hué",
      p1: "Nichée le long des méandres paisibles de la Rivière des Parfums au centre du Viêt Nam, Hué fut la capitale impériale des treize empereurs de la dynastie Nguyễn de 1802 à 1945. Ville empreinte d'une mélancolie incomparable, elle unit la grandeur palatiale à la mousse séculaire, où le tintement des cloches de la pagode se fond dans les brumes matinales et où la poésie résonne encore sous les toits de tuiles vernissées.",
      p2: "Chaque tirage de cette collection est le fruit d'une contemplation patiente. Nous attendons ces instants rares où la lumière tropicale devient dorée, quand la pluie dessine un voile de velours sur les cours royales et quand les artisans de Thủy Xuân disposent leurs gerbes d'encens au soleil.",
      stat1Number: "100+ Ans",
      stat1Desc: "Garantie de longévité muséale sans décoloration ni altération des pigments.",
      stat2Number: "30 à 50",
      stat2Desc: "Plafond d'édition strict dans le monde entier. Aucun retirage ultérieur.",
      calloutBadge: "Norme Chambre Noire d'Artisan",
      calloutDesc: "Impression exclusive avec encres minérales pigmentaires 12 canaux sur pur coton chiffon sans acide.",
      themesTag: "Trois Regards Thématiques",
      themesTitle: "Portfolios de l'Empire d'Annam",
      pI_tag: "Portfolio I",
      pI_title: "Échos Impériaux",
      pI_desc: "La Porte du Midi, les faîtages aux dragons de céramique et la majesté mélancolique des tombeaux impériaux.",
      pII_tag: "Portfolio II",
      pII_title: "Rivière des Parfums",
      pII_desc: "Sampans glissant dans la brume matinale, éperviers sur la lagune de Tam Giang et lanternes flottantes.",
      pIII_tag: "Portfolio III",
      pIII_title: "Traditions Vivantes",
      pIII_desc: "Bouquets d'encens parfumés de Thủy Xuân, fleurs de lotus sacrées du lac Tịnh Tâm et soies violettes.",
      explorePortfolio: "Explorer le Portfolio →",
      museumSpecsTag: "Spécifications Muséales",
      museumSpecsTitle: "Intégrité de Conservation Séculaire",
      spec1Title: "Papier Hahnemühle 308g Coton",
      spec1Desc: "Fabriqué en Allemagne à 100% en fibres de pur coton, sans azurants optiques. Finition mate veloutée garantissant l'absence de reflets indésirables.",
      spec2Title: "Bois Massif Européen Certifié",
      spec2Desc: "Cadres usinés avec précision en noyer noir américain, chêne blanc et érable issus de forêts durables, traités à la cire d'abeille et protégés par un carton barrière sans acide.",
      spec3Title: "Verre Acrylique Anti-UV TrueColor",
      spec3Desc: "Vitrage acrylique de qualité muséale filtrant 99% des rayonnements ultraviolets tout en offrant une transparence cristalline et une résistance optimale aux chocs.",
    },
    footer: {
      brandText: "Éditions photographiques d'art dédiées à la beauté poétique de Hué, Viêt Nam. Conçues pour les collectionneurs et amateurs d'art du monde entier.",
      atelierLocation: "NHIẾP ẢNH NGHỆ THUẬT HUẾ",
      portfoliosTitle: "Portfolios Sélectionnés",
      gazetteTitle: "La Gazette du Collectionneur",
      gazetteDesc: "Recevez les invitations privées lors des sorties d'éditions limitées et les carnets de création de Hué.",
      emailPlaceholder: "Votre adresse e-mail",
      joinBtn: "S'inscrire",
      joinSuccess: "Bienvenue dans le registre privé des collectionneurs de Hue Art Prints.",
      guaranteeText: "Garantie 100 ans • Certificat d'authenticité signé • Assurance de livraison offerte",
      rights: "Association de Photographie de Hué. Tous droits réservés.",
    },
    submitModal: {
      menuLabel: "Soumettre",
      modalTitle: "Soumettre une Photographie d'Art de Hué",
      modalSubtitle: "Dédié aux photographes capturant la poésie de Hué. Les œuvres sont examinées par l'Association de Photographie de Hué et l'administrateur avant publication.",
      dropzoneTitle: "Glissez-déposez une photo haute résolution ou cliquez pour parcourir",
      dropzoneSubtitle: "Prend en charge JPG, PNG, WebP ou TIFF (jusqu'à 25 Mo)",
      changeImage: "Changer d'image",
      artworkDetailsTitle: "1. Informations et Contexte de l'Œuvre",
      titleViLabel: "Titre de l'œuvre (Vietnamien)",
      titleEnLabel: "Titre de l'œuvre (Anglais ou Français)",
      collectionLabel: "Collection Associée",
      yearLabel: "Année de prise de vue",
      locationLabel: "Lieu à Hué",
      coordinatesLabel: "Coordonnées GPS (ex: 16.4698° N, 107.5794° E)",
      storyLabel: "Inspiration et Récit de Création",
      storyPlaceholder: "Racontez l'ambiance, la lumière, l'émotion ou l'attente derrière la prise de vue...",
      historyLabel: "Note Historique et Patrimoniale",
      historyPlaceholder: "Signification culturelle du monument, de la pagode, du fleuve ou de l'artisanat...",
      cameraSectionTitle: "2. Matériel & Données Techniques (EXIF)",
      cameraBodyLabel: "Boîtier de l'appareil",
      lensLabel: "Objectif",
      exposureSettingsLabel: "Paramètres d'exposition (Focale • Ouverture • Vitesse • ISO)",
      orientationLabel: "Format de l'image",
      moodLabel: "Ambiance / Palette visuelle",
      pricingSectionTitle: "3. Proposition de Tirage et Édition",
      basePriceLabel: "Prix indicatif conseillé (VND)",
      editionLimitLabel: "Tirage d'art limité (ex: 30 exemplaires)",
      authorSectionTitle: "4. Coordonnées de l'Auteur / Photographe",
      authorNameLabel: "Nom complet du photographe",
      authorEmailLabel: "Email de contact",
      authorPhoneLabel: "Numéro de téléphone",
      authorSocialLabel: "Portfolio ou Lien réseaux sociaux",
      submitButton: "Envoyer à l'administrateur (vinhhuong119@gmail.com)",
      submitting: "Envoi en cours...",
      successTitle: "Œuvre Soumise avec Succès !",
      successDesc: "Le dossier et le fichier ont été transmis à l'administrateur de l'Association de Photographie de Hué via vinhhuong119@gmail.com. Vous recevrez une réponse sous 24 à 48 heures.",
      emailDestination: "Boîte de réception admin : vinhhuong119@gmail.com",
      submissionRef: "Référence du dossier :",
      previewOnWall: "Prévisualiser sur le mur d'exposition",
      closeBtn: "Fermer",
      requiredFieldsNote: "(*) Veuillez renseigner les champs essentiels pour l'évaluation curatoriale.",
    },
  },
};
