export type Lang = "en" | "ar";

const en = {
  skip: "Skip to main content",
  nav: {
    brand: "Arwas World",
    primary: "Primary",
    showcase: "Showcase",
    shop: "Shop",
    custom: "Customizing",
    markets: "Where we ship",
    order: "Order",
    newTab: " (opens in a new tab)",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLabel: "العربية",
    switchHref: "/ar",
    switchLang: "ar",
  },
  hero: {
    eyebrow: "Custom apparel and drinkware",
    a: "Comfy. Customized.",
    b: "Yours.",
    intro:
      "Hoodies, T-shirts, jerseys and polos, plus tumblers, bottles and mugs, made with your name, team or brand on them. We ship from Kenya and Oman to the world.",
    primary: "Customize a product",
    secondary: "See how it works",
  },
  showcase: {
    label: "Product showcase",
    tabs: "Products",
    carousel: (name: string) =>
      `${name} photos and videos. Use the left and right arrow keys to browse.`,
    prev: "Previous photo or video",
    next: "Next photo or video",
    soon: "Photos and videos coming soon.",
    play: "Play video",
    pause: "Pause video",
    order: "Order on WhatsApp",
    note: "Tell us your name, team or logo on WhatsApp and we will send a preview before we print.",
    photoAlt: (name: string, i: number, n: number) => `${name}, photo ${i} of ${n}`,
    videoLabel: (name: string, i: number, n: number) => `${name}, video ${i} of ${n}`,
    showPhoto: (i: number, n: number) => `Show photo ${i} of ${n}`,
    showVideo: (i: number, n: number) => `Show video ${i} of ${n}`,
    quote: "Request a quote",
  },
  shop: {
    eyebrow: "Shop",
    title: "Shop the range",
    intro:
      "Every piece can carry your name, team or brand. Browse the gallery, or message us to order.",
    filter: "Filter products",
    all: "All",
    apparel: "Apparel",
    drinkware: "Drinkware",
    showing: (n: number) => `Showing ${n} products.`,
    view: "View gallery",
    order: "Order",
    orderOn: (name: string) => ` ${name} on WhatsApp (opens in a new tab)`,
    quote: "Request a quote",
  },
  craft: {
    eyebrow: "Customizing",
    title: "Made around you, not off a shelf",
    points: [
      {
        title: "Comfort first",
        body: "Every piece is chosen to feel good on the first wear and the fiftieth: soft fabrics, easy fits and prints that stay part of the garment.",
      },
      {
        title: "Your design, your way",
        body: "Send a name, a crest, a company logo or a rough sketch. We place it, show you the result and only print once you approve it.",
      },
      {
        title: "One piece or a hundred",
        body: "A single gift hoodie, a full football kit or matching mugs for your whole office. You get the same care at any quantity.",
      },
    ],
  },
  process: {
    eyebrow: "How it works",
    title: "Three steps from idea to doorstep",
    step: "Step ",
    steps: [
      { title: "Choose", body: "Browse the showcase and pick a product." },
      { title: "Share your design", body: "Message us on WhatsApp with your text, logo and sizes." },
      { title: "We print and deliver", body: "Approve the preview, then we produce your order and ship it to you." },
    ],
  },
  markets: {
    eyebrow: "Where we ship",
    title: "Rooted in Kenya and Oman, open to everywhere",
    items: [
      { title: "Kenya", body: "Our home market, with delivery across the country." },
      { title: "Oman", body: "Customers across Oman order the same custom range." },
      { title: "Worldwide", body: "Ordering from somewhere else? Message us and we will arrange delivery." },
    ],
  },
  cta: {
    title: "Let\u2019s make something with your name on it",
    button: "Start an order on WhatsApp",
  },
  footer: {
    aria: "Footer",
    explore: "Explore",
    contact: "Contact",
    wa: "Message us on WhatsApp",
    blurb: "Comfy, customized apparel and drinkware. Based in Kenya and Oman, shipping worldwide.",
    rights: (y: number) => `\u00a9 ${y} Arwas World. All rights reserved.`,
  },
};

export type Dict = typeof en;

const ar: Dict = {
  skip: "انتقل إلى المحتوى الرئيسي",
  nav: {
    brand: "Arwas World",
    primary: "التنقل الرئيسي",
    showcase: "المعرض",
    shop: "المتجر",
    custom: "التخصيص",
    markets: "الشحن",
    order: "اطلب الآن",
    newTab: " (يفتح في تبويب جديد)",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    switchLabel: "English",
    switchHref: "/",
    switchLang: "en",
  },
  hero: {
    eyebrow: "ملابس وأدوات شرب مخصّصة",
    a: "مريح. مخصّص.",
    b: "لك.",
    intro:
      "هوديات وتيشيرتات وقمصان رياضية وبولو، إضافة إلى تامبلر وزجاجات وأكواب، مطبوعة باسمك أو اسم فريقك أو علامتك التجارية. نشحن من كينيا وعُمان إلى جميع أنحاء العالم.",
    primary: "خصّص منتجك",
    secondary: "اكتشف كيف نعمل",
  },
  showcase: {
    label: "معرض المنتجات",
    tabs: "المنتجات",
    carousel: (name: string) => `صور وفيديوهات ${name}. استخدم مفتاحَي السهم للتصفح.`,
    prev: "الصورة أو الفيديو السابق",
    next: "الصورة أو الفيديو التالي",
    soon: "الصور والفيديوهات قريباً.",
    play: "تشغيل الفيديو",
    pause: "إيقاف الفيديو",
    order: "اطلب عبر واتساب",
    note: "أخبرنا باسمك أو فريقك أو شعارك عبر واتساب وسنرسل لك معاينة قبل الطباعة.",
    photoAlt: (name: string, i: number, n: number) => `${name}، صورة ${i} من ${n}`,
    videoLabel: (name: string, i: number, n: number) => `${name}، فيديو ${i} من ${n}`,
    showPhoto: (i: number, n: number) => `عرض الصورة ${i} من ${n}`,
    showVideo: (i: number, n: number) => `عرض الفيديو ${i} من ${n}`,
    quote: "اطلب عرض سعر",
  },
  shop: {
    eyebrow: "المتجر",
    title: "تسوّق مجموعتنا",
    intro: "كل قطعة يمكن أن تحمل اسمك أو فريقك أو علامتك. تصفّح المعرض أو راسلنا لتقديم طلبك.",
    filter: "تصفية المنتجات",
    all: "الكل",
    apparel: "الملابس",
    drinkware: "أدوات الشرب",
    showing: (n: number) => `عرض ${n} منتجات.`,
    view: "عرض المعرض",
    order: "اطلب",
    orderOn: (name: string) => ` ${name} عبر واتساب (يفتح في تبويب جديد)`,
    quote: "اطلب عرض سعر",
  },
  craft: {
    eyebrow: "التخصيص",
    title: "مصنوع حولك، لا من الرف",
    points: [
      {
        title: "الراحة أولاً",
        body: "نختار كل قطعة لتكون مريحة من أول ارتداء وحتى المرة الخمسين: أقمشة ناعمة وقصّات سهلة وطباعة تدوم.",
      },
      {
        title: "تصميمك بطريقتك",
        body: "أرسل اسماً أو شعاراً أو رسماً تقريبياً. نضعه على المنتج ونريك النتيجة، ولا نطبع إلا بعد موافقتك.",
      },
      {
        title: "قطعة واحدة أو مئة",
        body: "هودي واحد كهدية، أو طقم كرة قدم كامل، أو أكواب متطابقة لمكتبك. بنفس العناية مهما كانت الكمية.",
      },
    ],
  },
  process: {
    eyebrow: "كيف نعمل",
    title: "ثلاث خطوات من الفكرة إلى باب بيتك",
    step: "الخطوة ",
    steps: [
      { title: "اختر", body: "تصفّح المعرض واختر منتجاً." },
      { title: "شاركنا تصميمك", body: "راسلنا عبر واتساب بنصك وشعارك والمقاسات." },
      { title: "نطبع ونوصّل", body: "وافق على المعاينة، ثم نجهّز طلبك ونشحنه إليك." },
    ],
  },
  markets: {
    eyebrow: "الشحن",
    title: "جذورنا في كينيا وعُمان، وبابنا مفتوح للعالم",
    items: [
      { title: "كينيا", body: "سوقنا الأول، مع التوصيل إلى جميع أنحاء البلاد." },
      { title: "عُمان", body: "عملاؤنا في أنحاء عُمان يطلبون المجموعة المخصّصة نفسها." },
      { title: "حول العالم", body: "تطلب من مكان آخر؟ راسلنا وسنرتّب التوصيل." },
    ],
  },
  cta: {
    title: "لنصنع شيئاً يحمل اسمك",
    button: "ابدأ طلبك عبر واتساب",
  },
  footer: {
    aria: "التذييل",
    explore: "استكشف",
    contact: "تواصل معنا",
    wa: "راسلنا عبر واتساب",
    blurb: "ملابس وأدوات شرب مخصّصة ومريحة. من كينيا وعُمان، ونشحن إلى جميع أنحاء العالم.",
    rights: (y: number) => `\u00a9 ${y} Arwas World. جميع الحقوق محفوظة.`,
  },
};

export const DICT: Record<Lang, Dict> = { en, ar };

export const STARTER_AR: Record<
  string,
  { name: string; tagline: string; description: string; specs: { label: string; value: string }[] }
> = {
  hoodie: {
    name: "هوديات",
    tagline: "دافئة وواسعة، صُنعت لتعيش فيها.",
    description:
      "هودي ناعم بقبعة واسعة وجيب أمامي. اطبع تصميمك على الصدر أو الظهر أو الكم أو القبعة، بما يناسب فريقك أو مدرستك أو علامتك.",
    specs: [
      { label: "القصّة", value: "واسعة، للجنسين" },
      { label: "مناطق الطباعة", value: "الصدر، الظهر، الأكمام" },
      { label: "مناسب لـ", value: "الفرق، المدارس، الهدايا" },
    ],
  },
  tee: {
    name: "تيشيرتات",
    tagline: "الكلاسيكي اليومي.",
    description:
      "تيشيرت بياقة مستديرة مريح يتقبّل الطباعة بوضوح. بسيط للاستخدام اليومي، وشخصي بما يكفي ليكون لك وحدك.",
    specs: [
      { label: "القصّة", value: "عادية، للجنسين" },
      { label: "مناطق الطباعة", value: "الصدر، الظهر" },
      { label: "مناسب لـ", value: "الفعاليات، الزي الموحّد، المنتجات الترويجية" },
    ],
  },
  polo: {
    name: "قمصان بولو",
    tagline: "أنيقة دون تكلّف.",
    description:
      "قميص بولو بياقة وصف أزرار، مثالي للزي الموحّد وفعاليات الشركات، مع شعارك على الصدر.",
    specs: [
      { label: "القصّة", value: "عادية" },
      { label: "مناطق الطباعة", value: "الصدر، الكم، الظهر" },
      { label: "مناسب لـ", value: "الموظفون، الشركات، الأندية" },
    ],
  },
  jersey: {
    name: "قمصان رياضية",
    tagline: "جهّز فريقك بالكامل.",
    description:
      "قمصان رياضية مصمّمة للحركة، باسم فريقك وأسماء اللاعبين وأرقامهم. اطلب تشكيلة كاملة بتصاميم متطابقة.",
    specs: [
      { label: "القصّة", value: "رياضية" },
      { label: "مناطق الطباعة", value: "الأمام، الخلف، الأكمام" },
      { label: "مناسب لـ", value: "الفرق، الدوريات، الجماهير" },
    ],
  },
  tumbler: {
    name: "تامبلر",
    tagline: "مشروبك، واسمك عليه.",
    description:
      "تامبلر طويل بغطاء وماصّة لحمل مشروبك كل يوم. أضف اسماً أو شعاراً أو عبارة تلتف حول الجسم.",
    specs: [
      { label: "النوع", value: "غطاء وماصّة" },
      { label: "مناطق الطباعة", value: "حول الجسم" },
      { label: "مناسب لـ", value: "الهدايا، المكاتب، العلامات التجارية" },
    ],
  },
  bottle: {
    name: "زجاجات",
    tagline: "احمل ماءك بأناقة.",
    description:
      "زجاجة نحيفة قابلة لإعادة الاستخدام للنادي أو المدرسة أو الطريق. خصّصها باسم أو شعار لتكون هدية يحتفظ بها صاحبها.",
    specs: [
      { label: "النوع", value: "نحيفة بغطاء لولبي" },
      { label: "مناطق الطباعة", value: "حول الجسم" },
      { label: "مناسب لـ", value: "الرياضة، المدارس، الفعاليات" },
    ],
  },
  mug: {
    name: "أكواب",
    tagline: "كل صباح، بلمسة منك أكثر.",
    description:
      "كوب كلاسيكي بمقبض مريح. من أكثر الهدايا طلباً وأطقم المكاتب، مطبوع بنصك أو تصميمك.",
    specs: [
      { label: "النوع", value: "كلاسيكي بمقبض" },
      { label: "مناطق الطباعة", value: "الواجهة الأمامية" },
      { label: "مناسب لـ", value: "الهدايا، المقاهي، المكاتب" },
    ],
  },
};