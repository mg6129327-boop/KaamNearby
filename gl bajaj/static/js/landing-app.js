/**
 * KaamNearby - Vue 3 Interactive Landing Page Application
 * Provides real-time filtering, instant search, dynamic cost calculator,
 * quick preview modals, dual-perspective workflow, and FAQ accordions.
 */

(function () {
  'use strict';

  // Wait for DOM & Vue to be available
  function initVueLanding() {
    if (typeof Vue === 'undefined') {
      console.warn('Vue 3 is loading or not available yet. Retrying...');
      setTimeout(initVueLanding, 100);
      return;
    }

    const { createApp, ref, computed, onMounted, nextTick, watch } = Vue;

    createApp({
      setup() {
        // Parse embedded initial data from Flask backend
        let rawData = {};
        const dataScript = document.getElementById('landing-data');
        if (dataScript) {
          try {
            rawData = JSON.parse(dataScript.textContent);
          } catch (e) {
            console.error('Failed to parse landing data:', e);
          }
        }

        const categories = ref(rawData.categories || []);
        const allWorkers = ref(rawData.workers || []);
        const totalWorkerCount = ref(rawData.workerCount || 45);
        const totalCompletedBookings = ref(rawData.completedBookings || 320);

        // --- Multilingual System (English <-> Hindi) ---
        const currentLang = ref(localStorage.getItem('kaamnearby_lang') || 'en');

        const i18n = {
          en: {
            hero_badge: '100% Direct Booking • 0% Platform Commission',
            hero_title_1: 'Find Trusted',
            hero_title_2: 'Local Workers',
            hero_title_3: 'Near You',
            hero_tagline_1: 'Book',
            hero_tagline_2: 'Negotiate',
            hero_tagline_3: 'Get It Done',
            search_placeholder: 'Search plumber, electrician, carpenter...',
            all_locations: 'All Locations',
            find_pros: 'Find Pros',
            popular_searches: 'Popular Searches',
            all_services: 'All Services',
            verified_pros: 'Verified Pros',
            jobs_done: 'Jobs Done',
            rating: 'Rating',
            fast_response: 'Fast Response',
            emergency_badge: '⚡ Fast Local Dispatch',
            emergency_title: 'Need an Emergency Technician Right Now?',
            emergency_desc: 'Plumbing leak, sudden power failure, or AC breakdown? Connect directly with available technicians near your neighborhood.',
            direct_contact: 'Direct WhatsApp / Phone',
            active_now: 'Active Now',
            request_callback: 'Request Instant Callback',
            script_badge: 'Local Services Made Easy',
            calc_tag: 'Transparent Rates',
            calc_title: 'Interactive Service Cost Estimator',
            calc_subtitle: 'Know what fair rates look like before you book. Customize your repair requirements to view an instant transparent estimate.',
            calc_step1: '1. Select Trade Category',
            calc_step2: '2. Choose Specific Job Requirement',
            calc_scope: 'Quantity / Scope:',
            units: 'Units / Points',
            unit: 'Unit / Point',
            priority_dispatch: 'Priority Dispatch:',
            standard: 'Standard',
            urgent: '⚡ Urgent (< 1 hr)',
            fair_market: 'Fair Market Valuation',
            estimated_range: 'Estimated Price Range',
            est_subtitle: 'Based on recent successful bookings in your region.',
            negotiate_allowed: '* Direct negotiation allowed with the worker prior to job start.',
            zero_commission: 'Zero platform commission deducted',
            gov_verified: 'Government ID verified technicians',
            pay_after: 'Pay directly after job completion',
            browse_at_rate: 'Browse Workers at this Rate',
            dir_tag: 'Neighborhood Pros',
            dir_title: 'Verified Local Professionals',
            showing_workers: 'verified technicians ready for booking',
            all_services_dir: 'All Services Directory',
            all_cities: 'All Cities',
            top_rated: 'Top Rated ★',
            price_lth: 'Price: Low to High',
            price_htl: 'Price: High to Low',
            most_exp: 'Most Experienced',
            available_now: 'Available Now Only',
            filter_placeholder: 'Filter by name / skill...',
            reset: 'Reset',
            starting_fee: 'Starting Fee',
            quick_view: 'Quick View',
            book_profile: 'Book Profile',
            no_technicians: 'No Matching Technicians Found',
            no_technicians_desc: "We couldn't find available workers with your exact criteria. Try resetting filters or switching city location.",
            clear_all_filters: 'Clear All Filters',
            how_tag: 'Simple & Transparent',
            how_title: 'How KaamNearby Works',
            how_subtitle: 'Designed for trust, zero brokerage, and direct customer-to-technician communication.',
            for_homeowners: 'For Homeowners',
            for_tradespeople: 'For Tradespeople',
            c_step1_t: 'Search & Filter',
            c_step1_d: 'Find vetted local technicians in your city by trade category, price, and customer rating.',
            c_step2_t: 'Compare Verified Pros',
            c_step2_d: 'Check real government ID verification badges, experience levels, and neighbor reviews.',
            c_step3_t: 'Direct Negotiation',
            c_step3_d: 'Submit booking with your offer. Speak directly and agree on scope and fee with 0 middleman cuts.',
            c_step4_t: 'Pay After Job',
            c_step4_d: 'Technician arrives at scheduled time. Pay via UPI or cash only after satisfactory work.',
            w_step1_t: 'Free Quick Signup',
            w_step1_d: 'Register your profile with mobile number, trade skills, and daily working coverage radius.',
            w_step2_t: 'Get ID Verified',
            w_step2_d: 'Submit your government ID to earn the blue verified trust badge and unlock 3x customer leads.',
            w_step3_t: 'Direct Leads',
            w_step3_d: 'Get instant customer calls and booking inquiries in your locality. Negotiate fair fees directly.',
            w_step4_t: 'Keep 100% Earnings',
            w_step4_d: 'Zero commission deductions. You keep every rupee you earn from customers.',
            why_tag: 'Platform Benefits',
            why_title: 'Why Choose KaamNearby?',
            why_subtitle: 'Built from the ground up for Indian households and hardworking local tradespeople.',
            why1_t: 'Verified Technicians',
            why1_d: 'Every technician undergoes Aadhaar / government ID verification and skill vetting before onboarding.',
            why2_t: 'Seamless Booking',
            why2_d: 'Schedule visits at your convenience. Instant SMS and dashboard updates keep both sides aligned.',
            why3_t: '0% Brokerage & Inflation',
            why3_d: 'Direct customer-worker pricing with no corporate markups or hidden fees.',
            why4_t: 'Hyperlocal Neighborhoods',
            why4_d: 'Connect with workers residing within minutes of your home for rapid emergency response.',
            faq_tag: 'Got Questions?',
            faq_title: 'Frequently Asked Questions',
            faq_subtitle: 'Everything you need to know about booking and working on KaamNearby.',
            join_banner_tag: 'For Skilled Tradespeople',
            join_banner_title: 'Are You an Electrician, Plumber, or Carpenter?',
            join_banner_desc: 'Join KaamNearby today. Get direct customer leads in your city, negotiate fair prices, and grow your daily income with zero middleman deductions.',
            join_btn: 'Join as a Service Worker',
            modal_about: 'About the Professional',
            modal_coverage: 'Service Coverage',
            modal_close: 'Close',
            modal_proceed: 'Proceed to View Profile & Book',
            urgent_callback_title: 'Urgent Technician Callback',
            urgent_callback_desc: 'Enter your mobile number and preferred time. Nearby available technicians will call you immediately.',
            mobile_number: 'Your Mobile Number (10 Digits)',
            request_now: 'Request Callback Now',
            request_received: 'Request Received!',
            request_received_desc: 'Nearby technicians have been notified. You will receive a call shortly at'
          },
          hi: {
            hero_badge: '100% सीधी बुकिंग • 0% प्लेटफॉर्म कमीशन',
            hero_title_1: 'अपने नजदीकी',
            hero_title_2: 'भरोसेमंद',
            hero_title_3: 'कारीगर खोजें',
            hero_tagline_1: 'बुक करें',
            hero_tagline_2: 'मोलभाव करें',
            hero_tagline_3: 'काम पूरा कराएं',
            search_placeholder: 'प्लंबर, इलेक्ट्रीशियन, बढ़ई खोजें...',
            all_locations: 'सभी शहर',
            find_pros: 'कारीगर खोजें',
            popular_searches: 'लोकप्रिय खोजें',
            all_services: 'सभी सेवाएं',
            verified_pros: 'सत्यापित कारीगर',
            jobs_done: 'पूर्ण कार्य',
            rating: 'रेटिंग',
            fast_response: 'त्वरित सेवा',
            emergency_badge: '⚡ त्वरित स्थानीय सेवा',
            emergency_title: 'क्या आपको तुरंत आपातकालीन कारीगर चाहिए?',
            emergency_desc: 'पानी का रिसाव, अचानक बिजली गुल, या एसी खराबी? अपने पड़ोस में उपलब्ध कारीगरों से सीधे संपर्क करें।',
            direct_contact: 'सीधा फोन व व्हाट्सएप',
            active_now: 'अभी उपलब्ध',
            request_callback: 'तुरंत कॉलबैक अनुरोध करें',
            script_badge: 'स्थानीय सेवाएं अब और भी आसान',
            calc_tag: 'पारदर्शी दरें',
            calc_title: 'सेवा लागत कैलकुलेटर',
            calc_subtitle: 'बुकिंग से पहले उचित दरों की जानकारी पाएं। सटीक अनुमान देखने के लिए अपनी आवश्यकता चुनें।',
            calc_step1: '1. कार्य श्रेणी चुनें',
            calc_step2: '2. विशिष्ट कार्य आवश्यकता चुनें',
            calc_scope: 'मात्रा / कार्य क्षेत्र:',
            units: 'इकाई / पॉइंट्स',
            unit: 'इकाई / पॉइंट',
            priority_dispatch: 'प्राथमिकता:',
            standard: 'सामान्य',
            urgent: '⚡ आपातकालीन (< 1 घंटा)',
            fair_market: 'उचित बाजार मूल्यांकन',
            estimated_range: 'अनुमानित दर सीमा',
            est_subtitle: 'आपके क्षेत्र में हाल की सफल बुकिंग के आधार पर।',
            negotiate_allowed: '* कार्य शुरू होने से पहले कारीगर से सीधी बातचीत व मोलभाव की पूरी सुविधा।',
            zero_commission: 'कोई प्लेटफॉर्म कमीशन नहीं काटा जाता',
            gov_verified: 'सरकारी पहचान पत्र सत्यापित पेशेवर',
            pay_after: 'कार्य संतोषजनक पूरा होने के बाद ही भुगतान करें',
            browse_at_rate: 'इस दर पर कारीगर देखें',
            dir_tag: 'स्थानीय पेशेवर',
            dir_title: 'सत्यापित स्थानीय विशेषज्ञ',
            showing_workers: 'सत्यापित कारीगर बुकिंग के लिए तैयार हैं',
            all_services_dir: 'सभी सेवाओं की सूची',
            all_cities: 'सभी शहर',
            top_rated: 'सर्वोत्तम रेटिंग ★',
            price_lth: 'दर: कम से ज्यादा',
            price_htl: 'दर: ज्यादा से कम',
            most_exp: 'अधिक अनुभवी',
            available_now: 'केवल अभी उपलब्ध',
            filter_placeholder: 'नाम या कौशल द्वारा खोजें...',
            reset: 'रीसेट',
            starting_fee: 'प्रारंभिक शुल्क',
            quick_view: 'त्वरित विवरण',
            book_profile: 'प्रोफ़ाइल देखें',
            no_technicians: 'कोई कारीगर नहीं मिला',
            no_technicians_desc: 'आपकी चुनी गई शर्तों के अनुसार कारीगर उपलब्ध नहीं हैं। कृपया फिल्टर रीसेट करें या दूसरा शहर चुनें।',
            clear_all_filters: 'सभी फिल्टर हटाएं',
            how_tag: 'सरल व पारदर्शी',
            how_title: 'काम-नीरबाय कैसे काम करता है',
            how_subtitle: 'विश्वास, शून्य दलाली और सीधी बातचीत के लिए निर्मित।',
            for_homeowners: 'ग्राहकों के लिए',
            for_tradespeople: 'कारीगरों के लिए',
            c_step1_t: 'खोजें व चुनें',
            c_step1_d: 'अपने शहर में श्रेणी, दर व रेटिंग के आधार पर जांचे-परखे कारीगर ढूंढें।',
            c_step2_t: 'सत्यापित कारीगरों की तुलना',
            c_step2_d: 'सरकारी पहचान बैज, अनुभव और स्थानीय पड़ोसियों की समीक्षाएं जांचें।',
            c_step3_t: 'सीधी बातचीत व मोलभाव',
            c_step3_d: 'बिना किसी बिचौलिए के सीधे बात करें और काम व कीमत तय करें।',
            c_step4_t: 'काम के बाद भुगतान',
            c_step4_d: 'कारीगर समय पर पहुंचेगा। संतोषजनक काम के बाद ही यूपीआई या नकद भुगतान करें।',
            w_step1_t: 'मुफ़्त आसान पंजीकरण',
            w_step1_d: 'अपने मोबाइल नंबर, कौशल और कार्य क्षेत्र के साथ 2 मिनट में रजिस्टर करें।',
            w_step2_t: 'पहचान पत्र सत्यापित कराएं',
            w_step2_d: 'ब्लू ट्रस्ट बैज पाने और 3 गुना अधिक काम पाने के लिए अपनी आईडी अपलोड करें।',
            w_step3_t: 'सीधे ग्राहक संपर्क',
            w_step3_d: 'अपने इलाके से सीधे ग्राहकों के कॉल और बुकिंग पाएं। सीधे बात करें।',
            w_step4_t: '100% कमाई अपनी जेब में',
            w_step4_d: 'कोई कमीशन नहीं काटा जाता। आपकी पूरी मेहनत की कमाई आपकी अपनी है।',
            why_tag: 'प्लेटफॉर्म के लाभ',
            why_title: 'काम-नीरबाय क्यों चुनें?',
            why_subtitle: 'भारतीय परिवारों और मेहनती कारीगरों के लिए विशेष रूप से निर्मित।',
            why1_t: 'सत्यापित कारीगर',
            why1_d: 'हर कारीगर का आधार व सरकारी आईडी सत्यापन और कौशल जांच की जाती है।',
            why2_t: 'सहज बुकिंग',
            why2_d: 'अपनी सुविधा अनुसार समय चुनें। सीधे अपडेट दोनों पक्षों को सूचित रखते हैं।',
            why3_t: '0% दलाली व कमीशन',
            why3_d: 'बिना किसी गुप्त शुल्क या कंपनी कमीशन के पारदर्शी दरें।',
            why4_t: 'स्थानीय पड़ोस सेवा',
            why4_d: 'चंद मिनटों की दूरी पर मौजूद कारीगरों से तुरंत सहायता पाएं।',
            faq_tag: 'कोई सवाल है?',
            faq_title: 'अक्सर पूछे जाने वाले सवाल',
            faq_subtitle: 'काम-नीरबाय पर बुकिंग और काम करने से जुड़ी जरूरी जानकारी।',
            join_banner_tag: 'कुशल कारीगरों के लिए',
            join_banner_title: 'क्या आप इलेक्ट्रीशियन, प्लंबर या बढ़ई हैं?',
            join_banner_desc: 'आज ही काम-नीरबाय से जुड़ें। अपने शहर में सीधे ग्राहक पाएं, उचित दर तय करें और बिना किसी कमीशन कटौती के अपनी दैनिक आय बढ़ाएं।',
            join_btn: 'कारीगर के रूप में जुड़ें',
            modal_about: 'कारीगर के बारे में',
            modal_coverage: 'सेवा क्षेत्र',
            modal_close: 'बंद करें',
            modal_proceed: 'प्रोफ़ाइल देखें व बुक करें',
            urgent_callback_title: 'आपातकालीन कारीगर कॉलबैक',
            urgent_callback_desc: 'अपना मोबाइल नंबर और पसंदीदा समय दर्ज करें। नजदीकी उपलब्ध कारीगर आपको तुरंत कॉल करेंगे।',
            mobile_number: 'आपका मोबाइल नंबर (10 अंक)',
            request_now: 'तुरंत कॉलबैक अनुरोध भेजें',
            request_received: 'अनुरोध प्राप्त हुआ!',
            request_received_desc: 'नजदीकी कारीगरों को सूचित कर दिया गया है। जल्द ही इस नंबर पर कॉल आएगी:'
          }
        };

        function t(key) {
          const lang = currentLang.value;
          return (i18n[lang] && i18n[lang][key]) || i18n.en[key] || key;
        }

        // Listen for global language changes from the top navbar button
        window.addEventListener('language-changed', (e) => {
          if (e.detail && e.detail.lang) {
            currentLang.value = e.detail.lang;
            nextTick(refreshIcons);
          }
        });

        // --- Search & Filter Reactive State ---
        const searchQuery = ref('');
        const selectedCity = ref('');
        const selectedCategory = ref('all');
        const availableOnly = ref(false);
        const sortBy = ref('rating_desc');
        const showSuggestions = ref(false);

        // Predefined suggested search terms
        const suggestedQueries = [
          'Plumber tap repair',
          'Electrician MCB tripping',
          'Split AC gas refill',
          'Carpenter door lock installation',
          'Wall painting & putty',
          'Appliance washing machine repair',
          'Bathroom deep cleaning'
        ];

        const popularCities = [
          'Mathura',
          'Greater Noida',
          'Noida',
          'Delhi NCR',
          'Ghaziabad',
          'Faridabad'
        ];

        // --- Interactive Price Estimator State ---
        const calcCategory = ref('electrical');
        const calcServiceKey = ref('switchboard');
        const calcUnits = ref(2);
        const calcUrgency = ref('standard');

        // Service catalog matrix with base pricing for calculation
        const serviceMatrix = {
          electrical: {
            name: 'Electrical',
            services: [
              { key: 'switchboard', name: 'Switchboard / Socket Repair', base: 199, perUnit: 80 },
              { key: 'fan', name: 'Ceiling Fan Installation / Fix', base: 249, perUnit: 120 },
              { key: 'mcb', name: 'MCB / Fuse Box Tripping Fix', base: 349, perUnit: 150 },
              { key: 'wiring', name: 'Room Rewiring & Lighting', base: 499, perUnit: 250 }
            ]
          },
          plumbing: {
            name: 'Plumbing',
            services: [
              { key: 'tap_leak', name: 'Tap / Faucet Leak Repair', base: 179, perUnit: 70 },
              { key: 'toilet_flush', name: 'Flush Tank / Seat Fitting', base: 299, perUnit: 150 },
              { key: 'pipe_blockage', name: 'Drain / Pipe Blockage Clean', base: 349, perUnit: 180 },
              { key: 'tank_clean', name: 'Overhead Tank Cleaning', base: 599, perUnit: 350 }
            ]
          },
          carpentry: {
            name: 'Carpentry',
            services: [
              { key: 'door_lock', name: 'Door Lock / Handle Repair', base: 249, perUnit: 100 },
              { key: 'hinge_fix', name: 'Cabinet / Wardrobe Hinge Fix', base: 199, perUnit: 80 },
              { key: 'furniture_assembly', name: 'Bed / Table Assembly', base: 399, perUnit: 200 }
            ]
          },
          painting: {
            name: 'Painting',
            services: [
              { key: 'touchup', name: 'Spot Waterproofing & Touchup', base: 499, perUnit: 250 },
              { key: 'single_room', name: 'Single Room Fresh Coat', base: 1499, perUnit: 900 },
              { key: 'full_home', name: 'Full Apartment Painting', base: 4999, perUnit: 2500 }
            ]
          },
          'ac-repair': {
            name: 'AC Repair',
            services: [
              { key: 'ac_service', name: 'Jet Clean Foam Servicing', base: 449, perUnit: 350 },
              { key: 'ac_gas', name: 'Refrigerant Gas Top-Up', base: 1299, perUnit: 950 },
              { key: 'ac_install', name: 'Uninstallation & Mounting', base: 799, perUnit: 600 }
            ]
          },
          cleaning: {
            name: 'Cleaning',
            services: [
              { key: 'deep_bathroom', name: 'Intense Bathroom Acid Wash', base: 399, perUnit: 250 },
              { key: 'kitchen_degrease', name: 'Kitchen Chimney & Tile Degreasing', base: 599, perUnit: 350 },
              { key: 'sofa_shampoo', name: 'Fabric Sofa Foam Shampoo', base: 499, perUnit: 150 }
            ]
          }
        };

        // Computed dynamic options for active calculator category
        const currentServiceOptions = computed(() => {
          return serviceMatrix[calcCategory.value]?.services || [];
        });

        // Ensure valid service key when category changes
        watch(calcCategory, (newCat) => {
          const list = serviceMatrix[newCat]?.services;
          if (list && list.length > 0) {
            calcServiceKey.value = list[0].key;
          }
        });

        // Dynamic price calculation
        const estimatedPrice = computed(() => {
          const catObj = serviceMatrix[calcCategory.value];
          if (!catObj) return { min: 250, max: 450 };
          const serv = catObj.services.find((s) => s.key === calcServiceKey.value) || catObj.services[0];
          const units = Math.max(1, parseInt(calcUnits.value) || 1);
          const urgencyMultiplier = calcUrgency.value === 'express' ? 1.3 : 1.0;

          const baseCalc = serv.base + (units - 1) * serv.perUnit;
          const min = Math.round(baseCalc * 0.9 * urgencyMultiplier);
          const max = Math.round(baseCalc * 1.25 * urgencyMultiplier);
          return { min, max, avg: Math.round((min + max) / 2) };
        });

        // --- Filtered Workers List ---
        const filteredWorkers = computed(() => {
          let list = [...allWorkers.value];

          // Filter by Category
          if (selectedCategory.value && selectedCategory.value !== 'all') {
            const catLower = selectedCategory.value.toLowerCase();
            list = list.filter((w) => {
              const workerCat = (w.category || '').toLowerCase();
              return workerCat.includes(catLower) || catLower.includes(workerCat);
            });
          }

          // Filter by City
          if (selectedCity.value && selectedCity.value.trim() !== '') {
            const cityLower = selectedCity.value.toLowerCase().trim();
            list = list.filter((w) => {
              const workerCity = (w.city || '').toLowerCase().trim();
              const serviceArea = (w.service_area || '').toLowerCase();
              return workerCity.includes(cityLower) || serviceArea.includes(cityLower);
            });
          }

          // Filter by Availability
          if (availableOnly.value) {
            list = list.filter((w) => w.available === 1 || w.available === true);
          }

          // Filter by Search Query
          if (searchQuery.value && searchQuery.value.trim() !== '') {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter((w) => {
              return (
                (w.name || '').toLowerCase().includes(q) ||
                (w.category || '').toLowerCase().includes(q) ||
                (w.city || '').toLowerCase().includes(q) ||
                (w.bio || '').toLowerCase().includes(q) ||
                (w.service_area || '').toLowerCase().includes(q)
              );
            });
          }

          // Sorting
          list.sort((a, b) => {
            if (sortBy.value === 'rating_desc') {
              return (b.avg_rating || 0) - (a.avg_rating || 0);
            } else if (sortBy.value === 'price_asc') {
              return (a.starting_price || 0) - (b.starting_price || 0);
            } else if (sortBy.value === 'price_desc') {
              return (b.starting_price || 0) - (a.starting_price || 0);
            } else if (sortBy.value === 'exp_desc') {
              return (b.experience_years || 0) - (a.experience_years || 0);
            }
            return 0;
          });

          return list;
        });

        // --- Quick View Worker Modal ---
        const activeModalWorker = ref(null);
        function openWorkerModal(worker) {
          activeModalWorker.value = worker;
          document.body.style.overflow = 'hidden';
          nextTick(refreshIcons);
        }
        function closeWorkerModal() {
          activeModalWorker.value = null;
          document.body.style.overflow = '';
        }

        // --- Perspective Switcher ("How It Works") ---
        const activePerspective = ref('customer');

        // --- FAQ Accordion ---
        const openFaqIndex = ref(0);
        function toggleFaq(idx) {
          openFaqIndex.value = openFaqIndex.value === idx ? null : idx;
        }

        // --- Quick Callback / Urgent Help Modal ---
        const showCallbackModal = ref(false);
        const callbackSuccess = ref(false);
        const callbackData = ref({
          name: '',
          phone: '',
          city: 'Mathura',
          service: 'Electrical',
          time: 'Within 30 mins'
        });

        function openCallbackModal(serviceName) {
          if (serviceName) callbackData.value.service = serviceName;
          callbackSuccess.value = false;
          showCallbackModal.value = true;
          document.body.style.overflow = 'hidden';
          nextTick(refreshIcons);
        }

        function closeCallbackModal() {
          showCallbackModal.value = false;
          document.body.style.overflow = '';
        }

        function submitCallback() {
          if (!callbackData.value.phone || callbackData.value.phone.length < 10) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
          }
          callbackSuccess.value = true;
          setTimeout(() => {
            // Keep success message visible briefly
          }, 3000);
        }

        // --- Helpers ---
        function selectCategory(slug) {
          selectedCategory.value = slug;
          scrollToWorkers();
        }

        function clearFilters() {
          searchQuery.value = '';
          selectedCity.value = '';
          selectedCategory.value = 'all';
          availableOnly.value = false;
          sortBy.value = 'rating_desc';
        }

        function selectSuggestion(item) {
          searchQuery.value = item;
          showSuggestions.value = false;
          scrollToWorkers();
        }

        function scrollToWorkers() {
          const el = document.getElementById('marketplace-directory');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }

        function applyCalculatorToMarketplace() {
          selectedCategory.value = calcCategory.value;
          scrollToWorkers();
        }

        function formatCurrency(num) {
          if (num === null || num === undefined) return '₹0';
          return '₹' + Number(num).toLocaleString('en-IN');
        }

        function refreshIcons() {
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }

        // Watchers for icon refreshing
        watch(filteredWorkers, () => nextTick(refreshIcons));
        watch(activePerspective, () => nextTick(refreshIcons));

        onMounted(() => {
          refreshIcons();
          // Hide search suggestions on document click outside
          document.addEventListener('click', (e) => {
            const box = document.querySelector('.vue-search-box');
            if (box && !box.contains(e.target)) {
              showSuggestions.value = false;
            }
          });
        });

        return {
          // Data
          categories,
          allWorkers,
          totalWorkerCount,
          totalCompletedBookings,
          popularCities,
          suggestedQueries,
          serviceMatrix,

          // Search & Filter
          searchQuery,
          selectedCity,
          selectedCategory,
          availableOnly,
          sortBy,
          showSuggestions,
          filteredWorkers,
          selectCategory,
          clearFilters,
          selectSuggestion,
          scrollToWorkers,

          // Calculator
          calcCategory,
          calcServiceKey,
          calcUnits,
          calcUrgency,
          currentServiceOptions,
          estimatedPrice,
          applyCalculatorToMarketplace,

          // Modals
          activeModalWorker,
          openWorkerModal,
          closeWorkerModal,

          // Perspective
          activePerspective,

          // FAQ
          openFaqIndex,
          toggleFaq,

          // Callback
          showCallbackModal,
          callbackData,
          callbackSuccess,
          openCallbackModal,
          closeCallbackModal,
          submitCallback,

          // Utils & i18n
          formatCurrency,
          currentLang,
          t
        };
      }
    }).mount('#landing-app');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVueLanding);
  } else {
    initVueLanding();
  }
})();
