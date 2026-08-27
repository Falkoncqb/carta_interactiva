/* Café Nube — Carta editorial para clientes y catálogo operativo de cafetería. */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleGauge, Coffee, Cookie,
  CupSoda, Edit3, Eye, Filter, Leaf, Menu, MoreHorizontal, PackagePlus,
  Plus, Search, Settings2, Sparkles, Trash2, X, Zap
} from "lucide-react";

type Category = "Café" | "Fríos" | "Matcha" | "Panadería";
type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  tags: string[];
  image?: string;
  available: boolean;
  featured?: boolean;
};

const asset = {
  hero: "/manus-storage/cafe-nube-hero_77ae3867.jpg",
  latte: "/manus-storage/cafe-nube-latte_7b93ae52.jpg",
  pastry: "/manus-storage/cafe-nube-pastry_2ce360e0.jpg",
  matcha: "/manus-storage/cafe-nube-matcha_174e003f.jpg",
  mark: "/manus-storage/cafe-nube-mark_50082faa.png",
};

const categories: Array<Category | "Todo"> = ["Todo", "Café", "Fríos", "Matcha", "Panadería"];

const seedProducts: Product[] = [
  { id: "cap-latte", name: "Cappuccino de avena", category: "Café", price: 3200, description: "Doble espresso, avena cremosa y arte latte de temporada.", tags: ["Intenso", "Avena"], image: asset.latte, available: true, featured: true },
  { id: "flat-white", name: "Flat white", category: "Café", price: 2900, description: "Ristretto doble y microespuma sedosa. Pequeño, preciso, redondo.", tags: ["Doble", "Clásico"], available: true },
  { id: "cold-brew", name: "Cold brew cítrico", category: "Fríos", price: 3600, description: "Extracción lenta de 16 horas, piel de naranja y final de cacao.", tags: ["16 horas", "Sin leche"], available: true },
  { id: "mocha", name: "Mocha de la casa", category: "Café", price: 3500, description: "Espresso, chocolate 70% y leche vaporizada, con dulzor moderado.", tags: ["Chocolate", "Dulzor medio"], available: true },
  { id: "matcha", name: "Iced matcha latte", category: "Matcha", price: 3900, description: "Matcha ceremonial, leche fría y hielo. Verde profundo y final vegetal.", tags: ["Ceremonial", "Vegetal"], image: asset.matcha, available: true },
  { id: "pain-choco", name: "Pain au chocolat", category: "Panadería", price: 2500, description: "Masa laminada de mantequilla con centro de chocolate oscuro.", tags: ["Horneado hoy", "Mantequilla"], image: asset.pastry, available: true },
  { id: "tostada", name: "Tostada de temporada", category: "Panadería", price: 4400, description: "Masa madre, ricotta de limón, frutas y un hilo de miel.", tags: ["Masa madre", "Fresco"], available: true },
  { id: "cookie", name: "Cookie de miso", category: "Panadería", price: 2200, description: "Chocolate, nuez y un toque salado de miso blanco.", tags: ["Recién hecha", "Nuez"], available: false },
];

const priceFormatter = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const newProduct = (): Product => ({ id: crypto.randomUUID(), name: "", category: "Café", price: 0, description: "", tags: [], available: true });

function ProductGlyph({ category, className = "" }: { category: Category; className?: string }) {
  const Icon = category === "Panadería" ? Cookie : category === "Matcha" ? Leaf : category === "Fríos" ? CupSoda : Coffee;
  return <Icon className={className} strokeWidth={1.65} aria-hidden="true" />;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src={asset.mark} alt="" className="h-10 w-10 object-contain" />
      <div className="leading-none">
        <span className={`font-display block text-[1.45rem] tracking-tight ${light ? "text-[#fff9ed]" : "text-[#211914]"}`}>Café Nube</span>
        <span className={`block pt-1 text-[8px] font-extrabold uppercase tracking-[0.24em] ${light ? "text-[#dfc3a5]" : "text-[#a45839]"}`}>Tostado editorial</span>
      </div>
    </div>
  );
}

function Pill({ children, kind = "neutral" }: { children: React.ReactNode; kind?: "neutral" | "sage" | "terracotta" }) {
  const colors = { neutral: "bg-[#f1e7d9] text-[#59463a]", sage: "bg-[#dbe5d5] text-[#456044]", terracotta: "bg-[#f4ddd2] text-[#914228]" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.11em] ${colors[kind]}`}>{children}</span>;
}

function ProductImage({ product, compact = false }: { product: Product; compact?: boolean }) {
  if (product.image) return <img src={product.image} alt={product.name} className={`h-full w-full object-cover ${compact ? "rounded-xl" : ""}`} />;
  if (compact) return <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#ead8c5]"><ProductGlyph category={product.category} className="h-5 w-5 text-[#a45536]" /></div>;
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#ead8c5] paper-grain">
      <span className="absolute bottom-0 left-6 top-0 w-px bg-[#b35332]/45" />
      <div className="relative flex w-full flex-col justify-between p-5 text-[#a45536]">
        <div className="flex items-start justify-between"><span className="text-[9px] font-extrabold uppercase tracking-[0.18em]">Nota de barra</span><ProductGlyph category={product.category} className="h-5 w-5" /></div>
        <span className="font-display text-3xl italic text-[#79513c]">{product.category === "Fríos" ? "16 h" : product.category === "Panadería" ? "hoy" : "doble"}</span>
      </div>
    </div>
  );
}

function PublicCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const editorialOffset = product.featured ? "md:col-span-2" : product.id === "cold-brew" ? "md:translate-y-12" : product.id === "tostada" ? "md:col-span-2 md:translate-y-5" : "";
  return (
    <article className={`group relative overflow-hidden rounded-[1.25rem] bg-[#fffaf2] shadow-[0_8px_30px_rgba(72,45,26,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(72,45,26,0.14)] ${editorialOffset}`}>
      <div className={`overflow-hidden ${product.featured ? "h-56 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[45%]" : "h-44"}`}>
        <ProductImage product={product} />
      </div>
      <div className={`flex flex-col ${product.featured ? "min-h-[18rem] p-6 md:w-[60%] md:p-9" : "p-5"}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <Pill kind={product.category === "Panadería" ? "terracotta" : "neutral"}>{product.category}</Pill>
          <span className="font-display text-2xl text-[#a64e2f]">{priceFormatter.format(product.price)}</span>
        </div>
        <h3 className={`font-display text-[#241a14] ${product.featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>{product.name}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#725f51]">{product.description}</p>
        {product.id === "cold-brew" && <p className="mt-4 border-l-2 border-[#b35332] pl-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#8f553e]">Extracción lenta · brillo cítrico</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div className="flex flex-wrap gap-1.5">{product.tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}</div>
          <button onClick={() => onOpen(product)} className="group/btn flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#8d4028] transition hover:text-[#502111]">Ver <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" /></button>
        </div>
      </div>
    </article>
  );
}

function PublicMenu({ products, navigate }: { products: Product[]; navigate: (path: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<Category | "Todo">("Todo");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const menuProducts = useMemo(() => products.filter((p) => p.available && (activeCategory === "Todo" || p.category === activeCategory) && `${p.name} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [products, activeCategory, query]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f1e7] text-[#241a14]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <Logo light />
          <button onClick={() => navigate("/admin")} className="hidden items-center gap-2 rounded-full border border-[#fff9ed]/30 bg-[#fff9ed]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#fff9ed] backdrop-blur-sm transition hover:bg-[#fff9ed] hover:text-[#251b15] sm:flex"><Settings2 className="h-3.5 w-3.5" />Administrar</button>
          <button onClick={() => navigate("/admin")} aria-label="Abrir administración" className="rounded-full border border-[#fff9ed]/30 bg-[#fff9ed]/10 p-2.5 text-[#fff9ed] backdrop-blur-sm sm:hidden"><Settings2 className="h-4 w-4" /></button>
        </div>
      </header>

      <section className="relative isolate min-h-[650px] overflow-hidden bg-[#211914] pb-16 pt-36 md:min-h-[720px] md:pb-20 md:pt-44">
        <img src={asset.hero} alt="Cappuccino de avena y croissant recién horneado" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(30,22,18,0.95)_0%,rgba(30,22,18,0.84)_35%,rgba(30,22,18,0.22)_72%,rgba(30,22,18,0.05)_100%)]" />
        <div className="relative mx-auto flex min-h-[470px] max-w-[1440px] flex-col justify-end px-5 md:min-h-[520px] md:px-10">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#e5c2a3]"><span className="h-px w-8 bg-[#c96b47]" />Café de especialidad · hoy</div>
            <h1 className="font-display text-balance text-5xl leading-[0.94] text-[#fff8ec] sm:text-6xl md:text-8xl">Elige tu pausa.<br/><em className="font-normal text-[#e7a080]">La servimos con carácter.</em></h1>
            <p className="mt-7 max-w-md text-base leading-7 text-[#eadbcc]">Café con origen, recetas de temporada y panadería recién salida del horno. Hecho para acompañar tu momento.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => document.getElementById("carta")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-full bg-[#f5e8d8] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.13em] text-[#2d2018] transition hover:bg-white active:scale-[0.97]">Descubrir la carta <ArrowDownLine /></button>
              <span className="inline-flex items-center px-3 text-xs font-semibold text-[#f1d4c0]">Abierto hoy · 08:00 — 19:30</span>
            </div>
          </div>
        </div>
      </section>

      <main id="carta" className="relative mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="steam-curve text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#a65032]">La carta</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] text-[#251b15] md:text-6xl">Preparado para <em className="font-normal text-[#a65032]">quedarse</em> un rato.</h2>
          </div>
          <label className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[#dfcdb9] bg-[#fffaf2] px-4 text-[#826b5a] lg:w-80"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar en la carta" placeholder="Busca una bebida o algo dulce" className="w-full bg-transparent text-sm outline-none placeholder:text-[#a68d7a]" /></label>
        </div>

        <div className="mt-10 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="mr-1 h-4 w-4 shrink-0 text-[#a65032]" />
          {categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.11em] transition ${activeCategory === category ? "bg-[#5d895a] text-[#fff9ed] shadow-lg shadow-[#5d895a]/20" : "bg-[#eee0cd] text-[#6d5647] hover:bg-[#e5d1ba]"}`}>{category}</button>)}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{menuProducts.map((product) => <PublicCard key={product.id} product={product} onOpen={setSelected} />)}
          {menuProducts.length > 3 && <aside className="relative overflow-hidden rounded-[1.25rem] border border-[#d9c1a9] bg-[#e8d7c1] p-7 paper-grain sm:col-span-2 xl:col-span-3"><span className="absolute bottom-0 left-8 top-0 w-px bg-[#b35332]" /><div className="relative grid gap-6 sm:grid-cols-[0.8fr_1.2fr] sm:items-end"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a65032]">Regla de tostado · 02</p><p className="mt-3 font-display text-5xl leading-none text-[#33231a]">Que tenga<br/><em className="font-normal">origen.</em></p></div><div className="border-l border-[#b99d84] pl-5 text-sm leading-6 text-[#694f3e]"><p>Trabajamos el café como una historia corta: origen claro, molienda precisa y una receta que deja aparecer sus notas.</p><p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9a4b2e]">Cuerpo · dulzor · final</p></div></div></aside>}
        </div>
        {menuProducts.length === 0 && <div className="mt-10 rounded-[1.5rem] border border-dashed border-[#ceb69d] bg-[#fffaf2] px-6 py-14 text-center"><Search className="mx-auto h-7 w-7 text-[#a65032]" /><h3 className="mt-4 font-display text-2xl">No encontramos esa pausa.</h3><p className="mt-2 text-sm text-[#765f50]">Prueba con otra búsqueda o explora todas las categorías.</p><button onClick={() => { setQuery(""); setActiveCategory("Todo"); }} className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#a65032]">Ver carta completa</button></div>}
      </main>

      <section className="border-y border-[#ddc8b1] bg-[#ede0ce] paper-grain">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-16">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a65032]">Una guía pequeña</p><h2 className="mt-4 max-w-lg font-display text-4xl leading-tight text-[#281c15]">Aquí el menú se lee como se toma el café: <em className="font-normal">sin prisa.</em></h2></div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1"><Feature icon={<CircleGauge />} title="Tueste medio" text="Cuerpo redondo, acidez amable." /><Feature icon={<Leaf />} title="Alternativas" text="Avena disponible en cada espresso." /><Feature icon={<Sparkles />} title="Estacional" text="Recetas que siguen el ritmo del día." /></div>
        </div>
      </section>

      <footer className="bg-[#231a15] px-5 py-10 text-[#f3e5d5] md:px-10"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><Logo light /><div className="text-sm leading-6 text-[#c9aa91]"><p className="font-bold text-[#f3e5d5]">Café Nube · Plaza del Barrio</p><p>Abierto todos los días, 08:00 — 19:30</p></div><button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#e7a080] hover:text-white">Gestionar carta <ChevronRight className="h-4 w-4" /></button></div></footer>

      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ArrowDownLine() { return <span className="text-lg leading-none">↓</span>; }

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex items-center gap-4 rounded-2xl bg-[#f8f1e7]/70 p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3ddd2] text-[#9d4a2e]">{icon}</div><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#34251b]">{title}</p><p className="mt-1 text-xs text-[#725f51]">{text}</p></div></div>;
}

function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  return <div role="dialog" aria-modal="true" aria-label={`Detalle de ${product.name}`} className="fixed inset-0 z-50 flex items-end bg-[#211914]/65 p-3 backdrop-blur-sm md:items-center md:justify-center"><div className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] bg-[#fffaf2] shadow-2xl md:grid md:grid-cols-2"><button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-[#fffaf2]/90 p-2 text-[#38261b] shadow-sm hover:bg-white" aria-label="Cerrar detalle"><X className="h-5 w-5" /></button><div className="h-52 md:h-full"><ProductImage product={product} /></div><div className="p-7 md:p-9"><Pill kind="terracotta">{product.category}</Pill><h2 className="mt-4 font-display text-4xl text-[#271b14]">{product.name}</h2><p className="mt-3 text-sm leading-6 text-[#725f51]">{product.description}</p><p className="mt-7 font-display text-3xl text-[#a65032]">{priceFormatter.format(product.price)}</p><div className="mt-6 flex flex-wrap gap-2">{product.tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}</div><div className="mt-8 border-t border-[#ead8c5] pt-5 text-xs leading-5 text-[#826b5a]">Consulta en barra por disponibilidad y alternativas de leche.</div></div></div></div>;
}

function AdminMenu({ products, setProducts, navigate }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; navigate: (path: string) => void }) {
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const filteredProducts = useMemo(() => products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const visibleProducts = products.filter((p) => p.available).length;
  const totalValue = products.reduce((sum, product) => sum + product.price, 0);

  const saveProduct = (product: Product) => {
    setProducts((current) => current.some((item) => item.id === product.id) ? current.map((item) => item.id === product.id ? product : item) : [product, ...current]);
    toast.success(product.name ? "Producto guardado en la carta" : "Cambios guardados");
    setEditor(null);
  };
  const removeProduct = () => {
    if (!deleting) return;
    setProducts((current) => current.filter((item) => item.id !== deleting.id));
    toast.success(`${deleting.name} se eliminó de la carta`);
    setDeleting(null);
  };

  return <div className="min-h-screen bg-[#f7f2ea] text-[#291e17] lg:flex">
    <aside className="flex shrink-0 flex-row items-center justify-between bg-[#211914] px-5 py-4 text-[#f9eddf] lg:sticky lg:top-0 lg:h-screen lg:w-[255px] lg:flex-col lg:items-stretch lg:justify-start lg:px-6 lg:py-7">
      <Logo light />
      <nav className="hidden space-y-2 lg:mt-14 lg:block"><NavItem icon={<CircleGauge />} label="Resumen" active /><NavItem icon={<Menu />} label="Productos" /><NavItem icon={<Settings2 />} label="Ajustes" muted /><div className="ml-3 mt-8 border-l border-[#a65032] pl-3 text-[9px] font-extrabold uppercase leading-5 tracking-[0.16em] text-[#c89a7e]">Tostado 47<br/>Carta viva</div></nav>
      <div className="hidden rounded-2xl bg-[#30251f] p-4 lg:mt-auto lg:block"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#cb9d80]">Carta publicada</p><p className="mt-1 text-sm font-semibold">Los cambios se guardan aquí.</p><button onClick={() => navigate("/")} className="mt-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#e6a07c] hover:text-white"><Eye className="h-3.5 w-3.5" />Ver menú público</button></div>
      <button onClick={() => navigate("/")} className="rounded-full border border-[#5b483b] p-2 text-[#f9eddf] lg:hidden" aria-label="Ver menú público"><Eye className="h-4 w-4" /></button>
    </aside>

    <main className="min-w-0 flex-1 px-5 py-7 md:px-10 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div className="border-l-2 border-[#b35332] pl-4"><button onClick={() => navigate("/")} className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.13em] text-[#9b5538] hover:text-[#512819]"><ArrowLeft className="h-3.5 w-3.5" />Volver a la carta</button><p className="text-[10px] font-extrabold uppercase tracking-[0.21em] text-[#9b5538]">Operación diaria · regla 01</p><h1 className="mt-2 font-display text-4xl md:text-5xl">Tu carta, <em className="font-normal text-[#a65032]">en movimiento.</em></h1><p className="mt-2 text-sm text-[#755f51]">Gestiona los productos que ven tus clientes.</p></div><button onClick={() => setEditor(newProduct())} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#a65032] px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#fff9ed] shadow-lg shadow-[#a65032]/20 transition hover:bg-[#8d3f27] active:scale-[0.97]"><PackagePlus className="h-4 w-4" />Nuevo producto</button></div>

        <section className="mt-9 grid gap-4 md:grid-cols-3"><AdminStat icon={<Coffee />} label="En carta" value={`${visibleProducts}`} detail={`de ${products.length} productos`} color="terracotta" /><AdminStat icon={<Eye />} label="Categorías" value="04" detail="café, fríos y panadería" color="ink" /><AdminStat icon={<Zap />} label="Valor de carta" value={priceFormatter.format(totalValue)} detail="suma de precios publicados" color="sand" /></section>

        <section className="mt-8 overflow-hidden rounded-[1.35rem] border border-[#e3d2bf] bg-[#fffaf2] shadow-[0_10px_30px_rgba(79,48,27,0.06)]"><div className="flex flex-col justify-between gap-4 border-b border-[#eadac9] px-5 py-5 sm:flex-row sm:items-center md:px-7"><div><h2 className="font-display text-2xl">Productos de la carta</h2><p className="mt-1 text-xs text-[#7b6555]">Edita precios, características y disponibilidad.</p></div><label className="flex h-10 items-center gap-2 rounded-xl bg-[#f4e8da] px-3 text-[#8a6f5e] sm:w-64"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar producto" placeholder="Buscar producto" className="w-full bg-transparent text-sm outline-none placeholder:text-[#aa927e]" /></label></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[770px] border-collapse text-left"><thead><tr className="bg-[#fcf5eb] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#896f5d]"><th className="px-5 py-4 md:px-7">Producto</th><th className="px-4 py-4">Categoría</th><th className="px-4 py-4">Características</th><th className="px-4 py-4">Precio</th><th className="px-4 py-4">Estado</th><th className="px-5 py-4 text-right md:px-7">Acciones</th></tr></thead><tbody>{filteredProducts.map((product, index) => <tr key={product.id} className="border-t border-[#f0e2d2] text-sm transition hover:bg-[#fff6ea]"><td className="px-5 py-4 md:px-7"><div className="flex items-center gap-3"><span className="hidden font-display text-xl text-[#c0977c] xl:block">{String(index + 1).padStart(2, "0")}</span><div className="h-11 w-11 overflow-hidden rounded-xl"><ProductImage product={product} compact /></div><div><p className="font-bold text-[#34251b]">{product.name}</p><p className="mt-0.5 max-w-[220px] truncate text-xs text-[#816b5b]">{product.description}</p></div></div></td><td className="px-4 py-4"><Pill kind="neutral">{product.category}</Pill></td><td className="px-4 py-4"><div className="flex max-w-[170px] flex-wrap gap-1">{product.tags.slice(0, 2).map((tag) => <span key={tag} className="text-xs text-[#7a6454]">{tag}</span>)}</div></td><td className="px-4 py-4 font-display text-lg text-[#9b4a2d]">{priceFormatter.format(product.price)}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${product.available ? "text-[#436643]" : "text-[#9d6b55]"}`}><span className={`h-1.5 w-1.5 rounded-full ${product.available ? "bg-[#5d895a]" : "bg-[#bc9986]"}`} />{product.available ? "Publicado" : "Oculto"}</span></td><td className="px-5 py-4 md:px-7"><div className="flex justify-end gap-2"><button onClick={() => setEditor(product)} className="rounded-lg p-2 text-[#a65032] transition hover:bg-[#f4ddd2]" aria-label={`Editar ${product.name}`}><Edit3 className="h-4 w-4" /></button><button onClick={() => setDeleting(product)} className="rounded-lg p-2 text-[#a95a45] transition hover:bg-[#fae2dc]" aria-label={`Eliminar ${product.name}`}><Trash2 className="h-4 w-4" /></button><button onClick={() => setEditor(product)} className="rounded-lg p-2 text-[#826b5a] transition hover:bg-[#f1e4d4]" aria-label={`Más opciones de ${product.name}`}><MoreHorizontal className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
          {filteredProducts.length === 0 && <div className="px-6 py-14 text-center"><Search className="mx-auto h-6 w-6 text-[#a65032]" /><p className="mt-3 font-display text-xl">No hay productos con esa búsqueda.</p></div>}
          <div className="flex flex-col justify-between gap-3 border-t border-[#eadac9] px-5 py-4 text-xs text-[#816b5b] sm:flex-row md:px-7"><span>Mostrando {filteredProducts.length} de {products.length} productos</span><span className="font-bold text-[#a65032]">Guardado localmente en este navegador</span></div>
        </section>
      </div>
    </main>
    {editor && <ProductEditor product={editor} onClose={() => setEditor(null)} onSave={saveProduct} />}
    {deleting && <ConfirmDelete product={deleting} onCancel={() => setDeleting(null)} onConfirm={removeProduct} />}
  </div>;
}

function NavItem({ icon, label, active = false, muted = false }: { icon: React.ReactNode; label: string; active?: boolean; muted?: boolean }) { return <div className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? "bg-[#a65032] text-[#fff8ed]" : muted ? "text-[#bba390]" : "text-[#f2e3d3]"}`}>{icon}{label}</div>; }
function AdminStat({ icon, label, value, detail, color }: { icon: React.ReactNode; label: string; value: string; detail: string; color: "terracotta" | "ink" | "sand" }) { const colors = { terracotta: "bg-[#f1ddd2] text-[#9d4a2e]", ink: "bg-[#e8ded2] text-[#4d382a]", sand: "bg-[#eee1cc] text-[#896038]" }; return <article className="relative overflow-hidden rounded-[1.2rem] border border-[#e4d3c0] bg-[#fffaf2] p-5 shadow-[0_6px_18px_rgba(79,48,27,0.04)]"><span className="absolute bottom-0 left-0 top-0 w-1 bg-[#b35332]" /><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#876f5c]">{label}</p><p className="mt-2 font-display text-3xl text-[#2a1e16]">{value}</p></div><div className={`rounded-xl p-2.5 ${colors[color]}`}>{icon}</div></div><p className="mt-3 text-xs text-[#806958]">{detail}</p></article>; }

function ProductEditor({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (product: Product) => void }) {
  const [draft, setDraft] = useState<Product>({ ...product });
  const update = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!draft.name.trim() || draft.price <= 0 || !draft.description.trim()) { toast.error("Completa nombre, precio y descripción"); return; } onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim(), tags: draft.tags.filter(Boolean) }); };
  return <div role="dialog" aria-modal="true" aria-label="Editor de producto" className="fixed inset-0 z-50 overflow-y-auto bg-[#211914]/60 p-3 backdrop-blur-sm md:p-8"><div className="mx-auto my-2 max-w-2xl overflow-hidden rounded-[1.5rem] bg-[#fffaf2] shadow-2xl"><div className="flex items-center justify-between border-b border-[#ead8c5] px-6 py-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#a65032]">Gestión de producto</p><h2 className="mt-1 font-display text-3xl">{product.name ? "Editar producto" : "Nuevo producto"}</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#715a4a] hover:bg-[#f0e3d5]" aria-label="Cerrar editor"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="p-6"><div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre del producto"><input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej. Espresso tonic" className="form-input" /></Field><Field label="Precio (CLP)"><input value={draft.price || ""} onChange={(e) => update("price", Number(e.target.value))} type="number" min="0" placeholder="3200" className="form-input" /></Field><Field label="Categoría"><select value={draft.category} onChange={(e) => update("category", e.target.value as Category)} className="form-input"><option value="Café">Café</option><option value="Fríos">Fríos</option><option value="Matcha">Matcha</option><option value="Panadería">Panadería</option></select></Field><Field label="Etiquetas (separadas por coma)"><input value={draft.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((tag) => tag.trim()))} placeholder="Intenso, Avena" className="form-input" /></Field></div><div className="mt-5"><Field label="Descripción"><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} placeholder="Cuenta brevemente el sabor y la preparación." rows={3} className="form-input resize-none py-3" /></Field></div><div className="mt-5"><Field label="URL de foto (opcional)"><input value={draft.image || ""} onChange={(e) => update("image", e.target.value || undefined)} placeholder="https://..." className="form-input" /></Field></div><label className="mt-6 flex cursor-pointer items-center justify-between rounded-xl border border-[#e6d4c0] bg-[#fcf5eb] p-4"><div><p className="text-sm font-bold">Visible en la carta</p><p className="mt-0.5 text-xs text-[#806958]">El cliente podrá verlo y consultar sus detalles.</p></div><button type="button" onClick={() => update("available", !draft.available)} className={`relative h-7 w-12 rounded-full transition ${draft.available ? "bg-[#5d895a]" : "bg-[#c6ad9a]"}`} aria-pressed={draft.available}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${draft.available ? "translate-x-6" : "translate-x-1"}`} /></button></label><div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row"><button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#735d4d] hover:bg-[#f0e3d5]">Cancelar</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a65032] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#fff8ed] transition hover:bg-[#8c3e26]"><Check className="h-4 w-4" />Guardar producto</button></div></form></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#826a59]">{label}</span>{children}</label>; }
function ConfirmDelete({ product, onCancel, onConfirm }: { product: Product; onCancel: () => void; onConfirm: () => void }) { return <div role="dialog" aria-modal="true" aria-label="Confirmar eliminación" className="fixed inset-0 z-[60] flex items-center justify-center bg-[#211914]/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-[1.5rem] bg-[#fffaf2] p-7 shadow-2xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fae1d9] text-[#a54d35]"><Trash2 className="h-5 w-5" /></div><h2 className="mt-5 font-display text-3xl">¿Eliminar producto?</h2><p className="mt-3 text-sm leading-6 text-[#735e4e]">Vas a eliminar <strong>{product.name}</strong> de la carta. Esta acción no se puede deshacer desde esta sesión.</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={onCancel} className="rounded-xl px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#735d4d] hover:bg-[#f0e3d5]">Conservar</button><button onClick={onConfirm} className="rounded-xl bg-[#a64d35] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white hover:bg-[#8c3724]">Eliminar producto</button></div></div></div>; }

export default function Home() {
  const [location, navigate] = useLocation();
  const [products, setProducts] = useState<Product[]>(seedProducts);
  useEffect(() => { const stored = localStorage.getItem("cafe-nube-products"); if (!stored) return; try { const parsed = JSON.parse(stored) as Product[]; if (Array.isArray(parsed)) setProducts(parsed); } catch { localStorage.removeItem("cafe-nube-products"); } }, []);
  useEffect(() => { localStorage.setItem("cafe-nube-products", JSON.stringify(products)); }, [products]);
  return location === "/admin" ? <AdminMenu products={products} setProducts={setProducts} navigate={navigate} /> : <PublicMenu products={products} navigate={navigate} />;
}
