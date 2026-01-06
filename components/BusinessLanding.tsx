
import React from 'react';
import { CheckCircle2, Building2, BarChart3, Globe, ArrowRight, Zap, Layers, ChevronRight } from 'lucide-react';

interface BusinessLandingProps {
   onGetStarted: () => void;
   onLogin: () => void;
   onNavigateToDashboard: (section: string) => void;
}

const BusinessLanding: React.FC<BusinessLandingProps> = ({ onGetStarted, onLogin, onNavigateToDashboard }) => {
   return (
      <div className="bg-white font-sans text-slate-900">

         {/* Hero Section */}
         <div className="relative bg-slate-900 text-white overflow-hidden min-h-[650px] flex items-center">

            {/* Video Background */}
            <div className="absolute inset-0 z-0">
               {/* 
              === VEO PROMPT FOR GENERATION ===
              Use this prompt in Google Veo to generate your background:
              
              "A bright, vibrant, high-energy cinematic sequence in Nairobi Kenya. 
              The camera glides smoothly showing different sectors: 
              1) A modern pharmacy counter handing a package. 
              2) A busy restaurant kitchen packing food. 
              3) An online fashion shop owner boxing an item. 
              4) A large well-lit warehouse. 
              Connecting them all is a professional delivery rider on a bodaboda (motorcycle) 
              driving through sunny city traffic. 4k resolution, commercial lighting, 
              optimistic atmosphere, photorealistic."
           */}
               <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover scale-105"
               >
                  <source src="https://storage.googleapis.com/tumafast/video_20251215_161601_edit.mp4" type="video/mp4" />
               </video>

               {/* Dark overlay removed as requested */}
            </div>

            {/* Gradient Overlay removed as requested */}

            <div className="relative w-full max-w-7xl mx-auto px-4 pt-40 pb-24 sm:pt-48 sm:pb-32 z-20">
               <div className="max-w-3xl text-left">
                  <div className="inline-flex items-center space-x-2 bg-black/30 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md shadow-lg">
                     <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
                     <span className="text-sm font-semibold text-white tracking-wide">TumaFast for Enterprise</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] drop-shadow-xl text-white">
                     Logistics infrastructure for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">high-growth businesses.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-white mb-10 leading-relaxed max-w-2xl drop-shadow-md font-medium text-shadow-sm">
                     Automate your supply chain with our Bulk Scheduling tools, API integrations, and dedicated fleet management.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-start">
                     <button
                        onClick={onGetStarted}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center transform hover:scale-105"
                     >
                        Create Business Account <ArrowRight className="ml-2 w-5 h-5" />
                     </button>
                     <button
                        onClick={onLogin}
                        className="px-8 py-4 bg-black/40 hover:bg-black/60 text-white rounded-xl font-bold text-lg backdrop-blur-md transition-all border border-white/30 shadow-lg hover:border-white/50"
                     >
                        Login to Dashboard
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Trust Bar */}
         <div className="border-b border-gray-100 bg-white py-14">
            <div className="max-w-7xl mx-auto px-4 text-center">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">Trusted by industry leaders</p>
               <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-12">
                  {/* KOKO Networks */}
                  <div className="group flex flex-col items-center justify-center">
                     <img
                        src="https://storage.googleapis.com/tumafast/koko.png"
                        alt="KOKO Networks"
                        className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
                     />
                  </div>

                  {/* Jumia Kenya */}
                  <div className="group flex flex-col items-center justify-center">
                     <img
                        src="https://storage.googleapis.com/tumafast/jumia.jpg"
                        alt="JUMIA"
                        className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 mix-blend-multiply"
                     />
                  </div>

                  {/* Naivas Supermarkets */}
                  <div className="group flex flex-col items-center justify-center">
                     <img
                        src="https://storage.googleapis.com/tumafast/naivas.png"
                        alt="NAIVAS"
                        className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
                     />
                  </div>

                  {/* Copia Kenya */}
                  <div className="group flex flex-col items-center justify-center">
                     <img
                        src="https://storage.googleapis.com/tumafast/copia.png"
                        alt="COPIA"
                        className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
                     />
                  </div>

                  {/* Twiga Foods */}
                  <div className="group flex flex-col items-center justify-center">
                     <img
                        src="https://storage.googleapis.com/tumafast/twiga.jpg"
                        alt="TWIGA"
                        className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 mix-blend-multiply"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Features Grid */}
         <div className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for efficiency at scale</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                     We replace manual dispatching with intelligent automation, saving you hours every week.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                     <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                        <Layers className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Bulk Order Upload</h3>
                     <p className="text-slate-500 leading-relaxed mb-6 flex-grow">
                        Upload hundreds of orders via CSV or use our Smart Paste tool to schedule multiple deliveries in seconds.
                     </p>
                     <button
                        onClick={() => onNavigateToDashboard('BULK')}
                        className="text-blue-600 font-bold flex items-center hover:translate-x-2 transition-transform self-start"
                     >
                        Start Bulk Upload <ChevronRight className="w-4 h-4 ml-1" />
                     </button>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                     <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                        <Zap className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Developer API</h3>
                     <p className="text-slate-500 leading-relaxed mb-6 flex-grow">
                        Connect your e-commerce store directly to our fleet. Webhooks for status updates and automated dispatching.
                     </p>
                     <button
                        onClick={() => onNavigateToDashboard('API')}
                        className="text-emerald-600 font-bold flex items-center hover:translate-x-2 transition-transform self-start"
                     >
                        View Documentation <ChevronRight className="w-4 h-4 ml-1" />
                     </button>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                     <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                        <BarChart3 className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Analytics & ETIMS Invoicing</h3>
                     <p className="text-slate-500 leading-relaxed mb-6 flex-grow">
                        Track spend, delivery times, and success rates. We automatically email you ETIMS-compliant invoices for your tax records.
                     </p>
                     <button
                        onClick={() => onNavigateToDashboard('OVERVIEW')}
                        className="text-indigo-600 font-bold flex items-center hover:translate-x-2 transition-transform self-start"
                     >
                        View Reports <ChevronRight className="w-4 h-4 ml-1" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Integration Section */}
         <div className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
               <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="lg:w-1/2">
                     <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1 mb-6">
                        <Globe className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-600 uppercase">API First</span>
                     </div>
                     <h2 className="text-4xl font-bold text-slate-900 mb-6">Integrate in minutes, not weeks.</h2>
                     <p className="text-lg text-slate-600 mb-8">
                        Our REST API is documented to global standards. Whether you are running Shopify, WooCommerce, or a custom stack, we plug right in.
                     </p>

                     <div className="space-y-4">
                        <div className="flex items-center">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                           <span className="text-slate-700 font-medium">99.9% API Uptime SLA</span>
                        </div>
                        <div className="flex items-center">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                           <span className="text-slate-700 font-medium">Sandbox environment for testing</span>
                        </div>
                        <div className="flex items-center">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                           <span className="text-slate-700 font-medium">Dedicated technical support channel</span>
                        </div>
                     </div>
                  </div>

                  <div className="lg:w-1/2">
                     <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 font-mono text-sm leading-relaxed overflow-hidden">
                        <div className="flex space-x-2 mb-4">
                           <div className="w-3 h-3 rounded-full bg-red-500"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-blue-400">curl <span className="text-white">-X POST</span> <span className="text-green-400">https://api.tumafast.co.ke/v1/orders</span> \</div>
                        <div className="text-white pl-4">-H <span className="text-yellow-300">"Authorization: Bearer YOUR_API_KEY"</span> \</div>
                        <div className="text-white pl-4">-d <span className="text-yellow-300">'{'{'}</span></div>
                        <div className="text-purple-300 pl-8">"pickup": <span className="text-white">"Nairobi CBD"</span>,</div>
                        <div className="text-purple-300 pl-8">"dropoff": <span className="text-white">"Westlands"</span>,</div>
                        <div className="text-purple-300 pl-8">"items": <span className="text-white">"Office Supplies"</span>,</div>
                        <div className="text-purple-300 pl-8">"vehicle": <span className="text-white">"Boda Boda"</span></div>
                        <div className="text-white pl-4"><span className="text-yellow-300">{'}'}'</span></div>

                        <div className="mt-6 text-slate-500"># Response</div>
                        <div className="text-green-400">{'{'} "id": "ORD-12345", "status": "queued", "eta": "45 mins" {'}'}</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* CTA */}
         <div className="bg-blue-600 py-20 text-center">
            <div className="max-w-4xl mx-auto px-4">
               <h2 className="text-3xl font-bold text-white mb-6">Ready to optimize your logistics?</h2>
               <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                  Join the fastest growing logistics network in Kenya. No setup fees. Pay as you go.
               </p>
               <button
                  onClick={onGetStarted}
                  className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:bg-blue-50 transition-all"
               >
                  Get Started for Free
               </button>
            </div>
         </div>

      </div>
   );
};

export default BusinessLanding;
