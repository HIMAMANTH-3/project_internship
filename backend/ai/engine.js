// ai/engine.js — AI generation engine supporting Gemini, OpenAI, and local Mock mode
const PROMPT_VERSION = '1.0.0';

const SYSTEM_PROMPT = `You are an expert international export market positioning consultant specializing in furniture products for Sri Venkata Sai Furniture Works, an Indian furniture manufacturer with expertise in Home Furniture, Office Furniture, Custom Furniture, and Export-Grade Furniture.

Your task is to generate highly professional, realistic, data-driven, business-focused recommendations to help the company position their products in international markets.

CRITICAL: You must respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text). The JSON must contain EXACTLY these keys:
{
  "marketPositioning": "Detailed 3-4 paragraph market positioning strategy",
  "packagingAdaptations": "Specific packaging, labeling, and shipping recommendations for the target market",
  "pricingConsiderations": "Pricing strategy with currency, cost structure, competitor benchmarks, and margin guidance",
  "marketEntryStrategy": "Step-by-step market entry approach including channel, distribution, and partnership guidance",
  "competitiveAdvantages": "Key differentiators and unique selling propositions vs local and international competitors",
  "risks": "List of 4-6 key risks (regulatory, economic, logistics, cultural) with mitigation strategies",
  "exportReadinessChecklist": ["Checklist item 1", "Checklist item 2", "... (6-8 items total)"]
}

Make all recommendations specific to the target market's regulations, culture, consumer preferences, and economic conditions. Reference real standards, certifications, and trade agreements where relevant.`;

function buildUserPrompt(data) {
  return `Admin: ${data.adminName}
Product Category: ${data.productCategory}
Product Description: ${data.productDescription}
Target Export Market: ${data.targetMarket}
Business Goals: ${data.businessGoals}
Special Requirements: ${data.specialRequirements || 'None specified'}
Additional Notes: ${data.notes || 'None'}

Generate a comprehensive, actionable export market positioning report tailored specifically for this furniture product and target market.`;
}

// ── Mock Generator ────────────────────────────────────────────────────────────
function generateMockResponse(data) {
  const market = data.targetMarket.trim();
  const category = data.productCategory.trim();
  const product = data.productDescription.trim();

  // Market-specific data lookup
  const marketProfiles = {
    usa: {
      name: 'United States',
      currency: 'USD',
      standards: 'ANSI/BIFMA, California Proposition 65, CARB Phase 2',
      certifications: 'FSC (Forest Stewardship Council), GREENGUARD Gold',
      tradeAgreement: 'No FTA with India currently; GSP benefits may apply for eligible products',
      distributionChannels: 'Amazon Business, Wayfair, big-box retailers (IKEA, West Elm), B2B trade shows (NeoCon Chicago)',
      avgTariff: '0–5.9% (HS Chapter 94)',
      logistics: 'IATA/IMDG compliant ocean freight via major ports (Los Angeles, New York)',
      culturalNote: 'Americans value functionality, ergonomics, and value-for-money. Eco-certifications strongly influence purchasing decisions.',
      competitors: 'Ashley Furniture, Wayfair private labels, low-cost Chinese imports',
      priceRange: '$150–$800 per unit (mid-market segment)',
    },
    uk: {
      name: 'United Kingdom',
      currency: 'GBP',
      standards: 'BS EN 12520, BS EN 1022, UK REACH, BS 7176 (fire safety for upholstered furniture)',
      certifications: 'FSC, FIRA (Furniture Industry Research Association) Gold Award',
      tradeAgreement: 'India-UK FTA under negotiation; current MFN tariffs apply (~6.5% for furniture)',
      distributionChannels: 'John Lewis, Habitat, Argos, Made.com, online marketplaces, UK trade shows (Clerkenwell Design Week)',
      avgTariff: '6.5% MFN rate',
      logistics: 'DP World London Gateway or Felixstowe port; 25–30 day transit from India',
      culturalNote: 'UK buyers favour heritage craftsmanship, sustainability credentials, and classic-modern design hybrids.',
      competitors: 'IKEA UK, DFS, Made.com, Chinese OEM imports',
      priceRange: '£120–£650 per unit',
    },
    uae: {
      name: 'United Arab Emirates',
      currency: 'AED',
      standards: 'Emirates Authority for Standardisation (ESMA), GSO standards for furniture',
      certifications: 'ESMA product registration, Emirates Green Building Council compliance',
      tradeAgreement: 'India-UAE CEPA (Comprehensive Economic Partnership Agreement) — reduced tariffs to 0–5% for Indian exporters',
      distributionChannels: 'IKEA UAE, Pan Emirates, THE One, luxury fit-out companies, Index Exhibition Dubai',
      avgTariff: '0–5% under India-UAE CEPA',
      logistics: 'Jebel Ali Port (world\'s 9th largest); 10–14 day transit from India',
      culturalNote: 'UAE market demands luxury aesthetics, customisation for Arabic sitting styles, and premium packaging. Ramadan and festive gifting cycles drive bulk orders.',
      competitors: 'Italian luxury furniture brands, Turkish manufacturers, Malaysian budget imports',
      priceRange: 'AED 500–5,000 per unit (premium positioning recommended)',
    },
    germany: {
      name: 'Germany',
      currency: 'EUR',
      standards: 'EN 12520, EN 13761, DIN standards, GS (Geprüfte Sicherheit) mark, EU Ecodesign',
      certifications: 'PEFC, FSC, Blue Angel (Blauer Engel) eco-label, LGA quality mark',
      tradeAgreement: 'EU GSP+ scheme allows duty-free access for eligible Indian products',
      distributionChannels: 'IKEA Germany, XXXLutz, Höffner, Möbelhaus chains, Ambiente Frankfurt trade fair',
      avgTariff: '0–2.7% under EU GSP+ for eligible categories',
      logistics: 'Port of Hamburg or Bremen; strict ISPM-15 phytosanitary treatment mandatory for wood packaging',
      culturalNote: 'German consumers prioritise quality over price, environmental responsibility, and DIN-certified safety. Long-term B2B relationships valued over transactional deals.',
      competitors: 'Nobilia, Hülsta, IKEA, Danish design brands',
      priceRange: '€200–€900 per unit',
    },
    australia: {
      name: 'Australia',
      currency: 'AUD',
      standards: 'AS/NZS 4688 (furniture safety), ACCC product safety regulations, Australian Furniture Association standards',
      certifications: 'FSC, GECA (Good Environmental Choice Australia)',
      tradeAgreement: 'India-Australia ECTA (Economic Cooperation and Trade Agreement) — significant tariff reductions for Indian furniture',
      distributionChannels: 'Nick Scali, Harvey Norman, IKEA Australia, Freedom Furniture, online via Temple & Webster',
      avgTariff: '0–5% under India-Australia ECTA',
      logistics: 'Port of Sydney or Melbourne; 18–22 day sea transit; strict biosecurity inspections (DAFF)',
      culturalNote: 'Australians value outdoor-friendly, durable designs. "Made in India" increasingly well-received. Sustainability and ethical sourcing are key purchasing triggers.',
      competitors: 'Nick Scali private labels, Vietnamese manufacturers, flat-pack Chinese imports',
      priceRange: 'AUD 300–1,200 per unit',
    },
    canada: {
      name: 'Canada',
      currency: 'CAD',
      standards: 'CGSB (Canadian General Standards Board), Health Canada furniture safety guidelines',
      certifications: 'FSC Canada, GREENGUARD Gold, SCS Certified Sustainable',
      tradeAgreement: 'No India-Canada FTA; standard MFN tariffs ~0–9.5% depending on category',
      distributionChannels: 'IKEA Canada, The Brick, Leon\'s, Hudson\'s Bay, Amazon.ca, CIFF (Canada International Furniture Fair)',
      avgTariff: '0–9.5% MFN',
      logistics: 'Port of Vancouver or Montreal; 22–28 days sea transit from India',
      culturalNote: 'Canadian buyers are multicultural and receptive to South Asian craftsmanship. Strong demand for solid wood and sustainable materials in Quebec and Ontario.',
      competitors: 'BDI Furniture, Structube, Castlery, low-cost Asian imports',
      priceRange: 'CAD 200–1,000 per unit',
    },
  };

  // Match market (case-insensitive partial match)
  const marketKey = Object.keys(marketProfiles).find(k =>
    market.toLowerCase().includes(k) || marketProfiles[k].name.toLowerCase().includes(market.toLowerCase())
  );
  const m = marketProfiles[marketKey] || {
    name: market,
    currency: 'USD',
    standards: 'Local national quality and safety standards for furniture',
    certifications: 'ISO 9001, FSC certification recommended',
    tradeAgreement: 'Review applicable bilateral trade agreements between India and this market',
    distributionChannels: 'Local importers, trade shows, B2B distributors, e-commerce platforms',
    avgTariff: '5–15% (verify current HS Chapter 94 rates)',
    logistics: 'Ocean freight via nearest major port; 20–35 day transit from India',
    culturalNote: 'Research local consumer preferences, colour choices, and size specifications before production.',
    competitors: 'Local manufacturers, Chinese and Vietnamese imports',
    priceRange: 'Research local market benchmarks for competitive pricing',
  };

  const categoryLower = category.toLowerCase();
  const isOffice = categoryLower.includes('office');
  const isHome = categoryLower.includes('home') || categoryLower.includes('bedroom') || categoryLower.includes('living');
  const isCustom = categoryLower.includes('custom');
  const isOutdoor = categoryLower.includes('outdoor') || categoryLower.includes('garden');

  const productType = isOffice ? 'commercial/office furniture'
    : isCustom ? 'bespoke custom furniture'
    : isOutdoor ? 'outdoor and garden furniture'
    : 'residential home furniture';

  return {
    marketPositioning: `Sri Venkata Sai Furniture Works is uniquely positioned to capture the premium-to-mid segment of the ${m.name} ${productType} market by leveraging India's rich woodworking heritage, skilled artisan labour, and competitive cost structures. The ${category} segment in ${m.name} is currently valued at multi-billion dollar levels, with growing consumer appetite for handcrafted, sustainably sourced products that offer superior quality at accessible price points — precisely where Indian manufacturers hold a structural advantage over Chinese mass-market competitors.

The target product — ${product.slice(0, 120)}${product.length > 120 ? '...' : ''} — aligns strongly with current trends in ${m.name}. ${m.culturalNote} By prominently communicating the "Crafted in India" story, highlighting the use of natural materials, and showcasing the artisanal process through digital content and catalogues, the company can command a 15–25% price premium over comparable imports from Southeast Asia.

A focused B2B-first strategy is recommended for market entry: targeting interior designers, commercial fit-out companies, hospitality procurement teams, and mid-to-large retailers in ${m.name}. This approach reduces marketing overhead, enables bulk-order economics, and builds referenceable brand credibility faster than direct-to-consumer channels. Once 3–5 anchor B2B clients are secured, a parallel D2C e-commerce channel can be activated to capture retail margins.

Long-term brand positioning should emphasise four pillars: (1) Authentic Indian Craftsmanship — traceable, artisan-made products; (2) Sustainable & Responsible Sourcing — FSC-certified wood, low-VOC finishes; (3) Customisation Capability — ability to adapt designs to local aesthetic preferences; and (4) Competitive Value — comparable quality to European brands at 30–40% lower price points. These pillars form the foundation of a compelling brand narrative for the ${m.name} market.`,

    packagingAdaptations: `For the ${m.name} market, packaging must meet ${m.standards} compliance requirements and withstand the approximately ${m.logistics.includes('day') ? m.logistics.match(/\d+–?\d*/)?.[0] || '25' : '25'}-day ocean freight journey. All wooden packaging materials must comply with ISPM-15 (International Standards for Phytosanitary Measures) — heat treatment or methyl bromide fumigation is mandatory; stamps must be clearly visible on all wooden crates and pallets.

Primary packaging recommendations: (1) Multi-layer corrugated boxes (minimum 5-ply, 200 GSM burst strength) with internal honeycomb cardboard partitions for fragile components; (2) Foam-in-place or EPE foam padding for carved or finished surfaces; (3) Stretch-wrap all flat-pack components in bundles with silica gel sachets (minimum 5g per cubic foot) to prevent moisture damage during transit.

Labelling must be in English and comply with ${m.name} consumer protection laws. Required label information: country of origin ("Made in India"), product name, materials used, assembly instructions (with pictogram diagrams), weight/dimensions, FSC or relevant certification marks, and importer/distributor contact details. For the ${m.name} market specifically, also include compliance markings for ${m.standards}.

Sustainable packaging is a strong value signal: use recyclable or FSC-certified packaging materials, print with soy-based inks, and include a brief sustainability insert card. This resonates strongly with ${m.name} buyers and differentiates from competitors using non-recyclable plastic-heavy packaging. Consider adding a QR code linking to an assembly video and care guide, which improves customer satisfaction and reduces after-sales queries.`,

    pricingConsiderations: `Recommended pricing structure for the ${m.name} market in ${m.currency}: ${m.priceRange}. This positions the products in the accessible-premium segment — above mass-market Chinese imports but below European luxury brands — where Indian furniture has the strongest competitive differentiation.

Cost build-up model (approximate): Ex-Factory Cost (India) + 8–12% Export Packaging + 2–3% Pre-shipment Inspection (FSSAI/SGS) + Ocean Freight (India → ${m.name}) approx. $150–$350 per CBM + Marine Insurance (1.5% of CIF value) + Import Duty at ${m.avgTariff} + Port Handling & Customs Clearance + Importer/Distributor Margin (25–35%) + Retailer Markup (40–60%) = Consumer Retail Price.

For initial market entry, offer tiered pricing: (1) Distributor/Importer price at 35–45% below retail; (2) MOQ-linked discounts — 5% off for orders >50 units, 10% off for >200 units; (3) Sample order policy — first container at 10% discount against confirmed repeat order intent. This incentivises distributors to take risk on a new supplier.

Currency strategy: Quote in ${m.currency} to remove FX risk from the buyer side, but hedge your INR exposure through forward contracts via your bank. A 5–7% currency buffer built into pricing protects against INR depreciation. Avoid spot-rate quoting for orders with 90+ day delivery timelines. Payment terms recommendation: 30% advance TT + 70% against LC or sight draft — this balances cash flow with credit risk on a new market relationship.`,

    marketEntryStrategy: `Phase 1 — Market Intelligence & Compliance (Month 1–2): Engage an India-${m.name} export consultant or the FIEO (Federation of Indian Export Organisations) regional office to validate HS codes, confirm applicable tariffs under ${m.tradeAgreement}, and obtain an IEC (Import Export Code) if not already held. Register with the India Brand Equity Foundation (IBEF) and apply for MSME export promotion schemes. Conduct digital market research: analyse ${m.distributionChannels.split(',')[0]} bestseller rankings, pricing, and customer reviews to benchmark expectations.

Phase 2 — Product Certification & Sample Development (Month 2–4): Obtain pre-export quality certification from EEPC India or BIS. Arrange independent third-party testing (SGS, Bureau Veritas, or Intertek) to certify compliance with ${m.standards}. Develop 5–8 hero SKUs specifically adapted for ${m.name} preferences — consult local interior design blogs and social media trends. Produce professional product photography and a digital catalogue (PDF + interactive web version) with dimensions in metric and imperial units.

Phase 3 — Distributor & Channel Partner Identification (Month 3–5): List on IndiaMART Global, Alibaba.com, and TradeIndia to attract inbound distributor enquiries. Proactively target: ${m.distributionChannels}. Attend or exhibit at a relevant trade fair (consider a shared pavilion under "India Pavilion" for cost efficiency). Shortlist 2–3 distribution partners based on their existing portfolio, market reach, financial stability, and cultural fit.

Phase 4 — First Export & Relationship Building (Month 5–8): Execute first container shipment with a preferred distributor. Arrange video-call factory tour and provide detailed product documentation. Send a dedicated account manager for an in-person visit to ${m.name} within the first 6 months — this dramatically improves retention and up-sell rates. Gather market feedback systematically and iterate product specifications.

Phase 5 — Scale & Diversification (Month 9–18): Based on sell-through data, double down on top-performing SKUs. Explore direct-to-retailer relationships, bypassing one distribution layer to improve margins. Launch a localised landing page or microsite for ${m.name} buyers. Apply for additional certifications (${m.certifications}) to access premium retail channels. Set an annual revenue target of ₹2–4 Cr from this market in Year 1, scaling to ₹8–15 Cr by Year 3.`,

    competitiveAdvantages: `1. Cost-Competitiveness with Quality Parity: Indian skilled labour costs are 40–60% lower than European equivalents, enabling Sri Venkata Sai Furniture Works to deliver comparable quality at significantly lower cost. This creates a sustainable price advantage of 25–40% versus European competitors without sacrificing margins.

2. Authentic Handcrafted Heritage: The "Made in India" label carries strong positive associations in ${m.name} — particularly for carved wood furniture, inlay work, and artisanal finishing. This is a genuine differentiator versus mass-produced Chinese or flat-pack Scandinavian furniture. Storytelling about artisan families, traditional techniques, and regional wood traditions resonates powerfully with premium buyers.

3. Customisation Agility: Unlike large-scale automated manufacturers, a mid-sized Indian operation can accommodate custom dimensions, finishes, upholstery fabrics, and design modifications with lower MOQs (minimum order quantities). This is highly valued by interior designers, hospitality clients, and boutique retailers in ${m.name} who need differentiation.

4. India-${m.name} Trade Agreement Benefits: ${m.tradeAgreement} provides preferential duty access, reducing landed cost versus competitors from non-FTA countries and improving the value proposition for ${m.name} importers.

5. End-to-End Supply Capability: From raw material sourcing in India's timber-rich states (Rajasthan, Uttar Pradesh, Karnataka) to finished goods export, a vertically integrated or closely networked supply chain enables better quality control, shorter lead times, and transparent sourcing — all key concerns for ${m.name} buyers.

6. Growing "India Brand" Momentum: India's global brand equity in the premium handicrafts and home décor space is rising, supported by government initiatives like "Vocal for Local" on the global stage, and India's growing presence at international trade fairs. Early movers benefit from positive press coverage and "discovery" positioning before the market becomes saturated.`,

    risks: `1. Regulatory & Compliance Risk: ${m.name} enforces ${m.standards}. Non-compliance leads to port detention, product recalls, and reputational damage. MITIGATION: Engage a certified third-party testing lab (SGS/Bureau Veritas) before first shipment; budget ₹1.5–3L per product range for certification costs; appoint a local compliance consultant in ${m.name}.

2. Currency Fluctuation Risk: INR/USD or INR/${m.currency} volatility can erode margins significantly — a 5% adverse move can wipe out profit on a thin-margin shipment. MITIGATION: Use forward contracts for confirmed orders exceeding 60-day delivery; build a 5–7% forex buffer into all quotes; invoice in ${m.currency} where possible.

3. Logistics & Supply Chain Risk: Ocean freight delays, port congestion (especially post-COVID norms), container shortages, and damage in transit are persistent risks. MITIGATION: Maintain relationships with 2–3 freight forwarders; over-insure cargo (110% of CIF value); use consolidation (LCL) shipments for initial orders to reduce cash lock-up risk; build 45-day buffer stock for key accounts.

4. Intellectual Property & Design Copying Risk: Unique designs can be replicated by competitors in ${m.name} or other markets once publicly displayed. MITIGATION: Register key designs under the Designs Act 2000 (India) and consider design protection in ${m.name} for flagship products; watermark catalogue images; use NDAs with distributors covering proprietary designs.

5. Distributor Dependency Risk: Over-reliance on a single distributor creates vulnerability if the relationship sours or the distributor underperforms. MITIGATION: Develop parallel channels from Month 9 onwards; include performance clauses (minimum purchase commitments) in distributor agreements; maintain direct relationships with 2–3 end retailers as leverage.

6. Cultural & Design Mismatch Risk: Products designed for Indian tastes may not appeal to ${m.name} consumers without adaptation — wrong dimensions (bed sizes, sofa depths), colour palettes, or wood finishes. MITIGATION: Conduct consumer research or engage a local ${m.name}-based interior designer as a paid consultant before finalising export SKUs; use customer review data from ${m.distributionChannels.split(',')[0]} as a free research tool.`,

    exportReadinessChecklist: [
      `Obtain/verify Import Export Code (IEC) from DGFT India`,
      `Register with EEPC India (Engineering Export Promotion Council) for export support and market intelligence`,
      `Arrange third-party product testing for compliance with ${m.standards}`,
      `Ensure all wood packaging materials are ISPM-15 certified (heat treatment stamp visible on all wooden pallets/crates)`,
      `Obtain FSC or ${m.certifications.split(',')[0].trim()} certification for sustainable sourcing credibility`,
      `Prepare complete export documentation: Commercial Invoice, Packing List, Certificate of Origin (COO from EEPC/Chamber of Commerce), Bill of Lading, Phytosanitary Certificate (if applicable)`,
      `Open a dedicated export current account and set up forward contracts for currency hedging`,
      `Develop English-language product catalogue with ${m.name}-compliant labelling, metric + imperial dimensions, and QR-code linked assembly guides`,
      `Shortlist and sign agreement with a licensed customs broker / freight forwarder experienced in India → ${m.name} routes`,
      `Register on India's TreDS platform or arrange export credit insurance (ECGC) to manage payment risk on new buyer relationships`,
    ],
  };
}

// ── Gemini ────────────────────────────────────────────────────────────────────
async function generateWithGemini(data) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Try models in order of preference/availability
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
  let lastErr;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });
      const result = await model.generateContent(buildUserPrompt(data));
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
      // Only try next model if it's a 404 (model not found) or 429 per-model quota
      const msg = err.message || '';
      if (msg.includes('not found') || msg.includes('not supported')) {
        continue; // try next model
      }
      throw err; // re-throw other errors (auth, network, etc.)
    }
  }
  throw lastErr;
}

// ── OpenAI ────────────────────────────────────────────────────────────────────
async function generateWithOpenAI(data) {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(data) }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 4096
  });
  return JSON.parse(response.choices[0].message.content);
}

// ── Main Entry Point ──────────────────────────────────────────────────────────
async function generateRecommendation(data) {
  const start = Date.now();
  let aiResponse;
  let modelUsed;

  try {
    if (process.env.GEMINI_API_KEY) {
      aiResponse = await generateWithGemini(data);
      modelUsed = 'gemini-1.5-flash';
    } else if (process.env.OPENAI_API_KEY) {
      aiResponse = await generateWithOpenAI(data);
      modelUsed = 'gpt-4o';
    } else {
      // No API key — use built-in mock generator
      console.log('ℹ️  No API key set — using built-in expert mock generator.');
      aiResponse = generateMockResponse(data);
      modelUsed = 'mock-expert';
    }
  } catch (err) {
    const msg = err.message || '';

    // On quota / auth failure, fall back to mock instead of crashing
    if (
      msg.includes('quota') || msg.includes('429') || msg.includes('Too Many') ||
      msg.includes('RESOURCE_EXHAUSTED') || msg.includes('API key') ||
      msg.includes('invalid') || msg.includes('PERMISSION_DENIED')
    ) {
      console.warn('⚠️  AI API unavailable — falling back to expert mock generator. Reason:', msg.slice(0, 80));
      aiResponse = generateMockResponse(data);
      modelUsed = 'mock-expert-fallback';
    } else if (msg.includes('JSON')) {
      throw new Error('AI returned malformed response. Please try again.');
    } else {
      throw err;
    }
  }

  const responseTime = Date.now() - start;

  // Validate expected keys exist
  const requiredKeys = ['marketPositioning', 'packagingAdaptations', 'pricingConsiderations',
    'marketEntryStrategy', 'competitiveAdvantages', 'risks', 'exportReadinessChecklist'];
  for (const key of requiredKeys) {
    if (!aiResponse[key]) {
      aiResponse[key] = `[${key} data not available — please regenerate]`;
    }
  }

  return { aiResponse, responseTime, modelUsed, promptVersion: PROMPT_VERSION };
}

module.exports = { generateRecommendation, PROMPT_VERSION };
