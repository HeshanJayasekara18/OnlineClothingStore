export default function Section2() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1">
          {/* Hero Section */}
          

          {/* Featured Categories Section */}
          <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Categories</h2>
              <div className="mt-8 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                <a className="group" href="#">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-slate-200">
                    <img 
                      alt="Men's Collection" 
                      className="h-full w-full object-cover object-center group-hover:opacity-75" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw79fsyEZULHIJXzWRt-HXSElay1HtjcOoiIH3gdCQXxkCgHGZPQios8oAKlkRmNr1Imh_7yR5icuu4YRZ2HJ3-FNwEJfrZkMA0k0d795T8_6hN1KVE9C873-i4UaPaRKen166IHduVCG13KzkBq7mv__1w_ay3hitvAOLwPcCuJ_Dw7R8uILrU-jokxAYoGJ8LG24hvqvd-cJzW1HL7FNQHABkRXpsk2dJGANukX_wvisguxmwVIgEkdjh7Lak9WvFbF5d5HA1iS_"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">Men</h3>
                </a>
                <a className="group" href="#">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-slate-200">
                    <img 
                      alt="Women's Collection" 
                      className="h-full w-full object-cover object-center group-hover:opacity-75" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxTn3vzq9fVlwPCtidyUXGyR3dWLmpqD4zo-4xhzhg9Ya07fZYs__Yv7_wK59ahiG9OkbFrypD0KPnNDUG4FgZ9LbTAKAYaTUwySr-_EoRM0K-VXUlLzb4S5Rh9qZ-DaHuALskvfpiJ7b0ggKn_ASToslLsmV9u5YhoeB7-HJxySlYCAO42zM0mRLzZlKFgWxgQomuWyoDZdA7DtATR1_GPNxHD9ckgcBXOgnpNosBt8lG-IoggRwWJ79v0Cp19yvEpSsqP8vn63Lw"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">Women</h3>
                </a>
                <a className="group" href="#">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-slate-200">
                    <img 
                      alt="Kids' Collection" 
                      className="h-full w-full object-cover object-center group-hover:opacity-75" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJghL3H6NosdfNvlid4q2qJOy-WHBUZgPJOqi3oXgHoja21ifSs-eRzAC7JS9_4NiC9rpzXw0aTihHCKsmYVQMrofsdVq2cG3DwuTFUEsJCl2rARUvfASI1DObc7SymkWsuKiH56dcwUo0qzEwDNjo17gKR0Cx2-4Fh-p7Y4o5-u2plf6ejXgM83w__iiujMYXY9SH-TT2B6xbBkv-phSuMPMGVzD8jpMx4zf8ygD-gn7oQQxCvHCRdkDRSQT5A_F9B0PS9ON7PiEW"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">Kids</h3>
                </a>
                <a className="group" href="#">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-slate-200">
                    <img 
                      alt="Accessories" 
                      className="h-full w-full object-cover object-center group-hover:opacity-75" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW8GZDwPHr42ZxjjoXeQpJx4jhzckw0BFjLVnPNcSI1-etqKNU31U3zj_ptQSly7ae2kFzBAxWPC-I9EgDthaoMLyQ7b4pT7sefc3_qNnrIQVPUjVg-0zBYwa24eh-5mtygcjgPbb0tSqKGak-voNc_XozTpjQfv-Mn6o_3qA01WgT5hq3Lqo9_LgoF-fCKzDAIHZAVRv844JUVASNkCKi9N39RVuUBSjSLWonB0QOnOfcnHwrxkQrRgbwjE42-rZpZ7qTmVEDuWAD"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">Accessories</h3>
                </a>
              </div>
            </div>
          </section>

          {/* Trending Products Section */}
          <section className="bg-slate-100 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Trending Products</h2>
              <div className="mt-8 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                <div className="group relative">
                  <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-slate-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                    <img 
                      alt="Classic Denim Jacket" 
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzLLmLn93In9RRosMONRTYJ1wlA-DVE1_DUUIcyeNtELjACCuV2XTgaqXyf6u3r5oLIeULQ7Jfiygc8TWjhUFv3rIt0OtqscajzTD8Wy2AK8nHeEgw7rC9mJYI3VKVSqF1JS38144xchdq6hBVKraGCL2vI60w_A9oKX34nlky548vTmrGX3h1hFaG1WCp2v4tGGupyTjnBjSBkcXLd5zQ4fGBN3LdpnQXsG4g5JQrIAQZzLN0zR64AL3zNBkpjeE8kOOXoh7-vc5a"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-slate-700">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0"></span>
                          Classic Denim Jacket
                        </a>
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-900">$79.99</p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-slate-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                    <img 
                      alt="Summer Breeze Dress" 
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8Eu5oG84sBOcdRs-c9H8gTGXn0yLUe8RyVti98wX16XtWzZlrSwtvlwWCnGpbF3OWVUMuvUSJX_WFNwd0iLGuRsWziFAtYV63cDQx_uKXDKFoTwiPUZJyZQ7KzS0VpNlTUeWkr4kqL7m78EVjNI3AF5K9_vYPITYPhoCKtRJUFx0yuWcTfZY6BUKEsx0pYiZ8VyHXfri3NFrJaO0KqKmNSvg6xwpI8MbB-adSvkJUHqgMDFkL-dO_dPQgxmWTXnNeSTKcttMlSUP7"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-slate-700">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0"></span>
                          Summer Breeze Dress
                        </a>
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-900">$49.99</p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-slate-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                    <img 
                      alt="Urban Explorer Backpack" 
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTMtmKQglIFWlYyijL-Pzj3bdvL2RuePmAmGEnmFT76Q3DmZW4CCC39vYZKjBz4YbuvPP9xGmywNveLbEe9XDlyb2E9NiDtHl1Rx7324R7j_0Ju52ZMNb0pTmQlxw1oqD6LToPN2hQrdrBw6Av9yio2sBA_i2F7lYReRZBj5PeDsxs8PdR3N-0FTUCaYb1Lucb8rrzDAZY2j1atL-S2ynPj3V_DJrNtcsT4iV7-7um3uGKrowqkjXCfdKr1Y4HhKsxZ8xPQywa-V28"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-slate-700">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0"></span>
                          Urban Explorer Backpack
                        </a>
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-900">$59.99</p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-slate-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                    <img 
                      alt="Cozy Knit Sweater" 
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB47SCitFCUBsairHBisdoYF7p1yC1jXcdtRhdU1xnpG2yIFR31YrHvmn2Yd9O56aq7C9ZwZPR3uWnHxnIDxW_1IDpSs30XCu9RXWiGo3HJWBB3To8vcnIg1sSLudp6GluPeQyL5_uQbF6rA_ogB2nVuSNoj7xh3LkuHlL8Pl90oi4fVapw7oNrT3WlGkOvNHQ8C0AVTxSIGlHgk_edD8kQSYqbC63zIonfifNMdz89triXTpXJWxQVGonVOKQq0SbPDeG1FlrFq26E"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-slate-700">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0"></span>
                          Cozy Knit Sweater
                        </a>
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-900">$69.99</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sale Section */}
          <section className="bg-slate-900 py-16 text-center sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-extrabold text-white">Up to 50% Off</h2>
              <p className="mt-4 text-lg text-slate-300">Don't miss out on our biggest sale of the season.</p>
              <button className="mt-8 rounded-lg bg-[#1773cf] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1773cf]/90">
                Shop Sale
              </button>
            </div>
          </section>
        </main>

        
      </div>
    </div>
  );
}