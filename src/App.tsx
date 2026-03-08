import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';

function App() {
  const [view, setView] = useState<'onboarding' | 'login' | 'app'>('onboarding');
  const [tab, setTab] = useState<'home' | 'orders' | 'profile'>('home');
  const [subView, setSubView] = useState<'none' | 'restaurant_list' | 'restaurant_menu' | 'product_detail' | 'checkout' | 'active_order' | 'addresses' | 'payments'>('none');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  const [email, setEmail] = useState('cliente@exemplo.com');
  const [password, setPassword] = useState('senha123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');

  const [activeDrivers, setActiveDrivers] = useState(0);
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

  const renderHome = () => (
    <div className="flex flex-col h-full bg-background overflow-y-auto hide-scrollbar pb-32">
      <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Entregar em</p>
            <div className="flex items-center gap-1 cursor-pointer">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Casa • Rua Augusta, 45</h3>
              <span className="material-symbols-rounded text-slate-400">keyboard_arrow_down</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform">
            <span className="material-symbols-rounded text-slate-600" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
        <div className="relative">
          <span className="material-symbols-rounded absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input type="text" placeholder="Pratos, restaurantes..." className="w-full pl-14 pr-6 py-4 bg-white/60 border border-white rounded-[24px] shadow-soft focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400" />
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Active Order Tracking Widget */}
        {myOrders.find(o => o.status !== 'concluido') && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              setSelectedItem(myOrders.find(o => o.status !== 'concluido'));
              setSubView('active_order');
            }}
            className="bg-brand-600 rounded-[32px] p-5 flex items-center gap-4 shadow-float cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-rounded text-white animate-bounce">local_shipping</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Pedido em andamento</p>
              <h4 className="text-white font-black text-lg tracking-tight">Rastrear Entrega ⚡</h4>
            </div>
            <span className="material-symbols-rounded text-white/40">chevron_right</span>
          </motion.div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: 'restaurant', label: 'Comida', color: 'bg-orange-100 text-orange-600', action: () => setSubView('restaurant_list') },
            { icon: 'shopping_cart', label: 'Mercado', color: 'bg-brand-100 text-brand-600' },
            { icon: 'medication', label: 'Farmácia', color: 'bg-blue-100 text-blue-600' },
            { icon: 'package_2', label: 'Envios', color: 'bg-purple-100 text-purple-600' },
          ].map((cat, i) => (
            <div key={i} onClick={cat.action} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className={`w-[72px] h-[72px] rounded-[24px] flex items-center justify-center ${cat.color} shadow-soft`}>
                <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
              </div>
              <span className="text-xs font-bold text-slate-700">{cat.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-slate-900 rounded-[32px] p-6 relative overflow-hidden shadow-float cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSubView('restaurant_list')}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-brand-500/30 rounded-full blur-[40px]"></div>
          <h3 className="text-brand-400 font-bold text-xs uppercase tracking-widest mb-2">Especial de Hoje</h3>
          <h2 className="text-white text-2xl font-black leading-tight mb-4 max-w-[200px]">Peça e ganhe<br />Frete Grátis</h2>
          <button className="bg-white text-slate-900 font-bold text-sm px-6 py-2.5 rounded-full pointer-events-none">Fazer Pedido</button>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">Entregadores na Região</h3>
          <div className="w-full h-48 bg-slate-200 rounded-[32px] relative overflow-hidden shadow-soft border border-white">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shadow-[0_0_8px_#4ade80]"></div>
                <span className="text-xs font-bold text-slate-800">{activeDrivers} online agora perto de você</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestaurantList = () => {
    const filters = ['Todos', 'Entrega Grátis', 'Mais Rápidos', 'Top Avaliados'];

    const restaurants = [
      { tag: 'Lanches', name: 'Burger Premium', rating: '4.9', time: '30-40 min', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop', freeDelivery: true, ratingVal: 4.9, timeVal: 35 },
      { tag: 'Japonesa', name: 'Sushi House', rating: '4.7', time: '40-50 min', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop', freeDelivery: false, ratingVal: 4.7, timeVal: 45 },
      { tag: 'Pizza', name: 'Nossa Pizza', rating: '4.5', time: '20-30 min', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop', freeDelivery: true, ratingVal: 4.5, timeVal: 25 }
    ];

    const filteredRestaurants = restaurants.filter(r => {
      if (activeFilter === 'Todos') return true;
      if (activeFilter === 'Entrega Grátis') return r.freeDelivery;
      if (activeFilter === 'Mais Rápidos') return r.timeVal <= 35;
      if (activeFilter === 'Top Avaliados') return r.ratingVal >= 4.7;
      return true;
    });

    return (
      <div className="absolute inset-0 z-40 bg-background flex flex-col hide-scrollbar overflow-y-auto pb-6">
        <header className="px-6 py-6 sticky top-0 z-20 glass-panel border-b-0 rounded-b-[40px] flex items-center justify-between gap-4">
          <button onClick={() => setSubView('none')} className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-soft active:scale-95 transition-transform text-slate-900 border border-slate-100">
            <span className="material-symbols-rounded text-xl text-slate-700">arrow_back</span>
            <span className="font-bold text-sm">Voltar</span>
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex-1 text-right">Restaurantes</h2>
        </header>

        {/* Smart Filters Bar */}
        <div className="px-6 mb-6">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => {
                  setLoadingRestaurants(true);
                  setActiveFilter(f);
                  setTimeout(() => setLoadingRestaurants(false), 800);
                }}
                className={`whitespace-now80 px-5 py-2.5 rounded-full text-xs font-black transition-all border ${activeFilter === f ? 'bg-brand-600 text-white border-brand-600 shadow-float' : 'bg-white text-slate-500 border-slate-100'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 space-y-4">
          {loadingRestaurants ? (
            // Skeleton Screens
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-soft animate-pulse">
                <div className="w-24 h-24 rounded-[24px] bg-slate-100"></div>
                <div className="flex-1 space-y-3">
                  <div className="w-20 h-4 bg-slate-100 rounded-full"></div>
                  <div className="w-40 h-6 bg-slate-100 rounded-full"></div>
                  <div className="w-32 h-4 bg-slate-100 rounded-full"></div>
                </div>
              </div>
            ))
          ) : (
            filteredRestaurants.map((rest, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i}
                onClick={() => setSubView('restaurant_menu')}
                className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-soft cursor-pointer active:scale-95 transition-transform border border-transparent hover:border-brand-500/20"
              >
                <div className="w-24 h-24 rounded-[24px] bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url('${rest.img}')` }}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{rest.tag}</span>
                    {rest.freeDelivery && <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Entrega Grátis</span>}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-2">{rest.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-amber-500"><span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>{rest.rating}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-rounded text-base">schedule</span>{rest.time}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {!loadingRestaurants && filteredRestaurants.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <span className="material-symbols-rounded text-5xl mb-4">search_off</span>
              <p className="font-bold">Nenhum restaurante encontrado.</p>
            </div>
          )}
        </div>
      </div>
    );
  };


  const renderRestaurantMenu = () => (
    <div className="absolute inset-0 z-50 bg-background flex flex-col hide-scrollbar overflow-y-auto">
      {/* Sticky Header with Back Button */}
      <header className="fixed top-0 left-0 right-0 z-[60] px-6 py-6 pointer-events-none">
        <button
          onClick={() => setSubView('restaurant_list')}
          className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg active:scale-95 transition-transform text-slate-900 border border-white/50"
        >
          <span className="material-symbols-rounded text-xl">arrow_back</span>
          <span className="font-bold text-sm">Voltar</span>
        </button>
      </header>

      <div className="relative w-full h-64 bg-cover bg-center shrink-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
      </div>

      <div className="flex-1 bg-background -mt-10 rounded-t-[40px] px-6 pt-8 pb-32 relative">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Burger Premium</h2>
        <p className="text-slate-500 font-bold mt-1">Lanches artesanais e bebidas.</p>

        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-black text-slate-900 mb-4">Populares</h3>
          {[
            { id: 1, name: 'Double Smash Burger', desc: 'Pão brioche, 2 blends de 100g, cheddar, bacon e molho especial.', price: 34.90 },
            { id: 2, name: 'Combo Classic', desc: 'Smash Burger + Fritas rústicas + Refrigerante Lata.', price: 42.50 },
            { id: 3, name: 'Fritas com Cheddar', desc: 'Porção de 300g com molho de cheddar e farofa de bacon.', price: 22.00 }
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-[28px] shadow-soft border border-slate-100 flex justify-between items-center gap-4">
              <div className="flex-1 cursor-pointer" onClick={() => {
                setSelectedItem(item);
                setTempQuantity(1);
                setSubView('product_detail');
              }}>
                <h4 className="text-base font-black text-slate-900">{item.name}</h4>
                <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                <p className="text-brand-600 font-black mt-2">R$ {item.price.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full border border-slate-100">
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  disabled={getItemCount(item.id) === 0}
                  className="w-10 h-10 rounded-full bg-white text-slate-400 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 shadow-soft"
                >
                  <span className="material-symbols-rounded">remove</span>
                </button>
                <span className="font-black text-slate-900 w-4 text-center">{getItemCount(item.id)}</span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center active:scale-95 transition-transform shadow-soft"
                >
                  <span className="material-symbols-rounded">add</span>
                </button>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2">Pedido em Tempo Real</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Chega em -- min</h2>
            </div>
            <div className="bg-white p-3 rounded-[24px] shadow-soft border border-slate-100 flex items-center gap-3">
              <span className="material-symbols-rounded text-brand-600 text-3xl">restaurant</span>
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
              {['Recebido', 'Preparando', 'A Caminho', 'Entregue'].map((step, i) => (
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

  const BottomNav = () => (
    <div className="fixed bottom-6 left-6 right-6 z-30">
      <div className="glass-panel flex justify-around items-center px-2 py-2 rounded-full shadow-float border border-white/40">
        {[
          { id: 'home', icon: 'home', label: 'Início', action: () => { setTab('home'); setSubView('none'); } },
          { id: 'orders', icon: 'receipt_long', label: 'Pedidos', action: () => { setTab('orders'); setSubView('none'); } },
          { id: 'profile', icon: 'person', label: 'Perfil', action: () => { setTab('profile'); setSubView('none'); } },
        ].map((item: any) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`flex flex-col items-center justify-center w-20 h-16 rounded-full transition-all duration-300 ${tab === item.id ? 'bg-white shadow-soft scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className={`material-symbols-rounded ${tab === item.id ? 'text-brand-600' : ''}`} style={{ fontVariationSettings: tab === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            {tab === item.id && <span className="text-[10px] font-bold text-slate-900 mt-1">{item.label}</span>}
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
              {subView === 'restaurant_list' && <motion.div key="rlist" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderRestaurantList()}</motion.div>}
              {subView === 'restaurant_menu' && <motion.div key="rmenu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-50">{renderRestaurantMenu()}</motion.div>}
              {subView === 'product_detail' && <motion.div key="pdetail" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-[70]">{renderProductDetail()}</motion.div>}
              {subView === 'checkout' && <motion.div key="check" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-[60]">{renderCheckout()}</motion.div>}
              {subView === 'addresses' && <motion.div key="address" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderAddresses()}</motion.div>}
              {subView === 'payments' && <motion.div key="pay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="absolute inset-0 z-40">{renderPayments()}</motion.div>}
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
