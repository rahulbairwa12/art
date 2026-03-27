import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const shopifyStore = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    console.log(`[Shopify Sync] Starting sync for ${email} (${name})`);
    console.log(`[Shopify Sync] Store: ${shopifyStore}`);

    if (!shopifyStore || !accessToken) {
      console.error('[Shopify Sync] Missing credentials');
      return NextResponse.json({ error: 'Shopify configuration missing' }, { status: 500 });
    }

    // Step 1: Search for existing customer by email
    const searchUrl = `https://${shopifyStore}/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}`;
    
    console.log(`[Shopify Sync] Searching at: ${searchUrl}`);

    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`[Shopify Sync] Search failed (${searchResponse.status}):`, errorText);
      return NextResponse.json({ error: 'Failed to search Shopify customers' }, { status: searchResponse.status });
    }

    const searchData = await searchResponse.json();
    console.log(`[Shopify Sync] Search results: ${searchData.customers?.length || 0} found`);
    
    // If customer already exists, we're done
    if (searchData.customers && searchData.customers.length > 0) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Customer already exists in Shopify', 
        existing: true 
      });
    }

    // Step 2: Create new customer if they don't exist
    const nameParts = (name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Portal';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

    console.log(`[Shopify Sync] Creating customer: ${firstName} ${lastName}`);

    const createUrl = `https://${shopifyStore}/admin/api/2024-01/customers.json`;
    
    const randomPass = Math.random().toString(36).slice(-12) + '!';
    const customerData = {
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        verified_email: true,
        send_email_welcome: false,
        password: randomPass,
        password_confirmation: randomPass
      }
    };

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`[Shopify Sync] Create failed (${createResponse.status}):`, errorText);
      return NextResponse.json({ error: 'Failed to create Shopify customer', details: errorText }, { status: createResponse.status });
    }

    const newCustomer = await createResponse.json();
    console.log(`[Shopify Sync] Successfully created: ${newCustomer.customer.id}`);

    return NextResponse.json({ 
      status: 'success', 
      message: 'New Shopify customer created', 
      customer: newCustomer.customer 
    });

  } catch (error: any) {
    console.error('Shopify Sync API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
