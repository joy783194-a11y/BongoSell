import {
  supabase,
  isSupabaseConfigured,
  DatabaseProduct,
  DatabaseOrder,
  DatabaseOrderItem,
  DatabaseConversation,
  DatabaseMessage,
  DatabaseAIAgentSettings,
  DatabaseKnowledgeDocument,
  DatabaseConnectedPage,
  DatabaseSubscription,
  DatabaseUsageEvent,
} from './supabase';

/**
 * Check if error is due to missing tables / pending migrations on Supabase
 */
function isTableMissingError(errorMsg?: string | null): boolean {
  if (!errorMsg) return false;
  return (
    errorMsg.includes('Could not find the table') ||
    errorMsg.includes('schema cache') ||
    errorMsg.includes('does not exist') ||
    errorMsg.includes('relation') ||
    errorMsg.includes('fetch failed')
  );
}

/**
 * Seed initial realistic Bengali F-commerce data for testing & fallback
 */
const INITIAL_DEMO_PRODUCTS: DatabaseProduct[] = [
  {
    id: 'prod-jamdani-101',
    workspace_id: 'default-ws',
    name: 'রয়েল ব্লু ঢাকাই জামদানি শাড়ী',
    description: 'আসল সুতি ঢাকাই জামদানি, নিখুঁত হাতের কাজ, সাথে ম্যাচিং ব্লাউজ পিস।',
    sku: 'JMD-802',
    category: 'Clothing',
    price: 3200,
    minimum_price: 3000,
    discount_limit: 200,
    stock_quantity: 14,
    image_url: null,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod-earbuds-202',
    workspace_id: 'default-ws',
    name: 'Aura Pro ANC Earbuds (Matte Black)',
    description: 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন, ৩০ ঘণ্টা প্লেব্যাক, ৬ মাসের অফিশিয়াল ওয়ারেন্টি।',
    sku: 'EAR-104',
    category: 'Gadgets',
    price: 1850,
    minimum_price: 1750,
    discount_limit: 100,
    stock_quantity: 28,
    image_url: null,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-gel-303',
    workspace_id: 'default-ws',
    name: 'অ্যাকনে কেয়ার জেল ময়েশ্চারাইজার (১০০ মিলি)',
    description: 'তৈলাক্ত ও ব্রণপ্রবণ ত্বকের জন্য উপযোগী সেন্টেলা ও নিয়াসিনামাইড উপাদান।',
    sku: 'SKN-301',
    category: 'Cosmetics',
    price: 850,
    minimum_price: 800,
    discount_limit: 50,
    stock_quantity: 42,
    image_url: null,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-sunblock-404',
    workspace_id: 'default-ws',
    name: 'হাইড্রেটিং সানব্লক SPF 50+ PA+++',
    description: 'কোনো সাদা দাগ ছাড়া দ্রুত শোষিত হয়, ওয়াটার রেজিস্ট্যান্ট ও নন-গ্রিসি।',
    sku: 'SKN-305',
    category: 'Cosmetics',
    price: 750,
    minimum_price: 700,
    discount_limit: 50,
    stock_quantity: 0,
    image_url: null,
    status: 'draft',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_DEMO_ORDERS: DatabaseOrder[] = [
  {
    id: 'ord-8941',
    workspace_id: 'default-ws',
    conversation_id: 'conv-nusrat-1',
    order_number: 'ORD-8941',
    customer_name: 'নুসরাত জাহান',
    customer_phone: '01711234567',
    delivery_address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা',
    delivery_area: 'inside_dhaka',
    status: 'confirmed',
    subtotal: 3200,
    discount_amount: 0,
    delivery_charge: 70,
    total_amount: 3270,
    payment_method: 'Cash on Delivery (COD)',
    payment_status: 'unpaid',
    notes: 'বিকেল ৪টার পর ডেলিভারি দিতে অনুরোধ করেছেন।',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    order_items: [
      {
        id: 'item-8941-1',
        workspace_id: 'default-ws',
        order_id: 'ord-8941',
        product_id: 'prod-jamdani-101',
        product_name_snapshot: 'রয়েল ব্লু ঢাকাই জামদানি শাড়ী',
        unit_price: 3200,
        quantity: 1,
        line_total: 3200,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'ord-8940',
    workspace_id: 'default-ws',
    conversation_id: 'conv-tanvir-2',
    order_number: 'ORD-8940',
    customer_name: 'মোঃ তানভীর হাসান',
    customer_phone: '01819998877',
    delivery_address: 'নাসিরাবাদ হাউজিং সোসাইটি, চট্টগ্রাম',
    delivery_area: 'outside_dhaka',
    status: 'pending_confirmation',
    subtotal: 1850,
    discount_amount: 0,
    delivery_charge: 130,
    total_amount: 1980,
    payment_method: 'Cash on Delivery (COD)',
    payment_status: 'unpaid',
    notes: 'কল দিয়ে অর্ডার কনফার্ম করতে হবে।',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    order_items: [
      {
        id: 'item-8940-1',
        workspace_id: 'default-ws',
        order_id: 'ord-8940',
        product_id: 'prod-earbuds-202',
        product_name_snapshot: 'Aura Pro ANC Earbuds (Matte Black)',
        unit_price: 1850,
        quantity: 1,
        line_total: 1850,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'ord-8935',
    workspace_id: 'default-ws',
    conversation_id: null,
    order_number: 'ORD-8935',
    customer_name: 'ফারজানা আক্তার',
    customer_phone: '01923445566',
    delivery_address: 'সেক্টর ৪, উত্তরা, ঢাকা',
    delivery_area: 'inside_dhaka',
    status: 'shipped',
    subtotal: 1500,
    discount_amount: 0,
    delivery_charge: 70,
    total_amount: 1570,
    payment_method: 'Cash on Delivery (COD)',
    payment_status: 'unpaid',
    notes: 'Steadfast Courier Tracking: ST-99824',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    order_items: [
      {
        id: 'item-8935-1',
        workspace_id: 'default-ws',
        order_id: 'ord-8935',
        product_id: 'prod-gel-303',
        product_name_snapshot: 'অ্যাকনে কেয়ার জেল + সানব্লক কম্বো',
        unit_price: 1500,
        quantity: 1,
        line_total: 1500,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

const INITIAL_DEMO_CONVERSATIONS: DatabaseConversation[] = [
  {
    id: 'conv-nusrat-1',
    workspace_id: 'default-ws',
    connected_page_id: null,
    external_conversation_id: 'fb-thread-101',
    customer_display_name: 'নুসরাত জাহান',
    customer_external_id: 'fb-user-101',
    status: 'resolved',
    assigned_to_user_id: null,
    human_takeover_enabled: false,
    last_message_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'conv-tanvir-2',
    workspace_id: 'default-ws',
    connected_page_id: null,
    external_conversation_id: 'fb-thread-102',
    customer_display_name: 'MD Tanvir',
    customer_external_id: 'fb-user-102',
    status: 'pending',
    assigned_to_user_id: null,
    human_takeover_enabled: false,
    last_message_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'conv-afsana-3',
    workspace_id: 'default-ws',
    connected_page_id: null,
    external_conversation_id: 'fb-thread-103',
    customer_display_name: 'Afsana Mimi',
    customer_external_id: 'fb-user-103',
    status: 'open',
    assigned_to_user_id: null,
    human_takeover_enabled: false,
    last_message_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
  {
    id: 'conv-rakib-4',
    workspace_id: 'default-ws',
    connected_page_id: null,
    external_conversation_id: 'fb-thread-104',
    customer_display_name: 'Rakibul Hasan',
    customer_external_id: 'fb-user-104',
    status: 'open',
    assigned_to_user_id: null,
    human_takeover_enabled: true,
    last_message_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

const INITIAL_DEMO_MESSAGES: Record<string, DatabaseMessage[]> = {
  'conv-nusrat-1': [
    {
      id: 'msg-1',
      workspace_id: 'default-ws',
      conversation_id: 'conv-nusrat-1',
      direction: 'inbound',
      sender_type: 'customer',
      content: 'আসসালামু আলাইকুম, জামদানি শাড়ীর কি আর কোনো কালার আছে?',
      message_type: 'text',
      external_message_id: 'm1',
      delivery_status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    },
    {
      id: 'msg-2',
      workspace_id: 'default-ws',
      conversation_id: 'conv-nusrat-1',
      direction: 'outbound',
      sender_type: 'ai',
      content: 'ওয়ালাইকুম আসসালাম আপু! আমাদের কাছে বর্তমানে জনপ্রিয় রয়েল ব্লু (রেড বর্ডার) কালারটি ইন-স্টক আছে। ফিক্সড প্রাইজ ৩,২০০ টাকা। ঢাকা সিটিতে হোম ডেলিভারি ৭০ টাকা। আপনি কি অর্ডার করতে চান?',
      message_type: 'text',
      external_message_id: 'm2',
      delivery_status: 'delivered',
      created_at: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    },
    {
      id: 'msg-3',
      workspace_id: 'default-ws',
      conversation_id: 'conv-nusrat-1',
      direction: 'inbound',
      sender_type: 'customer',
      content: 'হ্যাঁ, আমি ১ পিস নিব। নাম: নুসরাত জাহান, ফোন: 01711234567, ঠিকানা: বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা।',
      message_type: 'text',
      external_message_id: 'm3',
      delivery_status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    },
    {
      id: 'msg-4',
      workspace_id: 'default-ws',
      conversation_id: 'conv-nusrat-1',
      direction: 'outbound',
      sender_type: 'ai',
      content: 'অনেক ধন্যবাদ আপু! আপনার অর্ডারটি নিশ্চিত করা হয়েছে (অর্ডার আইডি #ORD-8941)। মোট ৩,২৭০ টাকা ক্যাশ অন ডেলিভারিতে ২-৩ কার্যদিবসের মধ্যে পেয়ে যাবেন।',
      message_type: 'order_card',
      external_message_id: 'm4',
      delivery_status: 'delivered',
      created_at: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
    },
  ],
  'conv-tanvir-2': [
    {
      id: 'msg-201',
      workspace_id: 'default-ws',
      conversation_id: 'conv-tanvir-2',
      direction: 'inbound',
      sender_type: 'customer',
      content: 'Bhai earbuds er battery backup kemon? Chattogram a courier charge koto?',
      message_type: 'text',
      external_message_id: 'm201',
      delivery_status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    },
    {
      id: 'msg-202',
      workspace_id: 'default-ws',
      conversation_id: 'conv-tanvir-2',
      direction: 'outbound',
      sender_type: 'ai',
      content: 'Hi brother! Aura Pro ANC Earbuds a single charge a 6 hours and case shoho 30 hours porjonto playback paben. Chattogram courier charge 130 taka. Total 1,980 taka (COD).',
      message_type: 'text',
      external_message_id: 'm202',
      delivery_status: 'delivered',
      created_at: new Date(Date.now() - 1000 * 60 * 114).toISOString(),
    },
    {
      id: 'msg-203',
      workspace_id: 'default-ws',
      conversation_id: 'conv-tanvir-2',
      direction: 'inbound',
      sender_type: 'customer',
      content: 'Nasirabad, Chattogram a pathiye den. MD Tanvir, 01819998877',
      message_type: 'text',
      external_message_id: 'm203',
      delivery_status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
  'conv-afsana-3': [
    {
      id: 'msg-301',
      workspace_id: 'default-ws',
      conversation_id: 'conv-afsana-3',
      direction: 'inbound',
      sender_type: 'customer',
      content: 'Aei cream ta ki oily skin er jonno valo? Kono side effect ache?',
      message_type: 'text',
      external_message_id: 'm301',
      delivery_status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    },
    {
      id: 'msg-302',
      workspace_id: 'default-ws',
      conversation_id: 'conv-afsana-3',
      direction: 'outbound',
      sender_type: 'ai',
      content: 'জি আপু, আমাদের অ্যাকনে কেয়ার জেল ময়েশ্চারাইজারটি শতভাগ অয়েল-ফ্রি ওয়াটার জেল। এতে সেন্টেলা ও নিয়াসিনামাইড রয়েছে যা ব্রণ কমাতে সাহায্য করে এবং ত্বক অতিরিক্ত তৈলাক্ত করে না।',
      message_type: 'text',
      external_message_id: 'm302',
      delivery_status: 'delivered',
      created_at: new Date(Date.now() - 1000 * 60 * 199).toISOString(),
    },
  ],
  'conv-rakib-4': [
    {
      id: 'msg-401',
      workspace_id: 'default-ws',
      conversation_id: 'conv-rakib-4',
      direction: 'inbound',
      sender_type: 'customer',
      content: 'Bhai ami 20 piece wholesale nite chai, admin er sathe kotha bolte parbo?',
      message_type: 'text',
      external_message_id: 'm401',
      delivery_status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    },
    {
      id: 'msg-402',
      workspace_id: 'default-ws',
      conversation_id: 'conv-rakib-4',
      direction: 'outbound',
      sender_type: 'ai',
      content: 'জি ভাইয়া, হোলসেল অর্ডারের জন্য আমি পেইজের অ্যাডমিনের কাছে আপনার রিকোয়েস্ট ফরোয়ার্ড করেছি। খুব শীঘ্রই আমাদের সেলস প্রতিনিধি আপনার সাথে ইনবক্সে যোগাযোগ করবেন।',
      message_type: 'text',
      external_message_id: 'm402',
      delivery_status: 'delivered',
      created_at: new Date(Date.now() - 1000 * 60 * 299).toISOString(),
    },
  ],
};

const INITIAL_DEMO_KNOWLEDGE: DatabaseKnowledgeDocument[] = [
  {
    id: 'kdoc-1',
    workspace_id: 'default-ws',
    title: 'ডেলিভারি চার্জ ও সময়সীমা (Delivery Policy)',
    content: 'ঢাকার ভেতরে ডেলিভারি চার্জ ৭০ টাকা (১-২ কার্যদিবস)। ঢাকার বাইরে কুরিয়ার চার্জ ১৩০ টাকা (২-৩ কার্যদিবস)। রেডএক্স ও স্টিডফাস্ট কুরিয়ারের মাধ্যমে ক্যাশ অন ডেলিভারি (COD) প্রযোজ্য।',
    document_type: 'shipping',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kdoc-2',
    workspace_id: 'default-ws',
    title: 'এক্সচেঞ্জ ও রিটার্ন পলিসি (Exchange Rules)',
    content: 'ডেলিভারিম্যানের উপস্থিতিতে পণ্য চেক করে গ্রহণ করবেন। কোনো ত্রুটি থাকলে ডেলিভারিম্যান থাকা অবস্থাতেই আমাদের ইনবক্সে ভিডিও সহ জানাতে হবে। সাইজ পরিবর্তনের ক্ষেত্রে ডেলিভারি চার্জ প্রদান সাপেক্ষে ৩ দিনের মধ্যে এক্সচেঞ্জ করা যাবে।',
    document_type: 'policy',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// In-Memory store for preview environment when Supabase is unconfigured or tables are pending migration
const memoryStore = {
  products: [...INITIAL_DEMO_PRODUCTS],
  orders: [...INITIAL_DEMO_ORDERS],
  conversations: [...INITIAL_DEMO_CONVERSATIONS],
  messages: { ...INITIAL_DEMO_MESSAGES },
  agentSettings: {
    id: 'agent-1',
    workspace_id: 'default-ws',
    agent_name: 'BongoSell AI Assistant',
    enabled: true,
    preferred_language: 'bn' as const,
    tone: 'polite_bn' as const,
    business_instructions: 'সবসময় আপু/ভাইয়া বলে আন্তরিকভাবে কথা বলবে। ফিক্সড প্রাইসের বাইরে দাম কমাবে না। অর্ডার নিশ্চিত করার জন্য নাম, মোবাইল নম্বর ও পূর্ণ ঠিকানা সংগ্রহ করবে।',
    greeting_message: 'আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?',
    minimum_price_enforcement_enabled: true,
    human_handover_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as DatabaseAIAgentSettings,
  knowledgeDocs: [...INITIAL_DEMO_KNOWLEDGE],
  subscription: {
    id: 'sub-1',
    workspace_id: 'default-ws',
    plan_code: 'starter' as const,
    status: 'trial' as const,
    billing_cycle: 'monthly' as const,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 86400000 * 14).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as DatabaseSubscription,
  usageEvents: [
    {
      id: 'ue-1',
      workspace_id: 'default-ws',
      event_type: 'message_processed' as const,
      quantity: 42,
      estimated_cost: 0,
      idempotency_key: 'init-1',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ue-2',
      workspace_id: 'default-ws',
      event_type: 'order_captured' as const,
      quantity: 3,
      estimated_cost: 0,
      idempotency_key: 'init-2',
      created_at: new Date().toISOString(),
    },
  ] as DatabaseUsageEvent[],
};

/**
 * ============================================================================
 * PRODUCT CATALOG SERVICE
 * ============================================================================
 */
export async function getProducts(workspaceId: string): Promise<DatabaseProduct[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DatabaseProduct[];
      }
      if (error && !isTableMissingError(error.message)) {
        console.warn('Supabase query error:', error);
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local dataset:', err);
    }
  }

  return memoryStore.products;
}

export async function addProduct(
  workspaceId: string,
  productData: Omit<DatabaseProduct, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
): Promise<{ data: DatabaseProduct | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          workspace_id: workspaceId,
        })
        .select()
        .single();

      if (!error && data) {
        return { data: data as DatabaseProduct, error: null };
      }

      if (error && !isTableMissingError(error.message)) {
        return { data: null, error: error.message };
      }
      // If table is missing on remote, fall through to memory store
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { data: null, error: err.message || 'Failed to add product' };
      }
    }
  }

  // Fallback memory insert
  const newProduct: DatabaseProduct = {
    ...productData,
    id: 'prod-' + Date.now(),
    workspace_id: workspaceId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.products = [newProduct, ...memoryStore.products];
  return { data: newProduct, error: null };
}

export async function updateProduct(
  productId: string,
  updates: Partial<DatabaseProduct>
): Promise<{ data: DatabaseProduct | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (!error && data) {
        return { data: data as DatabaseProduct, error: null };
      }

      if (error && !isTableMissingError(error.message)) {
        return { data: null, error: error.message };
      }
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { data: null, error: err.message || 'Failed to update product' };
      }
    }
  }

  memoryStore.products = memoryStore.products.map((p) =>
    p.id === productId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
  );
  const updated = memoryStore.products.find((p) => p.id === productId) || null;
  return { data: updated, error: null };
}

export async function deleteProduct(productId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error && !isTableMissingError(error.message)) {
        return { error: error.message };
      }
      if (!error) return { error: null };
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { error: err.message || 'Failed to delete product' };
      }
    }
  }

  memoryStore.products = memoryStore.products.filter((p) => p.id !== productId);
  return { error: null };
}

/**
 * ============================================================================
 * ORDERS SERVICE
 * ============================================================================
 */
export async function getOrders(workspaceId: string): Promise<DatabaseOrder[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DatabaseOrder[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local orders:', err);
    }
  }

  return memoryStore.orders;
}

export async function updateOrderStatus(
  orderId: string,
  status: DatabaseOrder['status']
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error && !isTableMissingError(error.message)) {
        return { error: error.message };
      }
      if (!error) return { error: null };
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { error: err.message || 'Failed to update order status' };
      }
    }
  }

  memoryStore.orders = memoryStore.orders.map((o) =>
    o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
  );
  return { error: null };
}

export async function createOrder(
  workspaceId: string,
  orderData: Omit<DatabaseOrder, 'id' | 'workspace_id' | 'created_at' | 'updated_at' | 'order_items'>,
  items: Array<Omit<DatabaseOrderItem, 'id' | 'workspace_id' | 'order_id' | 'created_at'>>
): Promise<{ data: DatabaseOrder | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          workspace_id: workspaceId,
        })
        .select()
        .single();

      if (!orderErr && order) {
        if (items.length > 0) {
          const orderItemsPayload = items.map((it) => ({
            ...it,
            workspace_id: workspaceId,
            order_id: order.id,
          }));
          await supabase.from('order_items').insert(orderItemsPayload);
        }
        return { data: order as DatabaseOrder, error: null };
      }

      if (orderErr && !isTableMissingError(orderErr.message)) {
        return { data: null, error: orderErr.message };
      }
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { data: null, error: err.message || 'Failed to create order' };
      }
    }
  }

  const newOrderId = 'ord-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder: DatabaseOrder = {
    ...orderData,
    id: newOrderId,
    workspace_id: workspaceId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: items.map((it, idx) => ({
      ...it,
      id: `item-${newOrderId}-${idx}`,
      workspace_id: workspaceId,
      order_id: newOrderId,
      created_at: new Date().toISOString(),
    })),
  };

  memoryStore.orders = [newOrder, ...memoryStore.orders];
  return { data: newOrder, error: null };
}

/**
 * ============================================================================
 * CONVERSATIONS & LIVE INBOX SERVICE
 * ============================================================================
 */
export async function getConversations(workspaceId: string): Promise<DatabaseConversation[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('last_message_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DatabaseConversation[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local conversations:', err);
    }
  }

  return memoryStore.conversations;
}

export async function getMessages(conversationId: string): Promise<DatabaseMessage[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as DatabaseMessage[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local messages:', err);
    }
  }

  return memoryStore.messages[conversationId] || [];
}

export async function sendMessage(
  workspaceId: string,
  conversationId: string,
  content: string,
  senderType: 'human' | 'customer' | 'ai'
): Promise<{ data: DatabaseMessage | null; error: string | null }> {
  const direction = senderType === 'customer' ? 'inbound' : 'outbound';

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          workspace_id: workspaceId,
          conversation_id: conversationId,
          direction,
          sender_type: senderType,
          content,
          delivery_status: 'delivered',
        })
        .select()
        .single();

      if (!error && data) {
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

        return { data: data as DatabaseMessage, error: null };
      }

      if (error && !isTableMissingError(error.message)) {
        return { data: null, error: error.message };
      }
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { data: null, error: err.message || 'Failed to dispatch message' };
      }
    }
  }

  const newMsg: DatabaseMessage = {
    id: 'msg-' + Date.now(),
    workspace_id: workspaceId,
    conversation_id: conversationId,
    direction,
    sender_type: senderType,
    content,
    message_type: 'text',
    external_message_id: null,
    delivery_status: 'delivered',
    created_at: new Date().toISOString(),
  };

  if (!memoryStore.messages[conversationId]) {
    memoryStore.messages[conversationId] = [];
  }
  memoryStore.messages[conversationId].push(newMsg);

  memoryStore.conversations = memoryStore.conversations.map((c) =>
    c.id === conversationId ? { ...c, last_message_at: new Date().toISOString() } : c
  );

  return { data: newMsg, error: null };
}

export async function toggleHumanTakeover(
  conversationId: string,
  enabled: boolean
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          human_takeover_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (error && !isTableMissingError(error.message)) {
        return { error: error.message };
      }
      if (!error) return { error: null };
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { error: err.message || 'Failed to toggle takeover' };
      }
    }
  }

  memoryStore.conversations = memoryStore.conversations.map((c) =>
    c.id === conversationId ? { ...c, human_takeover_enabled: enabled } : c
  );
  return { error: null };
}

/**
 * ============================================================================
 * AI AGENT & KNOWLEDGE DOCUMENTS SERVICE
 * ============================================================================
 */
export async function getAIAgentSettings(
  workspaceId: string
): Promise<DatabaseAIAgentSettings | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('ai_agent_settings')
        .select('*')
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (!error && data) {
        return data as DatabaseAIAgentSettings;
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local agent settings:', err);
    }
  }

  return memoryStore.agentSettings;
}

export async function saveAIAgentSettings(
  workspaceId: string,
  settings: Partial<DatabaseAIAgentSettings>
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('ai_agent_settings').upsert(
        {
          workspace_id: workspaceId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id' }
      );

      if (error && !isTableMissingError(error.message)) {
        return { error: error.message };
      }
      if (!error) return { error: null };
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { error: err.message || 'Failed to save settings' };
      }
    }
  }

  memoryStore.agentSettings = {
    ...memoryStore.agentSettings,
    ...settings,
    updated_at: new Date().toISOString(),
  };
  return { error: null };
}

export async function getKnowledgeDocuments(
  workspaceId: string
): Promise<DatabaseKnowledgeDocument[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DatabaseKnowledgeDocument[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local knowledge docs:', err);
    }
  }

  return memoryStore.knowledgeDocs;
}

export async function addKnowledgeDocument(
  workspaceId: string,
  doc: Omit<DatabaseKnowledgeDocument, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
): Promise<{ data: DatabaseKnowledgeDocument | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .insert({
          ...doc,
          workspace_id: workspaceId,
        })
        .select()
        .single();

      if (!error && data) {
        return { data: data as DatabaseKnowledgeDocument, error: null };
      }

      if (error && !isTableMissingError(error.message)) {
        return { data: null, error: error.message };
      }
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { data: null, error: err.message || 'Failed to add document' };
      }
    }
  }

  const newDoc: DatabaseKnowledgeDocument = {
    ...doc,
    id: 'kdoc-' + Date.now(),
    workspace_id: workspaceId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memoryStore.knowledgeDocs = [newDoc, ...memoryStore.knowledgeDocs];
  return { data: newDoc, error: null };
}

export async function deleteKnowledgeDocument(docId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('knowledge_documents').delete().eq('id', docId);
      if (error && !isTableMissingError(error.message)) {
        return { error: error.message };
      }
      if (!error) return { error: null };
    } catch (err: any) {
      if (!isTableMissingError(err.message)) {
        return { error: err.message || 'Failed to delete document' };
      }
    }
  }

  memoryStore.knowledgeDocs = memoryStore.knowledgeDocs.filter((d) => d.id !== docId);
  return { error: null };
}

/**
 * ============================================================================
 * CONNECTED PAGES SERVICE
 * ============================================================================
 */
export async function getConnectedPages(
  workspaceId: string
): Promise<DatabaseConnectedPage[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('connected_pages')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (!error && data) {
        return data as DatabaseConnectedPage[];
      }
    } catch (err) {
      console.warn('Supabase query failed for connected pages:', err);
    }
  }

  return [];
}

/**
 * ============================================================================
 * SUBSCRIPTIONS & USAGE
 * ============================================================================
 */
export async function getSubscription(
  workspaceId: string
): Promise<DatabaseSubscription | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (!error && data) {
        return data as DatabaseSubscription;
      }
    } catch (err) {
      console.warn('Supabase query failed for subscription:', err);
    }
  }

  return memoryStore.subscription;
}

export async function getUsageEvents(
  workspaceId: string
): Promise<DatabaseUsageEvent[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('usage_events')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (!error && data && data.length > 0) {
        return data as DatabaseUsageEvent[];
      }
    } catch (err) {
      console.warn('Supabase query failed for usage events:', err);
    }
  }

  return memoryStore.usageEvents;
}
