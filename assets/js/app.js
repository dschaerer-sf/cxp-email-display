class CXPEmailDisplay {
    constructor() {
        this.emailCount = 0;
        this.totalResponseTime = 0;
        this.pageViews = this.getPageViews();
        this.initializeApp();
        this.startClock();
        this.checkForWebhookData();
    }

    initializeApp() {
        console.log('🚀 CXP Email Display initialized');
        this.updatePageViews();
        this.updateConnectionStatus('ready');
        
        // Check for URL parameters (webhook data)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('webhook_data')) {
            const webhookData = JSON.parse(decodeURIComponent(urlParams.get('webhook_data')));
            this.displayEmail(webhookData, true);
        }
    }

    updateConnectionStatus(status) {
        const statusEl = document.getElementById('connectionStatus');
        switch(status) {
            case 'ready':
                statusEl.textContent = '🟢 Ready';
                statusEl.className = 'connection-status';
                break;
            case 'receiving':
                statusEl.textContent = '📡 Receiving';
                statusEl.className = 'connection-status connecting';
                break;
            case 'connected':
                statusEl.textContent = '✅ Connected';
                statusEl.className = 'connection-status';
                break;
        }
    }

    getPageViews() {
        const views = localStorage.getItem('cxp_page_views');
        return views ? parseInt(views) : 0;
    }

    updatePageViews() {
        this.pageViews++;
        localStorage.setItem('cxp_page_views', this.pageViews.toString());
        document.getElementById('pageViews').textContent = this.pageViews;
    }

    startClock() {
        setInterval(() => {
            document.getElementById('currentTime').textContent = 
                new Date().toLocaleString('en-US', {
                    timeZone: 'Europe/Zurich',
                    hour12: false
                });
        }, 1000);
    }

    checkForWebhookData() {
        // Check localStorage for webhook data (from GitHub Actions redirect)
        const webhookData = localStorage.getItem('pending_webhook_data');
        if (webhookData) {
            const emailData = JSON.parse(webhookData);
            this.displayEmail(emailData, true);
            localStorage.removeItem('pending_webhook_data');
        }

        // Set up periodic check for new webhook data
        setInterval(() => {
            this.checkForWebhookData();
        }, 2000);
    }

    displayEmail(emailData, isRealTrigger = false) {
        const container = document.getElementById('emailContainer');
        const timestamp = new Date().toLocaleString();
        const triggerType = isRealTrigger ? '🚀 CXP Triggered' : '🧪 Test Simulation';
        
        this.emailCount++;
        this.updateStats();
        this.updateConnectionStatus('receiving');
        
        setTimeout(() => {
            this.updateConnectionStatus('ready');
        }, 2000);

        const emailHtml = `
            <div class="email-display">
                <div class="email-header">
                    <div class="email-meta">
                        To: ${emailData.to}<br>
                        From: nespresso@email.com<br>
                        <span class="timestamp">${triggerType} • ${timestamp}</span>
                    </div>
                    <h2 class="email-subject">${emailData.subject}</h2>
                </div>
                <div class="email-content">
                    ${emailData.content}
                    ${emailData.personalizationData ? `
                        <div class="personalization-data">
                            <strong>🎯 Personalization Data (from CXP):</strong>
                            <pre>${JSON.stringify(emailData.personalizationData, null, 2)}</pre>
                        </div>
                    ` : ''}
                    ${emailData.cxpMetadata ? `
                        <div style="background: #e8f4fd; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 0 10px 10px 0;">
                            <strong>📊 CXP Journey Metadata:</strong><br>
                            <strong>Journey ID:</strong> ${emailData.cxpMetadata.journeyId}<br>
                            <strong>Segment:</strong> ${emailData.cxpMetadata.segment}<br>
                            <strong>Trigger:</strong> ${emailData.cxpMetadata.trigger}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = emailHtml + container.innerHTML;
        
        // Update status
        const statusEl = document.getElementById('status');
        statusEl.innerHTML = `✅ Email triggered successfully! (${this.emailCount} total)`;
        statusEl.style.background = 'rgba(46, 204, 113, 0.3)';
        
        // Scroll to top to show new email
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateStats() {
        document.getElementById('emailCount').textContent = this.emailCount;
        document.getElementById('lastTrigger').textContent = new Date().toLocaleTimeString();
        
        // Simulate response time for demo
        const responseTime = Math.floor(Math.random() * 300) + 100; // 100-400ms
        this.totalResponseTime += responseTime;
        const avgTime = Math.floor(this.totalResponseTime / this.emailCount);
        document.getElementById('avgResponseTime').textContent = avgTime + 'ms';
    }

    clearEmails() {
        document.getElementById('emailContainer').innerHTML = '';
        this.emailCount = 0;
        this.totalResponseTime = 0;
        document.getElementById('emailCount').textContent = '0';
        document.getElementById('avgResponseTime').textContent = '0ms';
        document.getElementById('lastTrigger').textContent = 'Never';
        document.getElementById('status').innerHTML = '⏳ Ready to receive email triggers from CXP platform';
        document.getElementById('status').style.background = 'rgba(255,255,255,0.2)';
    }

    // Test email scenarios
    simulateWelcomeEmail() {
        this.displayEmail({
            to: "maria.schmidt@nespresso.com",
            subject: "Welcome to Nespresso, Maria! Your journey begins now ☕",
            content: this.generateWelcomeContent(),
            personalizationData: {
                firstName: "Maria",
                country: "Switzerland",
                registrationSource: "Web",
                preferredLanguage: "German",
                welcomeOffer: "WELCOME20",
                loyaltyTier: "New Customer"
            },
            cxpMetadata: {
                journeyId: "welcome-onboarding-v2",
                segment: "new-customers-ch",
                trigger: "customer.registered"
            }
        });
    }

    simulateAbandonedCart() {
        this.displayEmail({
            to: "hans.mueller@email.com",
            subject: "Hans, your Vertuo Next is waiting - 15% off expires in 2 hours! ⏰",
            content: this.generateAbandonedCartContent(),
            personalizationData: {
                firstName: "Hans",
                cartValue: "€299.00",
                discountValue: "€44.85",
                timeLeft: "2 hours",
                cartItems: ["Vertuo Next Grey", "Colombia Capsules", "Cleaning Kit"],
                loyaltyTier: "Silver"
            },
            cxpMetadata: {
                journeyId: "cart-abandonment-recovery",
                segment: "high-value-carts",
                trigger: "cart.abandoned.2hours"
            }
        });
    }

    simulateProductReco() {
        this.displayEmail({
            to: "sophie.dubois@email.com",
            subject: "Sophie, new capsules perfect for your Vertuo Next! 🌟",
            content: this.generateProductRecoContent(),
            personalizationData: {
                firstName: "Sophie",
                lastPurchase: "Colombia Master Origin",
                machine: "Vertuo Next",
                loyaltyTier: "Gold",
                recommendationReason: "Similar flavor profile",
                country: "France"
            },
            cxpMetadata: {
                journeyId: "product-recommendation-ai",
                segment: "high-engagement-customers",
                trigger: "ml.recommendation.generated"
            }
        });
    }

    simulatePurchaseConfirm() {
        this.displayEmail({
            to: "andreas.weber@email.com",
            subject: "Order confirmed! Your Nespresso delivery is on its way 📦",
            content: this.generatePurchaseConfirmContent(),
            personalizationData: {
                firstName: "Andreas",
                orderNumber: "CH-2025-091601",
                orderTotal: "€185.50",
                estimatedDelivery: "September 18, 2025",
                items: ["Essenza Mini Black", "Variety Pack - 50 capsules"],
                loyaltyPoints: "185"
            },
            cxpMetadata: {
                journeyId: "purchase-confirmation",
                segment: "confirmed-customers",
                trigger: "order.confirmed"
            }
        });
    }

    simulateWinbackCampaign() {
        this.displayEmail({
            to: "elena.rossi@email.com",
            subject: "We miss you, Elena! Come back to exceptional coffee ☕💝",
            content: this.generateWinbackContent(),
            personalizationData: {
                firstName: "Elena",
                lastPurchase: "March 15, 2025",
                daysSinceLastPurchase: 184,
                favoriteProduct: "Roma Intensity 8",
                winbackOffer: "30OFF",
                loyaltyTier: "Gold (Inactive)"
            },
            cxpMetadata: {
                journeyId: "winback-campaign-q3",
                segment: "inactive-gold-customers",
                trigger: "customer.inactive.6months"
            }
        });
    }

    // Content generators
    generateWelcomeContent() {
        return `
            <h1 style="color: #8B4513; margin-bottom: 20px;">Welcome to Nespresso, Maria!</h1>
            <p style="font-size: 16px; margin-bottom: 25px;">We're thrilled to have you join our coffee community in Switzerland.</p>
            
            <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #8B4513;">
                <h3 style="color: #8B4513; margin-bottom: 15px;">🎁 Your Welcome Gift</h3>
                <p style="font-size: 18px;"><strong>20% OFF</strong> your first order with code: <code style="background:#8B4513;color:white;padding:8px 12px;border-radius:4px;font-size:16px;">WELCOME20</code></p>
            </div>
            
            <h3 style="color: #8B4513; margin: 25px 0 15px 0;">Recommended for You:</h3>
            <ul style="list-style: none; padding: 0;">
                <li style="margin: 12px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">☕ <strong>Vertuo Next</strong> - Perfect for your morning routine</li>
                <li style="margin: 12px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">🇨🇴 <strong>Colombia Master Origin</strong> - Smooth and balanced</li>
                <li style="margin: 12px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">⚡ <strong>Stormio Intensity 8</strong> - Bold and intense</li>
            </ul>
        `;
    }

    generateAbandonedCartContent() {
        return `
            <h1 style="color: #e74c3c; margin-bottom: 20px;">Don't miss out, Hans!</h1>
            <p style="font-size: 16px; margin-bottom: 25px;">You left something amazing in your cart. Complete your purchase before your discount expires!</p>
            
            <div style="border: 3px solid #e74c3c; padding: 25px; border-radius: 12px; margin: 25px 0; background: #fff5f5;">
                <h3 style="color: #e74c3c; margin-bottom: 15px;">⚡ Limited Time: 15% OFF</h3>
                <p style="font-size: 18px;">Your cart total: <span style="text-decoration: line-through;">€299.00</span> → <strong style="color: #e74c3c; font-size: 20px;">€254.15</strong></p>
                <p style="color: #e74c3c; font-weight: bold;">⏰ Expires: <strong>2 hours</strong></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h4 style="color: #8B4513; margin-bottom: 15px;">Items in your cart:</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #8B4513;">🖥️ Vertuo Next Coffee Machine - Grey</li>
                    <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #8B4513;">☕ Colombia Master Origin (30 capsules)</li>
                    <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #8B4513;">🧽 Cleaning Kit</li>
                </ul>
            </div>
        `;
    }

    generateProductRecoContent() {
        return `
            <h1 style="color: #8B4513; margin-bottom: 20px;">Discover Your Next Favorite, Sophie!</h1>
            <p style="font-size: 16px; margin-bottom: 25px;">Based on your love for <strong>Colombia Master Origin</strong>, we've found some perfect matches for your Vertuo Next.</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 25px 0;">
                <div style="flex: 1; min-width: 250px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #8B4513;">
                    <h4 style="color: #8B4513; margin-bottom: 10px;">🇪🇹 Ethiopia Master Origin</h4>
                    <p style="margin-bottom: 10px;">Floral and fruity notes</p>
                    <p><strong>Intensity: 4</strong></p>
                </div>
                <div style="flex: 1; min-width: 250px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #8B4513;">
                    <h4 style="color: #8B4513; margin-bottom: 10px;">🌊 Stormio</h4>
                    <p style="margin-bottom: 10px;">Bold and contrasted</p>
                    <p><strong>Intensity: 8</strong></p>
                </div>
            </div>
            
            <div style="background: #d4edda; border: 2px solid #c3e6cb; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #155724; margin-bottom: 10px;">☕ Loyalty Reward Available</h3>
                <p style="color: #155724;">As a <strong>Gold Member</strong>, enjoy <strong>free shipping</strong> on your next order!</p>
            </div>
        `;
    }

    generatePurchaseConfirmContent() {
        return `
            <h1 style="color: #27ae60; margin-bottom: 20px;">Thank you for your order, Andreas!</h1>
            <p style="font-size: 16px; margin-bottom: 25px;">Your Nespresso order has been confirmed and will be prepared with care.</p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #27ae60;">
                <h3 style="color: #27ae60; margin-bottom: 20px;">📦 Order Details</h3>
                <div style="display: grid; gap: 10px;">
                    <p><strong>Order Number:</strong> CH-2025-091601</p>
                    <p><strong>Total:</strong> €185.50</p>
                    <p><strong>Estimated Delivery:</strong> September 18, 2025</p>
                </div>
            </div>
            
            <div style="background: #d4edda; border: 2px solid #c3e6cb; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #155724; margin-bottom: 10px;">🌟 Loyalty Points Earned</h3>
                <p style="color: #155724;">You've earned <strong>185 points</strong> with this purchase!</p>
            </div>
        `;
    }

    generateWinbackContent() {
        return `
            <h1 style="color: #8B4513; margin-bottom: 20px;">We miss you, Elena! 💝</h1>
            <p style="font-size: 16px; margin-bottom: 25px;">It's been 6 months since your last coffee order. Let's get you back to the exceptional taste you love.</p>
            
            <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 30px; border-radius: 15px; margin: 25px 0; text-align: center;">
                <h3 style="margin-bottom: 15px;">🎯 Special Comeback Offer</h3>
                <p style="font-size: 24px; margin-bottom: 15px;"><strong>30% OFF</strong> your return order</p>
                <p style="font-size: 18px;">Code: <code style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 6px;">30OFF</code></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h4 style="color: #8B4513; margin-bottom: 15px;">☕ Your Favorites are Waiting</h4>
                <p>We remember you loved <strong>Roma Intensity 8</strong> - it's still available and as perfect as ever!</p>
            </div>
            
            <div style="background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h4 style="color: #856404; margin-bottom: 10px;">👑 Your Gold Status</h4>
                <p style="color: #856404;">Your Gold membership benefits are still active - including free shipping on orders over €50!</p>
            </div>
        `;
    }
}

// Tab functionality for webhook configuration
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.webhook-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

function generateWebhookSite() {
    window.open('https://webhook.site/', '_blank');
}

// Global functions for buttons
let cxpApp;

document.addEventListener('DOMContentLoaded', () => {
    cxpApp = new CXPEmailDisplay();
});

function simulateWelcomeEmail() {
    cxpApp.simulateWelcomeEmail();
}

function simulateAbandonedCart() {
    cxpApp.simulateAbandonedCart();
}

function simulateProductReco() {
    cxpApp.simulateProductReco();
}

function simulatePurchaseConfirm() {
    cxpApp.simulatePurchaseConfirm();
}

function simulateWinbackCampaign() {
    cxpApp.simulateWinbackCampaign();
}

function clearEmails() {
    cxpApp.clearEmails();
}
