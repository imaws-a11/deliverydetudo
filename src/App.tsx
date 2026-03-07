import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './lib/supabase';

// Mock Data
const SERVICES = [
  { id: 'mototaxi', icon: 'moped', label: 'Mototáxi', category: 'transport' },
  { id: 'entrega', icon: 'restaurant', label: 'Alimentos', category: 'food' },
  { id: 'expressas', icon: 'bolt', label: 'Expressas', category: 'delivery' },
  { id: 'pacotes', icon: 'package_2', label: 'Pacotes', category: 'delivery' },
  { id: 'documentos', icon: 'vpn_key', label: 'Documentos', category: 'delivery' },
  { id: 'mercado', icon: 'shopping_cart', label: 'Mercado', category: 'food' },
  { id: 'farmacia', icon: 'medical_services', label: 'Farmácia', category: 'health' },
  { id: 'pet', icon: 'pets', label: 'Pet Shop', category: 'shopping' },
  { id: 'mais', icon: 'more_horiz', label: 'Mais', gray: true, category: 'other' },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'delivery', title: 'Pacote Entregue', subtitle: 'To: Rua Augusta, 450', time: 'Há 2h', icon: 'check_circle', iconColor: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 2, type: 'transport', title: 'Viagem Finalizada', subtitle: 'From: Shopping Morumbi', time: 'Ontem', icon: 'directions_bike', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 3, type: 'delivery', title: 'Pedido Cancelado', subtitle: 'Restaurante: Pizza Mania', time: '2 dias atrás', icon: 'cancel', iconColor: 'text-red-600', bgColor: 'bg-red-100' },
];

type ViewState =
  | 'onboarding' | 'login' | 'app'
  | 'mototaxi_request' | 'mototaxi_category' | 'searching_driver' | 'driver_found' | 'trip_in_progress' | 'trip_completed' | 'trip_rating'
  | 'shipping_details' | 'shipping_address' | 'shipping_vehicle' | 'shipping_payment' | 'shipping_processing' | 'shipping_error'
  | 'searching_courier' | 'on_the_way_to_pickup' | 'on_the_way_to_destination' | 'delivery_completed'
  | 'driver_confirmation' | 'pet_shop' | 'food_categories' | 'notifications' | 'profile'
  | 'my_data' | 'payment_methods' | 'saved_addresses' | 'coupons' | 'order_history' | 'support';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('onboarding');
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAddress] = useState('Av. Paulista, 1000');
  const [destinationAddress, setDestinationAddress] = useState('Shopping Morumbi, 1089');
  const [selectedCategory, setSelectedCategory] = useState({ id: 'comum', label: 'Mototáxi Comum', price: 'R$ 12,00' });
  const [paymentMethod, setPaymentMethod] = useState('money');
  const [destinationSearchVal, setDestinationSearchVal] = useState('');

  // User Profile Data (Mock)
  const [userData] = useState({
    name: 'Ricardo Oliveira',
    email: 'ricardo.oliveira@email.com',
    phone: '(11) 98765-4321',
    rating: 4.9,
    ordersCount: 124,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1kK06avEJV3GlHT9jYD09fWkHVZdK7zkHeHYogAjmBCqXwyB_Ygnp3VZ9juLgAqaSvGhvLzQon1d7E9tLz_5kVT7CIf_s7qK74PPyuFi4HGrlcx85SrJRMc3UvL-oBQ1GoxCcS-T0sYZ-XkHgn_gvv1HOP66lHmV8hDOtsFJkcWIz1OCMuAhRW6lBogvrB61Ss0xec2nTU124JXBhsR9bdk4ClV3OzNeDDbn4Z1bMcDbGnPQ-fG-Vr9-PzNYb-NYt0MQiw1TsAYN7'
  });

  // Shipping Flow State
  const [activeService, setActiveService] = useState<any>(null);
  const [shippingItemType, setShippingItemType] = useState('package');
  const [isFragile, setIsFragile] = useState(false);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [pickupAddress, setPickupAddress] = useState('Av. Paulista, 1578');
  const [pickupComplement, setPickupComplement] = useState('');
  const [pickupContact, setPickupContact] = useState('');
  const [shippingItemDesc, setShippingItemDesc] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('motorcycle');
  const [shippingPrice, setShippingPrice] = useState(45.90);

  useEffect(() => {
    if (currentView === 'searching_driver') {
      const timer = setTimeout(() => setCurrentView('driver_found'), 5000);
      return () => clearTimeout(timer);
    }
    if (currentView === 'driver_found') {
      const timer = setTimeout(() => setCurrentView('trip_in_progress'), 5000);
      return () => clearTimeout(timer);
    }
    if (currentView === 'trip_in_progress') {
      const timer = setTimeout(() => setCurrentView('trip_completed'), 10000);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const filteredServices = useMemo(() => {
    return SERVICES.filter(s =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderOnboarding = () => (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative z-10">
        {/* Cinematic Hero Section */}
        <div className="w-full pt-12 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div
              className="w-full aspect-[4/5] bg-slate-900 overflow-hidden rounded-[50px] shadow-2xl relative border border-white/10 dark:border-white/5"
            >
              <img
                src="https://images.unsplash.com/photo-1549463599-24794790949e?q=80&w=1000&auto=format&fit=crop"
                className="size-full object-cover scale-110 animate-slow-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <div className="glass px-4 py-2 rounded-full w-fit mb-4 border border-white/20">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Elite Experience</span>
                </div>
                <h2 className="text-white text-4xl font-black tracking-tight leading-none italic uppercase">Tudo na<br /><span className="text-primary tracking-widest text-2xl not-italic">VELOCIDADE LUX</span></h2>
              </div>
            </div>
            {/* Floating Widget */}
            <div className="absolute -bottom-6 -right-4 glass p-4 rounded-3xl shadow-soft border border-white/20 animate-bounce cursor-default">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-900 font-bold">bolt</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">VIP Ativo</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Content */}
        <div className="flex flex-col flex-1 justify-between px-8 pb-16 pt-12">
          <div className="space-y-4">
            <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[40px] font-black leading-tight text-center font-display italic">
              O seu tempo é <span className="text-primary not-italic">sagrado.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-bold leading-relaxed text-center px-4 font-display opacity-80 uppercase tracking-tighter">
              A elegância da conveniência elevada ao próximo patamar.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex w-full flex-row items-center justify-center gap-3">
              <div className="h-1.5 w-12 rounded-full bg-primary shadow-soft"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setCurrentView('login')}
                className="flex w-full cursor-pointer items-center justify-center rounded-3xl h-18 py-5 bg-primary text-slate-900 text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all font-display uppercase tracking-[0.2em] border-b-4 border-slate-900/10"
              >
                Explorar Lux
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="flex w-full cursor-pointer items-center justify-center rounded-3xl h-16 py-4 glass border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-sm font-black font-display uppercase tracking-[0.3em] active:bg-slate-50 dark:active:bg-slate-800 transition-all opacity-80 hover:opacity-100"
              >
                Acessar Minha Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 size-[500px] bg-primary/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 size-[400px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex items-center p-8 justify-between">
          <button
            className="size-12 rounded-2xl glass border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white transition-all active:scale-90"
            onClick={() => setCurrentView('onboarding')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="glass px-5 py-2.5 rounded-2xl border border-white/20">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Acesso Seguro</span>
          </div>
        </div>

        <main className="flex-1 px-8 pt-6 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-slate-900 dark:text-white text-[44px] font-black tracking-tight leading-none uppercase italic">IDENTIFIQUE-<br /><span className="text-primary not-italic tracking-[0.1em]">SE</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-60">Entre para continuar sua jornada elite</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-4">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-primary text-xl">alternate_email</span>
                </div>
                <input
                  className="block w-full pl-14 pr-6 py-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-[30px] text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-floating"
                  placeholder="ricardo.oliveira@email.com"
                  type="email"
                  defaultValue="ricardo.oliveira@email.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Senha Secreta</label>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/20 hover:border-primary transition-all">Esqueceu?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-primary text-xl">lock</span>
                </div>
                <input
                  className="block w-full pl-14 pr-16 py-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-[30px] text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-floating"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  defaultValue="password123"
                />
                <button
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors p-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('app')}
              className="w-full bg-primary text-slate-900 font-black py-6 rounded-[32px] text-base uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-3 border-b-4 border-slate-900/10"
            >
              Autenticar
              <span className="material-symbols-outlined">verified_user</span>
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso Rápido</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 glass py-5 rounded-[30px] border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.95] text-[10px] font-black uppercase tracking-widest">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" className="size-4" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 glass py-5 rounded-[30px] border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.95] text-[10px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-xl">apple</span>
                Apple ID
              </button>
            </div>
          </div>
        </main>

        <footer className="p-10 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-tighter text-sm">
            Novo por aqui? <button className="text-primary font-black hover:underline ml-1">Criar Convite Lux</button>
          </p>
        </footer>
      </div>

      {/* Decorative */}
      <div className="absolute -top-20 -left-20 size-80 bg-primary/10 rounded-full blur-[100px] -z-0"></div>
    </div>
  );



  const renderHome = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32 animate-in fade-in duration-700">
      <header className="p-6 space-y-6 sticky top-0 glass z-40 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="size-12 rounded-2xl bg-primary flex items-center justify-center text-slate-900 font-bold shadow-soft cursor-pointer active:scale-90 transition-all bg-center bg-cover border border-white/20"
              style={{ backgroundImage: `url('${userData.avatar}')` }}
              onClick={() => setActiveTab('profile')}
            />
            <div className="cursor-pointer group" onClick={() => setCurrentView('mototaxi_request')}>
              <p className="text-[10px] text-left text-slate-400 font-black uppercase tracking-[0.3em] leading-none mb-1">Entregar em</p>
              <div className="flex items-center gap-1.5 font-display">
                <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">location_on</span>
                <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[140px] tracking-tight">{selectedAddress}</span>
                <span className="material-symbols-outlined text-slate-400 text-sm group-hover:rotate-180 transition-transform">keyboard_arrow_down</span>
              </div>
            </div>
          </div>
          <button
            className="size-12 rounded-2xl glass border border-white/10 dark:border-white/5 flex items-center justify-center relative active:scale-90 transition-all shadow-floating"
            onClick={() => {
              setNotifications(0);
              setCurrentView('notifications');
            }}
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-100 text-2xl">notifications</span>
            {notifications > 0 && (
              <span className="absolute top-3.5 right-3.5 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-background-dark shadow-[0_0_8px_#ef4444]"></span>
            )}
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary group-focus-within:scale-125 transition-transform duration-500">search</span>
          </div>
          <input
            className="block w-full pl-14 pr-6 py-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-[30px] text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-floating"
            placeholder="O que você deseja hoje?"
            type="text"
            onFocus={() => setActiveTab('search')}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-4">
        {/* Elite Banner */}
        <section className="px-6 py-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative w-full h-[220px] rounded-[48px] overflow-hidden group cursor-pointer shadow-floating"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 p-10 flex flex-col justify-end">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-3">Programa Fidelidade Lux</span>
              <h3 className="text-3xl font-black text-white leading-none tracking-tight mb-4 italic">PRIVILÉGIOS<br /><span className="text-primary tracking-[0.1em]">EXCLUSIVOS</span></h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Primeira entrega grátis</p>
            </div>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-110"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540959733332-e94e270b4d48?q=80&w=1000&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          </motion.div>
        </section>

        {/* Categories Carousel */}
        <section className="py-8">
          <div className="px-8 flex justify-between items-end mb-6">
            <h2 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] font-display">Categorias High-End</h2>
            <button className="text-[10px] font-black text-primary uppercase border-b border-primary/30 pb-0.5 tracking-widest">Ver Todas</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
            {[
              { id: 'mototaxi', icon: 'moped', label: 'Concierge Viagem', color: 'bg-primary/20' },
              { id: 'entrega', icon: 'restaurant', label: 'Gourmet Deli', color: 'bg-red-500/10 text-red-600' },
              { id: 'expressas', icon: 'bolt', label: 'Elite Express', color: 'bg-yellow-500/10 text-yellow-600' },
              { id: 'mercado', icon: 'shopping_cart', label: 'Mercado Lux', color: 'bg-green-500/10 text-green-600' },
              { id: 'pet', icon: 'pets', label: 'Pet Gourmet', color: 'bg-blue-500/10 text-blue-600' },
            ].map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-4 min-w-[120px] p-6 rounded-[40px] bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-floating cursor-pointer group hover:border-primary/30 transition-all"
                onClick={() => {
                  if (item.id === 'mototaxi') setCurrentView('mototaxi_request');
                  else if (item.id === 'pet') setCurrentView('pet_shop');
                  else if (item.id === 'entrega' || item.id === 'mercado') {
                    setActiveService(item);
                    setCurrentView('food_categories');
                  } else {
                    setActiveService(item);
                    setCurrentView('shipping_details');
                  }
                }}
              >
                <div className={`size-16 rounded-2xl ${item.color.includes('primary') ? item.color : item.color.split(' ')[0]} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-3xl ${item.color.includes('text') ? item.color.split(' ')[1] : 'text-primary'}`}>{item.icon}</span>
                </div>
                <span className="text-[10px] font-black text-center uppercase tracking-widest leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Selection */}
        <section className="px-6 py-6">
          <h2 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-2 mb-6 font-display">Seleção Curada Lux</h2>
          <div className="grid grid-cols-1 gap-6">
            {[
              { title: 'Alta Gastronomia', subtitle: 'Os melhores chefs do bairro', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop', tag: 'Top Rated' },
              { title: 'Vinhos & Destilados', subtitle: 'Adega exclusiva 24h', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop', tag: 'Curadoria' },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="relative h-[200px] rounded-[40px] overflow-hidden shadow-floating group cursor-pointer"
              >
                <img src={card.img} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-center">
                  <span className="bg-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-900 w-fit mb-3">{card.tag}</span>
                  <h4 className="text-white text-2xl font-black tracking-tight">{card.title}</h4>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">{card.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Map Peek */}
        <section className="px-6 mt-6 pb-12">
          <div className="h-40 w-full rounded-[48px] overflow-hidden relative shadow-floating group cursor-pointer border border-white/10 dark:border-white/5">
            <div
              className="absolute inset-0 bg-slate-900 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110 opacity-70 group-hover:opacity-90"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1000&auto=format&fit=crop')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-4">
              <div className="glass px-6 py-3 rounded-full flex items-center gap-3 border border-white/20 shadow-soft animate-bounce">
                <span className="size-2.5 rounded-full bg-primary shadow-[0_0_15px_#D4AF37]"></span>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">12 Concierges Ativos na Região</span>
              </div>
              <h4 className="text-white text-lg font-black uppercase tracking-[0.1em] text-center">Abrir Mapa em Tempo Real</h4>
            </div>
          </div>
        </section>
      </main>
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in fade-in duration-500">
      <div className="flex items-center glass p-5 justify-between sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display">Meu Perfil</h2>
      </div>

      <div className="relative px-6 py-10 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
        <div className="flex w-full flex-col gap-6 items-center">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-primary shadow-soft transition-transform"
              style={{ backgroundImage: `url('${userData.avatar}')` }}
            />
            <div className="absolute bottom-1 right-1 bg-primary text-slate-900 p-2.5 rounded-full border-2 border-white dark:border-background-dark flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all">
              <span className="material-symbols-outlined text-sm font-bold">edit</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight font-display">{userData.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold font-display mt-1">{userData.email}</p>

            <div className="flex items-center gap-4 mt-6">
              {[
                { val: '4.9', label: 'Avaliação' },
                { val: '124', label: 'Pedidos' },
                { val: 'Lvl 8', label: 'Membro' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center px-4 py-3 bg-white dark:bg-surface-dark rounded-3xl shadow-floating border border-slate-100 dark:border-white/5 min-w-[80px]">
                  <span className="text-primary font-black text-lg leading-none mb-1">{stat.val}</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-8">
        <div>
          <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] pb-5 px-3 font-display">Sua Experiência Premium</h3>
          <div className="space-y-3">
            {[
              { icon: 'person', label: 'Meus Dados', view: 'my_data' },
              { icon: 'payments', label: 'Métodos de Pagamento', view: 'payment_methods' },
              { icon: 'location_on', label: 'Endereços Salvos', view: 'saved_addresses' },
              { icon: 'confirmation_number', label: 'Cupons e Promoções', view: 'coupons' },
              { icon: 'history', label: 'Histórico de Pedidos', view: 'order_history' },
              { icon: 'help', label: 'Ajuda e Suporte', view: 'support' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView(item.view as ViewState)}
                className="flex items-center gap-5 bg-white dark:bg-surface-dark p-5 rounded-[32px] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group shadow-floating border border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/10 shrink-0 size-12 shadow-inner group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-slate-900 transition-colors">{item.icon}</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-bold flex-1 font-display tracking-tight">{item.label}</p>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pb-12 text-center space-y-6">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 bg-red-500/5 p-5 rounded-[32px] cursor-pointer group border border-red-500/10 hover:bg-red-500/10 transition-all"
            onClick={() => { if (confirm('Sair da conta?')) setCurrentView('onboarding'); }}
          >
            <div className="text-red-500 flex items-center justify-center rounded-2xl bg-red-500/10 shrink-0 size-12 shadow-inner">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <p className="text-red-500 text-base font-black flex-1 font-display tracking-tight text-left">Encerrar Sessão</p>
          </motion.div>

          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] font-display px-2">
            Multi-Service Delivery Lux • Versão 4.12.0
          </p>
        </div>
      </div>
    </div>
  );

  const renderMyData = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('profile')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Meus Dados</h2>
      </div>
      <div className="p-8 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="size-32 rounded-full border-4 border-primary bg-center bg-cover shadow-soft" style={{ backgroundImage: `url('${userData.avatar}')` }} />
            <div className="absolute -bottom-1 -right-1 bg-primary text-slate-900 p-2.5 rounded-full border-2 border-white dark:border-background-dark shadow-xl active:scale-90 cursor-pointer">
              <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {[
            { label: 'Nome Completo', val: userData.name, type: 'text' },
            { label: 'E-mail', val: userData.email, type: 'email' },
            { label: 'Telefone', val: userData.phone, type: 'tel' },
            { label: 'CPF', val: '***.***.***-**', type: 'text' },
          ].map((field, i) => (
            <label key={i} className="block space-y-2 group">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 group-focus-within:text-primary transition-colors">{field.label}</span>
              <input
                type={field.type}
                defaultValue={field.val}
                className="w-full bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-[24px] p-5 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-floating"
              />
            </label>
          ))}
        </div>
        <button className="w-full bg-primary hover:bg-gold-600 text-slate-900 font-black py-6 rounded-[28px] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-sm">Salvar Alterações</button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('profile')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Pagamentos</h2>
      </div>
      <div className="p-8 space-y-8">
        <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-2 font-display">Cartões Selecionados</h3>
        <div className="relative group">
          <div className="relative h-60 w-full rounded-[40px] overflow-hidden shadow-2xl p-8 flex flex-col justify-between text-white bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-white/10 transition-transform group-hover:scale-[1.02] duration-500">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -z-0"></div>
            <div className="flex justify-between items-start relative z-10">
              <span className="material-symbols-outlined text-5xl text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">contactless</span>
              <div className="h-8 w-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/5">
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Gold Card</span>
              </div>
            </div>
            <div className="space-y-6 relative z-10">
              <p className="text-2xl font-black tracking-[0.25em] font-display text-shadow">•••• •••• •••• 4582</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Titular</p>
                  <p className="font-bold text-sm uppercase tracking-wide">{userData.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Até</p>
                  <p className="font-bold text-sm">12/28</p>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4 object-contain brightness-0 invert opacity-80" />
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-white dark:bg-surface-dark border-2 border-dashed border-slate-200 dark:border-white/5 py-6 rounded-[32px] flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 font-black transition-all hover:border-primary/50 hover:text-primary hover:bg-brand-50/10 active:scale-[0.98] uppercase tracking-widest text-xs">
          <span className="material-symbols-outlined text-xl">add_card</span>
          Novo Cartão de Crédito
        </button>

        <div className="pt-4 space-y-4">
          <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-2 font-display">Carteiras Digitais</h3>
          <div className="flex items-center gap-5 bg-white dark:bg-surface-dark p-5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-floating group cursor-pointer hover:border-primary/20 transition-all">
            <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-500 text-3xl">pix</span>
            </div>
            <div className="flex-1">
              <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">PIX Instantâneo</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Conectado • Preferencial</p>
            </div>
            <div className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Ativo</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavedAddresses = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('profile')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Endereços</h2>
      </div>
      <div className="p-8 space-y-6">
        <div className="space-y-4">
          {[
            { id: 1, type: 'Casa', address: 'Rua das Flores, 123 - Centro', icon: 'home_app_logo' },
            { id: 2, type: 'Trabalho', address: 'Av. Paulista, 1500 - Bela Vista', icon: 'corporate_fare' },
            { id: 3, type: 'Academia', address: 'Rua Augusta, 450 - Consolação', icon: 'fitness_center' },
          ].map((addr) => (
            <div key={addr.id} className="flex items-center gap-5 bg-white dark:bg-surface-dark p-5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-floating group transition-all hover:border-primary/30">
              <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-slate-900 transition-all">
                <span className="material-symbols-outlined text-2xl">{addr.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1">{addr.type}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate max-w-[200px]">{addr.address}</p>
              </div>
              <button className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-2">
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          ))}
        </div>
        <button className="w-full bg-primary hover:bg-gold-600 text-slate-900 font-black py-6 rounded-[28px] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm">
          <span className="material-symbols-outlined">add_location_alt</span>
          Novo Destino Premium
        </button>
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('profile')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Privilégios</h2>
      </div>
      <div className="p-8 space-y-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 rounded-[40px] shadow-floating relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 size-48 bg-primary/20 rounded-full blur-[60px] group-hover:bg-primary/30 transition-all duration-700"></div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Seus Pontos Elite</p>
          <div className="flex items-baseline gap-2">
            <p className="text-primary text-5xl font-black italic">2.450</p>
            <span className="text-white/60 font-black text-sm uppercase tracking-widest">Pontos</span>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 px-4 flex items-center gap-3 border border-white/10">
              <span className="material-symbols-outlined text-primary text-xl fill-1">military_tech</span>
              <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] leading-none">Vip Elite Club</span>
            </div>
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%] rounded-full shadow-soft"></div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-2 font-display">Ofertas Exclusivas</h3>
          {[
            { code: 'VIPGOLD50', desc: '50% de Desconto em Deliveries', expiry: '30 Mar' },
            { code: 'FREETRANSPORT', desc: 'Viagem Grátis até R$ 20,00', expiry: '15 Abr' },
          ].map((coupon, i) => (
            <div key={i} className="relative group overflow-hidden bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-floating flex items-center justify-between before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:-translate-x-3 before:size-6 before:bg-background-light dark:before:bg-background-dark before:rounded-full after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-3 after:size-6 after:bg-background-light dark:after:bg-background-dark after:rounded-full">
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex flex-col items-center justify-center border-r border-dashed border-gold-200 dark:border-white/10 pr-5 shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">{coupon.code}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{coupon.desc}</p>
                  <p className="text-[8px] text-primary/60 font-black uppercase mt-1">Expira em {coupon.expiry}</p>
                </div>
              </div>
              <button className="bg-primary/10 text-primary font-black text-[10px] px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-primary hover:text-slate-900 transition-all z-10 border border-primary/20">Copiar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('profile')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Suporte</h2>
      </div>
      <div className="p-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="size-20 bg-primary/10 rounded-[30px] flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-soft">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">support_agent</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Concierge 24/7</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Atendimento prioritário em andamento</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {[
            { label: 'Chat Online', icon: 'forum', color: 'bg-brand-50 dark:bg-brand-500/10' },
            { label: 'Ligar Agora', icon: 'phone_in_talk', color: 'bg-green-500/10' },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-floating text-center flex flex-col items-center gap-4 active:scale-95 transition-all group hover:border-primary/20 cursor-pointer">
              <div className={`size-14 rounded-2xl ${item.color} flex items-center justify-center text-primary group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
              </div>
              <p className="font-black text-[10px] text-slate-900 dark:text-white uppercase tracking-[0.2em]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 font-display">Tópicos VIP</h3>
          {[
            { q: 'Problemas com Pedido Elite', icon: 'shopping_bag' },
            { q: 'Gestão de Pagamentos', icon: 'account_balance' },
            { q: 'Segurança & Biometria', icon: 'fingerprint' },
            { q: 'Solicitar Parcerias Lux', icon: 'diamond' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-white dark:bg-surface-dark p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-floating group cursor-pointer transition-all hover:border-primary/30">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-xl">{item.icon}</span>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.q}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('profile')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Histórico</h2>
      </div>
      <div className="p-8 space-y-8">
        <div className="space-y-6">
          {RECENT_ACTIVITY.map((activity) => (
            <div key={activity.id} className="flex flex-col bg-white dark:bg-surface-dark p-6 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-floating group transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-5 mb-6">
                <div className={`size-16 rounded-2xl ${activity.bgColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-3xl ${activity.iconColor} fill-1`}>{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1 uppercase">{activity.title}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{activity.time} • Concierge Lux</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-lg">R$ 45,90</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Finalizado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 bg-slate-50 dark:bg-white/[0.03] text-slate-500 font-black text-[10px] py-4 rounded-2xl uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20">Ver Recibo</button>
                <button className="flex-1 bg-primary text-slate-900 font-black text-[10px] py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all">Repetir Pedido</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMototaxiRequest = () => {
    const options = [
      { id: '1', title: 'Casa', address: 'Rua das Flores, 123', icon: 'home' },
      { id: '2', title: 'Trabalho', address: 'Av. Paulista, 1500 - Bela Vista', icon: 'work' },
      { id: '3', title: 'Academia', address: 'Smart Fit - Unidade Centro', icon: 'fitness_center' },
    ];

    return (
      <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHr9C_Yv7-T6jV7X_f9U_D5W_9fL9f8y_f8E_8R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R_R')" }}
          >
            {/* Fallback pattern if image fails */}
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 opacity-80" />
          </div>
        </div>

        {/* Floating Header */}
        <div className="relative z-20 flex items-center p-4 gap-3">
          <button
            onClick={() => setCurrentView('app')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl text-slate-900 dark:text-white transition-all active:scale-90"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl border border-white/20">
            <h2 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-tight">Pedir Mototáxi</h2>
          </div>
        </div>

        {/* Draggable Bottom Sheet */}
        <div className="mt-auto z-30 relative pointer-events-none">
          <motion.div
            drag="y"
            dragConstraints={{ top: -300, bottom: 0 }}
            className="bg-white dark:bg-slate-900 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] pointer-events-auto flex flex-col pt-2"
          >
            {/* Handle */}
            <div className="flex w-full items-center justify-center py-4">
              <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="px-6 pb-12 space-y-6">
              {/* Address inputs */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-2 gap-1.5">
                    <div className="size-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                    <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-700 opacity-60"></div>
                    <div className="size-2.5 rounded-full bg-primary shadow-lg shadow-primary/30"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center h-12 bg-white dark:bg-slate-900 rounded-xl px-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{selectedAddress}</span>
                    </div>
                    <div className="flex items-center h-12 bg-white dark:bg-slate-900 rounded-xl px-4 border-2 border-primary shadow-lg">
                      <span className="material-symbols-outlined text-primary text-xl mr-2">search</span>
                      <input
                        className="bg-transparent border-none focus:ring-0 w-full text-slate-900 dark:text-white font-black text-sm placeholder:text-slate-400"
                        placeholder="Para onde vamos hoje?"
                        value={destinationSearchVal}
                        onChange={(e) => setDestinationSearchVal(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Lugares Salvos</p>
                <div className="space-y-1">
                  {options.filter(o => o.title.toLowerCase().includes(destinationSearchVal.toLowerCase())).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setDestinationAddress(item.address);
                        setCurrentView('mototaxi_category');
                      }}
                      className="flex items-center w-full p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[22px] group transition-all active:scale-[0.98]"
                    >
                      <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-slate-900 transition-colors shadow-sm">
                        <span className="material-symbols-outlined fill-1">{item.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-black text-slate-900 dark:text-white text-base tracking-tight">{item.title}</p>
                        <p className="text-xs font-bold text-slate-500 truncate mt-0.5">{item.address}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                  ))}

                  <button
                    onClick={() => alert('Arraste o mapa para confirmar sua localização')}
                    className="flex items-center w-full p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[22px] group transition-all active:scale-[0.98]"
                  >
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mr-4 group-hover:bg-slate-200 transition-colors shadow-sm">
                      <span className="material-symbols-outlined">map</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-slate-900 dark:text-white text-base tracking-tight">Selecionar no mapa</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderMototaxiCategory = () => (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Full Map Background */}
      <div className="absolute inset-0 z-0 scale-110">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-0589Pt8--aSpz41aFmb3ccjVnvysIl76IMY3ZmSP7b40-duSd_cW8NNguu_BA915EVlwSuuzxjzFSQhMGrHdRAcdBKow5Sn6INlnUK1b6BlH1g7aYyx-E3a-HJ_QJeIfGJ5StLUjBXayZnTLPwFguoWE-7jqymRu7OItTYCq2X6WjHzwIZ0uMG2DYgsOlAjBqYD7k7OQq8n8iseJqM2EPVrPJq8akq0oyzY0YIKn70BCB0ntRFSZLHlVhlkvH3yBY2f_aJmx358')" }}
        >
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
        </div>
      </div>

      {/* Origin/Destination Markers on Map */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center -translate-y-20">
        <div className="relative w-full h-full">
          <div className="absolute top-1/3 left-1/4 animate-bounce">
            <div className="bg-blue-500 p-2 rounded-full shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-white text-xs">person_pin_circle</span>
            </div>
          </div>
          <div className="absolute top-1/2 right-1/3 animate-pulse">
            <div className="bg-primary p-3 rounded-full shadow-2xl border-2 border-white">
              <span className="material-symbols-outlined text-slate-900 text-sm">location_on</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Header */}
      <div className="relative z-20 flex items-center p-4 gap-3 bg-gradient-to-b from-black/30 to-transparent">
        <button
          onClick={() => setCurrentView('mototaxi_request')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl text-slate-900 dark:text-white transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/20 flex-1">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Trajeto</p>
            <div className="flex items-center gap-2">
              <p className="text-slate-900 dark:text-white text-xs font-bold truncate max-w-[80px] opacity-60">{selectedAddress.split(',')[0]}</p>
              <span className="material-symbols-outlined text-[10px] text-slate-400">arrow_forward</span>
              <p className="text-slate-900 dark:text-white text-sm font-black truncate">{destinationAddress.split(',')[0]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Categories Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
        <motion.div
          drag="y"
          dragConstraints={{ top: -300, bottom: 0 }}
          className="bg-white dark:bg-slate-900 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col pt-2"
        >
          {/* Handle */}
          <div className="flex w-full items-center justify-center py-4">
            <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="px-6 pb-20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Categorias</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest">Selecione o melhor para você</p>
              </div>
              <div className="flex items-center gap-1 bg-primary/20 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-primary text-sm fill-1">bolt</span>
                <span className="text-[10px] font-black text-primary uppercase">Mão de obra Rush</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { id: 'comum', icon: 'two_wheeler', label: 'Mototáxi Comum', eta: '3 min', price: 12.00, desc: 'Transporte rápido e seguro' },
                { id: 'vip', icon: 'electric_moped', label: 'Mototáxi VIP', eta: '5 min', price: 18.00, premium: true, desc: 'Motoristas melhor avaliados' },
                { id: 'delivery', icon: 'inventory_2', label: 'Apenas Entrega', eta: '4 min', price: 10.50, desc: 'Ideal para encomendas pequenas' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory({ id: cat.id, label: cat.label, price: `R$ ${cat.price.toFixed(2).replace('.', ',')}` })}
                  className={`flex flex-col gap-3 px-5 py-4 rounded-[28px] transition-all borderActive active:scale-[0.98] ${selectedCategory.id === cat.id ? 'bg-primary/5 dark:bg-primary/10 border-2 border-primary ring-4 ring-primary/10' : 'bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center rounded-2xl shrink-0 size-14 shadow-sm transition-all ${selectedCategory.id === cat.id ? 'bg-primary text-slate-900 scale-110' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-2xl fill-1">{cat.icon}</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <p className={`text-lg font-black tracking-tight leading-none ${selectedCategory.id === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{cat.label}</p>
                          {cat.premium && <span className="bg-primary text-[8px] font-black px-1.5 py-0.5 rounded-md text-slate-900 uppercase shadow-sm">VIP</span>}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">Chegada em {cat.eta}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${selectedCategory.id === cat.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>R$ {cat.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  {selectedCategory.id === cat.id && (
                    <div className="pt-2 border-t border-primary/20 text-left">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic font-display">"{cat.desc}"</p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col gap-4">
              <div
                onClick={() => setPaymentMethod(prev => prev === 'money' ? 'card' : 'money')}
                className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-primary text-2xl">{paymentMethod === 'money' ? 'payments' : 'credit_card'}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Pagamento</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-slate-900 dark:text-white font-black text-sm">{paymentMethod === 'money' ? 'Dinheiro' : 'Cartão Nubank'}</p>
                      <p className="text-[10px] font-bold text-slate-400">{paymentMethod === 'card' ? '•••• 4582' : ''}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-1 rounded-lg">
                  <span className="material-symbols-outlined text-slate-300">swap_horiz</span>
                </div>
              </div>

              <button
                className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-extrabold py-5 rounded-3xl text-xl shadow-2xl shadow-primary/40 transition-all active:scale-[0.95] flex items-center justify-center gap-3 border-b-4 border-slate-900/10"
                onClick={() => setCurrentView('searching_driver')}
              >
                Solicitar {selectedCategory.label}
                <span className="material-symbols-outlined font-bold">keyboard_double_arrow_right</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
  const renderShippingDetails = () => (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto bg-white dark:bg-background-dark shadow-xl overflow-x-hidden font-display">
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          onClick={() => setCurrentView('app')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Detalhes do Envio</h2>
        <div className="size-10"></div>
      </header>

      <div className="flex w-full flex-row items-center justify-center gap-3 py-6 bg-white dark:bg-background-dark">
        <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
        <div className="h-1 w-12 rounded-full bg-primary/30 dark:bg-primary/10"></div>
        <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-1 w-12 rounded-full bg-slate-100 dark:bg-slate-800"></div>
        <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <section className="px-4 py-4">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-4">O que você está enviando?</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'package', icon: 'package_2', label: 'Pacote' },
              { id: 'document', icon: 'description', label: 'Documento' },
              { id: 'keys', icon: 'vpn_key', label: 'Chaves' },
              { id: 'other', icon: 'more_horiz', label: 'Outro' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setShippingItemType(item.id)}
                className={`flex flex-col gap-3 rounded-xl border-2 p-4 items-start cursor-pointer transition-all ${shippingItemType === item.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'}`}
              >
                <span className={`material-symbols-outlined text-3xl ${shippingItemType === item.id ? 'text-primary' : 'text-slate-500'}`}>{item.icon}</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-base font-bold">{item.label}</h2>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-4 mt-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">emergency_home</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Conteúdo Frágil</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Requer manuseio especial</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={isFragile}
                onChange={() => setIsFragile(!isFragile)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </section>

        <section className="px-4 py-4 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Instruções de Coleta</h3>
            </div>
            <textarea
              className="block w-full px-4 py-3 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary focus:border-primary placeholder:text-slate-400 text-sm"
              placeholder="Ex: Falar com o porteiro, o pacote está na recepção..."
              rows={3}
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
            ></textarea>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">flag</span>
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Instruções de Entrega</h3>
            </div>
            <textarea
              className="block w-full px-4 py-3 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary focus:border-primary placeholder:text-slate-400 text-sm"
              placeholder="Ex: Apartamento 402, tocar o interfone..."
              rows={3}
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
            ></textarea>
          </div>
        </section>
      </main>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/10 dark:bg-background-dark/10 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
        <button
          className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
          onClick={() => setCurrentView('shipping_address')}
        >
          Próximo Passo
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  );

  const renderShippingAddress = () => (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white dark:bg-background-dark shadow-xl font-display">
      <header className="flex items-center p-4 sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
        <button
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          onClick={() => setCurrentView('shipping_details')}
        >
          <span className="material-symbols-outlined block text-slate-900 dark:text-slate-100">arrow_back</span>
        </button>
        <h1 className="ml-2 text-xl font-bold tracking-tight">Nova Entrega</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Passo 2 de 4</span>
            <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded">COLETA & DESTINO</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/4 rounded-full"></div>
          </div>
        </div>

        <section className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-900 text-sm">home_pin</span>
            </div>
            <h2 className="text-lg font-bold">Ponto de Retirada</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Endereço de Coleta</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  className="w-full bg-transparent border-none focus:ring-0 p-4 text-base"
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
                <span className="material-symbols-outlined text-slate-400 pr-4">map</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Complemento</label>
                <input
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-base focus:border-primary focus:ring-0"
                  placeholder="Apto, Sala"
                  type="text"
                  value={pickupComplement}
                  onChange={(e) => setPickupComplement(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Contato</label>
                <input
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-base focus:border-primary focus:ring-0"
                  placeholder="Nome ou Tel"
                  type="text"
                  value={pickupContact}
                  onChange={(e) => setPickupContact(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-900 text-sm">flag</span>
            </div>
            <h2 className="text-lg font-bold">Destino da Entrega</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-500 mb-1">Endereço de Entrega</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  className="w-full bg-transparent border-none focus:ring-0 p-4 text-base"
                  placeholder="Para onde vamos levar?"
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
                <span className="material-symbols-outlined text-slate-400 pr-4">location_on</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-900 text-sm">inventory_2</span>
            </div>
            <h2 className="text-lg font-bold">O que vamos entregar?</h2>
          </div>
          <textarea
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-base focus:border-primary focus:ring-0 resize-none"
            placeholder="Ex: Chaves esquecidas, documento em envelope pardo, pizza grande..."
            rows={3}
            value={shippingItemDesc}
            onChange={(e) => setShippingItemDesc(e.target.value)}
          ></textarea>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-4 pb-4 z-20">
        <button
          className="w-full bg-primary hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          onClick={() => setCurrentView('shipping_vehicle')}
        >
          Próximo Passo
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
  const renderShippingVehicle = () => (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white dark:bg-background-dark shadow-xl overflow-x-hidden font-display">
      <div className="flex items-center p-4 pb-2 justify-between">
        <div
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center cursor-pointer active:scale-95 transition-transform"
          onClick={() => setCurrentView('shipping_address')}
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Tipo de Veículo</h2>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-slate-900 dark:text-slate-100 text-base font-semibold leading-normal">Progresso da entrega</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">3 de 4</p>
        </div>
        <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 w-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: '75%' }}></div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-2">
        <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-tight">Como deseja enviar seu item?</h3>
        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal mt-2">Selecione o veículo ideal para o tamanho e peso da sua encomenda.</p>
      </div>

      <div className="flex flex-col gap-4 p-4 flex-grow">
        {[
          { id: 'motorcycle', icon: 'two_wheeler', label: 'Motocicleta', price: 12.90, time: '15 min', cap: '10kg' },
          { id: 'car', icon: 'directions_car', label: 'Carro', price: 24.50, time: '22 min', cap: '50kg' },
          { id: 'van', icon: 'local_shipping', label: 'Van', price: 45.00, time: '35 min', cap: '200kg' },
        ].map((v) => (
          <label
            key={v.id}
            className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer hover:border-primary transition-colors ${selectedVehicle === v.id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-slate-900 dark:text-primary">
              <span className="material-symbols-outlined text-3xl">{v.icon}</span>
            </div>
            <div className="flex grow flex-col">
              <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight">{v.label}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">R$ {v.price.toFixed(2).replace('.', ',')} • {v.time} • Cap. {v.cap}</p>
            </div>
            <input
              className="radio-custom h-6 w-6 border-2 border-slate-300 dark:border-slate-600 bg-transparent text-transparent checked:border-primary checked:bg-primary focus:outline-none focus:ring-0 focus:ring-offset-0 rounded-full"
              name="vehicle"
              type="radio"
              checked={selectedVehicle === v.id}
              onChange={() => {
                setSelectedVehicle(v.id);
                setShippingPrice(v.price + 33.00); // Simulate total price
              }}
            />
          </label>
        ))}
      </div>

      <div className="mt-auto p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800">
        <button
          className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
          onClick={() => setCurrentView('shipping_payment')}
        >
          Próximo Passo
        </button>
      </div>
    </div>
  );

  const renderShippingPayment = () => (
    <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display mb-20">
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => setCurrentView('shipping_vehicle')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Pagamento</h2>
      </div>

      <div className="p-4">
        <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-4 text-left">Resumo da Entrega</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 text-left">
          <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-50 dark:border-slate-800">
            <div className="text-slate-900 dark:text-slate-100 flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
              <span className="material-symbols-outlined text-slate-800 dark:text-primary">location_on</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal line-clamp-1">De: {pickupAddress}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">Centro, São Paulo - SP</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-50 dark:border-slate-800">
            <div className="text-slate-900 dark:text-slate-100 flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
              <span className="material-symbols-outlined text-slate-800 dark:text-primary">near_me</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal line-clamp-1">Para: {destinationAddress}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">Bela Vista, São Paulo - SP</p>
            </div>
          </div>
          <div className="p-4 bg-primary/5">
            <div className="flex justify-between items-center text-left">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Estimado</p>
              <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">R$ {shippingPrice.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="w-full h-32 rounded-xl bg-slate-200 dark:bg-slate-800 relative overflow-hidden group shadow-inner">
          <img
            alt="Mapa da rota de entrega"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaJa5sNVtFMv2iOBc1SbEV3J8-XGmvojzuaFz68DHfO81ZI1z9aOGGn9KiqsZPjUDD8QDdMYupxdQunU9X2JrR9tBcITyrV56vi6BkDKBzfyy7uKaRI-YBlAP9idOY5T95WFhBl_ogA6RkW0r5JKUPEtqShR5-elHIXi4o4ue7WtsfGnBh5VWjsx4fJBJ4DAy26dVq-j2v64rwQknqau-RKUi15r1ZSdajEDWq2y-PswCNwVN9WUh3eW0fUaZ-tfFGuojQkNuNulM"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>

      <div className="px-4 pb-12">
        <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-4 text-left">Método de Pagamento</h3>
        <div className="space-y-3">
          {[
            { id: 'card', icon: 'credit_card', label: 'Cartão de Crédito', sub: 'Nubank •••• 4582' },
            { id: 'pix', icon: 'qr_code_2', label: 'PIX', sub: 'Aprovação instantânea' },
            { id: 'money', icon: 'payments', label: 'Dinheiro', sub: 'Pague ao entregador' },
          ].map((p) => (
            <label
              key={p.id}
              className={`relative flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl cursor-pointer shadow-sm border-2 transition-all ${paymentMethod === p.id ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
              onClick={() => setPaymentMethod(p.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-10 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">{p.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">{p.label}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{p.sub}</p>
                </div>
              </div>
              <input
                className="w-5 h-5 text-primary focus:ring-primary border-slate-300 rounded-full"
                name="payment"
                type="radio"
                checked={paymentMethod === p.id}
              />
            </label>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            Adicionar novo cartão
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-30">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total a pagar:</span>
          <span className="text-slate-900 dark:text-slate-100 text-xl font-extrabold">R$ {shippingPrice.toFixed(2).replace('.', ',')}</span>
        </div>
        <button
          className="w-full bg-primary hover:bg-yellow-400 text-slate-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          onClick={() => {
            setCurrentView('shipping_processing');
            setTimeout(() => {
              setCurrentView('searching_courier');
            }, 3000);
          }}
        >
          <span>Confirmar Pedido</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );


  const renderShippingProcessing = () => (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-background-dark p-6 text-center font-display">
      <div className="relative size-48 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        <div className="absolute inset-4 rounded-full border-4 border-primary/40 animate-pulse"></div>
        <div className="absolute inset-8 rounded-full border-4 border-primary/60"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-bounce">sync</span>
        </div>
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 text-center">Processando Pagamento</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-center">
        Estamos confirmando sua transação com a operadora. Isso levará apenas alguns segundos...
      </p>

      {/* Mocking a failure chance for testing */}
      <button
        className="mt-12 text-slate-400 text-xs hover:text-slate-600 underline"
        onClick={() => setCurrentView('shipping_error')}
      >
        Simular erro no pagamento
      </button>

      {/* Auto transition for demo */}
      <button
        className="mt-4 text-primary text-xs font-bold"
        onClick={() => setCurrentView('searching_courier')}
      >
        Pular para busca de entregador
      </button>
    </div>
  );

  const renderSearchingCourier = () => (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display antialiased">
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <div className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center cursor-pointer" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Status do Pedido</h2>
      </div>

      <div className="flex-1 relative min-h-[400px]">
        <div
          className="absolute inset-0 w-full h-full bg-slate-200 dark:bg-slate-800 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbEzk3I8i7aZwjRrqV6FrHSzDMcTH6xxqFEPdfYlvHne2DOR75gHCgmjq7Ol4Szf3EqEs-sPp1KUo4POB_jzVyj14HRGT_15PsR9MoIYHFXQBrph5RNqKD_PaFyzX1cWXctTb-5tRwQKGIaMxlib71ZqprgLb_XhS3q1mZf8wLGQOS6jXtOT5x0ksfb-jkV-9zTjuyQ02EJ_r2xcI8LR65hHVBup5A6TEltH_8roa6Z8obWdc0xh0lz4dTGD8UU3sVBUmTB-jvOUo")' }}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-primary/20 rounded-full scale-100 opacity-50 animate-ping"></div>
            <div className="absolute w-48 h-48 bg-primary/30 rounded-full scale-100 opacity-60 animate-pulse"></div>
            <div className="relative z-10 bg-primary p-4 rounded-full shadow-xl">
              <span className="material-symbols-outlined text-slate-900 text-4xl">location_on</span>
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 right-4 text-left">
          <div className="bg-white/90 dark:bg-background-dark/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-primary/20">
            <h4 className="text-primary text-sm font-bold leading-normal tracking-[0.015em] mb-2">Buscando o entregador mais próximo...</h4>
            <div className="flex flex-col gap-2">
              <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ animation: 'shimmer 2s infinite linear', width: '45%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Conectando à frota</p>
                <p className="text-slate-900 dark:text-slate-100 text-xs font-bold">2-3 mins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        className="bg-background-light dark:bg-background-dark border-t border-primary/10 p-6 space-y-6 text-left cursor-grab active:cursor-grabbing"
      >
        <div className="flex h-2 w-full items-center justify-center -mt-4 mb-2">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">{activeService?.icon || 'restaurant'}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">{shippingItemDesc || 'Double Cheeseburger Combo'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Large fries, Coke Zero, Extra pickles</p>
          </div>
          <div className="text-right">
            <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">R$ {shippingPrice.toFixed(2).replace('.', ',')}</p>
            <p className="text-primary text-xs font-bold uppercase tracking-wider">PAGO</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-xl">home</span>
            <span className="text-sm">{destinationAddress || '742 Evergreen Terrace, Springfield'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-xl">credit_card</span>
            <span className="text-sm">Visa ending in •••• 4242</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button className="w-full h-14 bg-primary text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity" onClick={() => setCurrentView('on_the_way_to_pickup')}>Ver Recibo (Simular Motorista)</button>
          <button className="w-full h-14 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" onClick={() => setCurrentView('app')}>Cancelar Pedido</button>
        </div>
        <div className="pb-safe"></div>
      </motion.div>
    </div>
  );

  const renderShippingError = () => (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-background-dark p-6 text-center font-display">
      <div className="size-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-red-600 dark:text-red-400">error</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Pagamento Não Aprovado</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-10">
        Não foi possível processar seu pagamento. Verifique os dados do cartão ou escolha outro método de pagamento.
      </p>

      <div className="w-full max-w-xs flex flex-col gap-4">
        <button
          className="w-full bg-primary text-slate-900 font-bold py-4 rounded-xl shadow-lg active:scale-95"
          onClick={() => setCurrentView('shipping_payment')}
        >
          Tentar Novamente
        </button>
        <button
          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl active:scale-95"
          onClick={() => setCurrentView('app')}
        >
          Cancelar Pedido
        </button>
      </div>
    </div>
  );

  const renderOnTheWayToPickup = () => (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-display text-slate-900 dark:text-slate-100 antialiased">
      <header className="flex items-center bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
        <button className="text-slate-900 dark:text-slate-100 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => setCurrentView('searching_courier')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 px-4 text-left">
          <h2 className="text-lg font-bold leading-tight tracking-tight">A caminho da coleta</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Order #ORD-88291</p>
        </div>
        <button className="text-slate-900 dark:text-slate-100 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 z-0 bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center opacity-80"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDeiVKkZVxsTCus4j0C1LggLX0P8AsGMSyclEDAaJCxFY3_CMfXBq3kzQQq3dZIhe4C0gMedQjDhk328kAYngcGmFoA9acHUiUJ-g_0lZlR6wf49vZmYX7RAp1DOqla_zbI6KvP6GWwB-L2_AzCOqI7VePG7-AU0REWvdNEaxSwK9dPiml6DkVE-UoeyCbdcqfTXcG9h689VMtvEagjvq-Mh0lAL-oaq8sdiYYe50aJcpQ2lRia70wpP6lO7Kp_upqOSZYZTU6neSs")' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full max-w-md mx-auto">
              <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                <div className="bg-primary p-2 rounded-full shadow-lg border-2 border-white">
                  <span className="material-symbols-outlined text-slate-900 text-sm">storefront</span>
                </div>
                <span className="mt-1 px-2 py-0.5 bg-white dark:bg-slate-900 rounded text-[10px] font-bold shadow-sm">Ponto de Retirada</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                <div className="bg-primary p-2 rounded-full shadow-xl border-2 border-white ring-4 ring-primary/20">
                  <span className="material-symbols-outlined text-slate-900 animate-bounce">moped</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span> Alex está a caminho
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          className="absolute bottom-0 left-0 right-0 z-10 p-4 cursor-grab active:cursor-grabbing"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="flex items-center justify-between mb-6 text-left">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">CHEGADA ESTIMADA</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">8 - 12 mins</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
              </div>
            </div>
            <hr className="border-slate-100 dark:border-slate-800 mb-6" />
            <div className="flex items-center gap-4 mb-6 text-left">
              <div className="relative">
                <div
                  className="h-14 w-14 rounded-full bg-cover bg-center border-2 border-primary"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBiBYgblH5HH2WXeJjN8UpvJ4EBx_xj6ZFLNU1Km9lEN5hSbYzx0DaYvEK6f_MySPaCYBbkWHXsELTXXYain7UNeOmlqendDCrtC-76tYjQQ9mmor9jxbLx9uzAFbayHR3iiPOpWCYCOTVi9o1ddBJyfH4MErHKSDKjpKPSVDIqlDhd48Evq0ODiBPZxTEGAXMH8LJu11OyXedROV5oYY2SfrR2EHh42TMcr7fXEvUljr9wbUSsQNfijig4Q5eihFTqYVePM66-w-I")' }}
                ></div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                  4.9 ★
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Alex Thompson</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Entregador parceiro</p>
              </div>
              <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-slate-900 shadow-sm hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">call</span>
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-slate-900 dark:text-slate-100 shadow-sm hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">chat_bubble</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                className="w-full bg-primary text-slate-900 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
                onClick={() => setCurrentView('on_the_way_to_destination')}
              >
                Rastrear Localização Exata
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <nav className="flex border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-3 pt-2 safe-area-bottom">
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400 dark:text-slate-500" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined">home</span>
          <p className="text-[10px] font-medium leading-normal">Início</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">assignment</span>
          <p className="text-[10px] font-medium leading-normal">Pedidos</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">chat</span>
          <p className="text-[10px] font-medium leading-normal">Mensagens</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">person</span>
          <p className="text-[10px] font-medium leading-normal">Perfil</p>
        </button>
      </nav>
    </div>
  );

  const renderOnTheWayToDestination = () => (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl font-display text-slate-900 dark:text-slate-100 antialiased">
      <header className="flex items-center bg-white/80 backdrop-blur-md dark:bg-background-dark/80 p-4 z-20 border-b border-slate-100 dark:border-slate-800">
        <div className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" onClick={() => setCurrentView('on_the_way_to_pickup')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <div className="flex-1 text-center font-display">
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Entrega em andamento</h2>
          <p className="text-xs font-medium text-slate-500">Order #TW-8829-X</p>
        </div>
        <div className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <span className="material-symbols-outlined">more_vert</span>
        </div>
      </header>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAfnXs_9AWTozfJ1hyq_90dw_8GzCZYQGtvxO603CEbGrq7yJw0JsiUHhGpmUhukVuRdTfu2RC9CdMp5hIfpWRyoEIS-YT7cbLlgZGWrjZC98_X655rz_nHmNMR-gwYDQRipkbCBVyvk5o8vISNV3QwxeU1zhBqGp4Uidzi98XWCLXRDbtgmvB8RK_-n0WcwKLsxOD2EcpekKvssFML48ciE43GzAynj0ZnJNuJF3lbdNhPVRpSpo7n_LcJuZFT8AMrM62fpZgSCO4")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
          <div className="pointer-events-auto w-full">
            <div className="flex w-full h-12 items-stretch rounded-xl shadow-lg overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-slate-400 flex bg-white dark:bg-slate-900 items-center justify-center pl-4">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="flex w-full border-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-0 px-4 text-sm font-medium" placeholder="Rastrear rota de entrega" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <div className="flex flex-col shadow-lg rounded-xl overflow-hidden">
              <button className="flex size-11 items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 border-b border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="flex size-11 items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            <button className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-lg hover:bg-slate-50">
              <span className="material-symbols-outlined">near_me</span>
            </button>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-0 size-4 bg-slate-900 rounded-full border-2 border-white shadow-md"></div>
            <div className="absolute top-2 left-2 w-20 h-1 bg-slate-900/20 rotate-[35deg] origin-left"></div>
            <div className="absolute top-10 left-10 flex flex-col items-center">
              <div className="bg-primary p-2 rounded-full shadow-xl border-2 border-white animate-bounce">
                <span className="material-symbols-outlined text-slate-900 text-xl leading-none">moped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        className="flex flex-col bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-xl z-30 cursor-grab active:cursor-grabbing"
      >
        <div className="flex h-6 w-full items-center justify-center">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="px-5 pb-6 text-left">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-primary/20 text-slate-900 dark:text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">EM TRÂNSITO</span>
              <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">ETA: 12:45 PM</p>
            </div>
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Item coletado, a caminho do destino</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer" onClick={() => setCurrentView('delivery_completed')}>
            <div className="relative">
              <img className="size-12 rounded-full border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB07pUH-eLImBO718xQMlX4d9ESOUhxzvtgTLzphLVLWiX6cHStI12TlpZsslYJ_VJC6aOOSFUzPCo_1ZZMJUtU-gY-elsL9Eq4B6T6ZP2jPD3gwteU9IpxVPBXqy1jZHaH0sWrCZSeCyhOXbR6--99JMu34kSEb9VUkTe21olzmuFMyWqFowRiLj86uKBHWznY6_4zlkOKn8zhy8-j6Dviq62oiKH7pQ8OfBBI7sW31B433VrOjP_iU1paU0TjV4jnS2mbuKFcYgg" />
              <div className="absolute -bottom-1 -right-1 bg-primary size-5 rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] font-bold">star</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">Marcus Thompson</p>
              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-xs font-medium">4.9 Avaliação</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-xs font-medium">Honda Super Cub</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-600">
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
              </button>
              <button className="size-10 flex items-center justify-center rounded-full bg-primary text-slate-900 shadow-md">
                <span className="material-symbols-outlined text-xl">call</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark px-4 pb-6 pt-2">
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400 dark:text-slate-500" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined">home</span>
          <p className="text-xs font-medium leading-normal">Início</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">package_2</span>
          <p className="text-xs font-bold leading-normal">Pedidos</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <p className="text-xs font-medium leading-normal">Carteira</p>
        </button>
        <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">person</span>
          <p className="text-xs font-medium leading-normal">Perfil</p>
        </button>
      </div>
    </div >
  );

  const renderDeliveryCompleted = () => (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display antialiased">
      <header className="flex items-center bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <button className="text-slate-900 dark:text-slate-100 p-2" onClick={() => setCurrentView('on_the_way_to_destination')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Status da Entrega</h2>
      </header>
      <main className="flex-1 overflow-y-auto pb-24 font-display">
        <section className="flex flex-col items-center px-6 py-10">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 !text-5xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Entrega Concluída!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm px-8">Seu pedido foi entregue com sucesso. Aproveite!</p>
        </section>
        <section className="px-4 mb-6">
          <div className="h-48 w-full rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden relative border border-slate-100 dark:border-slate-800">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsEVj9TsXwmv4-ZusTLaqZip2e4CMUDt17lMqyrpJn5-vadn3PvduHSnxt4jvWOF1wSzY72muYzi7gP4OYLKHOhFA4kB0JoH2eYuk--U3w9atlHxkRUyEefzJhh5Rb5cFxN3ROOIuHR8Hk2HpBQ1g5dhs5gOGLTQn1io6rtpooPNfv7GQuPFAwvgk5Zzt3IHSoE4R2k9XYtvwinxy08Au00gB6Jk7LitcOWOppbdqtkZsxXtl4D-ugsASxadSvACRnBpwU9fCGj6s')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </section>
        <section className="px-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800 mb-3">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Número do Pedido</span>
              <span className="font-bold text-slate-900 dark:text-white">#4582</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800 mb-3">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Total Pago</span>
              <span className="font-bold text-slate-900 dark:text-white">R$ {shippingPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Tempo de Entrega</span>
              <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-bold">24 min</span>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 mb-8">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1 text-left">Entregador</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="size-16 rounded-full overflow-hidden bg-slate-200 border-2 border-primary">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJD_vkFNC0C_0e25SPYOv4hzvAPvr8n8Bw0k01c6Md8Bm97mG0zL8yJIbk31X7u2N6d238Lumq3Y-pj282fnMCsmNZKdxxtl0LmnPb-8gpw6FT4bCEhFQirSmegkTv8qbUVsguPyh6EK2_88a20HpLWxQqrxqHoDoq85HKmaNmg4kmIt0VYTCRvK1o-CT5fAb6TyySKhCzOxcUuigrDlL38EGduZbkv_kaodp7m7Gr-dCG2Axsu7iKinn7XI8Cvv9ILc7L-htyQLI" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Ricardo Oliveira</h4>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary !text-lg">star</span>
                <span className="text-sm font-semibold">4.9</span>
                <span className="text-slate-400 text-xs ml-1">(120+ entregas)</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined">chat</span>
              </button>
            </div>
          </div>
        </section>
        <section className="px-4 flex flex-col gap-3">
          <button className="bg-primary hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2" onClick={() => setCurrentView('trip_rating')}>
            <span className="material-symbols-outlined">star</span>
            Avaliar Entrega
          </button>
          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-4 rounded-xl" onClick={() => setCurrentView('app')}>
            Voltar para o Início
          </button>
        </section>
      </main>
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pb-6 pt-2 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-primary" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined fill-1">home</span>
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-medium">Pedidos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">favorite</span>
          <span className="text-[10px] font-medium">Favoritos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );

  const renderDriverConfirmation = () => (
    <div className="flex h-screen w-full flex-col bg-slate-900 text-white p-6 font-display overflow-hidden">
      <div className="flex-1 flex flex-col justify-center text-left">
        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full w-fit mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest">Nova Solicitação de Entrega</span>
        </div>

        <h1 className="text-5xl font-black mb-2 leading-[0.9]">{activeService?.label || 'Encomenda'}</h1>
        <p className="text-slate-400 text-lg mb-10">Distância: 1.2km • 4 min</p>

        <div className="space-y-8 mb-12">
          <div className="flex gap-4">
            <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">radio_button_checked</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">COLETA</p>
              <p className="text-xl font-bold">{pickupAddress}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center text-red-500">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">ENTREGA</p>
              <p className="text-xl font-bold">{destinationAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-6 mb-12 flex items-center justify-between border border-white/10">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase">GANHO TOTAL</p>
            <p className="text-4xl font-black text-primary">R$ {(shippingPrice * 0.8).toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="size-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
            <span className="text-xl font-black">24s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4">
        <button
          className="py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95"
          onClick={() => setCurrentView('app')}
        >
          Recusar
        </button>
        <button
          className="py-5 bg-primary text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(255,217,0,0.3)] transition-all active:scale-95"
          onClick={() => {
            alert('Entrega Aceita! Iniciando navegação...');
            setCurrentView('app');
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );


  const renderSearchingDriver = () => (
    <div className="relative flex flex-col h-screen w-full overflow-hidden font-display bg-background-light dark:bg-background-dark antialiased">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800 transition-colors">
        <button
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-90"
          onClick={() => setCurrentView('mototaxi_category')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 font-display">Pedido em Andamento</h2>
      </div>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuiRMJZpr1WxZBEPZjeWORvbFvUA78xDjJGYXuNkbgCz_Lc48ZbkqvM6jrbz9H0AFBSBVc3tpAKHkg56mUNu8pTTgjgTpYAvPsSAwYbbQUdnWZeDHsPDVPpX3JpZQ_BSsIOvFx9zgMNse7sgoFUxlB5Haqczf0sYpXFnB-HG5yZt3-5R0nxkSECzDgoWrN1VgomedPoObVi0yM-iPlQPaCtNvDCas8kA0OTtSXJ3WpCSz6foDgmB6xfwE5ejYa-glnTBCOJQtxgIw')" }}
      >
      </div>

      {/* Search Radar Section */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="relative flex items-center justify-center">
          <div className="absolute border-2 border-primary rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] w-[260px] h-[260px] opacity-20"></div>
          <div className="absolute border-2 border-primary rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_0.5s_infinite] w-[180px] h-[180px] opacity-40"></div>
          <div className="absolute border-2 border-primary rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_1s_infinite] w-[100px] h-[100px] opacity-60"></div>
          <div className="relative bg-primary p-6 rounded-full shadow-2xl shadow-primary/40 active:scale-95 transition-transform z-10">
            <span className="material-symbols-outlined text-4xl text-slate-900 animate-bounce">motorcycle</span>
          </div>
        </div>
        <div className="mt-20 text-center px-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">Procurando o motorista...</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xs mx-auto font-display">Conectando você ao profissional mais próximo na sua região de <b>{selectedAddress.split(',')[0]}</b>.</p>
        </div>
      </div>

      {/* Bottom Sheet UI */}
      <div className="mt-auto z-30 relative pointer-events-none">
        <motion.div
          drag="y"
          dragConstraints={{ top: -100, bottom: 0 }}
          className="relative z-20 p-4 pb-8 space-y-4 pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-t-[40px] shadow-[0_-12px_45px_rgb(0,0,0,0.15)] border-t border-white/20"
        >
          {/* Handle */}
          <div className="flex w-full justify-center mb-2">
            <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Service Info Card */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 font-display">Serviço Selecionado</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 font-display">{selectedCategory.label}</h4>
              </div>
              <div className="bg-primary/20 p-3 rounded-2xl">
                <span className="material-symbols-outlined text-primary font-bold">
                  {paymentMethod === 'money' ? 'payments' : 'credit_card'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 font-display">Tempo de espera: ~3 min</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary font-display">{selectedCategory.price}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{destinationAddress}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">
                <span className="text-primary font-black">Buscando</span>
                <span>Confirmando</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-primary w-2/3 rounded-full animate-[shimmer_2s_infinite_linear] bg-gradient-to-r from-primary via-white/30 to-primary bg-[length:200%_100%] shadow-lg"></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('mototaxi_category')}
            className="w-full bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 py-5 rounded-2xl font-black text-red-600 dark:text-red-400 hover:bg-red-100 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] font-display"
          >
            <span className="material-symbols-outlined text-xl">close</span>
            Cancelar Solicitação
          </button>
        </motion.div>
      </div>

      {/* Floating Action Buttons for Map (Side) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <button className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">add</span>
        </button>
        <button className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">remove</span>
        </button>
        <button className="mt-2 flex size-11 items-center justify-center rounded-xl bg-primary shadow-xl shadow-primary/30 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-slate-900">my_location</span>
        </button>
      </div>
    </div>
  );

  const renderDriverFound = () => (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Half: Map Section */}
      <div className="relative h-1/2 w-full bg-slate-200 shadow-inner">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover animate-in fade-in zoom-in duration-1000"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAa-NRJciIpJWfL9EbgDfquLuz5JcmYoZyr_eHO88n0ERBSBPpuAf-nAgVQ6dznqkyRZDsvelFILGkzXBle-lLLHBogXa7UKKUcFfnLyM7BV8kDsnEoX4wk7DcP8u6Nz3bhjlWPPUDR4yN5d-2M7Woayk34pfa7z4wgptKtJe76k1rFxQDotUgWigLB7aCJydqxbw9Nh68p7s-fvuJFCuQFk5dwBZVNUin1cFIqlPCA62OuktdKO43AqvNWcqzeHpC3C5ej8735XKM')" }}
        >
        </div>
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/30 to-transparent z-20">
          <button
            onClick={() => setCurrentView('app')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl text-slate-900 dark:text-white transition-all active:scale-90"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
            <span className="material-symbols-outlined text-primary text-xl fill-1 animate-pulse">pedal_bike</span>
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Motorista a caminho</span>
          </div>
        </div>
        {/* Floating Status Badge */}
        <div className="absolute bottom-6 right-4 bg-primary text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">timer</span>
          <span className="text-sm font-black tracking-tighter">4 min • 1.2 km</span>
        </div>
      </div>

      {/* Bottom Sheet Details */}
      <div className="mt-auto z-30 relative pointer-events-none -mt-8">
        <motion.div
          drag="y"
          dragConstraints={{ top: -200, bottom: 0 }}
          className="bg-white dark:bg-background-dark rounded-t-[32px] shadow-[0_-12px_40px_rgb(0,0,0,0.12)] z-10 pointer-events-auto flex flex-col"
        >
          {/* Drag Handle */}
          <div className="flex w-full items-center justify-center py-4 cursor-grab active:cursor-grabbing">
            <div className="h-1.5 w-14 rounded-full bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <div className="flex flex-col px-6 space-y-6 overflow-y-auto pb-32">
            {/* Driver Card */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img
                    alt="Driver"
                    className="size-16 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg relative z-10"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFT8Q-sccp3BpQSFaN9JDf-8sGRJycpwy02h3K02y_ZCdn88WeGGVc-h3gk3EMOBJGdvPzbo26Z-gZtj5qgeuXNkQrbhU_8hpkkvtTvRIUB4K3950LaxXI_VfX0Fu1fl--BkgKKdyjm8C37CNcaOv-z8KWRwclM5yzui01TmAgb7OZspJe8HjCSpfRILRf1YPNo0PxnrnwV3yxZbncuxzxnb15vNNDSVh9GWWECMWv1yo94e_B6wBEtAfDijcxC5tY09fuuM4aHGk"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800 z-20 shadow-md">
                    4.9 ★
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black leading-none text-slate-900 dark:text-white">Ricardo</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 dark:text-slate-500">Honda Titan • Preta</p>
                  <div className="inline-flex bg-slate-200 dark:bg-slate-700 w-fit px-2 py-0.5 rounded-lg text-[11px] font-black tracking-widest mt-1.5 text-slate-600 dark:text-slate-300">
                    ABC-1234
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Abrindo chat com Ricardo...')}
                  className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-slate-900 shadow-lg shadow-primary/20 transition-all active:scale-90 hover:brightness-110"
                >
                  <span className="material-symbols-outlined fill-1">chat</span>
                </button>
                <button
                  onClick={() => alert('Chamando Ricardo...')}
                  className="flex h-13 w-13 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white transition-all active:scale-90 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm"
                >
                  <span className="material-symbols-outlined fill-1">call</span>
                </button>
              </div>
            </div>

            {/* Trip Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Pagamento</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">{paymentMethod === 'money' ? 'Dinheiro' : 'Cartão'}</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Preço Est.</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-lg font-black text-primary">{selectedCategory.price}</span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4 py-2">
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-2">
                  <div className="size-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                  <div className="w-0.5 h-12 bg-slate-100 dark:bg-slate-800 my-1"></div>
                  <div className="size-2.5 rounded-full bg-primary shadow-lg shadow-primary/30"></div>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Origem</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{selectedAddress}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Destino</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Button */}
            <button
              onClick={() => alert('Entrando em contato com a Central de Segurança 24h...')}
              className="flex items-center justify-center gap-3 w-full py-5 bg-red-50 dark:bg-red-500/5 text-red-600 rounded-2xl font-black text-sm uppercase tracking-wide transition-all active:scale-[0.98] hover:bg-red-100 dark:hover:bg-red-500/10 border border-red-100/50 dark:border-red-900/20"
            >
              <span className="material-symbols-outlined text-lg fill-1">shield_with_heart</span>
              Central de Segurança
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark px-4 pb-8 pt-3 transition-colors shadow-[0_-8px_30px_rgb(0,0,0,0.05)]">
        <div className="flex gap-2 max-w-md mx-auto">
          {[
            { id: 'home', icon: 'home', label: 'Início', active: false },
            { id: 'trips', icon: 'motorcycle', label: 'Viagens', active: true },
            { id: 'history', icon: 'history', label: 'Atividade', active: false },
            { id: 'profile', icon: 'account_circle', label: 'Perfil', active: false },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'home') {
                  setCurrentView('app');
                  setActiveTab('home');
                }
              }}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90 ${item.active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <span className={`material-symbols-outlined ${item.active ? 'fill-1' : ''}`}>{item.icon}</span>
              <p className="text-[10px] font-black uppercase font-display">{item.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTripInProgress = () => (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Top App Bar */}
      <div className="z-20 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setCurrentView('app')}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-black leading-tight tracking-tight flex-1 text-center">Viagem Iniciada</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCddPhXFlLNtvt6NgxGkMu1xDIZQHlyv5oAt_KVvgnHAQ39KQfxl9ImavZTudCmL2ei_CkBBu5ivXrJoi8hf_EcvvTmqCCap4yZSi6C7IfH7Z3mm4_Bfaf8STcMdgePVVq68V16M1t4hjA8W19E4xeVuTkPvRJV-2idTR4s9ePM7jbtmVJVVp3qNulGqwCTa8jThntuXHlLuKIlLdvVkzFg-Czpwwf9GbrJkMA-6PqqkVON5kL0ihX4TeLZrXZYgpEpgGPO-3LBwTI')" }}
        >
        </div>
      </div>

      {/* Floating UI Elements on Map */}
      <div className="absolute top-24 right-4 z-10 flex flex-col gap-3">
        <button className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
          <span className="material-symbols-outlined text-slate-900 dark:text-white group-hover:rotate-12 transition-transform">my_location</span>
        </button>
        <button className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
          <span className="material-symbols-outlined text-slate-900 dark:text-white group-hover:scale-110 transition-transform">share</span>
        </button>
      </div>

      {/* Bottom Sheet Overlay */}
      <div className="mt-auto z-20 relative pointer-events-none">
        <motion.div
          drag="y"
          dragConstraints={{ top: -200, bottom: 0 }}
          className="bg-white dark:bg-background-dark rounded-t-[40px] shadow-[0_-12px_45px_rgb(0,0,0,0.15)] p-8 pt-6 space-y-8 transition-colors duration-500 pointer-events-auto"
        >
          <div className="flex w-full items-center justify-center mb-4 cursor-grab active:cursor-grabbing">
            <div className="h-1.5 w-14 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          {/* Driver Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div
                  className="size-18 rounded-full bg-center bg-cover border-4 border-primary shadow-xl group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsPW9WrjsobVwFqeOWBrS2MG3bsBdvg1mYAD218eJO2cysBg_x6VLwkX1BFEl4NmYHD3S6H5AhZhfQQSCfz37YEg5k6Qyx9e655g8GY1BBRwnvfBTpbqtKMNswvdDxB1fnzAhPfPTupoktY39vT9_MrzsKU-7ZOPJ51b6r_FppJGb5AcSPHb98x1Pe9SEOSlRvHuFkpy24f0qxxwQTTHnmMMO52aeHiPFmaXub1jMWSE_-_ZXshNp6P8NR2_Qls_eYYfCZQm3Ej9o')" }}
                >
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-background-dark shadow-md">
                  4.9
                </div>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">Ricardo Silva</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Honda Titan</p>
                  <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">ABC-1234</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button className="flex size-14 items-center justify-center rounded-[20px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all active:scale-90 hover:brightness-110">
                <span className="material-symbols-outlined fill-1">chat</span>
              </button>
              <button className="flex size-14 items-center justify-center rounded-[20px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all active:scale-90 hover:brightness-110">
                <span className="material-symbols-outlined fill-1">call</span>
              </button>
            </div>
          </div>

          {/* Trip Details Card */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800 group hover:border-primary/20 transition-colors">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center pt-2 gap-1.5">
                  <div className="size-3 rounded-full bg-primary shadow-lg shadow-primary/30"></div>
                  <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-700 opacity-60"></div>
                  <div className="size-3 rounded-full border-2 border-primary animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Origem</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-bold truncate mt-1">Rua das Flores, 123 - Centro</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Destino</p>
                    <p className="text-slate-900 dark:text-white text-lg font-black truncate mt-1 leading-tight">{selectedAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price and ETA */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex size-13 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Preço Estimado</p>
                <p className="text-slate-900 dark:text-white font-black text-xl">{selectedCategory.price}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chegada em</p>
              <p className="text-primary font-black text-2xl drop-shadow-sm">12 min</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">share</span>
              Compartilhar
            </button>
            <button
              onClick={() => {
                if (confirm('Deseja realmente cancelar a viagem? Taxas de cancelamento podem ser aplicadas.')) {
                  setCurrentView('app');
                }
              }}
              className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-red-500 text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:bg-red-600 shadow-lg shadow-red-500/20"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
              Cancelar
            </button>
          </div>

          {/* Safety Message */}
          <div className="flex items-center justify-center gap-2 pb-2">
            <span className="material-symbols-outlined text-green-500 text-lg fill-1">shield</span>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-tight">Viagem protegida pelo Seguro de Acidentes.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderTripCompleted = () => (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <header className="flex items-center bg-white dark:bg-background-dark p-4 z-10 shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setCurrentView('app')}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight flex-1 text-center pr-10">Viagem Concluída</h2>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-in fade-in duration-1000 grayscale-[0.3]"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD02zBt5XUXsm5SPsJq-av80YMcZ54RaKFn9zKeihlV-7BLOXaeLuTmqrCk2O9RxCxXXCfiGQDHXpsfftRFEMMR8nXel-cyf27mucBY0fGKPFnJ6W5wB_INqLcRDHnX2fLkiDhr_NjWouaV_v7nIRQMRm0eujmS9yQhb2juVG63zRRa-mwhPnLpL_pnPJaKpd_R-qSkyxHe_KYp7zdPTfM32_CAUa-rvGCVy-O2Mw4Pmb8U0UswNXWU0SPpgfn5aKBNlNVddkOFDp4')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary p-5 rounded-full shadow-[0_0_50px_rgba(255,217,0,0.4)] border-8 border-white dark:border-background-dark animate-bounce duration-1000">
            <span className="material-symbols-outlined text-slate-900 text-4xl fill-1">location_on</span>
          </div>
        </div>
      </div>

      <div className="mt-auto z-20 relative pointer-events-none -mt-10">
        <motion.div
          drag="y"
          dragConstraints={{ top: -200, bottom: 0 }}
          className="relative z-20 bg-white dark:bg-background-dark rounded-t-[40px] shadow-[0_-15px_50px_rgb(0,0,0,0.18)] pointer-events-auto"
        >
          <div className="flex h-8 w-full items-center justify-center cursor-grab active:cursor-grabbing">
            <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mt-2"></div>
          </div>
          <div className="px-8 pt-4 pb-12">
            <div className="text-center mb-8">
              <div className="inline-flex bg-green-50 dark:bg-green-500/10 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-green-100 dark:border-green-500/20">
                Chegada ao destino
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight leading-tight">Você chegou ao seu destino!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Preço</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">{selectedCategory.price}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Distância</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">4.5 km</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Duração</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">12 min</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[30px] mb-10 border border-slate-100 dark:border-slate-800">
              <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border-4 border-white dark:border-slate-700 shadow-md">
                <img className="w-full h-full object-cover" alt="Ricardo Silva" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiUuUEgtmFITu71yPoWB_YoiRBLptM6RcfaqdoaREOCoa6NfOW3HK08kTRuEpu1TdqUMvNi4yAFuHr41j5AMd2bu1tiPwbdu4sNMNmFO_UspDtrxAYKOiHGtr5QRJLM02p10x-xCnRtiMqnoM0FJzYfbKwuP7jOdoa6JN8qn2eo97INOHtUDymo-jnXvqmeluT3XAneBQ33ud-0Mr8pigRX6_Roc96_AghQtHWkeOTfGzqg8JloJse2Bq7kMl1_t76S1wbXL5zdjo" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white font-black text-xl">Ricardo Silva</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Honda Titan</p>
                  <span className="text-primary font-black text-sm">★ 4.9</span>
                </div>
              </div>
              <button className="bg-white dark:bg-slate-700 p-3 rounded-2xl shadow-sm text-slate-600 dark:text-white transition-all active:scale-90 hover:brightness-95">
                <span className="material-symbols-outlined fill-1">chat_bubble</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setCurrentView('trip_rating')}
                className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] text-lg uppercase tracking-wider"
              >
                Avaliar Corrida
              </button>
              <button
                onClick={() => setCurrentView('app')}
                className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest"
              >
                Agora não, ir para Início
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderTripRating = () => (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <div className="flex items-center p-6 pb-2 justify-between">
        <button
          onClick={() => setCurrentView('trip_completed')}
          className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center pr-12">Avaliar Entrega</h2>
      </div>

      <div className="flex-1 flex flex-col px-8 py-4">
        {/* Courier Profile Section */}
        <div className="flex flex-col gap-6 items-center py-8">
          <div className="relative animate-in zoom-in duration-500">
            <div
              className="size-40 rounded-full bg-center bg-cover border-8 border-primary shadow-2xl"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBhhr_MfTrZ648_v8xlu3O79HUUki_woDSn7wlUSMFnHATEUSYwI9FP1yTUWjF0ztN2xoTA24xFEgG8D6Cil4qSPSqbqDDl-LJuVnUAynDv4Qdzki4hGBx7kWS3o4Iyi78WvZ7AEPV5BYOTEHE76M82lbEgwjAIEouT5p73LuU8qSgSgfpRmdjGJpgF8JMPF4bqO0jiTKG1IM5V4pUDMvWjE0U_FsNB2TkKl6cMdFQ6NMpWanKIhHx3RE7HseFb3q0n4SOPQ0WpDIkE')" }}
            >
            </div>
            <div className="absolute -bottom-2 right-4 bg-primary text-slate-900 size-11 flex items-center justify-center rounded-full border-4 border-white dark:border-background-dark shadow-lg">
              <span className="material-symbols-outlined fill-1">verified</span>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">João Silva</p>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-bold">Seu entregador de hoje</p>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex flex-col items-center gap-6 py-6 mb-4">
          <h4 className="text-slate-900 dark:text-white text-xl font-black text-center uppercase tracking-tight">Como foi sua experiência?</h4>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-all active:scale-75 transform hover:scale-110"
              >
                <span className={`material-symbols-outlined text-5xl ${star <= 4 ? 'text-primary fill-1' : 'text-slate-200 dark:text-slate-800'}`}>
                  star
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Feedback Tags */}
        <div className="space-y-4 mb-8">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest pl-1">O que você mais gostou?</p>
          <div className="flex gap-2.5 flex-wrap">
            {['Entrega rápida', 'Simpático', 'Cuidado extra', 'Boa comunicação'].map((tag, idx) => (
              <button
                key={tag}
                className={`flex h-11 items-center justify-center rounded-2xl px-5 transition-all text-sm font-bold active:scale-95 ${idx === 0 ? 'bg-primary/20 border-2 border-primary text-slate-800 dark:text-white' : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent text-slate-500 dark:text-slate-400'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comments Area */}
        <div className="flex flex-col gap-3 mb-10">
          <label className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest pl-1" htmlFor="comments">Comentário opcional</label>
          <textarea
            className="w-full rounded-[24px] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-0 text-slate-900 dark:text-white p-5 font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
            id="comments"
            placeholder="Escreva aqui como foi sua experiência..."
            rows={3}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-4 pb-12">
          <button
            onClick={() => {
              alert('Obrigado pela sua avaliação! Ricardo ficará feliz em saber.');
              setCurrentView('app');
              setActiveTab('home');
            }}
            className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] text-lg uppercase tracking-wider"
          >
            Enviar Avaliação
          </button>
          <button
            onClick={() => {
              setCurrentView('app');
              setActiveTab('home');
            }}
            className="w-full py-2 text-slate-400 dark:text-slate-500 font-black hover:text-slate-900 dark:hover:text-white transition-colors uppercase text-xs tracking-widest"
          >
            Pular avaliação
          </button>
        </div>

        {/* Stats Preview */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800 mb-8 flex items-center gap-8">
          <div className="flex flex-col items-center">
            <p className="text-slate-900 dark:text-white text-4xl font-black leading-none tracking-tight">4.9</p>
            <div className="flex gap-0.5 text-primary mt-1.5">
              {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-sm fill-1">star</span>)}
              <span className="material-symbols-outlined text-sm fill-1">star_half</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1 uppercase">1,240 votos</p>
          </div>
          <div className="flex-1 space-y-2">
            {[85, 10, 3, 1, 1].map((pct, idx) => (
              <div key={5 - idx} className="flex items-center gap-3">
                <span className="text-slate-400 dark:text-slate-600 text-[10px] font-black w-2">{5 - idx}</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold w-6 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );



  const renderOrders = () => {
    const ACTIVE_ORDERS = [
      { id: 'ORD-1029', status: 'Em preparo', item: 'Hambúrguer Gourmet', store: 'Burger King', progress: 45, icon: 'restaurant', time: 'Enviado às 19:45' },
      { id: 'ORD-8829', status: 'A caminho', item: 'Entrega de Documentos', store: 'Minha Localização', progress: 85, icon: 'bolt', time: 'Retirado às 20:12' },
    ];

    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32 animate-in fade-in duration-500">
        <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
          <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display uppercase tracking-[0.2em]">Meus Pedidos</h2>
        </div>

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          <div className="space-y-6">
            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-2 font-display">Rastreamento Premium</h3>
            {ACTIVE_ORDERS.map((order) => (
              <div key={order.id} className="relative group bg-white dark:bg-surface-dark p-6 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-floating overflow-hidden transition-all hover:scale-[1.01]">
                <div className="flex items-center gap-5 mb-6">
                  <div className="size-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0 border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-slate-900">
                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">{order.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1">{order.item}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.store}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-primary/10 text-primary font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">{order.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Progresso Elite</span>
                    <span className="text-primary font-black">{order.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${order.progress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-primary shadow-soft relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </motion.div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 bg-slate-50 dark:bg-white/[0.03] text-slate-500 font-black text-[10px] py-4 rounded-2xl uppercase tracking-[0.2em] hover:bg-primary/20 hover:text-primary transition-all border border-transparent hover:border-primary/20">Chat Concierge</button>
                  <button className="flex-1 bg-primary text-slate-900 font-black text-[10px] py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all">Priorizar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] font-display">Histórico Lux</h3>
              <button onClick={() => setActiveTab('history')} className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/30 pb-0.5">Ver Tudo</button>
            </div>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex items-center gap-5 p-5 bg-white dark:bg-surface-dark rounded-[32px] border border-slate-100 dark:border-white/5 shadow-floating group cursor-pointer transition-all hover:border-primary/20">
                  <div className={`size-12 rounded-2xl ${activity.bgColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-xl ${activity.iconColor}`}>{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{activity.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{activity.time} • R$ {Math.floor(Math.random() * 50 + 20)},00</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32 animate-in fade-in duration-500">
      <header className="p-6 space-y-6 sticky top-0 glass z-30 border-b border-white/10 dark:border-white/5">
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight text-center font-display uppercase tracking-[0.3em]">Pesquisa Lux</h2>
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary group-focus-within:scale-125 transition-transform duration-500">search</span>
          </div>
          <input
            className="block w-full pl-14 pr-6 py-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-[30px] text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-floating"
            placeholder="O que você deseja hoje?"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-10 overflow-y-auto">
        {!searchQuery ? (
          <>
            <section className="space-y-6">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 font-display">Categorias Elite</h3>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { id: 'express', label: 'Entrega Rápida', color: 'bg-yellow-500/10 text-yellow-600', icon: 'bolt' },
                  { id: 'food', label: 'Gourmet Food', color: 'bg-red-500/10 text-red-600', icon: 'restaurant' },
                  { id: 'packages', label: 'Pacotes Lux', color: 'bg-blue-500/10 text-blue-600', icon: 'package_2' },
                  { id: 'health', label: 'Saúde & Wellness', color: 'bg-green-500/10 text-green-600', icon: 'medical_services' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    className={`flex flex-col p-7 rounded-[40px] ${cat.color} border border-transparent hover:border-current transition-all text-left space-y-5 shadow-floating group active:scale-95`}
                  >
                    <div className="size-14 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">{cat.icon}</span>
                    </div>
                    <span className="font-black text-base tracking-tight uppercase leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 font-display">Mais Buscados</h3>
              <div className="flex flex-wrap gap-3 px-1">
                {['Sushi Premium', 'Vinho Importado', 'Farmácia 24h', 'Pet Gourmet', 'Courier Lux'].map((tag) => (
                  <button key={tag} className="px-5 py-2.5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-90">
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 font-display">Principais Resultados</h3>
            <div className="space-y-4">
              {filteredServices.length > 0 ? filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-5 p-6 bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-white/5 shadow-floating active:scale-[0.98] transition-all cursor-pointer group"
                  onClick={() => {
                    setActiveService(service);
                    setCurrentView('shipping_details');
                  }}
                >
                  <div className="size-16 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-all duration-500 shadow-inner shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">{service.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{service.label}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Serviço Concierge Lux Disponível</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:translate-x-2 transition-transform">arrow_forward_ios</span>
                </div>
              )) : (
                <div className="py-24 text-center space-y-6">
                  <div className="size-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-30 border-2 border-dashed border-slate-300">
                    <span className="material-symbols-outlined text-5xl">search_off</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Nenhum resultado lux encontrado</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">Tente buscar por termos mais genéricos</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );

  const renderPetShop = () => (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark font-display">
      <header className="flex items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button className="p-2" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Pet Shop</h2>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-primary/20 p-8 rounded-[40px] text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-primary animate-bounce">pets</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Seu pet merece o melhor!</h1>
          <p className="text-sm text-slate-500 font-bold">Ração, brinquedos e acessórios com entrega em minutos.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {['Rações', 'Brinquedos', 'Higiene', 'Petiscos'].map((cat) => (
            <div key={cat} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
              </div>
              <span className="font-bold text-sm tracking-tight">{cat}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const renderFoodCategories = () => (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark font-display">
      <header className="flex items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button className="p-2" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">{activeService?.label || 'Categorias'}</h2>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden relative group">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <h3 className="text-white text-2xl font-black italic">Os melhores do bairro</h3>
          </div>
        </div>
        <div className="space-y-4">
          {['Hambúrgueres', 'Pizzas', 'Sushis', 'Doces & Bolos'].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-primary transition-all active:scale-[0.98]"
              onClick={() => {
                setShippingItemDesc(item);
                setCurrentView('shipping_details');
              }}
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">{item}</h4>
                <p className="text-xs text-slate-500">12 estabelecimentos próximos</p>
              </div>
              <span className="material-symbols-outlined text-primary">chevron_right</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const renderNotifications = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in fade-in duration-500">
      <div className="flex items-center glass p-5 sticky top-0 z-30 border-b border-white/10 dark:border-white/5">
        <button onClick={() => setCurrentView('app')} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight flex-1 text-center font-display mr-10 uppercase">Avisos Elite</h2>
      </div>
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {[
          { title: 'Privilégio Ativo ⚡', text: '50% OFF em entregas gourmet hoje!', time: 'Agora', icon: 'bolt', color: 'bg-brand-50 dark:bg-brand-900/10 text-primary' },
          { title: 'Concierge Finalizado', text: 'Sua viagem exclusiva com Ricardo foi concluída.', time: '2h atrás', icon: 'verified', color: 'bg-green-500/10 text-green-500' },
          { title: 'Elite Payment', text: 'PIX Instantâneo agora é o método preferencial.', time: 'Ontem', icon: 'payments', color: 'bg-blue-500/10 text-blue-500' },
        ].map((notif, idx) => (
          <div key={idx} className="flex items-start gap-5 p-6 bg-white dark:bg-surface-dark rounded-[40px] border border-slate-100 dark:border-white/5 shadow-floating group transition-all hover:border-primary/20">
            <div className={`size-14 rounded-2xl ${notif.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-2xl fill-1">{notif.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">{notif.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">{notif.text}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-background-dark min-h-screen flex flex-col shadow-xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        {currentView === 'onboarding' && renderOnboarding()}
        {currentView === 'login' && renderLogin()}
        {currentView === 'mototaxi_request' && renderMototaxiRequest()}
        {currentView === 'mototaxi_category' && renderMototaxiCategory()}
        {currentView === 'searching_driver' && renderSearchingDriver()}
        {currentView === 'driver_found' && renderDriverFound()}
        {currentView === 'trip_in_progress' && renderTripInProgress()}
        {currentView === 'trip_completed' && renderTripCompleted()}
        {currentView === 'trip_rating' && renderTripRating()}
        {currentView === 'shipping_details' && renderShippingDetails()}
        {currentView === 'shipping_address' && renderShippingAddress()}
        {currentView === 'shipping_vehicle' && renderShippingVehicle()}
        {currentView === 'shipping_payment' && renderShippingPayment()}
        {currentView === 'shipping_processing' && renderShippingProcessing()}
        {currentView === 'shipping_error' && renderShippingError()}
        {currentView === 'searching_courier' && renderSearchingCourier()}
        {currentView === 'on_the_way_to_pickup' && renderOnTheWayToPickup()}
        {currentView === 'on_the_way_to_destination' && renderOnTheWayToDestination()}
        {currentView === 'delivery_completed' && renderDeliveryCompleted()}
        {currentView === 'driver_confirmation' && renderDriverConfirmation()}
        {currentView === 'pet_shop' && renderPetShop()}
        {currentView === 'food_categories' && renderFoodCategories()}
        {currentView === 'notifications' && renderNotifications()}
        {currentView === 'my_data' && renderMyData()}
        {currentView === 'payment_methods' && renderPaymentMethods()}
        {currentView === 'saved_addresses' && renderSavedAddresses()}
        {currentView === 'coupons' && renderCoupons()}
        {currentView === 'order_history' && renderOrderHistory()}
        {currentView === 'support' && renderSupport()}
        {currentView === 'app' && (
          <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {activeTab === 'home' && renderHome()}
              {activeTab === 'search' && renderSearch()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'history' && renderOrderHistory()}
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 px-4 pb-8 pt-3 flex justify-between items-center z-40 transition-colors">
              {[
                { id: 'home', icon: 'home', label: 'Início' },
                { id: 'search', icon: 'search', label: 'Busca' },
                { id: 'orders', icon: 'list_alt', label: 'Pedidos' },
                { id: 'profile', icon: 'person', label: 'Perfil', fill: true },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.scrollTo(0, 0);
                  }}
                  className={`flex flex-1 flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === item.id ? 'text-slate-900 dark:text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <span className={`material-symbols-outlined text-[28px] ${activeTab === item.id && item.fill ? 'fill-1' : ''}`}>
                    {item.icon}
                  </span>
                  <p className="text-[10px] font-bold uppercase font-display">{item.label}</p>
                </button>
              ))}
            </nav>
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes radar {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .radar-pulse { position: relative; display: flex; align-items: center; justify-content: center; }
        .radar-ring { position: absolute; border-radius: 50%; border: 2px solid #ffd900; opacity: 0; }
        .fill-1 { font-variation-settings: 'FILL' 1; }
      `}</style>
    </div>
  );
}

export default App;
