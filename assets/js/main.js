/* 
    Car Auction Fees Calculator
    Data Source: BCA Blue (Standard) Fees - Effective April 2025
    Structure: Tiered fixed fees + fixed services (V5, Assured)
*/

// Updated 2025/2026 Bands (Net Prices)
const BANDS = [
    { limit: 49, fee: 45.00 },
    { limit: 99, fee: 74.17 },
    { limit: 149, fee: 107.50 },
    { limit: 199, fee: 152.50 },
    { limit: 249, fee: 160.00 },
    { limit: 299, fee: 168.33 },
    { limit: 349, fee: 212.50 },
    { limit: 399, fee: 223.33 },
    { limit: 449, fee: 242.50 },
    { limit: 499, fee: 251.67 },
    { limit: 749, fee: 334.17 },
    { limit: 999, fee: 401.67 },
    { limit: 1249, fee: 425.00 },
    { limit: 1499, fee: 440.00 },
    { limit: 1749, fee: 457.50 },
    { limit: 1999, fee: 473.33 },
    { limit: 2249, fee: 487.50 },
    { limit: 2499, fee: 505.00 },
    { limit: 2749, fee: 518.33 },
    { limit: 2999, fee: 525.00 },
    { limit: 3249, fee: 597.50 },
    { limit: 3499, fee: 605.83 },
    { limit: 3749, fee: 617.50 },
    { limit: 3999, fee: 626.67 },
    { limit: 4249, fee: 631.67 },
    { limit: 4499, fee: 639.17 },
    { limit: 4749, fee: 646.67 },
    { limit: 4999, fee: 653.33 },
    { limit: 11499, fee: 800.00 }, // Estimated mid-range bridge based on 2025 trend
    { limit: 11749, fee: 862.50 }, // Confirmed 2025
    { limit: 12249, fee: 893.33 },
    { limit: 12749, fee: 911.67 },
    { limit: 13249, fee: 922.50 },
    { limit: 13749, fee: 930.00 },
    { limit: 14249, fee: 956.67 },
    { limit: 14749, fee: 974.17 },
    { limit: 15249, fee: 999.17 },
    { limit: 15749, fee: 1016.67 },
    { limit: 16249, fee: 1046.67 },
    { limit: 16749, fee: 1064.17 },
    { limit: 17249, fee: 1070.83 },
    { limit: 18249, fee: 1070.83 }, // Plateau observed
    { limit: 24999, fee: 1074.17 } // Highest band before 'POA'
];

// Fixed Costs (Net) - Updated 2025
const FIXED = {
    assured: 61.00,  // BCA Assured (Standard)
    v5: 21.67,       // V5 Handling
    online: 0.00     // "No extra online fee" per 2025 policy for standard access
};

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. MOBILE MENU
    const menuBtn = document.querySelector('.mobile-toggle');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                menuOverlay.classList.add('active');
                gsap.to(mobileLinks, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 });
                menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>`;
            } else {
                closeMenu();
            }
        });
    }

    function closeMenu() {
        isMenuOpen = false;
        menuOverlay.classList.remove('active');
        gsap.to(mobileLinks, { y: 20, opacity: 0, duration: 0.2 });
        menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2"><path d="M3 12H21M3 6H21M3 18H21"/></svg>`;
    }
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // 2. CALCULATOR LOGIC
    const input = document.getElementById("hammerPrice");
    const toggle = document.getElementById("vatToggle");
    const btnCalc = document.getElementById("btnCalculate");
    const warning = document.getElementById("rangeWarning");

    // Elements
    const elHammer = document.getElementById("elHammer");
    const elBuyerFee = document.getElementById("elBuyerFee");
    const elFixed = document.getElementById("elFixedFees");
    const elVat = document.getElementById("elVat");
    const elTotal = document.getElementById("elTotal");
    
    const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

    function performCalculation() {
        if (!input) return;
        const val = parseFloat(input.value);

        if (isNaN(val) || val < 0) {
            elTotal.innerText = "£0.00";
            return;
        }

        // Range Logic
        if (val < 11 || val > 24999) {
            warning.style.display = "block";
            // We calculate anyway but show warning
        } else {
            warning.style.display = "none";
        }

        // Buyer Fee Lookup
        let fee = 0;
        let found = false;
        for (let b of BANDS) {
            if (val <= b.limit) { 
                fee = b.fee; 
                found = true; 
                break; 
            }
        }
        // Fallback for gaps or higher values not in POA range
        if (!found && val <= 24999) fee = 1074.17; 

        const fixedSum = FIXED.assured + FIXED.v5 + FIXED.online;
        
        // VAT Calculation (20% on fees always; 20% on hammer if toggled)
        const vatOnFees = (fee + fixedSum) * 0.20;
        const vatOnHammer = toggle.checked ? (val * 0.20) : 0;
        const totalVat = vatOnFees + vatOnHammer;
        
        const totalPayable = val + fee + fixedSum + totalVat;

        // Render
        elHammer.innerText = money.format(val);
        elBuyerFee.innerText = money.format(fee);
        elFixed.innerText = money.format(fixedSum);
        elVat.innerText = money.format(totalVat);
        elTotal.innerText = money.format(totalPayable);

        // Animation
        gsap.fromTo(elTotal, { scale: 1.05, color: "#4F46E5" }, { scale: 1, color: "#111827", duration: 0.3 });

        // GA4 Event (As requested in brief)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculate', {
                'category': 'calculator',
                'label': 'bca_fees',
                'value': Math.round(val)
            });
        }
    }

    if (btnCalc) {
        btnCalc.addEventListener("click", performCalculation);
    }

    // Optional: Allow "Enter" key to calculate
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") performCalculation();
        });
    }

    // 3. PAGE ANIMATIONS & OPTIMIZATION
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        
        gsap.registerPlugin(ScrollTrigger);

        // A. Homepage Hero Animation
        const heroTitle = document.querySelector(".hero h1");
        if (heroTitle) {
            gsap.from(heroTitle, { 
                y: 30, 
                opacity: 0, 
                duration: 0.8, 
                ease: "power3.out" 
            });
            
            gsap.from(".hero p", { 
                y: 30, 
                opacity: 0, 
                duration: 0.8, 
                delay: 0.1, 
                ease: "power3.out" 
            });
        }

        // B. Generic "Fade Up" Animation
        const fadeElements = gsap.utils.toArray('.fade-up');
        if (fadeElements.length > 0) {
            fadeElements.forEach(el => {
                gsap.from(el, {
                    scrollTrigger: { 
                        trigger: el, 
                        start: "top 90%"
                    },
                    y: 30, 
                    opacity: 0, 
                    duration: 0.6, 
                    ease: "power3.out"
                });
            });
        }
    }

    // 4. AFFILIATE LINK TRACKING (Added per brief)
    const affiliateLinks = document.querySelectorAll('.affiliate-track');
    affiliateLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Get partner name from data attribute
            const partner = link.getAttribute('data-partner') || 'unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'affiliate_click', {
                    'category': 'affiliate',
                    'label': partner
                });
            }
        });
    });
});