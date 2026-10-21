import { describe, it, expect } from 'vitest';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  createOrder,
  updateOrderStatus,
  getConversations,
  sendMessage,
  toggleHumanTakeover,
  getAIAgentSettings,
  saveAIAgentSettings,
  getKnowledgeDocuments,
  addKnowledgeDocument,
  deleteKnowledgeDocument,
} from './database-service';

describe('Database Service & Multi-Tenant Operations', () => {
  const testWorkspaceId = 'test-ws-automation';

  it('fetches initial products catalog', async () => {
    const products = await getProducts(testWorkspaceId);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('price');
    expect(products[0]).toHaveProperty('sku');
  });

  it('creates and retrieves a new product in the catalog', async () => {
    const newProductPayload = {
      name: 'সিল্ক জামদানি স্পেশাল',
      description: 'টেস্ট বিবরণ',
      sku: 'SLK-999',
      category: 'Clothing',
      price: 4500,
      minimum_price: 4200,
      discount_limit: 300,
      stock_quantity: 12,
      image_url: null,
      status: 'active' as const,
    };

    const { data, error } = await addProduct(testWorkspaceId, newProductPayload);
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.name).toBe('সিল্ক জামদানি স্পেশাল');
    expect(data?.price).toBe(4500);
    expect(data?.minimum_price).toBe(4200);

    // Verify it appears in product list
    const products = await getProducts(testWorkspaceId);
    const found = products.find((p) => p.sku === 'SLK-999');
    expect(found).toBeDefined();

    // Clean up
    if (data?.id) {
      await deleteProduct(data.id);
    }
  });

  it('updates product pricing and status', async () => {
    const products = await getProducts(testWorkspaceId);
    const firstProduct = products[0];

    const { data, error } = await updateProduct(firstProduct.id, {
      stock_quantity: 25,
      status: 'active',
    });

    expect(error).toBeNull();
    expect(data?.stock_quantity).toBe(25);
  });

  it('manages orders and status lifecycle', async () => {
    const orders = await getOrders(testWorkspaceId);
    expect(orders.length).toBeGreaterThan(0);

    const firstOrder = orders[0];
    const { error: updateErr } = await updateOrderStatus(firstOrder.id, 'shipped');
    expect(updateErr).toBeNull();

    // Record a manual order
    const { data: newOrder, error: createErr } = await createOrder(
      testWorkspaceId,
      {
        conversation_id: null,
        order_number: 'ORD-TEST-99',
        customer_name: 'সাকিব আল হাসান',
        customer_phone: '01700000000',
        delivery_address: 'মিরপুর ২, ঢাকা',
        delivery_area: 'inside_dhaka',
        status: 'confirmed',
        subtotal: 3200,
        discount_amount: 0,
        delivery_charge: 70,
        total_amount: 3270,
        payment_method: 'Cash on Delivery (COD)',
        payment_status: 'unpaid',
        notes: 'টেস্ট অর্ডার',
      },
      [
        {
          product_id: null,
          product_name_snapshot: 'রয়েল ব্লু ঢাকাই জামদানি শাড়ী',
          unit_price: 3200,
          quantity: 1,
          line_total: 3200,
        },
      ]
    );

    expect(createErr).toBeNull();
    expect(newOrder?.customer_name).toBe('সাকিব আল হাসান');
    expect(newOrder?.total_amount).toBe(3270);
  });

  it('dispatches messages and toggles human takeover mode', async () => {
    const convs = await getConversations(testWorkspaceId);
    expect(convs.length).toBeGreaterThan(0);
    const targetConv = convs[0];

    // Toggle takeover
    const { error: takeoverErr } = await toggleHumanTakeover(targetConv.id, true);
    expect(takeoverErr).toBeNull();

    // Dispatch human message
    const { data: msg, error: msgErr } = await sendMessage(
      testWorkspaceId,
      targetConv.id,
      'আমরা আজকে কুরিয়ারে পাঠিয়ে দেব।',
      'human'
    );

    expect(msgErr).toBeNull();
    expect(msg?.content).toBe('আমরা আজকে কুরিয়ারে পাঠিয়ে দেব।');
    expect(msg?.sender_type).toBe('human');
  });

  it('manages AI agent settings and knowledge documents', async () => {
    const settings = await getAIAgentSettings(testWorkspaceId);
    expect(settings).not.toBeNull();

    const { error: saveErr } = await saveAIAgentSettings(testWorkspaceId, {
      agent_name: 'BongoSell SuperBot',
      minimum_price_enforcement_enabled: true,
    });
    expect(saveErr).toBeNull();

    // Knowledge document CRUD
    const { data: newDoc, error: docErr } = await addKnowledgeDocument(testWorkspaceId, {
      title: 'সাইজ চার্ট (Size Chart)',
      content: 'M = ৩৮ ইঞ্চি, L = ৪০ ইঞ্চি, XL = ৪২ ইঞ্চি।',
      document_type: 'size_guide',
      status: 'active',
    });

    expect(docErr).toBeNull();
    expect(newDoc?.title).toBe('সাইজ চার্ট (Size Chart)');

    if (newDoc?.id) {
      const { error: delErr } = await deleteKnowledgeDocument(newDoc.id);
      expect(delErr).toBeNull();
    }
  });
});
