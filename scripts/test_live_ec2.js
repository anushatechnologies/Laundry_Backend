async function pollApi() {
  const endpoints = [
    'http://16.113.88.125/api/categories',
    'http://16.113.88.125/api/services',
    'http://16.113.88.125/api/pricing/matrix',
    'http://16.113.88.125/api/subscriptions',
  ];

  console.log('----------------------------------------------------');
  console.log('🌐 Testing Live AWS EC2 Backend API: http://16.113.88.125');
  console.log('----------------------------------------------------');

  for (let i = 1; i <= 10; i++) {
    try {
      const res = await fetch(endpoints[0], { signal: AbortSignal.timeout(4000) });
      console.log(`[Attempt ${i}] HTTP ${endpoints[0]} Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log('🎉 SUCCESS! Backend API is LIVE on EC2!');
        console.log('Categories count:', data.data ? data.data.length : data.length);

        for (const ep of endpoints.slice(1)) {
          const r = await fetch(ep);
          console.log(`  ✅ ${ep} -> Status: ${r.status}`);
        }
        return true;
      }
    } catch (e) {
      console.log(`[Attempt ${i}] Waiting for GitHub Actions deployment to finish (${e.message})...`);
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
}

pollApi().catch(console.error);
