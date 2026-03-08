import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';

function App() {
  const [view, setView] = useState<'onboarding' | 'login' | 'app'>('onboarding');
  const [tab, setTab] = useState<'home' | 'orders' | 'profile'>('home');
  const [subView, setSubView] = useState<'none' | 'restaurant_list' | 'restaurant_menu' | 'product_detail' | 'checkout' | 'active_order' | 'addresses' | 'payments' | 'transit_selection' | 'generic_list'>('none');
  const [activeService, setActiveService] = useState<any>(null);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [activeMenuCategory, setActiveMenuCategory] = useState('Destaques');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [transitData, setTransitData] = useState({
    origin: 'Rua Augusta, 45',
    destination: '',
    type: 'mototaxi' as 'mototaxi' | 'carro' | 'van' | 'utilitario',
    estPrice: 0
  });

  const [email, setEmail] = useState('cliente@exemplo.com');
  const [password, setPassword] = useState('senha123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('users_delivery').upsert({ id: session.user.id, name: 'Usuário' }).then();
        setUserId(session.user.id);
        setView('app');
        fetchMyOrders(session.user.id);
      }
    });

    const fetchDrivers = async () => {
      const { count } = await supabase.from('drivers_delivery').select('*', { count: 'exact', head: true }).eq('is_online', true);
      setActiveDrivers(count || 0);
    };
    fetchDrivers();

    const sub = supabase.channel('drivers_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers_delivery' }, fetchDrivers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders_delivery' }, () => {
        if (userId) fetchMyOrders(userId);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [userId]);

  const fetchMyOrders = async (uid: string) => {
    const { data } = await supabase.from('orders_delivery').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data) setMyOrders(data);
  };

  const handleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name: 'Usuário' } } });
          if (signUpError) throw signUpError;
          await supabase.from('users_delivery').upsert({ id: signUpData.user!.id, name: 'Usuário' });
          setUserId(signUpData.user!.id);
          setView('app');
        } else throw error;
      } else {
        await supabase.from('users_delivery').upsert({ id: data.user!.id, name: 'Usuário' });
        setUserId(data.user!.id);
        setView('app');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemCount = (id: number) => cart.filter(item => item.id === id).length;

  const handleAddToCart = (item: any) => setCart([...cart, item]);

  const handleRemoveFromCart = (id: number) => {
    const idx = cart.findIndex(item => item.id === id);
    if (idx !== -1) {
      const newCart = [...cart];
      newCart.splice(idx, 1);
      setCart(newCart);
    }
  };

  const handlePlaceOrder = async () => {
    if (!userId) return;
    setIsLoading(true);
    const total = cart.reduce((acc, item) => acc + item.price, 0) + 5.9; // 5.90 is delivery fee

    const { data, error } = await supabase.from('orders_delivery').insert({
      user_id: userId,
      status: 'pendente',
      total_price: parseFloat(total.toFixed(2)),
      pickup_address: 'Restaurante Burger Premium • Av. Paulista, 1000',
      delivery_address: 'Rua Augusta, 45 - Consolação, São Paulo',
      service_type: 'delivery'
    }).select().single();

    setIsLoading(false);
    if (!error) {
      setCart([]);
      setSelectedItem(data); // Using selectedItem to store the current tracking order
      setSubView('active_order');
      fetchMyOrders(userId);
    } else {
      alert("Erro ao criar pedido.");
    }
  };

  const handleRequestTransit = async () => {
    if (!userId || !transitData.destination) return;
    setIsLoading(true);

    // Simulating transit order with destination-based logic
    let price = 0;
    if (transitData.type === 'mototaxi') price = 12.5;
    else if (transitData.type === 'carro') price = 22.0;
    else if (transitData.type === 'utilitario') price = 35.0;
    else if (transitData.type === 'van') price = 55.0;

    const { data, error } = await supabase.from('orders_delivery').insert({
      user_id: userId,
      status: 'pendente',
      total_price: price,
      pickup_address: transitData.origin,
      delivery_address: transitData.destination,
      service_type: transitData.type
    }).select().single();

    setIsLoading(false);
    if (!error) {
      setSelectedItem(data);
      setSubView('active_order');
      fetchMyOrders(userId);
      setTransitData({ ...transitData, destination: '' });
    } else {
      alert("Erro ao solicitar transporte.");
    }
  };

  const renderOnboarding = () => (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-between p-8 bg-surface relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-brand-400/20 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-blue-400/10 rounded-full blur-[80px]"></div>

      <div className="w-full pt-16 z-10">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-brand-600 rounded-[28px] flex items-center justify-center shadow-float mb-8">
          <span className="material-symbols-rounded text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
          Tudo que <br />você precisa,<br /><span className="text-brand-600">agora.</span>
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-500 text-lg font-medium">
          O delivery reimaginado para o seu ritmo de vida. Mais rápido, simples e incrivelmente suave.
        </motion.p>
      </div>

      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="w-full z-10 space-y-4">
        <button onClick={() => setView('login')} className="w-full bg-brand-600 text-white font-bold text-lg py-5 rounded-[28px] shadow-float active:scale-[0.98] transition-transform">
          Começar Agora
        </button>
      </motion.div>
    </div>
  );

  const renderLogin = () => (
    <div className="h-[100dvh] w-full flex flex-col p-8 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-brand-100/50 to-transparent -z-10"></div>

      <button onClick={() => setView('onboarding')} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-soft mb-8 mt-4 active:scale-95 transition-transform">
        <span className="material-symbols-rounded text-slate-700">arrow_back</span>
      </button>

      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bem-vindo(a)</h2>
      <p className="text-slate-500 font-medium mb-10">Faça login ou crie sua conta instantaneamente num click.</p>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">E-mail</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-6 py-5 bg-white border-0 rounded-[28px] shadow-soft focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-900 placeholder:text-slate-300 transition-all"
            placeholder="seu@email.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Senha</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-6 py-5 bg-white border-0 rounded-[28px] shadow-soft focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-900 placeholder:text-slate-300 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      {errorMsg && <p className="mt-6 text-red-500 text-sm font-bold text-center bg-red-50 p-4 rounded-2xl">{errorMsg}</p>}

      <div className="mt-auto pb-4">
        <button onClick={handleAuth} disabled={isLoading} className="w-full bg-slate-900 text-white font-bold text-lg py-5 rounded-[28px] shadow-soft active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2">
          {isLoading ? 'Conectando...' : 'Acessar Conta'}
          {!isLoading && <span className="material-symbols-rounded">arrow_forward</span>}
        </button>
      </div>
    </div>
  );

  const handleShopClick = (shop: any) => {
    // Initialize shop with categorized mock data based on type
    let categorizedShop = { ...shop, categories: [] as any[] };
    const serviceType = activeService?.type || 'restaurant';

    if (serviceType === 'beverages') {
      categorizedShop.categories = [
        { name: 'Cervejas', items: [{ id: 501, name: 'Heineken 600ml', price: 12.50, desc: 'Cerveja premium gelada.' }, { id: 502, name: 'IPA Artesanal', price: 24.90, desc: 'Cerveja forte lupulada.' }] },
        { name: 'Destilados', items: [{ id: 503, name: 'Whisky Black Label', price: 189.00, desc: 'Original 750ml.' }, { id: 504, name: 'Gin Tanqueray', price: 110.00, desc: 'Ideal para drinks.' }] },
        { name: 'Não Alcoólicas', items: [{ id: 505, name: 'Coca-Cola 2L', price: 9.90, desc: 'Família em dobro.' }, { id: 506, name: 'Suco de Laranja', price: 14.00, desc: 'Integral 1L.' }] },
        { name: 'Churrasco', items: [{ id: 507, name: 'Carvão 5kg', price: 22.00, desc: 'Eucalipto premium.' }, { id: 508, name: 'Sal Grosso', price: 4.50, desc: 'Temperado com ervas.' }] }
      ];
    } else if (serviceType === 'market') {
      categorizedShop.categories = [
        { name: 'Mercearia', items: [{ id: 201, name: 'Leite Integral 1L', price: 5.90, desc: 'Leite tipo A.' }, { id: 202, name: 'Arroz 5kg', price: 28.50, desc: 'Agulhinha tipo 1.' }] },
        { name: 'Higiene', items: [{ id: 203, name: 'Shampoo Care', price: 18.90, desc: 'Brilho e maciez.' }, { id: 204, name: 'Pasta de Dente', price: 5.50, desc: 'Proteção total.' }] },
        { name: 'Limpeza', items: [{ id: 205, name: 'Detergente 500ml', price: 2.80, desc: 'Controle de gordura.' }, { id: 206, name: 'Sabão em Pó 1kg', price: 15.90, desc: 'Brancura impecável.' }] }
      ];
    } else if (serviceType === 'pharmacy') {
      categorizedShop.categories = [
        { name: 'Medicamentos', items: [{ id: 303, name: 'Analgésico', price: 5.50, desc: 'Alívio rápido.' }, { id: 304, name: 'Anti-inflamatório', price: 12.90, desc: 'Eficácia comprovada.' }] },
        { name: 'Higiene', items: [{ id: 305, name: 'Sabonete Líquido', price: 8.90, desc: 'Neutro para peles sensíveis.' }, { id: 306, name: 'Desodorante Roll-on', price: 11.50, desc: 'Proteção 48h.' }] },
        { name: 'Bem-estar', items: [{ id: 301, name: 'Vitamina C', price: 18.20, desc: '10 comprimidos.' }, { id: 302, name: 'Protetor Solar', price: 45.90, desc: 'FPS 50.' }] }
      ];
    } else if (serviceType === 'pet') {
      categorizedShop.categories = [
        { name: 'Rações', items: [{ id: 401, name: 'Ração Golden 3kg', price: 54.90, desc: 'Carne e arroz.' }, { id: 403, name: 'Snack Dog', price: 8.50, desc: 'Petisco natural.' }] },
        { name: 'Higiene Pet', items: [{ id: 405, name: 'Shampoo para Cães', price: 22.90, desc: 'Para pelos claros.' }, { id: 406, name: 'Areia Sanitária Gato', price: 19.90, desc: 'Alta absorção.' }] },
        { name: 'Brinquedos', items: [{ id: 402, name: 'Brinquedo Mordedor', price: 15.00, desc: 'Borracha durável.' }, { id: 404, name: 'Bolinha Colorida', price: 5.00, desc: 'Diversão garantida.' }] }
      ];
    } else {
      // Default to Restaurant Categorization
      categorizedShop.categories = [
        { name: 'Populares', items: [{ id: 1, name: 'Double Smash Burger', desc: 'Sabor marcante e suculento.', price: 34.90 }, { id: 3, name: 'Fritas com Cheddar', desc: 'Porção generosa com bacon.', price: 22.00 }] },
        { name: 'Pratos', items: [{ id: 2, name: 'Combo Classic', desc: 'Completo com fritas e refri.', price: 42.50 }, { id: 10, name: 'Strogonoff de Frango', desc: 'Acompanha arroz e batata palha.', price: 38.00 }] },
        { name: 'Bebidas', items: [{ id: 11, name: 'Refrigerante Lata', desc: '350ml bem gelado.', price: 6.50 }, { id: 12, name: 'Suco Natural', price: 12.00, desc: 'Laranja ou Limão.' }] }
      ];
    }

    setSelectedShop(categorizedShop);
    setActiveMenuCategory(categorizedShop.categories[0]?.name || 'Populares');
    setSubView('restaurant_menu');
  };

  const renderHome = () => {
    const promotions = [
      { id: 1, title: 'Cupom R$20', desc: 'Em todo o setor de Mercado', code: 'MARKET20', color: 'bg-emerald-600', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400' },
      { id: 2, title: 'Frete Grátis', desc: 'Primeira compra em Farmácia', code: 'FARMAFREE', color: 'bg-blue-600', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400' },
      { id: 3, title: 'Pet Friday', desc: '30% OFF em acessários pet', code: 'PET30', color: 'bg-rose-600', img: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=400' }
    ];

    const bestSellers = [
      { id: 101, name: 'Combo Whopper', shop: 'Burger King', price: 34.90, img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=300' },
      { id: 102, name: 'Cerveja Heineken 600ml', shop: 'Adega Central', price: 12.50, img: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=300' },
      { id: 103, name: 'Ração Royal Canin 1kg', shop: 'Petz Store', price: 89.90, img: 'https://images.unsplash.com/photo-1589924691106-073b19f5538d?q=80&w=300' },
    ];

    const categories = [
      { icon: 'restaurant', label: 'Comida', color: 'bg-orange-100 text-orange-600', type: 'restaurant' },
      { icon: 'shopping_cart', label: 'Mercado', color: 'bg-emerald-100 text-emerald-600', type: 'market' },
      { icon: 'medication', label: 'Farmácia', color: 'bg-blue-100 text-blue-600', type: 'pharmacy' },
      { icon: 'pets', label: 'Pet Shop', color: 'bg-rose-100 text-rose-600', type: 'pet' },
      { icon: 'wine_bar', label: 'Bebidas', color: 'bg-amber-100 text-amber-600', type: 'beverages' },
      { icon: 'motorcycle', label: 'MotoTáxi', color: 'bg-yellow-100 text-yellow-600', action: () => { setTransitData({ ...transitData, type: 'mototaxi' }); setSubView('transit_selection'); } },
      { icon: 'directions_car', label: 'Motorista', color: 'bg-indigo-100 text-indigo-600', action: () => { setTransitData({ ...transitData, type: 'carro' }); setSubView('transit_selection'); } },
      { icon: 'local_shipping', label: 'Entregas', color: 'bg-slate-100 text-slate-600', action: () => { setTransitData({ ...transitData, type: 'van' }); setSubView('transit_selection'); } },
    ];

    const handleServiceSelection = (cat: any) => {
      if (cat.action) return cat.action();
      setActiveService(cat);
      if (cat.type === 'restaurant') {
        setSubView('restaurant_list');
      } else {
        setSubView('generic_list');
      }
    };

    return (
      <div className="flex flex-col h-full bg-[#f8f9fc] overflow-y-auto hide-scrollbar pb-32">
        <header className="px-6 py-6 sticky top-0 z-30 glass-panel border-b-0 rounded-b-[40px] mb-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg border-2 border-white">
                JS
              </div>
              <div>
                <p className="text-[9px] font-black text-brand-600 uppercase tracking-[0.2em] mb-0.5">Entregar em</p>
                <div className="flex items-center gap-1 cursor-pointer">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Rua Augusta, 45</h3>
                  <span className="material-symbols-rounded text-slate-400 text-lg">expand_more</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform">
                <span className="material-symbols-rounded text-slate-400">favorite</span>
              </div>
              <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform">
                <span className="material-symbols-rounded text-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-brand-500 rounded-full ring-2 ring-white"></div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <span className="material-symbols-rounded absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-600">search</span>
            <input type="text" placeholder="O que você precisa agora?" className="w-full pl-14 pr-6 py-4.5 bg-slate-100/50 border border-slate-200/50 rounded-[28px] focus:bg-white focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-bold" />
          </div>
        </header>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Active Order Tracking Widget */}
          {myOrders.find(o => !['concluido', 'cancelado'].includes(orderStatuses[o.status] || o.status)) && (
            <div className="px-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => {
                  setSelectedItem(myOrders.find(o => !['concluido', 'cancelado'].includes(orderStatuses[o.status] || o.status)));
                  setSubView('active_order');
                }}
                className="bg-slate-900 rounded-[32px] p-5 flex items-center gap-4 shadow-2xl shadow-slate-900/20 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <span className="material-symbols-rounded text-slate-900 animate-bounce font-black">delivery_dining</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Status do Pedido</p>
                  <h4 className="text-white font-black text-md tracking-tight">Motorista à caminho ⚡</h4>
                </div>
                <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-rounded">chevron_right</span>
                </button>
              </motion.div>
            </div>
          )}

          {/* Service Grid - Compact & Smooth */}
          <div className="px-6">
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {categories.map((cat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i}
                  onClick={() => handleServiceSelection(cat)}
                  className="flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition-all group"
                >
                  <div className={`w-[68px] h-[68px] rounded-[26px] flex items-center justify-center ${cat.color} shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all border border-white/50`}>
                    <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center w-full px-1">{cat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Promotions Carousel - CINEMATIC */}
          <div className="space-y-4">
            <div className="px-6 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Promoções Incríveis 💫</h3>
              <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Ver Todas</button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 pb-2 hide-scrollbar">
              {promotions.map((promo) => (
                <div key={promo.id} className={`shrink-0 w-[300px] h-[160px] rounded-[36px] ${promo.color} p-6 relative overflow-hidden shadow-lg shadow-black/5`}>
                  <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: `url('${promo.img}')` }}></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <h4 className="text-white text-2xl font-black leading-tight">{promo.title}</h4>
                      <p className="text-white/80 text-xs font-bold mt-1">{promo.desc}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl w-fit flex items-center gap-2 border border-white/30">
                      <span className="text-[10px] font-black text-white tracking-[0.2em]">{promo.code}</span>
                      <span className="material-symbols-rounded text-xs text-white">content_copy</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Products - Flash Sales */}
          <div className="space-y-4">
            <div className="px-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Mais Vendidos da Semana 🔥</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 pb-4 hide-scrollbar">
              {bestSellers.map((prod) => (
                <div key={prod.id} className="shrink-0 w-[140px] flex flex-col gap-3 group">
                  <div className="w-full aspect-square rounded-[32px] bg-slate-200 bg-cover bg-center shadow-sm group-hover:shadow-md transition-all relative overflow-hidden" style={{ backgroundImage: `url('${prod.img}')` }}>
                    <div className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg active:scale-95 transition-transform cursor-pointer">
                      <span className="material-symbols-rounded text-xl">add</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest mb-1">{prod.shop}</p>
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-1 truncate">{prod.name}</h4>
                    <p className="text-sm font-black text-slate-900 tracking-tighter">R$ {prod.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Near Establishments - NEW UI */}
          <div className="px-6 space-y-4 pb-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Populares Perto de Você 📍</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Drogaria Vida', type: 'Farmácia', rating: '4.8', dist: '1.2km', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=300' },
                { name: 'Supermercado Central', type: 'Mercado', rating: '4.5', dist: '0.8km', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300' },
                { name: 'Petz Store VIP', type: 'Petshop', rating: '4.9', dist: '2.5km', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300' }
              ].map((shop, i) => (
                <div key={i} className="bg-white p-4 rounded-[36px] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer">
                  <div className="w-20 h-20 rounded-[24px] bg-cover bg-center shadow-inner" style={{ backgroundImage: `url('${shop.img}')` }}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{shop.type}</span>
                      <div className="size-1 rounded-full bg-slate-300"></div>
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{shop.dist}</span>
                    </div>
                    <h4 className="text-md font-black text-slate-900 tracking-tight">{shop.name}</h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-rounded text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-[10px] font-black">{shop.rating}</span>
                      </div>
                      <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">ABERTO</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenericList = () => {
    if (!activeService) return null;

    const data: any = {
      market: {
        title: 'Mercados e Atacados',
        shops: [
          { name: 'Supermercado Central', tag: 'Grãos e Limpeza', rating: '4.5', time: '45-60 min', img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=300', freeDelivery: true },
          { name: 'Mercado do Bairro', tag: 'Conveniência', rating: '4.8', time: '15-25 min', img: 'https://images.unsplash.com/photo-1604719312563-8912e9223c6a?q=80&w=300', freeDelivery: false }
        ],
        products: [
          { id: 201, name: 'Leite Integral 1L', price: 5.90, desc: 'Leite tipo A, alta qualidade.' },
          { id: 202, name: 'Arroz Agulhinha 5kg', price: 28.50, desc: 'Arroz soltinho polido.' }
        ]
      },
      pharmacy: {
        title: 'Farmácias e Saúde',
        shops: [
          { name: 'Drogaria Vida', tag: '24 Horas', rating: '4.9', time: '20-30 min', img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=300', freeDelivery: true },
          { name: 'Pharma Mix', tag: 'Genéricos', rating: '4.6', time: '30-40 min', img: 'https://images.unsplash.com/photo-1631549916768-4119b295f136?q=80&w=300', freeDelivery: false }
        ],
        products: [
          { id: 301, name: 'Vitamina C 1g', price: 18.20, desc: 'Efervescente, 10 comprimidos.' },
          { id: 302, name: 'Protetor Solar FPS 50', price: 45.90, desc: 'Proteção UVA/UVB 200ml.' }
        ]
      },
      pet: {
        title: 'Pet Shops e Clínica',
        shops: [
          { name: 'Petz Store VIP', tag: 'Premium', rating: '4.9', time: '25-45 min', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300', freeDelivery: true },
          { name: 'Amigo Bicho', tag: 'Acessórios', rating: '4.7', time: '40-50 min', img: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=300', freeDelivery: false }
        ],
        products: [
          { id: 401, name: 'Ração Golden 3kg', price: 54.90, desc: 'Sabor carne para cães adultos.' },
          { id: 402, name: 'Brinquedo Mordedor', price: 15.00, desc: 'Borracha atóxica durável.' }
        ]
      },
      beverages: {
        title: 'Bebidas e Adegas',
        shops: [
          { name: 'Adega Top Prime', tag: 'Bebidas Geladas', rating: '4.8', time: '10-20 min', img: 'https://images.unsplash.com/photo-1528913135592-4abd73f8a0aa?q=80&w=300', freeDelivery: true },
          { name: 'Cervejaria Artesanal', tag: 'Craft Beer', rating: '4.7', time: '30-45 min', img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=300', freeDelivery: false }
        ],
        products: [
          { id: 501, name: 'Vinho Tinto Chileno', price: 45.00, desc: 'Cabernet Sauvignon 750ml.' },
          { id: 502, name: 'Pack Coca-Cola 350ml', price: 32.00, desc: 'Contém 12 latas.' }
        ]
      }
    };
    const serviceData = data[activeService.type] || { title: 'Serviços', shops: [] };

    return (
      <div className="absolute inset-0 z-40 bg-[#f8f9fc] flex flex-col hide-scrollbar overflow-y-auto pb-10" >
        <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4">
          <button onClick={() => setSubView('none')} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform text-slate-900 border border-slate-100">
            <span className="material-symbols-rounded text-xl">arrow_back</span>
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">{serviceData.title}</h2>
        </header>

        <div className="px-6 py-4 space-y-6">
          <section>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Estabelecimentos</h3>
            <div className="space-y-4">
              {serviceData.shops.map((shop: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  onClick={() => handleShopClick(shop)}
                  className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-20 h-20 rounded-[24px] bg-cover bg-center shadow-inner" style={{ backgroundImage: `url('${shop.img}')` }}></div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{shop.tag}</span>
                    <h4 className="text-md font-black text-slate-900 mt-1">{shop.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-amber-500"><span className="material-symbols-rounded text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>{shop.rating}</span>
                      <span>•</span>
                      <span>{shop.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {serviceData.products && (
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Produtos Sugeridos</h3>
              <div className="grid grid-cols-2 gap-4">
                {serviceData.products.map((p: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-[12px] font-black text-slate-900 leading-tight mb-2">{p.name}</h4>
                      <p className="text-[10px] font-medium text-slate-400 line-clamp-2">{p.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-black text-slate-900">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                      <button onClick={() => handleAddToCart(p)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center active:scale-95 transition-transform">
                        <span className="material-symbols-rounded text-sm">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div >
    );
  };

  const orderStatuses: any = {
    'pendente': 'pendente',
    'pending': 'pendente',
    'concluido': 'concluido',
    'cancelado': 'cancelado'
  };

  const renderRestaurantList = () => {
    const foodCategories = [
      { id: 'hamburguer', name: 'Hamburguerias', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=400' },
      { id: 'pizza', name: 'Pizzas', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400' },
      { id: 'japonesa', name: 'Japonesa', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400' },
      { id: 'acai', name: 'Açaí', img: 'https://images.unsplash.com/photo-1590301157890-48109335cf73?q=80&w=400' },
      { id: 'bares', name: 'Bares & Drinks', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' },
      { id: 'brasileira', name: 'Brasileira', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400' },
      { id: 'doces', name: 'Doces & Bolos', img: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=400' },
    ];

    const allRestaurants = [
      { tag: 'Lanches', type: 'hamburguer', name: 'Burger Premium', rating: '4.9', time: '30-40 min', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300', freeDelivery: true, ratingVal: 4.9, timeVal: 35 },
      { tag: 'Japonesa', type: 'japonesa', name: 'Sushi House', rating: '4.7', time: '40-50 min', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300', freeDelivery: false, ratingVal: 4.7, timeVal: 45 },
      { tag: 'Pizza', type: 'pizza', name: 'Nossa Pizza', rating: '4.5', time: '20-30 min', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300', freeDelivery: true, ratingVal: 4.5, timeVal: 25 },
      { tag: 'Açaí', type: 'acai', name: 'Açaí do Porto', rating: '4.8', time: '15-25 min', img: 'https://images.unsplash.com/photo-1590301157890-48109335cf73?q=80&w=300', freeDelivery: true, ratingVal: 4.8, timeVal: 20 },
      { tag: 'Bares', type: 'bares', name: 'The Pub Central', rating: '4.6', time: '20-35 min', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=300', freeDelivery: false, ratingVal: 4.6, timeVal: 25 }
    ];

    const filteredRestaurants = selectedFoodCategory
      ? allRestaurants.filter(r => r.type === selectedFoodCategory)
      : [];

    return (
      <div className="absolute inset-0 z-40 bg-[#f8f9fc] flex flex-col hide-scrollbar overflow-y-auto pb-6">
        <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (selectedFoodCategory) setSelectedFoodCategory(null);
              else setSubView('none');
            }}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform text-slate-900 border border-slate-100"
          >
            <span className="material-symbols-rounded text-xl text-slate-700">arrow_back</span>
            <span className="font-bold text-sm">Voltar</span>
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">
            {selectedFoodCategory ? foodCategories.find(c => c.id === selectedFoodCategory)?.name : 'Categorias de Comida'}
          </h2>
        </header>

        {!selectedFoodCategory ? (
          <div className="px-6 pt-4 grid grid-cols-1 gap-4">
            {foodCategories.map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={cat.id}
                onClick={() => {
                  setLoadingRestaurants(true);
                  setSelectedFoodCategory(cat.id);
                  setTimeout(() => setLoadingRestaurants(false), 500);
                }}
                className="relative h-32 rounded-[32px] overflow-hidden shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${cat.img}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                <div className="absolute inset-0 flex items-center px-8">
                  <h3 className="text-white text-2xl font-black tracking-tight">{cat.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="px-6 pt-4 space-y-4">
            {loadingRestaurants ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-[40px] flex items-center gap-4 animate-pulse">
                  <div className="w-24 h-24 rounded-[24px] bg-slate-100"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-20 h-4 bg-slate-100 rounded-full"></div>
                    <div className="w-40 h-6 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
              ))
            ) : (
              filteredRestaurants.map((rest, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i}
                  onClick={() => handleShopClick(rest)}
                  className="bg-white p-4 rounded-[40px] flex items-center gap-4 shadow-sm border border-slate-50 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-24 h-24 rounded-[32px] bg-cover bg-center" style={{ backgroundImage: `url('${rest.img}')` }}></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{rest.tag}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                        <span className="material-symbols-rounded text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {rest.rating}
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{rest.name}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{rest.time} • {rest.freeDelivery ? 'Entrega Grátis' : 'Taxa R$ 5,90'}</p>
                  </div>
                </motion.div>
              ))
            )}
            {!loadingRestaurants && filteredRestaurants.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <span className="material-symbols-rounded text-6xl mb-4">storefront</span>
                <p className="font-bold">Nenhum estabelecimento nesta categoria.</p>
                <button onClick={() => setSelectedFoodCategory(null)} className="mt-4 text-brand-600 font-black">Ver outras categorias</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  const renderRestaurantMenu = () => (
    <div className="absolute inset-0 z-50 bg-[#f8f9fc] flex flex-col hide-scrollbar overflow-y-auto">
      <header className="fixed top-0 left-0 right-0 z-[60] px-6 py-6 pointer-events-none flex items-center justify-between">
        <button
          onClick={() => setSubView(activeService ? 'generic_list' : 'restaurant_list')}
          className="pointer-events-auto flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg active:scale-95 transition-transform text-slate-900 border border-white/50"
        >
          <span className="material-symbols-rounded text-xl">arrow_back</span>
        </button>
        <div className="pointer-events-auto flex gap-2">
          <button className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-900 border border-white/50"><span className="material-symbols-rounded text-xl">share</span></button>
          <button className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-900 border border-white/50"><span className="material-symbols-rounded text-xl">search</span></button>
        </div>
      </header>

      <div className="relative w-full h-[280px] bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${selectedShop?.img || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop"}')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fc] via-transparent to-black/20"></div>
        <div className="absolute bottom-14 left-6 right-6 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black text-white bg-brand-600 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">{selectedShop?.tag || 'Lanches'}</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-3">{selectedShop?.name || 'Burger Premium'}</h2>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-[22px] shadow-xl flex items-center gap-2 mb-1">
            <span className="material-symbols-rounded text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-black text-slate-900">{selectedShop?.rating || '4.9'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#f8f9fc] -mt-8 rounded-t-[40px] relative">
        <div className="px-6 pt-2 sticky top-[80px] z-40 bg-[#f8f9fc]/80 backdrop-blur-xl py-4 border-b border-slate-100">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {(selectedShop?.categories || [{ name: 'Destaques' }]).map((cat: any) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveMenuCategory(cat.name);
                  document.getElementById(cat.name)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeMenuCategory === cat.name ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 bg-white border border-slate-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pt-6 pb-32 space-y-12">
          {(selectedShop?.categories || [
            {
              name: 'Destaques', items: [
                { id: 1, name: 'Double Smash Burger', desc: 'Pão brioche, 2 blends de 100g, cheddar, bacon e molho especial.', price: 34.90 },
                { id: 2, name: 'Combo Classic', desc: 'Smash Burger + Fritas rústicas + Refrigerante Lata.', price: 42.50 },
                { id: 3, name: 'Fritas com Cheddar', desc: 'Porção de 300g com molho de cheddar e farofa de bacon.', price: 22.00 }
              ]
            }
          ]).map((category: any) => (
            <div key={category.name} id={category.name} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand-500 rounded-full shadow-[0_0_8px_#4ade80]"></div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.1em] text-sm">{category.name}</h3>
                </div>
                <span className="text-[10px] font-black text-slate-400">{category.items.length} ITENS</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {category.items.map((item: any, i: number) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 flex justify-between items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => {
                      setSelectedItem(item);
                      setTempQuantity(1);
                      setSubView('product_detail');
                    }}>
                      <h4 className="text-md font-black text-slate-900 tracking-tight">{item.name}</h4>
                      <p className="text-[11px] font-medium text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                      <p className="text-slate-900 font-black mt-3 text-lg tracking-tighter">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-slate-50 p-1.5 rounded-[22px] border border-slate-100 shadow-inner">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-11 h-11 rounded-[18px] bg-slate-900 text-white flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-black/10"
                      >
                        <span className="material-symbols-rounded">add</span>
                      </button>
                      {getItemCount(item.id) > 0 && (
                        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                          <span className="font-black text-slate-900 text-sm py-1">{getItemCount(item.id)}</span>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="w-11 h-11 rounded-[18px] bg-white text-slate-400 flex items-center justify-center active:scale-95 transition-all border border-slate-100"
                          >
                            <span className="material-symbols-rounded">remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSubView('checkout')}
            className="w-full bg-slate-900 text-white p-4 rounded-[28px] shadow-float flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <motion.div
                key={cart.length}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-white/20 rounded-[16px] flex items-center justify-center font-black"
              >
                {cart.length}
              </motion.div>
              <span className="font-bold">Ver Carrinho</span>
            </div>
            <span className="font-black text-lg">R$ {cart.reduce((a, b) => a + b.price, 0).toFixed(2).replace('.', ',')}</span>
          </motion.button>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => {
    const subtotal = cart.reduce((a, b) => a + b.price, 0);
    const taxa = 5.90;
    const total = subtotal + taxa;

    return (
      <div className="absolute inset-0 z-[60] bg-background flex flex-col hide-scrollbar overflow-y-auto">
        <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4">
          <button onClick={() => setSubView('restaurant_menu')} className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-soft active:scale-95 transition-transform text-slate-900 border border-slate-100">
            <span className="material-symbols-rounded text-xl text-slate-700">arrow_back</span>
            <span className="font-bold text-sm">Voltar</span>
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">Finalizar Pedido</h2>
        </header>

        <div className="p-6 space-y-6 flex-1">
          <div className="bg-white p-6 rounded-[32px] shadow-soft">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Seu Pedido</h3>
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-4">
                  <p className="font-bold text-slate-500 mb-4">Seu carrinho está vazio.</p>
                  <button onClick={() => setSubView('restaurant_menu')} className="text-brand-600 font-bold px-4 py-2 bg-brand-50 rounded-full">Voltar ao Cardápio</button>
                </div>
              ) : (
                Array.from(new Set(cart.map(i => i.id))).map((id, i) => {
                  const item = cart.find(i => i.id === id);
                  if (!item) return null;
                  const count = getItemCount(item.id);
                  return (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-600 bg-brand-50 w-8 h-8 flex items-center justify-center rounded-lg">{count}x</span>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-500">R$ {(item.price * count).toFixed(2).replace('.', ',')}</span>
                        <button onClick={() => {
                          handleRemoveFromCart(item.id);
                          if (cart.length === 1 && cart[0].id === item.id) setSubView('restaurant_menu');
                        }} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:scale-95">
                          <span className="material-symbols-rounded text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="w-full h-px bg-slate-100 my-4"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Taxa de Entrega</span>
                  <span className="font-bold text-slate-900">R$ {taxa.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="w-full h-px bg-slate-100 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-slate-900">Total</span>
                  <span className="text-xl font-black text-brand-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-soft">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Entregar em</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><span className="material-symbols-rounded">home</span></div>
              <div>
                <p className="font-black text-slate-900">Casa</p>
                <p className="text-sm font-bold text-slate-500">Rua Augusta, 45 - Consolação</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 pb-10">
          <button onClick={handlePlaceOrder} disabled={isLoading || cart.length === 0} className="w-full bg-brand-600 text-white font-black text-lg py-5 rounded-[28px] shadow-float active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2">
            {isLoading ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="flex flex-col h-full bg-background overflow-y-auto pb-32">
      <header className="px-6 py-8 glass-panel sticky top-0 z-20">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Meus Pedidos</h1>
      </header>
      <div className="px-6 py-4 space-y-4">
        {myOrders.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <span className="material-symbols-rounded text-6xl text-slate-400 mb-4">receipt_long</span>
            <p className="font-bold text-slate-500">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          myOrders.map((order, i) => (
            <div key={i} className="bg-white p-5 rounded-[28px] shadow-soft border border-slate-100 relative overflow-hidden">
              {order.status === 'pendente' || order.status === 'a_caminho' ? (
                <div className="absolute top-0 right-0 left-0 h-1 bg-brand-500 animate-pulse"></div>
              ) : null}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center"><span className="material-symbols-rounded">shopping_bag</span></div>
                  <div>
                    <h3 className="font-black text-slate-900">Pedido #{order.id.slice(0, 5)}</h3>
                    <p className="text-xs font-bold text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${order.status === 'pendente' ? 'bg-amber-100 text-amber-600' : order.status === 'a_caminho' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="font-bold text-slate-500">{order.delivery_address}</span>
                <span className="font-black text-slate-900">R$ {order.total_price}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col h-full bg-background overflow-y-auto pb-32">
      <header className="px-6 py-8 glass-panel sticky top-0 z-20">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Perfil</h1>
      </header>
      <div className="px-6 py-4">
        <div className="flex items-center gap-5 bg-white p-6 rounded-[32px] shadow-soft mb-8 border border-slate-50">
          <div className="w-16 h-16 rounded-full bg-slate-200 bg-cover bg-center border-2 border-white shadow-soft" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop')" }}></div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Cliente Delivery</h2>
            <p className="text-sm font-medium text-slate-500">{email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: 'location_on', label: 'Endereços Salvos', action: () => setSubView('addresses') },
            { icon: 'payment', label: 'Métodos de Pagamento', action: () => setSubView('payments') },
            { icon: 'help', label: 'Ajuda e Suporte', action: () => alert('Suporte ficará disponível em breve.') }
          ].map((item, i) => (
            <div key={i} onClick={item.action} className="flex items-center gap-4 bg-white p-5 rounded-[24px] shadow-soft cursor-pointer active:scale-95 transition-transform border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <span className="material-symbols-rounded text-slate-600">{item.icon}</span>
              </div>
              <span className="font-bold text-slate-800 flex-1">{item.label}</span>
              <span className="material-symbols-rounded text-slate-300">chevron_right</span>
            </div>
          ))}

          <button onClick={async () => { await supabase.auth.signOut(); setView('onboarding'); }} className="w-full mt-8 py-5 bg-red-50 text-red-500 border border-red-100 font-black rounded-[24px] shadow-soft active:scale-95 transition-transform uppercase tracking-widest text-sm">
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="absolute inset-0 z-40 bg-background flex flex-col hide-scrollbar overflow-y-auto">
      <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4 mb-4">
        <button onClick={() => setSubView('none')} className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-soft active:scale-95 transition-transform text-slate-900 border border-slate-100">
          <span className="material-symbols-rounded text-xl text-slate-700">arrow_back</span>
          <span className="font-bold text-sm">Voltar</span>
        </button>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">Meus Endereços</h2>
      </header>
      <div className="px-6 space-y-4">
        <div className="bg-white p-5 rounded-[28px] shadow-soft border-2 border-brand-500">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">Principal</span>
            <span className="material-symbols-rounded text-slate-400">more_vert</span>
          </div>
          <p className="font-black text-slate-900 text-lg mt-2">Casa</p>
          <p className="font-bold text-slate-500">Rua Augusta, 45 - Apto 12</p>
          <p className="font-bold text-slate-400 text-sm">Consolação, São Paulo - SP</p>
        </div>
        <button className="w-full bg-slate-100 text-slate-600 font-bold border border-slate-200 border-dashed py-5 rounded-[28px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-rounded">add</span> Adicionar Novo Endereço
        </button>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="absolute inset-0 z-40 bg-background flex flex-col hide-scrollbar overflow-y-auto">
      <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4 mb-4">
        <button onClick={() => setSubView('none')} className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-soft active:scale-95 transition-transform text-slate-900 border border-slate-100">
          <span className="material-symbols-rounded text-xl text-slate-700">arrow_back</span>
          <span className="font-bold text-sm">Voltar</span>
        </button>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">Pagamentos</h2>
      </header>
      <div className="px-6 space-y-4">
        <div className="bg-slate-900 p-6 rounded-[28px] shadow-float text-white relative overflow-hidden">
          <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/10 rounded-full blur-[40px]"></div>
          <div className="flex justify-between items-center mb-8">
            <span className="material-symbols-rounded text-4xl">credit_card</span>
            <span className="font-black tracking-widest uppercase opacity-50">Mastercard</span>
          </div>
          <p className="font-black text-xl tracking-[0.2em] mb-2">**** **** **** 4892</p>
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Validade</p>
              <p className="font-bold">12/28</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Titular</p>
              <p className="font-bold uppercase">Cliente Exemplo</p>
            </div>
          </div>
        </div>
        <button className="w-full bg-slate-100 text-slate-600 font-bold border border-slate-200 border-dashed py-5 rounded-[28px] flex items-center justify-center gap-2 active:scale-95 transition-transform mt-4">
          <span className="material-symbols-rounded">add</span> Adicionar Novo Cartão
        </button>
      </div>
    </div>
  );

  const renderActiveOrder = () => {
    if (!selectedItem) return null;
    const statusSteps = ['pendente', 'a_caminho', 'concluido'];
    const currentStepIndex = statusSteps.indexOf(selectedItem.status);

    return (
      <div className="absolute inset-0 z-[100] bg-[#F4F5F7] flex flex-col hide-scrollbar overflow-y-auto">
        {/* Map Header Simulation */}
        <div className="relative w-full h-[45vh] bg-slate-200 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center grayscale contrast-75 brightness-90 animate-slow-zoom"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F4F5F7]"></div>

          <button onClick={() => setSubView('none')} className="absolute top-8 left-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform text-slate-900">
            <span className="material-symbols-rounded">close</span>
          </button>

          {/* Simulated Markers */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Pulsing delivery path/point */}
              <div className="w-4 h-4 bg-brand-600 rounded-full animate-ping absolute"></div>
              <div className="w-4 h-4 bg-brand-600 rounded-full relative shadow-lg ring-4 ring-white"></div>
            </div>
          </div>
        </div>

        {/* Status Content */}
        <div className="flex-1 -mt-10 bg-[#F4F5F7] rounded-t-[40px] px-8 pt-10 pb-32 relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-8 opacity-30"></div>

          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2">{selectedItem.total_price > 10 && selectedItem.total_price < 25 ? 'Viagem em Tempo Real' : 'Pedido em Tempo Real'}</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Chega em -- min</h2>
            </div>
            <div className="bg-white p-3 rounded-[24px] shadow-soft border border-slate-100 flex items-center gap-3">
              <span className="material-symbols-rounded text-brand-600 text-3xl">
                {selectedItem.total_price === 12.5 ? 'motorcycle' : selectedItem.total_price === 22.0 ? 'directions_car' : 'restaurant'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-12">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIndex + 1) * 33.3}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between mt-4">
              {(selectedItem.total_price > 10 && selectedItem.total_price < 40 ? ['Solicitado', 'Confirmado', 'Em Curso', 'Finalizado'] : ['Recebido', 'Preparando', 'A Caminho', 'Entregue']).map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-soft transition-colors ${i <= currentStepIndex + 1 ? 'bg-brand-600' : 'bg-slate-300'}`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${i <= currentStepIndex + 1 ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-soft border border-slate-50 flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-100 rounded-[20px] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-lg text-slate-900">{selectedItem.driver_id ? 'José da Silva' : 'Buscando Entregador...'}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedItem.driver_id ? 'Honda CG 160 • ABC-1234' : 'Aguarde um momento'}</p>
            </div>
            {selectedItem.driver_id && (
              <button className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-soft">
                <span className="material-symbols-rounded">call</span>
              </button>
            )}
          </div>

          {/* Order Summary Summary */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-5 rounded-[24px] border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-rounded text-slate-400">location_on</span>
                <p className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{selectedItem.delivery_address}</p>
              </div>
              <span className="font-black text-slate-900 tracking-tighter">R$ {selectedItem.total_price}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductDetail = () => {
    if (!selectedItem) return null;
    return (
      <div className="absolute inset-0 z-[70] bg-background flex flex-col hide-scrollbar overflow-y-auto">
        <div className="relative w-full h-80 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <button onClick={() => setSubView('restaurant_menu')} className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-soft active:scale-95 transition-transform text-slate-900">
            <span className="material-symbols-rounded text-xl">arrow_back</span>
            <span className="font-bold text-sm">Voltar</span>
          </button>
        </div>

        <div className="flex-1 bg-background -mt-10 rounded-t-[40px] px-8 pt-10 pb-32 relative">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedItem.name}</h2>
          <p className="text-brand-600 text-xl font-black mt-3">R$ {selectedItem.price.toFixed(2).replace('.', ',')}</p>
          <p className="text-slate-500 font-medium text-lg mt-6 leading-relaxed">{selectedItem.desc}</p>

          <div className="mt-12 flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Selecione a quantidade</p>
            <div className="flex items-center gap-10">
              <button
                onClick={() => setTempQuantity(q => Math.max(1, q - 1))}
                className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-transform shadow-inner border border-slate-200"
              >
                <span className="material-symbols-rounded text-3xl">remove</span>
              </button>
              <span className="text-4xl font-black text-slate-900 min-w-10 text-center">{tempQuantity}</span>
              <button
                onClick={() => setTempQuantity(q => q + 1)}
                className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center active:scale-90 transition-transform shadow-soft border border-brand-100"
              >
                <span className="material-symbols-rounded text-3xl">add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-10 left-8 right-8 z-[80]">
          <button
            onClick={() => {
              const itemsToAdd = Array(tempQuantity).fill(selectedItem);
              setCart([...cart, ...itemsToAdd]);
              setSubView('restaurant_menu');
            }}
            className="w-full bg-brand-600 text-white p-6 rounded-[28px] shadow-float flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <span className="font-black text-lg">Adicionar</span>
            <span className="font-black text-xl bg-white/20 px-4 py-1 rounded-xl">R$ {(selectedItem.price * tempQuantity).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderTransitSelection = () => (
    <div className="absolute inset-0 z-[110] bg-background flex flex-col hide-scrollbar overflow-y-auto">
      <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4 mb-4">
        <button onClick={() => setSubView('none')} className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-soft active:scale-95 transition-transform text-slate-900 border border-slate-100">
          <span className="material-symbols-rounded text-xl text-slate-700">arrow_back</span>
          <span className="font-bold text-sm">Voltar</span>
        </button>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">Pedir {transitData.type === 'mototaxi' ? 'MotoTáxi' : 'Motorista'}</h2>
      </header>

      <div className="px-6 space-y-6 flex-1">
        {/* Destination Input Section */}
        <div className="bg-white p-6 rounded-[32px] shadow-soft space-y-4 border border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-rounded text-brand-600">my_location</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 mb-1">Origem</p>
              <input
                type="text"
                value={transitData.origin}
                onChange={e => setTransitData({ ...transitData, origin: e.target.value })}
                className="w-full bg-slate-50 border-none px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>
          <div className="h-px bg-slate-100 ml-14"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-rounded text-orange-600">location_on</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 mb-1">Destino</p>
              <input
                autoFocus
                type="text"
                placeholder="Para onde vamos?"
                value={transitData.destination}
                onChange={e => {
                  const dest = e.target.value;
                  const price = dest.length > 3 ? (transitData.type === 'mototaxi' ? 8.5 : 15.0) + (dest.length * 0.5) : 0;
                  setTransitData({ ...transitData, destination: dest, estPrice: price });
                }}
                className="w-full bg-slate-50 border-none px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Opções Disponíveis</h3>

          <div
            onClick={() => setTransitData({ ...transitData, type: 'mototaxi' })}
            className={`p-5 rounded-[32px] border-2 transition-all flex items-center gap-4 cursor-pointer active:scale-[0.98] ${transitData.type === 'mototaxi' ? 'bg-white border-brand-500 shadow-float' : 'bg-white border-transparent shadow-soft opacity-60'}`}
          >
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
              <span className="material-symbols-rounded text-4xl">motorcycle</span>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 text-base">MotoTáxi</h4>
              <p className="text-[11px] font-bold text-slate-500 italic">Chega em 3 min • Rápido</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">R$ 12,50</p>
            </div>
          </div>

          <div
            onClick={() => setTransitData({ ...transitData, type: 'carro' })}
            className={`p-5 rounded-[32px] border-2 transition-all flex items-center gap-4 cursor-pointer active:scale-[0.98] ${transitData.type === 'carro' ? 'bg-white border-indigo-500 shadow-float' : 'bg-white border-transparent shadow-soft opacity-60'}`}
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <span className="material-symbols-rounded text-4xl">directions_car</span>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 text-base">Particular Carro</h4>
              <p className="text-[11px] font-bold text-slate-500 italic">Chega em 6 min • Conforto</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">R$ 22,00</p>
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 cursor-pointer" onClick={() => setTransitData({ ...transitData, destination: 'Shopping Center' })}>
            <span className="material-symbols-rounded text-slate-400 text-lg mb-2">mall</span>
            <p className="text-[10px] font-black uppercase text-slate-500">Shopping</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 cursor-pointer" onClick={() => setTransitData({ ...transitData, destination: 'Parque Ibirapuera' })}>
            <span className="material-symbols-rounded text-slate-400 text-lg mb-2">park</span>
            <p className="text-[10px] font-black uppercase text-slate-500">Parque</p>
          </div>
        </div>
      </div>

      <div className="p-6 pb-12 bg-white/80 backdrop-blur-md border-t border-slate-100 mt-auto">
        <button
          disabled={!transitData.destination || isLoading}
          onClick={handleRequestTransit}
          className="w-full bg-slate-900 text-white font-black text-lg py-5 rounded-[28px] shadow-float active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex justify-center items-center gap-3"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {transitData.destination ? `Confirmar ${transitData.type === 'mototaxi' ? 'Moto' : 'Carro'}` : 'Informe o Destino'}
              <span className="material-symbols-rounded">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-8 left-6 right-6 z-30">
      <div className="glass-panel flex justify-around items-center px-4 py-3 rounded-full shadow-float border border-white/40 relative">
        {/* Active Tab Background Indicator */}
        <motion.div
          className="absolute h-12 rounded-full bg-brand-600/10 border border-brand-600/10 pointer-events-none"
          initial={false}
          animate={{
            x: tab === 'home' ? '-115%' : tab === 'orders' ? '0%' : '115%',
            width: '28%'
          }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />

        {[
          { id: 'home', icon: 'home', label: 'Início', action: () => { setTab('home'); setSubView('none'); } },
          { id: 'orders', icon: 'receipt_long', label: 'Pedidos', action: () => { setTab('orders'); setSubView('none'); } },
          { id: 'profile', icon: 'person', label: 'Perfil', action: () => { setTab('profile'); setSubView('none'); } },
        ].map((item: any) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`flex flex-col items-center justify-center w-24 h-12 relative z-10 transition-colors duration-300 ${tab === item.id ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <motion.span
              whileTap={{ scale: 1.2 }}
              className="material-symbols-rounded"
              style={{ fontVariationSettings: tab === item.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </motion.span>
            {tab === item.id && (
              <motion.span
                layoutId="activeTabLabel"
                className="text-[9px] font-black uppercase tracking-[0.1em] mt-1"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-[100dvh] bg-background font-sans overflow-hidden relative">
      <AnimatePresence mode="wait">
        {view === 'onboarding' && <motion.div key="onb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><div className="h-full">{renderOnboarding()}</div></motion.div>}
        {view === 'login' && <motion.div key="log" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="h-full"><div className="h-full">{renderLogin()}</div></motion.div>}
        {view === 'app' && (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full relative">
            {tab === 'home' && renderHome()}
            {tab === 'orders' && renderOrders()}
            {tab === 'profile' && renderProfile()}

            {/* Sub Views */}
            <AnimatePresence>
              {subView === 'generic_list' && <motion.div key="glist" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderGenericList()}</motion.div>}
              {subView === 'restaurant_list' && <motion.div key="rlist" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderRestaurantList()}</motion.div>}
              {subView === 'restaurant_menu' && <motion.div key="rmenu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-50">{renderRestaurantMenu()}</motion.div>}
              {subView === 'product_detail' && <motion.div key="pdetail" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-[70]">{renderProductDetail()}</motion.div>}
              {subView === 'checkout' && <motion.div key="check" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-[60]">{renderCheckout()}</motion.div>}
              {subView === 'addresses' && <motion.div key="address" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderAddresses()}</motion.div>}
              {subView === 'payments' && <motion.div key="pay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderPayments()}</motion.div>}
              {subView === 'transit_selection' && <motion.div key="transit" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-[110]">{renderTransitSelection()}</motion.div>}
              {subView === 'active_order' && <motion.div key="aorder" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-[100]">{renderActiveOrder()}</motion.div>}
            </AnimatePresence>

            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
