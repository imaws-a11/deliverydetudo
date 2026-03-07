import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  | 'driver_confirmation' | 'pet_shop' | 'food_categories' | 'notifications';

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
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Hero Illustration Section */}
        <div className="w-full pt-8 px-4">
          <div className="relative">
            <div
              className="w-full bg-primary/10 dark:bg-primary/5 bg-center bg-no-repeat bg-contain flex flex-col justify-end overflow-hidden rounded-3xl min-h-[400px] relative z-10 shadow-inner"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvv17iTA97MO5UL0aTkrkrr96hmtrKbZjk9saKHn-0xQFx4SVJfzOJQ_u8MdBo-A12J6elggJPh5jQxWxYBDl1uT2422uJw-aPMoGrYIKlN9YD4uVeuIlGMdyzUAJ2Q1djKUDF_0HcNLY72gxXyIB9Qa6YfqPyO2hr85Oambfk3nu8iyMcbZIzS1XEAtNDb9gcG2Uf2D3x7UhCbDjD8H7HB5CyhQvqMA27hnMizc_7NA2I70IjZlx0tCUbsCgW7JcEzbhmi8jmQpfe')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent dark:from-background-dark"></div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 justify-between px-6 pb-12 pt-8">
          <div>
            <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[36px] font-extrabold leading-tight text-center pb-4 font-display">
              Tudo o que você precisa, <span className="text-primary">onde você estiver.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed text-center px-2 font-display">
              Peça comida, mercado, farmácia e muito mais sem sair de casa. A entrega mais rápida da cidade está a um toque.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Pagination Indicators */}
            <div className="flex w-full flex-row items-center justify-center gap-2">
              <div className="h-2 w-8 rounded-full bg-primary"></div>
              <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setCurrentView('login')}
                className="flex min-w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-16 px-5 bg-primary text-slate-900 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-display"
              >
                <span className="truncate">Começar Agora</span>
                <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="flex min-w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-14 px-5 bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base font-semibold font-display active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
              >
                <span className="truncate">Já tenho uma conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 -z-10"></div>
    </div>
  );

  const renderLogin = () => (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Top App Bar */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
          <div
            className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer active:scale-90 transition-transform"
            onClick={() => setCurrentView('onboarding')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Bem-vindo de volta</h2>
        </div>

        {/* Hero Illustration */}
        <div className="px-4 py-3">
          <div
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-2xl min-h-[240px] shadow-lg"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBr8wZYr3WlQfqAe8DOvPVYW8yDdMBD67anE78aHoEhZCQ0GMvZ0GZKHmlXO8jiTGUbeLl1SoRCjC9uXJfQb1ntrIS2Kj5wWYXGF4VJWS6q-4n3Fsqk-XfBfiVjGc4pwoAbthD7Dz7nt5COse7c6EaoPwwbBz6qSRiw_EL6Yd_8fsA4t6LbdqLyJSq0IKQYHx92zwoiXtsUhzYvZckARhMe-xOJE46fc5R1qFX6JQSZ9d_ID-UPhnMSl0xxxUtnG2FJdC3_u5Qsk2Q3')" }}
          >
          </div>
        </div>

        {/* Title Section */}
        <div className="px-6 pt-8 pb-2 text-center">
          <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight font-display">Pronto para sua próxima entrega?</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-display">Faça login para começar a acompanhar seus pedidos</p>
        </div>

        {/* Login Form */}
        <div className="flex flex-col gap-4 px-6 py-4 w-full">
          <label className="flex flex-col w-full text-left">
            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-2 font-display">E-mail</p>
            <input
              className="flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 px-4 text-base transition-all font-display"
              placeholder="ricardo.oliveira@email.com"
              type="email"
              defaultValue="ricardo.oliveira@email.com"
            />
          </label>
          <label className="flex flex-col w-full text-left">
            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-2 font-display">Senha</p>
            <div className="relative flex w-full items-stretch">
              <input
                className="flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 px-4 text-base transition-all font-display"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                defaultValue="password123"
              />
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </div>
            </div>
          </label>
          <div className="flex justify-end">
            <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary active:scale-95 transition-transform font-display">Esqueceu a senha?</button>
          </div>
          <button
            onClick={() => setCurrentView('app')}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl h-14 bg-primary text-slate-900 text-base font-bold leading-normal tracking-[0.015em] transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-primary/20 font-display"
          >
            Entrar
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center px-6 py-4 w-full">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="px-4 text-sm text-slate-400 font-medium font-display">ou continue com</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 px-6 pb-6 w-full">
          <button className="flex w-full items-center justify-center gap-3 rounded-xl h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all shadow-sm font-display">
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            Google
          </button>
          <button className="flex w-full items-center justify-center gap-3 rounded-xl h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all shadow-sm font-display">
            <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
              <path d="M17.05 20.28c-.96.95-2.24 1.48-3.55 1.48-1.54 0-2.88-.47-3.95-1.1-1.07-.63-2.06-1.57-2.92-2.76C5.03 15.65 4 13.56 4 11.45c0-2.11 1.03-4.2 2.63-5.5 1.6-1.31 3.61-1.8 5.61-1.42.45.08.88.24 1.28.47 1.11.63 1.94 1.35 2.53 1.35.59 0 1.42-.72 2.53-1.35.4-.23.83-.39 1.28-.47 2-.38 4.01.11 5.61 1.42 1.6 1.3 2.63 3.39 2.63 5.5 0 2.11-1.03 4.2-2.63 6.41-.86 1.19-1.85 2.13-2.92 2.76-1.07.63-2.41 1.1-3.95 1.1-1.31 0-2.59-.53-3.55-1.48L17.05 20.28zM14.5 1.5c.08 1.15-.36 2.29-1.22 3.14-.86.85-2.03 1.32-3.21 1.25-.08-1.15.36-2.29 1.22-3.14.86-.85 2.03-1.32 3.21-1.25z"></path>
            </svg>
            Apple
          </button>
        </div>

        {/* Sign Up CTA */}
        <div className="mt-auto pb-10 px-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 font-display">
            Não tem uma conta? <button className="text-slate-900 dark:text-slate-100 font-bold hover:underline ml-1 active:scale-95 transition-transform">Criar uma conta</button>
          </p>
        </div>
      </div>
    </div>
  );



  const renderHome = () => (
    <>
      <header className="p-4 space-y-4 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-slate-900 font-bold shadow-sm cursor-pointer active:scale-90 transition-transform bg-center bg-cover border-2 border-primary"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1kK06avEJV3GlHT9jYD09fWkHVZdK7zkHeHYogAjmBCqXwyB_Ygnp3VZ9juLgAqaSvGhvLzQon1d7E9tLz_5kVT7CIf_s7qK74PPyuFi4HGrlcx85SrJRMc3UvL-oBQ1GoxCcS-T0sYZ-XkHgn_gvv1HOP66lHmV8hDOtsFJkcWIz1OCMuAhRW6lBogvrB61Ss0xec2nTU124JXBhsR9bdk4ClV3OzNeDDbn4Z1bMcDbGnPQ-fG-Vr9-PzNYb-NYt0MQiw1TsAYN7')" }}
              onClick={() => setActiveTab('profile')}
            >
            </div>
            <div className="cursor-pointer group" onClick={() => setCurrentView('mototaxi_request')}>
              <p className="text-xs text-left text-slate-500 dark:text-slate-400 font-medium font-display">Entregar em</p>
              <div className="flex items-center gap-1 font-display">
                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                <span className="text-sm font-bold truncate max-w-[150px] group-hover:text-primary transition-colors">{selectedAddress}</span>
                <span className="material-symbols-outlined text-slate-400 text-sm group-hover:rotate-180 transition-transform">keyboard_arrow_down</span>
              </div>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center relative active:scale-90 transition-transform"
            onClick={() => {
              setNotifications(0);
              setCurrentView('notifications');
            }}
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-100">notifications</span>
            {notifications > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 transition-all focus:bg-white dark:focus:bg-slate-700 font-display"
            placeholder="Buscar comida, pacotes ou viagens"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Promo Banner */}
        <div className="px-4 py-4">
          <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-primary group transition-transform active:scale-95 cursor-pointer shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10 flex flex-col justify-center p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800/60 mb-1 text-left font-display">OFERTA EXCLUSIVA</span>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2 text-left font-display">50% de DESCONTO<br />na primeira entrega</h3>
              <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg w-fit font-display shadow-lg active:scale-90">Pedir Agora</button>
            </div>
            <div
              className="absolute right-0 top-0 h-full w-1/2 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZB0CdGjfU8bpvW6uolaEBu_Mv5k_x5dq7R7YXXWaxHFTcnnGO4yX1aTFm2enEa2HgxastRZdHYrJDrZIk9bmHcyNhZTy5PtkfMp0npTOJGYhV-W5xu8hmv8di_KbuAQJ1SvtGs6i-dc9mtNTyirG0H0xToGQ6Zne-8AQoarR87pNzGt_nGejvWUwpWjyEzsnBISgv8iegRwVlbZtmpsVSKCZA75L92c2EWTnCN1TGQRzbhtoyrmPttI8BzqE5StCd3gBv62NgiB1H')" }}
            >
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="px-4 pt-4">
          <h2 className="text-lg font-bold mb-4 text-left font-display">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Nossos Serviços'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {filteredServices.length > 0 ? (
              filteredServices.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary active:scale-95 transition-all cursor-pointer shadow-sm"
                  onClick={() => {
                    if (item.id === 'mototaxi') {
                      setCurrentView('mototaxi_request');
                    } else if (item.id === 'pet') {
                      setCurrentView('pet_shop');
                    } else if (item.id === 'entrega' || item.id === 'mercado') {
                      setActiveService(item);
                      setCurrentView('food_categories');
                    } else {
                      setActiveService(item);
                      setCurrentView('shipping_details');
                    }
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.gray ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/20'}`}>
                    <span className={`material-symbols-outlined text-2xl ${item.gray ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-primary'}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-center font-display">{item.label}</span>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center text-slate-500 font-display">
                Nenhum serviço encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display">Atividade Recente</h2>
            <button className="text-xs font-bold text-primary font-display" onClick={() => setActiveTab('history')}>Ver tudo</button>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.slice(0, 2).map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900/50 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${activity.iconColor}`}>{activity.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-bold font-display">{activity.title}</h4>
                  <p className="text-xs text-slate-500 font-display">{activity.subtitle}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 font-display">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Map Peek */}
        <div className="px-4 mt-8 pb-8">
          <div className="h-32 w-full rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 group cursor-pointer shadow-md">
            <div
              className="absolute inset-0 bg-slate-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDsPsvjf9cEz7PLbRX-NgcK1gs2aH4Fm3yNAT9l-nA-Crj3zdI2iJQy66cBbx6SUkWJdwgrUE7yj4ICJp3fQChmgvsi8GcUojV9Cm7nk9vmlx4Yg9IlGDnK0WTaLgNKdBHFFXwzACR1xiLygDP8IJ1r2bDM1g7LMfwViCXZB2P5dLGsNtbAcOuQvaQPaEAjh_wKyZ2c1-Jl3Ax1RpEM_ep9wA8UeaAk7qGqqOcKI91D3Au-3UInYqY2nMmThGc9Jc-w9DY38kbrvDc')" }}
            ></div>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform transition-transform group-hover:scale-105">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-display">12 Motoristas por perto</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );

  const renderProfile = () => (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background-dark pb-24">
      {/* Top Bar */}
      <div className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer active:scale-95 transition-transform"
          onClick={() => setActiveTab('home')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display">Perfil</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">settings</span>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex p-6">
        <div className="flex w-full flex-col gap-4 items-center">
          <div className="flex gap-4 flex-col items-center">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-primary shadow-lg transition-transform hover:scale-105"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1kK06avEJV3GlHT9jYD09fWkHVZdK7zkHeHYogAjmBCqXwyB_Ygnp3VZ9juLgAqaSvGhvLzQon1d7E9tLz_5kVT7CIf_s7qK74PPyuFi4HGrlcx85SrJRMc3UvL-oBQ1GoxCcS-T0sYZ-XkHgn_gvv1HOP66lHmV8hDOtsFJkcWIz1OCMuAhRW6lBogvrB61Ss0xec2nTU124JXBhsR9bdk4ClV3OzNeDDbn4Z1bMcDbGnPQ-fG-Vr9-PzNYb-NYt0MQiw1TsAYN7')" }}
              >
              </div>
              <div className="absolute bottom-1 right-1 bg-primary text-slate-900 p-1.5 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-sm font-bold">edit</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight tracking-tight text-center font-display">Ricardo Oliveira</p>
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-normal text-center font-display">ricardo.oliveira@email.com</p>
              <div className="flex items-center gap-1 mt-1 bg-primary/10 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-primary text-sm fill-1">star</span>
                <p className="text-slate-800 dark:text-slate-200 text-sm font-bold leading-normal text-center font-display">4.9</p>
                <span className="text-slate-400 text-xs font-normal ml-1 font-display">• 124 pedidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="flex-1 px-4 overflow-y-auto">
        {/* Account Section */}
        <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest pb-3 pt-6 px-2 font-display">Minha Conta</h3>
        <div className="space-y-1">
          {[
            { icon: 'person', label: 'Meus Dados' },
            { icon: 'payments', label: 'Métodos de Pagamento' },
            { icon: 'location_on', label: 'Endereços Salvos' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group shadow-sm mb-1">
              <div className="text-slate-900 dark:text-slate-100 flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
                <span className="material-symbols-outlined text-slate-800 dark:text-primary">{item.icon}</span>
              </div>
              <p className="text-slate-900 dark:text-slate-100 text-base font-semibold flex-1 font-display">{item.label}</p>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          ))}
        </div>

        {/* Perks & History Section */}
        <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest pb-3 pt-8 px-2 font-display">Atividades e Promoções</h3>
        <div className="space-y-1">
          {[
            { icon: 'confirmation_number', label: 'Cupons e Promoções' },
            { icon: 'history', label: 'Histórico de Pedidos', onClick: () => setActiveTab('history') },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group shadow-sm mb-1"
            >
              <div className="text-slate-900 dark:text-slate-100 flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
                <span className="material-symbols-outlined text-slate-800 dark:text-primary">{item.icon}</span>
              </div>
              <p className="text-slate-900 dark:text-slate-100 text-base font-semibold flex-1 font-display">{item.label}</p>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          ))}
        </div>

        {/* Support & Settings Section */}
        <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest pb-3 pt-8 px-2 font-display">Geral</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group shadow-sm mb-1">
            <div className="text-slate-900 dark:text-slate-100 flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
              <span className="material-symbols-outlined text-slate-800 dark:text-primary">help</span>
            </div>
            <p className="text-slate-900 dark:text-slate-100 text-base font-semibold flex-1 font-display">Ajuda e Suporte</p>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>
          <div
            className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group shadow-sm"
            onClick={() => {
              alert('Fazendo logout...');
              setCurrentView('onboarding');
            }}
          >
            <div className="text-red-500 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0 size-10">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <p className="text-red-500 text-base font-semibold flex-1 font-display">Sair da conta</p>
          </div>
        </div>

        <div className="mt-8 mb-4 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-slate-400 text-xs font-display">Versão 4.12.0 (Build 342)</p>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="px-4 pt-4 space-y-4 min-h-screen bg-slate-50 dark:bg-background-dark pb-32 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setActiveTab('profile')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold text-left font-display">Histórico de Pedidos</h2>
      </div>
      <div className="space-y-4 flex-1">
        {RECENT_ACTIVITY.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-transform active:scale-[0.98]">
            <div className={`w-12 h-12 rounded-xl ${activity.bgColor} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-2xl ${activity.iconColor}`}>{activity.icon}</span>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-slate-900 dark:text-white font-display">{activity.title}</h4>
              <p className="text-sm text-slate-500 font-display">{activity.subtitle}</p>
              <p className="text-xs text-slate-400 mt-1 font-display">{activity.time}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          </div>
        ))}
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

  const renderSearch = () => (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32">
      <header className="p-4 bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            autoFocus
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 font-display transition-all"
            placeholder="O que você está procurando?"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        {!searchQuery && (
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Buscas Recentes</h3>
            <div className="flex flex-wrap gap-2">
              {['Hambúrguer', 'Remédios', 'Documentos', 'Mercado'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">history</span>
                  {term}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Categorias Populares</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'express', label: 'Expressas', color: 'bg-yellow-500/10 text-yellow-600', icon: 'bolt' },
              { id: 'food', label: 'Comida', color: 'bg-red-500/10 text-red-600', icon: 'restaurant' },
              { id: 'packages', label: 'Pacotes', color: 'bg-blue-500/10 text-blue-600', icon: 'package' },
              { id: 'health', label: 'Saúde', color: 'bg-green-500/10 text-green-600', icon: 'medical_services' },
            ].map((cat) => (
              <button
                key={cat.id}
                className={`flex flex-col p-5 rounded-3xl ${cat.color} border border-transparent hover:border-current transition-all text-left space-y-3 group`}
              >
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-black text-lg tracking-tight uppercase">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {searchQuery && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Principais Resultados</h3>
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all cursor-pointer"
                  onClick={() => {
                    setActiveService(service);
                    setCurrentView('shipping_details');
                  }}
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{service.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">{service.label}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Disponível agora na sua região</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );

  const renderOrders = () => {
    const ACTIVE_ORDERS = [
      { id: 'ORD-1029', status: 'Em preparo', item: 'Hambúrguer Gourmet', store: 'Burger King', progress: 45, icon: 'restaurant' },
      { id: 'ORD-8829', status: 'Motorista a caminho', item: 'Entrega de Documentos', store: 'Minha Localização', progress: 75, icon: 'bolt' },
    ];

    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark pb-32">
        <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Meus Pedidos</h2>
        </header>

        <main className="flex-1 p-4 space-y-8 overflow-y-auto">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Pedidos em Andamento</h3>
            <div className="space-y-4">
              {ACTIVE_ORDERS.map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-800 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-md space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">{order.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{order.store}</h4>
                        <p className="text-xs text-slate-500 font-bold">{order.item}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/10 rounded-md uppercase tracking-wider">{order.status}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Acompanhamento</span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">{order.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${order.progress}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-slate-900 transition-all border border-slate-100 dark:border-slate-800">
                    Rastrear Pedido
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Histórico</h3>
              <button onClick={() => setActiveTab('history')} className="text-[10px] font-black text-primary uppercase border-b-2 border-primary/20">Ver Completo</button>
            </div>
            <div className="space-y-2">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl ${activity.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-xl ${activity.iconColor}`}>{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{activity.time} • R$ {Math.floor(Math.random() * 50 + 20)},00</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-all">chevron_right</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  };

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
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark font-display">
      <header className="flex items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button className="p-2" onClick={() => setCurrentView('app')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Notificações</h2>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {[
          { title: 'Promoção Relâmpago ⚡', text: '50% OFF em entregas de mercado hoje!', time: 'Agora', icon: 'bolt', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
          { title: 'Viagem Concluída', text: 'Sua viagem com Ricardo foi finalizada.', time: '2h atrás', icon: 'check_circle', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
          { title: 'Novo Método de Pagamento', text: 'PIX agora disponível para todos os serviços!', time: 'Ontem', icon: 'payments', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
        ].map((notif, idx) => (
          <div key={idx} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${notif.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined">{notif.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{notif.title}</h4>
                <span className="text-[10px] font-bold text-slate-400">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{notif.text}</p>
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
        {currentView === 'app' && (
          <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'home' && renderHome()}
              {activeTab === 'search' && renderSearch()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'history' && renderHistory()}
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
