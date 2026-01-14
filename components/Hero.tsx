
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, ShieldCheck, Zap, MapPin, Truck, Clock, Smartphone, ChevronRight, CheckCircle2, Building2, Star, Navigation, Package, Users, Map, Bike, Car, Search, Home, Rocket, Shield, Briefcase } from 'lucide-react';
import { parseNaturalLanguageOrder } from '../services/geminiService';
import { mapService } from '../services/mapService';
import { useAuth } from '../context/AuthContext';
import { usePrompt } from '../context/PromptContext';
import { orderService } from '../services/orderService';
import { ServiceType, VehicleType } from '../types';

interface HeroProps {
   onStartBooking?: (prefill?: any) => void;
   onBusinessClick?: () => void;
}

const PLACEHOLDERS = [
   "e.g. Laptop from Westlands to CBD...",
   "e.g. Containers from Mombasa port to warehouse in Nairobi Industrial Area...",
   "e.g. 20 90kg sacks of potatoes from Meru to Muthurwa...",
   "e.g. Dawa from Chemist to South B...",
   "e.g. Pick docs Upperhill drop Karen..."
];

const Hero: React.FC<HeroProps> = ({ onStartBooking, onBusinessClick }) => {
   const { user, logout } = useAuth();
   const { showConfirm } = usePrompt();
   const navigate = useNavigate();
   const [quickInput, setQuickInput] = useState('');
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [historyDestinations, setHistoryDestinations] = useState<any[]>([]);

   // Fetch User History for Quick Destinations
   useEffect(() => {
      const fetchHistory = async () => {
         if (user) {
            try {
               const orders = await orderService.getUserOrders(user.id);
               // Extract unique dropoff locations, limit to 5
               const uniqueDestinations = Array.from(new Set(orders.map(o => o.dropoff)))
                  .slice(0, 5)
                  .map(label => ({
                     label,
                     icon: MapPin,
                     isHistory: true
                  }));

               if (uniqueDestinations.length > 0) {
                  setHistoryDestinations(uniqueDestinations);
               }
            } catch (e) {
               console.error("Error fetching destination history:", e);
            }
         }
      };
      fetchHistory();
   }, [user]);

   // Placeholder Typing Effect State
   const [placeholder, setPlaceholder] = useState('');
   const [isDeleting, setIsDeleting] = useState(false);
   const [loopNum, setLoopNum] = useState(0);

   const textareaRef = useRef<HTMLTextAreaElement>(null);

   const requestUserLocation = (): Promise<{ lat: number, lng: number } | null> => {
      return new Promise((resolve) => {
         if (!navigator.geolocation) {
            resolve(null);
            return;
         }

         navigator.geolocation.getCurrentPosition(
            (position) => {
               resolve({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
               });
            },
            (error) => {
               console.error("Geolocation error:", error);
               resolve(null);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
         );
      });
   };

   useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      const i = loopNum % PLACEHOLDERS.length;
      const fullText = PLACEHOLDERS[i];

      if (isDeleting) {
         // Deleting Speed
         timer = setTimeout(() => {
            setPlaceholder(prev => prev.slice(0, -1));
            if (placeholder.length <= 1) {
               setIsDeleting(false);
               setLoopNum(l => l + 1);
            }
         }, 10);
      } else {
         // Typing Speed
         if (placeholder.length < fullText.length) {
            timer = setTimeout(() => {
               setPlaceholder(fullText.slice(0, placeholder.length + 1));
            }, 20);
         } else {
            // Pause at end before deleting
            timer = setTimeout(() => {
               setIsDeleting(true);
            }, 1500);
         }
      }
      return () => clearTimeout(timer);
   }, [placeholder, isDeleting, loopNum]);

   // Auto-grow effect
   useEffect(() => {
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
         textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
   }, [quickInput]);

   const performSearch = async (input: string) => {
      if (!input.trim()) {
         if (onStartBooking) {
            onStartBooking();
         } else {
            navigate('/book');
         }
         return;
      }

      setIsAnalyzing(true);
      const result = await parseNaturalLanguageOrder(input);

      if (result) {
         // Professionalize locations using Google Maps
         const prefill: any = { ...result };

         // If no pickup specified, try to get current location
         if (!result.pickup || result.pickup.toLowerCase().includes('current location')) {
            const coords = await requestUserLocation();
            if (coords) {
               const address = await mapService.reverseGeocode(coords.lat, coords.lng);
               if (address) prefill.pickup = address;
            }
         } else {
            const geo = await mapService.geocodeAddress(result.pickup);
            if (geo) prefill.pickup = geo.formattedAddress;
         }

         if (result.dropoff) {
            const geo = await mapService.geocodeAddress(result.dropoff);
            if (geo) prefill.dropoff = geo.formattedAddress;
         }

         setIsAnalyzing(false);
         if (onStartBooking) {
            onStartBooking(prefill);
         } else {
            navigate('/book', { state: { prefill } });
         }
      } else {
         setIsAnalyzing(false);
         // Fallback if AI fails or returns empty: Use the raw input as the item description
         // Also try to get current location for fallback
         const coords = await requestUserLocation();
         let pickup = '';
         if (coords) {
            const address = await mapService.reverseGeocode(coords.lat, coords.lng);
            if (address) pickup = address;
         }

         const fallbackPrefill = { itemDescription: input, pickup };
         if (onStartBooking) {
            onStartBooking(fallbackPrefill);
         } else {
            navigate('/book', { state: { prefill: fallbackPrefill } });
         }
      }
   };

   const handleQuickSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (checkDriverRole()) return;
      performSearch(quickInput);
   };

   const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuickInput(e.target.value);
   };

   // Helper to check if user is a driver and block booking
   const checkDriverRole = (): boolean => {
      if (user?.role === 'driver') {
         showConfirm(
            "Booking Restricted",
            "Driver accounts cannot place orders. Please log out and sign in with a Customer or Business account to book a delivery.",
            async () => {
               await logout();
               navigate('/');
            },
            'confirm'
         );
         return true; // Is a driver
      }
      return false; // Not a driver
   };

   const handleSendAnything = async () => {
      if (checkDriverRole()) return;
      // Populate the search bar immediately for instant feedback
      setQuickInput('Send a package from my current location');

      setIsAnalyzing(true);
      const coords = await requestUserLocation();
      let pickup = '';
      if (coords) {
         const address = await mapService.reverseGeocode(coords.lat, coords.lng);
         if (address) {
            pickup = address;
            // Update with the actual address once resolved
            setQuickInput(`Send a package from ${address}`);
         }
      }

      setIsAnalyzing(false);
      const prefill = {
         pickup: pickup,
         pickupCoords: coords,
         itemDescription: 'Package'
      };

      if (onStartBooking) {
         onStartBooking(prefill);
      } else {
         navigate('/book', { state: { prefill } });
      }
   };

   const handleBusinessClick = () => {
      if (onBusinessClick) {
         onBusinessClick();
      } else {
         navigate('/business');
      }
   };

   return (
      <div className="flex flex-col min-h-screen pointer-events-auto">

         {/* --- SECTION 1: HERO (Centered, Text Only) --- */}
         <div className="relative min-h-screen min-h-[100dvh] flex flex-col justify-center items-center bg-gradient-to-b from-green-50/50 via-white to-white">

            {/* CSS Animations Injection */}
            <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
           @keyframes travel-h {
            0% { left: -10%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { left: 110%; opacity: 0; }
          }
          @keyframes travel-v {
            0% { top: -10%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { top: 110%; opacity: 0; }
          }
          @keyframes travel-h-reverse {
            0% { right: -10%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { right: 110%; opacity: 0; }
          }
          @keyframes travel-v-reverse {
            0% { bottom: -10%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { bottom: 110%; opacity: 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          
          .vehicle-travel-h {
            position: absolute;
            animation: travel-h linear infinite;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vehicle-travel-h-rev {
            position: absolute;
            animation: travel-h-reverse linear infinite;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vehicle-travel-v {
            position: absolute;
            animation: travel-v linear infinite;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vehicle-travel-v-rev {
            position: absolute;
            animation: travel-v-reverse linear infinite;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>

            {/* Animated Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)' }}>
               {/* Grid Pattern - Boxed Style */}
               <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                  backgroundSize: '80px 80px'
               }}></div>

               {/* Animated Boxes / Traffic Simulation */}
               <div className="absolute inset-0">
                  {/* Horizontal Traffic (Right) */}
                  <div className="vehicle-travel-h text-brand-500/30" style={{ top: '15%', animationDuration: '25s', animationDelay: '0s' }}><Bike size={30} /></div>
                  <div className="vehicle-travel-h text-green-500/30" style={{ top: '40%', animationDuration: '35s', animationDelay: '7s' }}><Car size={40} /></div>
                  <div className="vehicle-travel-h text-brand-600/30" style={{ top: '65%', animationDuration: '30s', animationDelay: '3s' }}><Truck size={50} /></div>

                  {/* Horizontal Traffic (Left) */}
                  <div className="vehicle-travel-h-rev text-brand-400/30" style={{ top: '25%', animationDuration: '28s', animationDelay: '5s' }}><Car size={35} className="scale-x-[-1]" /></div>
                  <div className="vehicle-travel-h-rev text-green-400/30" style={{ top: '55%', animationDuration: '22s', animationDelay: '12s' }}><Bike size={25} className="scale-x-[-1]" /></div>

                  {/* Vertical Traffic (Down) */}
                  <div className="vehicle-travel-v text-brand-400/30" style={{ left: '10%', animationDuration: '40s', animationDelay: '2s' }}><Navigation size={30} className="rotate-180" /></div>
                  <div className="vehicle-travel-v text-green-400/30" style={{ left: '45%', animationDuration: '32s', animationDelay: '10s' }}><Navigation size={25} className="rotate-180" /></div>
                  <div className="vehicle-travel-v text-brand-500/30" style={{ left: '80%', animationDuration: '45s', animationDelay: '6s' }}><Navigation size={35} className="rotate-180" /></div>

                  {/* Vertical Traffic (Up) */}
                  <div className="vehicle-travel-v-rev text-brand-300/30" style={{ left: '25%', animationDuration: '38s', animationDelay: '4s' }}><Navigation size={28} /></div>
                  <div className="vehicle-travel-v-rev text-green-300/30" style={{ left: '65%', animationDuration: '42s', animationDelay: '15s' }}><Navigation size={22} /></div>

                  {/* Floating Glows */}
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-[120px] animate-pulse-glow"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
               </div>
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-24 pointer-events-auto">

               {/* Badge */}
               <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-200 shadow-sm text-brand-700 text-xs font-bold tracking-wide uppercase mb-4">
                  <span className="relative flex h-2 w-2 mr-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  Live in Nairobi • Mombasa • Kisumu
               </div>

               {/* Headline - Adjusted for Mobile (text-4xl base instead of 5xl) */}
               <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm mb-4">
                  Send anything, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-green-500">Fast & Reliable.</span>
               </h1>

               <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 font-medium leading-relaxed mb-4 sm:mb-6">
                  From Boda Boda errands to 40ft container trailers. <br className="hidden sm:block" />
                  Connect with verified drivers in seconds using Kenya's smartest logistics platform.
               </p>

               {/* Service Type Quick Select */}
               <div className="max-w-2xl mx-auto w-full mb-4 sm:mb-6 flex justify-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                  {[
                     { id: 'send', icon: Package, label: 'Send Anything', color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-600', desc: 'Personal & Errands', action: handleSendAnything },
                     { id: 'business', icon: Briefcase, label: 'Business', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600', desc: 'Bulk & Corporate', action: handleBusinessClick },
                  ].map((s) => (
                     <button
                        key={s.id}
                        disabled={isAnalyzing}
                        onClick={s.action}
                        className={`flex-1 flex flex-col items-center py-2 px-1 sm:py-4 sm:px-6 rounded-xl sm:rounded-[2rem] border-2 ${s.border} ${s.bg} hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                        <div className="absolute top-0 right-0 p-1 sm:p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                           <s.icon className="w-6 h-6 sm:w-12 sm:h-12" />
                        </div>
                        <s.icon className={`w-4 h-4 sm:w-7 sm:h-7 mb-1 sm:mb-2 ${s.color} group-hover:scale-110 transition-transform duration-300`} />
                        <span className={`text-[8px] sm:text-xs font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
                        <span className={`text-[6px] sm:text-[8px] font-bold uppercase tracking-tighter mt-0.5 text-slate-600`}>{s.desc}</span>
                     </button>
                  ))}
               </div>

               {/* Smart Input - Bolt Style */}
               <div className="max-w-2xl mx-auto w-full pt-1 mb-4 sm:mb-8">
                  <form onSubmit={handleQuickSubmit} className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-green-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                     <div className="relative bg-white rounded-2xl shadow-2xl p-1.5 sm:p-2 flex items-center gap-2 border border-gray-100 focus-within:ring-2 focus-within:ring-brand-500/50 transition-all duration-300">
                        <div className="pl-3 sm:pl-4 self-start pt-[20px] sm:pt-[30px]">
                           <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                        </div>
                        <textarea
                           ref={textareaRef}
                           rows={1}
                           className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-slate-400 text-sm sm:text-lg font-medium py-[16px] sm:py-[26px] resize-none overflow-hidden leading-relaxed"
                           placeholder={placeholder || "Where to?"}
                           value={quickInput}
                           onChange={handleTextareaChange}
                        />
                        <button
                           type="submit"
                           disabled={isAnalyzing || !quickInput.trim()}
                           className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all font-bold text-xs sm:text-sm mr-1 sm:mr-2 whitespace-nowrap shadow-md hover:shadow-lg self-end mb-1.5 sm:mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isAnalyzing ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           ) : (
                              <>
                                 <span>Send</span> <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                              </>
                           )}
                        </button>
                     </div>
                  </form>

                  {/* Quick Tap Destinations */}
                  <div className="mt-8 w-full max-w-2xl mx-auto">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 text-center">Quick Tap Destinations</p>
                     <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {(historyDestinations.length > 0 ? historyDestinations : [
                           { label: 'Nairobi', icon: MapPin },
                           { label: 'Mombasa', icon: MapPin },
                           { label: 'CBD', icon: MapPin },
                           { label: 'Westlands', icon: Building2 },
                           { label: 'Kilimani', icon: Home },
                           { label: 'Upper Hill', icon: Building2 },
                           { label: 'JKIA', icon: Navigation }
                        ]).map((dest) => (
                           <button
                              key={dest.label}
                              onClick={() => {
                                 if (checkDriverRole()) return;
                                 const query = `Send package from my current location to ${dest.label}`;
                                 setQuickInput(query);
                                 performSearch(query);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all shadow-sm active:scale-95"
                           >
                              <dest.icon className="w-3 h-3 text-brand-500" />
                              <span className="truncate max-w-[120px]">{dest.label.split(',')[0]}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Quick Features */}
               <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                  <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs sm:text-sm bg-white/[0.11] backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-default">
                     <Clock className="w-4 h-4 text-brand-500" />
                     <span>Under 60 min pickup</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs sm:text-sm bg-white/[0.11] backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-default">
                     <ShieldCheck className="w-4 h-4 text-brand-500" />
                     <span>Goods Insured</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs sm:text-sm bg-white/[0.11] backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-default">
                     <Smartphone className="w-4 h-4 text-brand-500" />
                     <span>Real-time Tracking</span>
                  </div>
               </div>

            </div>
         </div>

         {/* --- SECTION 2: SERVICES (Moved up) --- */}
         <div className="py-20 bg-gray-50 border-t border-gray-100 pointer-events-auto">
            <div className="max-w-6xl mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Delivery Solutions for Everyone</h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                     Whether you're sending a key across town or moving house across the country, we have the right vehicle for you.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Service 1 */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer" onClick={() => { if (checkDriverRole()) return; if (onStartBooking) onStartBooking({ vehicle: 'BODA' }); else navigate('/book', { state: { prefill: { vehicle: 'BODA' } } }); }}>
                     <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="w-7 h-7 animate-icon-hover" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Express</h3>
                     <p className="text-slate-500 mb-6 leading-relaxed">
                        Perfect for documents, keys, food, and small parcels. Our vast network of Boda Boda riders ensures pickups in minutes.
                     </p>
                     <ul className="space-y-2 mb-8">
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-brand-500 mr-2" /> 60 min city-wide delivery
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-brand-500 mr-2" /> Real-time GPS tracking
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-brand-500 mr-2" /> Starting at KES 50
                        </li>
                     </ul>
                     <button className="text-brand-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                        Book Boda Boda <ArrowRight className="w-4 h-4 ml-2" />
                     </button>
                  </div>

                  {/* Service 2 */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer" onClick={handleBusinessClick}>
                     <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-7 h-7 animate-icon-hover" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Logistics</h3>
                     <p className="text-slate-500 mb-6 leading-relaxed">
                        Scalable delivery solutions for e-commerce, retail, and healthcare. Streamline your operations with bulk scheduling and API integration.
                     </p>
                     <ul className="space-y-2 mb-8">
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" /> Optimized Multi-stop Routes
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" /> Secure COD & Payment Handling
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" /> Dedicated Account Support
                        </li>
                     </ul>
                     <button className="text-blue-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                        Business Solutions <ArrowRight className="w-4 h-4 ml-2" />
                     </button>
                  </div>

                  {/* Service 3 */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer" onClick={() => { if (checkDriverRole()) return; if (onStartBooking) onStartBooking({ vehicle: 'TRUCK' }); else navigate('/book', { state: { prefill: { vehicle: 'TRUCK' } } }); }}>
                     <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Truck className="w-7 h-7 animate-icon-hover" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Heavy Cargo & Freight</h3>
                     <p className="text-slate-500 mb-6 leading-relaxed">
                        From household moves to industrial freight. We provide Pickups, Vans, and 40ft Container Trailers for your largest loads.
                     </p>
                     <ul className="space-y-2 mb-8">
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-orange-500 mr-2" /> Professional Loading Teams
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-orange-500 mr-2" /> Comprehensive Transit Insurance
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                           <CheckCircle2 className="w-4 h-4 text-orange-500 mr-2" /> Nationwide Inter-county Haulage
                        </li>
                     </ul>
                     <button className="text-orange-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                        Book Freight <ArrowRight className="w-4 h-4 ml-2" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* ... (Rest of the file remains unchanged) ... */}
         {/* --- SECTION 3: HOW IT WORKS --- */}
         <div className="py-20 bg-white overflow-hidden pointer-events-auto">
            {/* ... */}
            <div className="max-w-7xl mx-auto px-4">
               <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">

                  <div className="w-full md:w-1/2 order-2 md:order-1">
                     <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">Delivery made simple.</h2>
                     {/* ... */}
                     <div className="space-y-12">
                        <div className="flex gap-6">
                           <div className="flex-shrink-0 w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl shadow-sm border border-brand-100">1</div>
                           <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">Book in Seconds</h4>
                              <p className="text-lg text-slate-600">Enter your pickup and drop-off locations. Our AI instantly recommends the best vehicle and price for your items.</p>
                           </div>
                        </div>

                        <div className="flex gap-6">
                           <div className="flex-shrink-0 w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl shadow-sm border border-brand-100">2</div>
                           <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">We Collect</h4>
                              <p className="text-lg text-slate-600">A nearby verified driver accepts your request and arrives within minutes to collect your items securely.</p>
                           </div>
                        </div>

                        <div className="flex gap-6">
                           <div className="flex-shrink-0 w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl shadow-sm border border-brand-100">3</div>
                           <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">Track & Deliver</h4>
                              <p className="text-lg text-slate-600">Watch your delivery in real-time on the map. Pay safely via M-Pesa once the job is completed to your satisfaction.</p>
                           </div>
                        </div>
                     </div>

                     <div className="mt-12">
                        <button onClick={() => { if (checkDriverRole()) return; if (onStartBooking) onStartBooking(); else navigate('/book'); }} className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center text-lg">
                           Get Started Now <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                     </div>
                  </div>

                  {/* Phone Mockup moved here */}
                  <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center relative">
                     {/* ... Phone Mockup content ... */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-gradient-to-tr from-brand-100 to-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                     {/* Phone Frame */}
                     <div className="relative z-10 mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[3rem] h-[600px] w-[320px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">

                        {/* Notch & Top Bar */}
                        <div className="absolute top-0 w-full h-8 bg-white z-30 flex justify-center">
                           <div className="h-6 w-40 bg-gray-900 rounded-b-2xl"></div>
                        </div>

                        {/* Screen Content - NOW WITH SIMULATED MAP BACKGROUND */}
                        <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
                           {/* ... Map SVGs and Content ... */}
                           <div className="absolute inset-0 z-0 bg-slate-100">
                              {/* Simulated Vector Map Roads */}
                              <svg className="absolute inset-0 w-full h-full text-slate-300">
                                 {/* ... paths ... */}
                                 <path d="M120 -50 L140 800" stroke="currentColor" strokeWidth="8" fill="none" />
                                 <path d="M-50 180 L400 150" stroke="currentColor" strokeWidth="8" fill="none" />
                                 <path d="M-50 100 L400 80" stroke="currentColor" strokeWidth="3" fill="none" />
                                 <path d="M200 -50 L220 800" stroke="currentColor" strokeWidth="4" fill="none" />
                                 <path d="M-50 350 L400 320" stroke="currentColor" strokeWidth="3" fill="none" />
                                 <path d="M300 -50 L320 800" stroke="currentColor" strokeWidth="3" fill="none" />
                                 <path d="M-50 480 L400 460" stroke="currentColor" strokeWidth="3" fill="none" />
                                 <path d="M40 -50 L60 800" stroke="currentColor" strokeWidth="2" fill="none" />
                                 <path d="M260 -50 L280 800" stroke="currentColor" strokeWidth="2" fill="none" />
                                 <path d="M-50 280 L400 250" stroke="currentColor" strokeWidth="2" fill="none" />
                                 <path d="M280 400 Q 350 450 400 420 L 400 600 L 250 600 Z" className="text-blue-100" fill="currentColor" stroke="none" />
                              </svg>
                           </div>

                           {/* Map Elements (Mock) */}
                           <div className="absolute inset-0 z-10">
                              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80 filter drop-shadow-md">
                                 <path d="M80 420 C 80 350, 150 350, 180 250 S 240 180, 240 140" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="6 4" strokeLinecap="round" />
                              </svg>
                              <div className="absolute top-[420px] left-[80px] -translate-x-1/2 -translate-y-1/2">
                                 <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                              </div>
                              <div className="absolute top-[140px] left-[240px] -translate-x-1/2 -translate-y-1/2">
                                 <div className="w-10 h-10 bg-brand-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-bounce z-20 relative">
                                    <Truck className="w-5 h-5 text-white" />
                                 </div>
                                 <div className="w-10 h-10 bg-black/20 rounded-full absolute -bottom-1 blur-sm transform scale-x-150"></div>
                              </div>
                           </div>

                           <div className="relative z-20 pt-10 px-4">
                              <div className="flex justify-between items-center">
                                 <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
                                    <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
                                 </div>
                                 <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                                    En Route • 12 mins
                                 </div>
                                 <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
                                    <Smartphone className="w-4 h-4 text-gray-600" />
                                 </div>
                              </div>
                           </div>

                           <div className="absolute top-[20%] left-4 right-4 z-20 animate-float">
                              <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                 </div>
                                 <div>
                                    <div className="text-xs font-bold text-gray-900">Driver Arriving</div>
                                    <div className="text-[10px] text-gray-500">John is 2km away with your package</div>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-auto bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] p-5 z-20 relative">
                              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
                              <div className="flex items-center gap-4 mb-4">
                                 <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                    <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="Driver" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                       <h4 className="font-bold text-gray-900 text-sm">John Doe</h4>
                                       <div className="flex items-center text-xs font-bold text-gray-900">
                                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" /> 4.9
                                       </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Black Motorcycle • KMD 45X</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button className="flex-1 bg-brand-600 text-white text-xs font-bold py-3 rounded-xl shadow-brand-200 hover:bg-brand-700 transition-colors">
                                    Call Driver
                                 </button>
                                 <button className="flex-1 bg-gray-50 text-gray-700 text-xs font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                    Message
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>

         {/* --- SECTION 4: STATS / TRUST --- */}
         <div className="border-y border-gray-100 bg-slate-50/50 py-16 pointer-events-auto">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                     <Package className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">50k+</div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Deliveries Completed</div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                     <Users className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">2,500+</div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Registered Drivers</div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                     <Map className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">15</div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Cities Covered</div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                     <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">4.8/5</div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Customer Rating</div>
               </div>
            </div>
         </div>

         {/* --- SECTION 5: CTA --- */}
         <div className="bg-slate-900 py-24 text-center relative overflow-hidden pointer-events-auto">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to move something?</h2>
               <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                  Join thousands of Kenyans who trust TumaFast for their daily logistics.
                  Fast, reliable, and affordable.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => { if (checkDriverRole()) return; if (onStartBooking) onStartBooking(); else navigate('/book'); }} className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-brand-500/25">
                     Book a Delivery
                  </button>
                  <button onClick={handleBusinessClick} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg transition-all backdrop-blur-sm">
                     Business Account
                  </button>
               </div>
            </div>
         </div>

      </div>
   );
};

export default Hero;
