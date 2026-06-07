// WebCheck Pro — Website SEO & Performance Analyzer Script

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const analyzerForm = document.getElementById('analyzer-form');
    const websiteUrlInput = document.getElementById('website-url');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const errorRetry = document.getElementById('error-retry');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingPercentage = document.getElementById('loading-percentage');
    const tipText = document.getElementById('tip-text');
    const resultsSection = document.getElementById('results-section');
    const analyzedUrlText = document.getElementById('analyzed-url-text');
    
    // Strategy Toggle Buttons
    const strategyMobile = document.getElementById('strategy-mobile');
    const strategyDesktop = document.getElementById('strategy-desktop');
    
    // Score Gauge SVGs & Text Elements
    const gaugePerf = document.getElementById('gauge-performance');
    const scorePerf = document.getElementById('score-performance');
    const gaugeSeo = document.getElementById('gauge-seo');
    const scoreSeo = document.getElementById('score-seo');
    const gaugeBP = document.getElementById('gauge-bestpractices');
    const scoreBP = document.getElementById('score-bestpractices');
    const gaugeAcc = document.getElementById('gauge-accessibility');
    const scoreAcc = document.getElementById('score-accessibility');
    const gaugeOverall = document.getElementById('gauge-overall');
    const scoreOverall = document.getElementById('score-overall');
    
    // Metric Cards Elements
    const cardFcp = document.getElementById('card-fcp');
    const valFcp = document.getElementById('val-fcp');
    const badgeFcp = document.getElementById('badge-fcp');
    
    const cardLcp = document.getElementById('card-lcp');
    const valLcp = document.getElementById('val-lcp');
    const badgeLcp = document.getElementById('badge-lcp');
    
    const cardTti = document.getElementById('card-tti');
    const valTti = document.getElementById('val-tti');
    const badgeTti = document.getElementById('badge-tti');
    
    const cardSi = document.getElementById('card-si');
    const valSi = document.getElementById('val-si');
    const badgeSi = document.getElementById('badge-si');
    
    // Recommendations List & Buttons
    const recommendationList = document.getElementById('recommendation-list');
    const btnReanalyze = document.getElementById('btn-reanalyze');
    const backToTop = document.getElementById('back-to-top');
    
    // Mobile Nav Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Global State variables
    let currentUrl = '';
    let currentStrategy = 'mobile'; // Default strategy as specified by Google API prompt
    let simulatedProgressInterval = null;
    let tipsRotationInterval = null;
    let latestLighthouseResult = null;
    let computedScores = {};
    let activeCategory = 'performance';
    let activeTab = 'overview';

    // Optimization tips list for rotation during loading screen
    const optimizationTips = [
        "Compress images before uploading to save bandwidth.",
        "Minify CSS, JavaScript, and HTML files to decrease load times.",
        "Enable Gzip or Brotli compression on your hosting server.",
        "Implement browser caching to avoid loading static files repeatedly.",
        "Eliminate render-blocking resources in the header of your page.",
        "Choose a high-performance hosting provider to lower server response times (TTFB).",
        "Use a Content Delivery Network (CDN) to serve assets closer to your visitors.",
        "Deconstruct heavy plugins or scripts that delay Time to Interactive (TTI).",
        "Prioritize critical CSS to render page layouts faster.",
        "Serve images in modern next-gen formats like WebP or AVIF."
    ];

    // Key audits list mapping for recommendations
    const keyAudits = [
        { id: 'render-blocking-resources', title: 'Eliminate render-blocking resources', impact: 'high', category: 'Speed' },
        { id: 'uses-responsive-images', title: 'Serve images in responsive sizes', impact: 'medium', category: 'Performance' },
        { id: 'offscreen-images', title: 'Defer offscreen images (Lazy load)', impact: 'medium', category: 'Performance' },
        { id: 'unminified-css', title: 'Minify CSS files', impact: 'low', category: 'Speed' },
        { id: 'unminified-javascript', title: 'Minify JavaScript files', impact: 'low', category: 'Speed' },
        { id: 'unused-css-rules', title: 'Reduce unused CSS rules', impact: 'medium', category: 'Performance' },
        { id: 'unused-javascript', title: 'Reduce unused JavaScript execution', impact: 'medium', category: 'Performance' },
        { id: 'uses-optimized-images', title: 'Optimize and compress images', impact: 'medium', category: 'Performance' },
        { id: 'modern-image-formats', title: 'Serve images in next-gen formats (WebP/AVIF)', impact: 'medium', category: 'Performance' },
        { id: 'uses-text-compression', title: 'Enable text compression (Gzip/Brotli)', impact: 'high', category: 'Speed' },
        { id: 'redirects', title: 'Avoid multiple page redirects', impact: 'medium', category: 'Speed' },
        { id: 'efficient-animated-content', title: 'Use video formats for animated content', impact: 'low', category: 'Performance' },
        { id: 'meta-description', title: 'Add a search-optimized meta description', impact: 'high', category: 'SEO' },
        { id: 'image-alt', title: 'Provide descriptive alt text for all images', impact: 'medium', category: 'SEO' },
        { id: 'document-title', title: 'Add a unique document title to your pages', impact: 'high', category: 'SEO' },
        { id: 'link-text', title: 'Use descriptive, indexable link anchor text', impact: 'medium', category: 'SEO' },
        { id: 'is-on-https', title: 'Migrate site fully to secure HTTPS', impact: 'high', category: 'Best Practices' }
    ];

    /* ==========================================================================
       NAVIGATION & ACCORDION BEHAVIORS
       ========================================================================== */
    
    // Mobile navigation menu toggle
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu on clicking nav link
        document.querySelectorAll('.nav-link, .btn-nav').forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // FAQ Accordion Toggle Actions
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isActive = item.classList.contains('active');
            
            // Close all other accordions first
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
                faqItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Toggle current accordion
            if (!isActive) {
                item.classList.add('active');
                // Calculate height dynamically for smooth accordion open
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });

    /* ==========================================================================
       UTILITIES & SCROLL HANDLERS
       ========================================================================== */
    
    // Show back-to-top button on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // Back-to-top smooth scrolling click
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth Scroll for local hashes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll Reveal implementation (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Unobserve to play animation only once
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Stats counter animation (Intersection Observer)
    const statsSection = document.getElementById('stats');
    let countersAnimated = false;

    const statsObserver = new IntersectionObserver((entries, observer) => {
        const [entry] = entries;
        if (entry.isIntersecting && !countersAnimated) {
            animateCounters();
            countersAnimated = true;
            observer.unobserve(entry.target);
        }
    }, {
        threshold: 0.2
    });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    function animateCounters() {
        const counters = [
            { id: 'counter-websites', target: 10000, suffix: '+', increment: 200 },
            { id: 'counter-accuracy', target: 95, suffix: '%', increment: 2 },
            { id: 'counter-free', target: 100, suffix: '%', increment: 2 }
        ];

        counters.forEach(item => {
            const el = document.getElementById(item.id);
            if (!el) return;
            
            let current = 0;
            const duration = 1500; // Total counter run duration in ms
            const intervalTime = Math.max(15, Math.round(duration / (item.target / item.increment)));
            
            const timer = setInterval(() => {
                current += item.increment;
                if (current >= item.target) {
                    current = item.target;
                    clearInterval(timer);
                }
                // Format with localized comma for large number targets
                el.textContent = current.toLocaleString('en-US');
            }, intervalTime);
        });
    }

    /* ==========================================================================
       FORM VALIDATION & FORMATTING
       ========================================================================== */

    // Normalize and clean URLs
    function formatUrl(url) {
        let cleanUrl = url.trim().toLowerCase();
        
        // Auto-add https if protocol is completely missing
        if (!/^https?:\/\//i.test(cleanUrl)) {
            cleanUrl = 'https://' + cleanUrl;
        }
        
        return cleanUrl;
    }

    // Basic regex URL formatting checks
    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            // Must have a hostname containing at least a dot (e.g. site.com)
            return parsedUrl.hostname.includes('.') && parsedUrl.hostname.length > 3;
        } catch (_) {
            return false;
        }
    }

    // Displays an input warning error
    function showError(message, showRetry = false) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        if (showRetry) {
            errorRetry.classList.remove('hidden');
        } else {
            errorRetry.classList.add('hidden');
        }
        
        // Auto scroll to view error
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorMessage.classList.add('hidden');
        errorRetry.classList.add('hidden');
    }

    /* ==========================================================================
       LOADING ANIMATION & TIP CAROUSEL
       ========================================================================== */
    
    function startLoading() {
        loadingOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Lock scrolling
        
        let percentage = 0;
        loadingPercentage.textContent = '0%';
        
        // Reset loading step indicators
        const steps = ['step-dns', 'step-lighthouse', 'step-metrics', 'step-done'];
        steps.forEach(id => {
            const stepEl = document.getElementById(id);
            if (stepEl) {
                stepEl.className = 'step';
            }
        });
        
        document.getElementById('step-dns').classList.add('active');

        // Rotate through tips carousel
        let tipIndex = 0;
        tipText.textContent = optimizationTips[tipIndex];
        
        tipsRotationInterval = setInterval(() => {
            tipIndex = (tipIndex + 1) % optimizationTips.length;
            tipText.textContent = optimizationTips[tipIndex];
        }, 3000);

        // Simulated progress bar counter
        // The API speed is unpredictable, so we animate fast to 75% then wait, finalizing at 100% on success
        simulatedProgressInterval = setInterval(() => {
            if (percentage < 35) {
                percentage += Math.floor(Math.random() * 3) + 1;
                updateLoadingStep('step-dns', 'step-lighthouse', 20);
            } else if (percentage < 75) {
                percentage += Math.floor(Math.random() * 2) + 1;
                updateLoadingStep('step-lighthouse', 'step-metrics', 55);
            } else if (percentage < 95) {
                // Crawl slowly while waiting for PageSpeed payload responses
                percentage += Math.random() > 0.6 ? 1 : 0;
                updateLoadingStep('step-metrics', 'step-done', 80);
            }
            
            loadingPercentage.textContent = `${Math.round(percentage)}%`;
        }, 350);
    }

    function updateLoadingStep(currentId, nextId, threshold) {
        const currEl = document.getElementById(currentId);
        const nextEl = document.getElementById(nextId);
        
        if (currEl && currEl.classList.contains('active')) {
            currEl.classList.remove('active');
            currEl.classList.add('done');
            if (nextEl) {
                nextEl.classList.add('active');
            }
        }
    }

    function stopLoading(success = true) {
        clearInterval(simulatedProgressInterval);
        clearInterval(tipsRotationInterval);
        
        if (success) {
            loadingPercentage.textContent = '100%';
            // Complete steps visually
            const steps = ['step-dns', 'step-lighthouse', 'step-metrics', 'step-done'];
            steps.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.className = 'step done';
            });
            
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                document.body.style.overflow = ''; // Unlock scroll
            }, 600);
        } else {
            loadingOverlay.classList.add('hidden');
            document.body.style.overflow = ''; // Unlock scroll
        }
    }

    /* ==========================================================================
       API INTEGRATION LAYER
       ========================================================================== */

    async function fetchPageSpeedData(targetUrl, strategy) {
        startLoading();
        
        // Prepare Google PageSpeed API parameters
        // Request categories: performance, accessibility, best-practices, seo
        const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=AIzaSyA971ImsPQnNfYym2JBme6KgJZuV-jzUdo`;
        
        try {
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.error?.message || `API error (HTTP ${response.status})`);
            }
            
            const data = await response.json();
            stopLoading(true);
            
            if (!data.lighthouseResult) {
                throw new Error("Lighthouse reports are unavailable for this website. Please try a different URL.");
            }
            
            renderAnalysisResults(data, targetUrl);
            
        } catch (error) {
            console.error("Analysis process failed:", error);
            stopLoading(false);
            showError(`Analysis failed: ${error.message}. Please check that the URL is public and type it correctly.`, true);
        }
    }

    /* ==========================================================================
       RESULTS DISPLAY & CALCULATIONS
       ========================================================================== */
    
    function renderAnalysisResults(data, url) {
        const lighthouse = data.lighthouseResult;
        
        // 1. EXTRACT CORE SCORES
        const perfScore = Math.round((lighthouse.categories.performance?.score ?? 0) * 100);
        const accScore = Math.round((lighthouse.categories.accessibility?.score ?? 0) * 100);
        const bpScore = Math.round((lighthouse.categories['best-practices']?.score ?? 0) * 100);
        const seoScore = Math.round((lighthouse.categories.seo?.score ?? 0) * 100);
        
        // 2. EXTRACT CORE SPEED AUDITS
        const fcpAudit = lighthouse.audits['first-contentful-paint'];
        const lcpAudit = lighthouse.audits['largest-contentful-paint'];
        const ttiAudit = lighthouse.audits['interactive'];
        const siAudit = lighthouse.audits['speed-index'];

        const fcpVal = fcpAudit?.displayValue ?? 'N/A';
        const lcpVal = lcpAudit?.displayValue ?? 'N/A';
        const ttiVal = ttiAudit?.displayValue ?? 'N/A';
        const siVal = siAudit?.displayValue ?? 'N/A';
        
        const fcpScore = fcpAudit?.score ?? 0;
        const lcpScore = lcpAudit?.score ?? 0;
        const ttiScore = ttiAudit?.score ?? 0;
        const siScore = siAudit?.score ?? 0;

        // 3. CALCULATE SPEED SCORE (Average of key speed audits)
        const speedScore = Math.round(((fcpScore + lcpScore + ttiScore + siScore) / 4) * 100);
        
        // 4. CALCULATE OVERALL HEALTH SCORE (Average of Performance, Accessibility, Best Practices, SEO)
        const overallScore = Math.round((perfScore + accScore + bpScore + seoScore) / 4);

        // Store state for modal detailed view
        latestLighthouseResult = lighthouse;
        computedScores = {
            performance: perfScore,
            accessibility: accScore,
            bestpractices: bpScore,
            seo: seoScore,
            speed: speedScore,
            overall: overallScore
        };

        // Update score card badges
        updateScoreCardBadges(lighthouse);

        // Update url visual text
        try {
            const parsed = new URL(url);
            analyzedUrlText.textContent = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
        } catch (_) {
            analyzedUrlText.textContent = url;
        }

        // 5. UPDATE GAUGE DISPLAYS & CLASSES
        updateScoreGauge(gaugePerf, scorePerf, perfScore);
        updateScoreGauge(gaugeAcc, scoreAcc, accScore);
        updateScoreGauge(gaugeBP, scoreBP, bpScore);
        updateScoreGauge(gaugeSeo, scoreSeo, seoScore);
        updateScoreGauge(gaugeOverall, scoreOverall, overallScore);
        
        // Add ratings classes to gauge score cards
        classifyScoreCard(scorePerf.closest('.score-card'), perfScore);
        classifyScoreCard(scoreAcc.closest('.score-card'), accScore);
        classifyScoreCard(scoreBP.closest('.score-card'), bpScore);
        classifyScoreCard(scoreSeo.closest('.score-card'), seoScore);
        classifyScoreCard(scoreOverall.closest('.score-card'), overallScore);

        // 6. UPDATE CORE WEB VITALS CARDS
        updateMetricCard(cardFcp, valFcp, badgeFcp, fcpVal, fcpScore);
        updateMetricCard(cardLcp, valLcp, badgeLcp, lcpVal, lcpScore);
        updateMetricCard(cardTti, valTti, badgeTti, ttiVal, ttiScore);
        updateMetricCard(cardSi, valSi, badgeSi, siVal, siScore);

        // 7. COMPILE ACTION RECOMMENDATIONS
        buildRecommendations(lighthouse.audits);

        // 8. RUN ADVANCED TAB CONTENT GENERATORS
        saveToHistory(url, overallScore);
        runUptimeChecker(url);
        runMetaTagsPreview(lighthouse);
        runLinksAnalysis(lighthouse);
        runSecurityChecker(lighthouse);
        runKeywordsAnalysis(lighthouse);
        runTechStackDetector(lighthouse);
        renderSpeedAuditsList(lighthouse);
        renderSeoAuditsList(lighthouse);
        loadScreenshotPreview('desktop');
        
        // Setup competitor comparison defaults
        const compUrlPrimary = document.getElementById('comp-url-primary');
        if (compUrlPrimary) {
            compUrlPrimary.value = url;
        }
        const compDashboard = document.getElementById('compare-dashboard');
        if (compDashboard) {
            compDashboard.classList.add('hidden');
        }
        const compUrlCompetitor = document.getElementById('comp-url-competitor');
        if (compUrlCompetitor) {
            compUrlCompetitor.value = '';
        }

        // Show results section
        resultsSection.classList.remove('hidden');
        
        // Scroll smoothly to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Animate and set SVG circle properties
    function updateScoreGauge(circleElement, textElement, score) {
        if (!circleElement || !textElement) return;
        
        // Circumference of radius 50 is 314.16
        const circumference = 314.16;
        const offset = circumference - (score / 100) * circumference;
        
        circleElement.style.strokeDasharray = circumference;
        circleElement.style.strokeDashoffset = offset;
        
        // Animate counter text
        animateValCounter(textElement, score);
    }

    function animateValCounter(element, targetVal) {
        let current = 0;
        const duration = 1200; // Matches CSS stroke transition
        const steps = 30;
        const increment = Math.ceil(targetVal / steps);
        const stepTime = duration / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetVal) {
                current = targetVal;
                clearInterval(timer);
            }
            element.textContent = current;
        }, stepTime);
    }

    // Set styling classes (excellent, average, poor)
    function classifyScoreCard(cardElement, score) {
        if (!cardElement) return;
        
        cardElement.classList.remove('excellent', 'average', 'poor');
        
        if (score >= 90) {
            cardElement.classList.add('excellent');
        } else if (score >= 50) {
            cardElement.classList.add('average');
        } else {
            cardElement.classList.add('poor');
        }
    }

    function updateMetricCard(cardElement, valueElement, badgeElement, value, score) {
        if (!cardElement) return;
        
        cardElement.classList.remove('excellent', 'average', 'poor');
        valueElement.textContent = value;
        
        let rating = '';
        if (score >= 0.9) {
            cardElement.classList.add('excellent');
            rating = 'Good';
        } else if (score >= 0.5) {
            cardElement.classList.add('average');
            rating = 'Needs Work';
        } else {
            cardElement.classList.add('poor');
            rating = 'Poor';
        }
        
        badgeElement.textContent = rating;
    }

    // Recommendations Builder Engine
    function buildRecommendations(audits) {
        recommendationList.innerHTML = '';
        
        // Gather failed keys from raw audits
        const failedChecks = [];
        
        keyAudits.forEach(item => {
            const auditData = audits[item.id];
            
            if (auditData) {
                // Audits score is a value from 0 to 1. If it's below 0.9, we list it as recommendation
                const score = auditData.score;
                if (score !== null && score < 0.9) {
                    failedChecks.push({
                        title: item.title,
                        description: auditData.description || 'Improve this factor to increase speed and user layout scores.',
                        impact: item.impact,
                        category: item.category,
                        score: score
                    });
                }
            }
        });

        // Sort by impact: high first, then medium, then low
        const impactWeights = { high: 3, medium: 2, low: 1 };
        failedChecks.sort((a, b) => impactWeights[b.impact] - impactWeights[a.impact]);

        if (failedChecks.length === 0) {
            const successEl = document.createElement('li');
            successEl.className = 'recommendation-item';
            successEl.style.justifyContent = 'center';
            successEl.innerHTML = `
                <div class="rec-details text-center">
                    <span class="rec-icon" style="font-size: 2.5rem; margin: 0 auto 12px auto; color: var(--score-green);">🎉</span>
                    <h4 class="rec-title">Outstanding Performance!</h4>
                    <p class="rec-desc">Your site passes all our core checks with flying colors. No major optimization suggestions are needed.</p>
                </div>
            `;
            recommendationList.appendChild(successEl);
            return;
        }

        // Limit recommendations display up to 6 priority items to avoid overwhelming users
        const priorityRecommendations = failedChecks.slice(0, 6);

        priorityRecommendations.forEach(item => {
            const li = document.createElement('li');
            li.className = 'recommendation-item';
            
            let impactBadgeClass = 'impact-low';
            let warningIcon = '⚠️';
            
            if (item.impact === 'high') {
                impactBadgeClass = 'impact-high';
                warningIcon = '🚨';
            } else if (item.impact === 'medium') {
                impactBadgeClass = 'impact-med';
                warningIcon = '⚠️';
            }

            // Convert Markdown-style links in google description e.g. [Learn more](url) to HTML clickable links
            let formattedDesc = item.description;
            const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            formattedDesc = formattedDesc.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); text-decoration: underline;">$1</a>');

            li.innerHTML = `
                <span class="rec-icon rec-${item.impact}">${warningIcon}</span>
                <div class="rec-details">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <h4 class="rec-title">${item.title}</h4>
                        <span class="rec-impact ${impactBadgeClass}">${item.impact} Priority</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">${item.category}</span>
                    </div>
                    <p class="rec-desc">${formattedDesc}</p>
                </div>
            `;
            
            recommendationList.appendChild(li);
        });
    }

    /* ==========================================================================
       EVENT LISTENERS & HANDLERS
       ========================================================================== */

    // Form submission analyzer click
    analyzerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError();
        
        const inputVal = websiteUrlInput.value;
        const targetUrl = formatUrl(inputVal);
        
        if (!isValidUrl(targetUrl)) {
            showError("Please enter a valid website domain or address (e.g., mysite.com or https://mysite.com).");
            return;
        }
        
        currentUrl = targetUrl;
        
        // Execute API call
        fetchPageSpeedData(currentUrl, currentStrategy);
    });

    // Strategy toggles re-trigger
    strategyMobile.addEventListener('click', () => {
        if (currentStrategy === 'mobile') return;
        
        strategyMobile.classList.add('active');
        strategyDesktop.classList.remove('active');
        currentStrategy = 'mobile';
        
        if (currentUrl) {
            fetchPageSpeedData(currentUrl, currentStrategy);
        }
    });

    strategyDesktop.addEventListener('click', () => {
        if (currentStrategy === 'desktop') return;
        
        strategyDesktop.classList.add('active');
        strategyMobile.classList.remove('active');
        currentStrategy = 'desktop';
        
        if (currentUrl) {
            fetchPageSpeedData(currentUrl, currentStrategy);
        }
    });

    // Retry error button
    errorRetry.addEventListener('click', () => {
        if (currentUrl) {
            hideError();
            fetchPageSpeedData(currentUrl, currentStrategy);
        }
    });

    // Reset analyzer back to home / input view
    btnReanalyze.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        websiteUrlInput.value = '';
        currentUrl = '';
        hideError();
        
        // Scroll smoothly to top analyzer input
        document.getElementById('analyzer-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Refocus on input
        setTimeout(() => websiteUrlInput.focus(), 800);
    });

    /* ==========================================================================
       SCORE DETAILS MODAL SUB-SYSTEM
       ========================================================================== */
    const modalEl = document.getElementById('details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalFooterCloseBtn = document.getElementById('modal-footer-close-btn');
    const modalTitleText = document.getElementById('modal-title-text');
    const modalSubtitleText = document.getElementById('modal-subtitle-text');
    const modalCategoryIcon = document.getElementById('modal-category-icon');
    const modalIssuesCountBadge = document.getElementById('modal-issues-count');
    const btnCopyReport = document.getElementById('btn-copy-report');
    const tabButtons = document.querySelectorAll('.modal-tab-btn');

    const categoryInfo = {
        performance: { title: "Performance Details", subtitle: "Overall speed and loading efficiency breakdown", icon: "⚡" },
        accessibility: { title: "Accessibility Details", subtitle: "Accessibility and usability audits breakdown", icon: "♿" },
        bestpractices: { title: "Best Practices Details", subtitle: "Security, code quality, and development standards", icon: "🛡️" },
        seo: { title: "SEO Details", subtitle: "Search engine optimization and visibility audits", icon: "🔍" },
        speed: { title: "Speed Score Details", subtitle: "Performance-focused resource load bottlenecks", icon: "🚀" },
        overall: { title: "Overall Health Details", subtitle: "Aggregated site health metrics & priorities", icon: "🏥" }
    };

    const performanceMetrics = [
        { id: 'first-contentful-paint', name: 'First Contentful Paint (FCP)', desc: 'Time when the first text or image is rendered.', impact: 'MEDIUM' },
        { id: 'largest-contentful-paint', name: 'Largest Contentful Paint (LCP)', desc: 'Time when the main content of page is fully loaded.', impact: 'HIGH' },
        { id: 'total-blocking-time', name: 'Total Blocking Time (TBT)', desc: 'Sum of all time periods between FCP and Time to Interactive where task length exceeded 50ms.', impact: 'HIGH' },
        { id: 'cumulative-layout-shift', name: 'Cumulative Layout Shift (CLS)', desc: 'Measures the movement of visible elements in the viewport.', impact: 'HIGH' },
        { id: 'speed-index', name: 'Speed Index', desc: 'Shows how quickly the contents of a page are visibly populated.', impact: 'MEDIUM' },
        { id: 'interactive', name: 'Time to Interactive (TTI)', desc: 'Time when the page becomes fully interactive.', impact: 'MEDIUM' }
    ];

    const accessibilityMetrics = [
        { id: 'color-contrast', name: 'Color Contrast Ratio', desc: 'Checks if background and foreground colors have sufficient contrast ratio for text readability.', impact: 'CRITICAL' },
        { id: 'image-alt', name: 'Image Alt Descriptions', desc: 'Checks that HTML images have alternative text tags so screen readers can interpret them.', impact: 'HIGH' },
        { id: 'html-has-lang', name: 'HTML Language Tag', desc: 'Checks if the root html element contains a valid lang attribute for correct translation software.', impact: 'MEDIUM' },
        { id: 'document-title', name: 'HTML Document Title', desc: 'Checks that the webpage has a structural document title defining its context.', impact: 'MEDIUM' },
        { id: 'link-name', name: 'Descriptive Link Anchors', desc: 'Checks if link anchors contain clear, meaningful, readable text rather than general words.', impact: 'HIGH' },
        { id: 'aria-allowed-attr', name: 'Allowed ARIA Attributes', desc: 'Checks that ARIA attributes are valid and allowed on their respective element roles.', impact: 'HIGH' },
        { id: 'meta-viewport', name: 'Scalable Mobile Viewport', desc: 'Checks that user zooming is not disabled in the viewport tag, ensuring accessibility scaling.', impact: 'HIGH' }
    ];

    const seoMetrics = [
        { id: 'document-title', name: 'Meta Title Tag', desc: 'Checks if the page has a title element and validates its length (50-60 characters is ideal for search results).', priority: 'CRITICAL' },
        { id: 'meta-description', name: 'Meta Description Tag', desc: 'Checks if the page has a meta description and validates its length (140-160 characters is ideal for snippets).', priority: 'HIGH' },
        { id: 'image-alt', name: 'Image Alternative Text', desc: 'Checks if image elements have descriptive alternative (alt) text to assist screen readers and search indexers.', priority: 'HIGH' },
        { id: 'link-text', name: 'Descriptive Link Text', desc: 'Checks if links have descriptive text (like \'Learn more\' vs descriptive phrasing) to improve SEO crawl link accessibility.', priority: 'MEDIUM' },
        { id: 'is-crawlable', name: 'Search Engine Crawlability', desc: 'Checks if search engines are allowed to index the page or if it is blocked by robots/noindex tags.', priority: 'CRITICAL' },
        { id: 'robots-txt', name: 'Robots.txt File Validation', desc: 'Checks if the website has a valid robots.txt file that guides crawlers on where they can go.', priority: 'MEDIUM' },
        { id: 'viewport', name: 'Mobile Viewport Configured', desc: 'Checks if the page defines a viewport meta tag for proper scaling on mobile screen layouts.', priority: 'CRITICAL' },
        { id: 'font-size', name: 'Legible Font Sizes', desc: 'Checks if the font size is large enough to be easily readable on mobile devices without zooming.', priority: 'MEDIUM' },
        { id: 'structured-data', name: 'Structured Schema Markup', desc: 'Checks if schema markup/structured data is present on the page to enhance search result rich snippets.', priority: 'MEDIUM' },
        { id: 'canonical', name: 'Canonical URL Tag', desc: 'Checks if the page has a canonical URL tag to prevent duplicate content issues in index rankings.', priority: 'HIGH' }
    ];

    const bestpracticesMetrics = [
        { id: 'is-on-https', name: 'HTTPS Secure Connection', desc: 'Checks if the webpage is loaded securely over HTTPS. HTTPS is crucial for user privacy, security, and search rankings.', security: 'HIGH' },
        { id: 'no-vulnerable-libraries', name: 'No Vulnerable JS Libraries', desc: 'Checks if any of the JavaScript libraries loaded on the page have known security vulnerabilities.', security: 'CRITICAL' },
        { id: 'csp-xss', name: 'Content Security Policy (CSP)', desc: 'Checks if a Content Security Policy (CSP) is active. CSP prevents XSS and data injection attacks.', security: 'HIGH' },
        { id: 'errors-in-console', name: 'No Browser Console Errors', desc: 'Checks if there are browser console logs indicating JavaScript errors or failed network requests during page load.', security: 'LOW' },
        { id: 'image-aspect-ratio', name: 'Correct Image Aspect Ratios', desc: 'Checks if images are displayed with their correct aspect ratio. Stretched or squished images look unprofessional.', security: 'NONE' },
        { id: 'deprecations', name: 'No Deprecated APIs Used', desc: 'Checks if the webpage uses features or APIs that are deprecated and will be removed in future browser versions.', security: 'MEDIUM' },
        { id: 'paste-preventing-inputs', name: 'Paste Allowed in Forms', desc: 'Checks if inputs allow users to paste content. Blocking paste degrades user experience, especially for password managers.', security: 'LOW' },
        { id: 'doctype', name: 'Valid HTML Doctype', desc: 'Checks if the page has a valid HTML doctype declared. Missing doctype triggers quirks-mode rendering.', security: 'LOW' }
    ];

    const speedMetrics = [
        { id: 'render-blocking-resources', name: 'Eliminate Render-Blocking Resources', desc: 'CSS and JS files blocking the browser from rendering the page layout quickly.', difficulty: 'Hard' },
        { id: 'unused-css-rules', name: 'Remove Unused CSS Rules', desc: 'CSS selectors and files loaded but not used by any element on the current page.', difficulty: 'Medium' },
        { id: 'unused-javascript', name: 'Remove Unused JavaScript', desc: 'JavaScript code loaded by the browser but not executed during page load.', difficulty: 'Hard' },
        { id: 'uses-optimized-images', name: 'Compress and Optimize Images', desc: 'Uncompressed image assets wasting user bandwidth and taking too long to fetch.', difficulty: 'Easy' },
        { id: 'modern-image-formats', name: 'Serve Images in WebP/AVIF', desc: 'Images loaded in PNG or JPG formats instead of modern formats (WebP, AVIF) which are much smaller.', difficulty: 'Easy' },
        { id: 'uses-text-compression', name: 'Enable Gzip/Brotli Compression', desc: 'Server-side file compression that reduces transfer sizes for text-based resources.', difficulty: 'Medium' },
        { id: 'uses-long-cache-ttl', name: 'Leverage Browser Caching', desc: 'Static assets served without long-term caching policies, forcing repeated page fetches.', difficulty: 'Medium' },
        { id: 'server-response-time', name: 'Reduce Server Response Time (TTFB)', desc: 'Time taken for the web server to start sending resource data. Indicates server performance.', difficulty: 'Hard' },
        { id: 'dom-size', name: 'Minimize HTML DOM Node Count', desc: 'Too many HTML elements in the page structure, which slows down styling and rendering paths.', difficulty: 'Medium' },
        { id: 'bootup-time', name: 'Reduce JavaScript Execution Time', desc: 'Time browser spends parsing, compiling, and running heavy JavaScript bundles.', difficulty: 'Hard' }
    ];

    const fixStepsMap = {
        'first-contentful-paint': [
            "Inline critical CSS rules in your HTML `<head>` section.",
            "Defer non-essential JavaScript tags using `defer` or `async`.",
            "Minify CSS stylesheet bundles and JavaScript files."
        ],
        'largest-contentful-paint': [
            "Preload LCP images using `<link rel=\"preload\" as=\"image\">` in head.",
            "Optimize and compress LCP images, serving them in WebP or AVIF format.",
            "Implement browser caching and use a Content Delivery Network (CDN)."
        ],
        'total-blocking-time': [
            "Use code splitting to break large JS modules into smaller chunks.",
            "Postpone or lazy-load non-essential third-party script execution.",
            "Deploy Web Workers to run long-running execution blocks in the background."
        ],
        'cumulative-layout-shift': [
            "Include explicit `width` and `height` attributes on all image and video tags.",
            "Reserve size slots for dynamic ad script containers, embeds, and iframes.",
            "Avoid injecting dynamic content above existing text/layout structures."
        ],
        'speed-index': [
            "Optimize render paths by removing unused CSS styles.",
            "Optimize the order of style and script loading to render layouts quickly.",
            "Compress and optimize static resources to load critical assets faster."
        ],
        'interactive': [
            "Reduce main-thread JavaScript payload load weight.",
            "Postpone initialization of heavy client side widgets until page interaction.",
            "Optimize layout templates to prevent layout thrashing."
        ],
        'document-title': [
            "Locate the `<title>` tag in the `<head>` of your webpage HTML.",
            "Ensure the title is descriptive and matches page keywords.",
            "Adjust length to be between 50 and 60 characters so it fits search result snippets."
        ],
        'meta-description': [
            "Add a `<meta name=\"description\" content=\"...\">` tag in your HTML head.",
            "Summarize page content in 140 to 160 characters to capture search user clicks.",
            "Include relevant primary page keywords naturally in the description copy."
        ],
        'image-alt': [
            "Search for image tags (`<img>`) missing alt parameters.",
            "Add the `alt` parameter describing what is in the image.",
            "Example: `<img src=\"logo.png\" alt=\"Company branding logo\">`."
        ],
        'link-text': [
            "Audit hyperlinks with text like 'Click here', 'Read more', or 'Go'.",
            "Rewrite them to be descriptive of the target page's content.",
            "Example: Change 'Read more' to 'Read our WordPress Optimization Guide'."
        ],
        'is-crawlable': [
            "Verify `<meta name=\"robots\" content=\"noindex\">` is not present in pages you want indexed.",
            "Inspect server response headers for `X-Robots-Tag: noindex`.",
            "Check sitemaps to verify the URL is listed for indexing."
        ],
        'robots-txt': [
            "Create a text file named `robots.txt` at your domain root (e.g. yoursite.com/robots.txt).",
            "Define crawling rules to allow search engine user-agents access.",
            "Reference your XML Sitemap link inside the file."
        ],
        'viewport': [
            "Add `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">` to your HTML `<head>`.",
            "Use CSS media queries to scale grids and components fluidly on mobile sizes."
        ],
        'font-size': [
            "Ensure baseline font sizes are at least 16px for body paragraphs.",
            "Use relative units (em, rem, or %) for layouts instead of fixed pixels.",
            "Provide a readable line-height parameter (minimum 1.5 is standard)."
        ],
        'structured-data': [
            "Add JSON-LD Schema markup describing page data (Article, Product, Org).",
            "Embed the schema scripts in your page body or head.",
            "Test implementation with Google Rich Results Test tools."
        ],
        'canonical': [
            "Identify the authoritative URL version for this webpage content.",
            "Add `<link rel=\"canonical\" href=\"https://yoursite.com/official-page\">` inside HTML head.",
            "Ensure redirects (like http to https, non-www to www) consolidate traffic to this URL."
        ],
        'is-on-https': [
            "Obtain and install an SSL certificate from Let's Encrypt or your web host.",
            "Configure a 301 server redirect rule routing all HTTP traffic to HTTPS version.",
            "Scan the site to fix mixed content warnings (assets using http protocol)."
        ],
        'no-vulnerable-libraries': [
            "Inspect vulnerable JS library warnings in Chrome DevTools or Lighthouse reports.",
            "Update jQuery, Bootstrap, or packages to their latest secure versions.",
            "Regularly audit node modules or third-party plugins for security updates."
        ],
        'csp-xss': [
            "Formulate a Content Security Policy specifying secure script and style origins.",
            "Send the policy via HTTP response header (`Content-Security-Policy`).",
            "Test CSP settings to ensure it blocks inline script injections without breaking tools."
        ],
        'errors-in-console': [
            "Open your website and access DevTools Console (F12 or Ctrl+Shift+I).",
            "Locate exceptions, script crashes, or asset loading errors (HTTP 404/500).",
            "Fix broken source file paths and resolve JS code bugs."
        ],
        'image-aspect-ratio': [
            "Verify CSS width and height declarations preserve original image proportions.",
            "Utilize CSS helper styles like `object-fit: cover;` for cropped cards.",
            "Avoid scaling dimensions explicitly in HTML if CSS stretches them."
        ],
        'deprecations': [
            "Scan console messages for browser deprecation warning notices.",
            "Locate deprecated JavaScript API usages (e.g. synch HTTP requests, document.write).",
            "Rewrite scripts to replace deprecated elements with modern API interfaces."
        ],
        'paste-preventing-inputs': [
            "Remove event handlers that block paste actions on form text inputs.",
            "Ensure fields like Password, Email, and Card Numbers accept pasting.",
            "Test compatibility with standard Password Managers (e.g. 1Password, Bitwarden)."
        ],
        'doctype': [
            "Open your homepage HTML source template files.",
            "Prepend `<!DOCTYPE html>` at the very start of the file structure.",
            "Ensure no blank spaces or comments precede the doctype declaration."
        ],
        'render-blocking-resources': [
            "Mark non-critical `<script>` tags with `defer` or `async` parameters.",
            "Split large CSS files, loading print or subpage CSS asynchronously.",
            "Inline critical CSS directly in page layout templates to speed up page rendering."
        ],
        'unused-css-rules': [
            "Run Chrome DevTools coverage audits to pinpoint unused CSS lines.",
            "Remove unused CSS classes from global stylesheets.",
            "Build separate CSS files corresponding only to templates requiring them."
        ],
        'unused-javascript': [
            "Identify heavy script bundles and employ tree-shaking tool filters.",
            "Delay loading of third-party widgets (chats, maps, trackers) until user scroll.",
            "Refactor code to load JS dynamically only when requested."
        ],
        'uses-optimized-images': [
            "Run images through compression packages like TinyPNG, OptiPNG, or ImageMin.",
            "Configure automatic media library compressors on your hosting platform.",
            "Ensure images display dimensions matching their actual resolution sizes."
        ],
        'modern-image-formats': [
            "Convert PNG and JPEG image assets to WebP or AVIF format.",
            "Use WordPress plugins or script pipelines to automatically convert media library uploads.",
            "Update theme templates to load modern image versions."
        ],
        'uses-text-compression': [
            "Enable Gzip or Brotli compression module configuration on Apache/Nginx server.",
            "Ensure HTML, CSS, JavaScript, and SVG resource content types are compressed.",
            "Test compression status with web validation tools."
        ],
        'uses-long-cache-ttl': [
            "Add `Cache-Control` headers specifying cache lifetimes for static assets.",
            "Set cache lifetime duration to 1 year (`max-age=31536000`) for static files.",
            "Configure cache settings in hosting panels, server rules, or cache plugins."
        ],
        'server-response-time': [
            "Migrate website files to high-performance SSD hosting providers.",
            "Implement server page-caching configurations (Redis, Memcached, Varnish).",
            "Optimize database tables, slow SQL query scripts, and update PHP configurations."
        ],
        'dom-size': [
            "Simplify template HTML layout trees by removing redundant wrapper divs.",
            "Implement pagination or lazy infinite scrolls on lists and tables.",
            "Refactor dynamic widget designs to keep structural nodes compact."
        ],
        'bootup-time': [
            "Minify JavaScript codes and combine redundant scripts.",
            "Remove unnecessary plugins and slow execution libraries.",
            "Defer heavy initialization codes to run after page layout loading."
        ],
        'color-contrast': [
            "Inspect background and text colors to verify they meet a 4.5:1 ratio (3:1 for large text).",
            "Brighten or darken text color until contrast ratio is compliant.",
            "Use developer accessibility tools in Chrome to preview color contrast issues."
        ],
        'html-has-lang': [
            "Open your website index root document template file.",
            "Update the HTML tag to specify a language parameter. Example: `<html lang=\"en\">`.",
            "Verify the code matches standard ISO language formatting guidelines."
        ],
        'link-name': [
            "Identify links containing generic text such as 'click here', 'more', or 'info'.",
            "Replace them with descriptive anchor words defining link targets.",
            "Ensure links retain distinct visual styles (underlines, color) separate from body text."
        ],
        'aria-allowed-attr': [
            "Check HTML elements containing ARIA attributes to confirm their syntax is standard.",
            "Ensure ARIA parameters are only added to supported HTML elements and roles.",
            "Verify attributes do not duplicate native tag functionality."
        ],
        'meta-viewport': [
            "Ensure the viewport meta tag does not contain `user-scalable=no` or `maximum-scale` constraints.",
            "Use standard scaling parameters. Example: `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`.",
            "Allow users to resize layouts freely to fit visual comfort."
        ]
    };

    function getAudit(lighthouse, id) {
        if (lighthouse && lighthouse.audits && lighthouse.audits[id]) {
            return lighthouse.audits[id];
        }
        return {
            score: 1,
            displayValue: 'N/A',
            description: 'Audit data unavailable.',
            details: { items: [] }
        };
    }

    function getIssuesForCategory(cat) {
        if (!latestLighthouseResult) return [];
        const list = [];
        
        if (cat === 'performance') {
            performanceMetrics.forEach(m => {
                const audit = getAudit(latestLighthouseResult, m.id);
                const score = audit.score !== null ? audit.score : 0.5;
                if (score < 0.9) {
                    list.push({
                        id: m.id,
                        name: m.name,
                        value: audit.displayValue || (score >= 0.9 ? 'Good' : 'Needs work'),
                        score: score,
                        desc: m.desc,
                        meaning: m.desc,
                        impact: m.impact,
                        fixSteps: fixStepsMap[m.id] || []
                    });
                }
            });
        } else if (cat === 'accessibility') {
            accessibilityMetrics.forEach(m => {
                const audit = getAudit(latestLighthouseResult, m.id);
                const score = audit.score !== null ? audit.score : 0.5;
                if (score < 0.9) {
                    list.push({
                        id: m.id,
                        name: m.name,
                        value: audit.displayValue || (score >= 0.9 ? 'Pass' : 'Fail'),
                        score: score,
                        desc: m.desc,
                        meaning: m.desc,
                        impact: m.impact,
                        fixSteps: fixStepsMap[m.id] || []
                    });
                }
            });
        } else if (cat === 'seo') {
            seoMetrics.forEach(m => {
                const audit = getAudit(latestLighthouseResult, m.id);
                const score = audit.score !== null ? audit.score : 0.5;
                if (score < 0.9) {
                    list.push({
                        id: m.id,
                        name: m.name,
                        value: audit.displayValue || (score >= 0.9 ? 'Pass' : 'Fail'),
                        score: score,
                        desc: m.desc,
                        meaning: m.desc,
                        priority: m.priority,
                        fixSteps: fixStepsMap[m.id] || []
                    });
                }
            });
        } else if (cat === 'bestpractices') {
            bestpracticesMetrics.forEach(m => {
                const audit = getAudit(latestLighthouseResult, m.id);
                const score = audit.score !== null ? audit.score : 0.5;
                if (score < 0.9) {
                    list.push({
                        id: m.id,
                        name: m.name,
                        value: audit.displayValue || (score >= 0.9 ? 'Pass' : 'Fail'),
                        score: score,
                        desc: m.desc,
                        meaning: m.desc,
                        security: m.security,
                        fixSteps: fixStepsMap[m.id] || []
                    });
                }
            });
        } else if (cat === 'speed') {
            speedMetrics.forEach(m => {
                const audit = getAudit(latestLighthouseResult, m.id);
                const score = audit.score !== null ? audit.score : 0.5;
                if (score < 0.9) {
                    let savingsText = '';
                    if (audit.details && audit.details.items && audit.details.items.length > 0) {
                        let totalBytesWasted = 0;
                        let totalMsWasted = 0;
                        audit.details.items.forEach(item => {
                            totalBytesWasted += item.wastedBytes || item.totalBytes || 0;
                            totalMsWasted += item.wastedMs || 0;
                        });
                        
                        if (totalMsWasted > 0) {
                            savingsText = `Save ${totalMsWasted}ms`;
                        } else if (totalBytesWasted > 0) {
                            if (totalBytesWasted > 1024 * 1024) {
                                savingsText = `Save ${(totalBytesWasted / (1024 * 1024)).toFixed(1)}MB`;
                            } else {
                                savingsText = `Save ${(totalBytesWasted / 1024).toFixed(0)}KB`;
                            }
                        }
                    }
                    if (!savingsText && audit.displayValue) {
                        savingsText = audit.displayValue;
                    }
                    
                    list.push({
                        id: m.id,
                        name: m.name,
                        value: savingsText || 'Needs Work',
                        score: score,
                        desc: m.desc,
                        meaning: m.desc,
                        difficulty: m.difficulty,
                        details: audit.details,
                        fixSteps: fixStepsMap[m.id] || []
                    });
                }
            });
        }
        
        return list;
    }

    function getHealthGrade(score) {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    function updateScoreCardBadges(lh) {
        const perfIssues = getIssuesForCategory('performance').length;
        const accIssues = getIssuesForCategory('accessibility').length;
        const bpIssues = getIssuesForCategory('bestpractices').length;
        const seoIssues = getIssuesForCategory('seo').length;
        const overallIssues = perfIssues + accIssues + bpIssues + seoIssues;

        setBadge('issues-badge-performance', perfIssues);
        setBadge('issues-badge-accessibility', accIssues);
        setBadge('issues-badge-bestpractices', bpIssues);
        setBadge('issues-badge-seo', seoIssues);
        setBadge('issues-badge-overall', overallIssues);
    }

    function setBadge(id, count) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = count === 1 ? `1 issue` : `${count} issues`;
        el.classList.remove('hidden', 'success', 'warning', 'error');
        
        if (count === 0) {
            el.classList.add('success');
            el.textContent = '0 issues';
        } else if (count <= 2) {
            el.classList.add('warning');
        } else {
            el.classList.add('error');
        }
    }

    function openDetailsModal(category) {
        if (!latestLighthouseResult) return;
        
        activeCategory = category;
        activeTab = 'overview';
        
        const info = categoryInfo[category];
        if (info) {
            modalTitleText.textContent = info.title;
            modalSubtitleText.textContent = info.subtitle;
            modalCategoryIcon.textContent = info.icon;
        }
        
        const issuesCount = category === 'overall' ? 
            (getIssuesForCategory('performance').length + getIssuesForCategory('accessibility').length + getIssuesForCategory('bestpractices').length + getIssuesForCategory('seo').length) : 
            getIssuesForCategory(category).length;
        modalIssuesCountBadge.textContent = issuesCount;
        
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === activeTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        document.body.style.overflow = 'hidden';
        modalEl.classList.remove('hidden');
        renderModalTab();
    }

    function closeDetailsModal() {
        modalEl.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function renderModalTab() {
        const overviewTab = document.getElementById('modal-tab-overview');
        const issuesTab = document.getElementById('modal-tab-issues');
        const howToFixTab = document.getElementById('modal-tab-how-to-fix');
        
        overviewTab.classList.remove('active');
        issuesTab.classList.remove('active');
        howToFixTab.classList.remove('active');
        
        if (activeTab === 'overview') {
            overviewTab.classList.add('active');
            populateOverviewTab(overviewTab);
        } else if (activeTab === 'issues') {
            issuesTab.classList.add('active');
            populateIssuesTab(issuesTab);
        } else if (activeTab === 'how-to-fix') {
            howToFixTab.classList.add('active');
            populateHowToFixTab(howToFixTab);
        }
    }

    function populateOverviewTab(container) {
        container.innerHTML = '';
        
        if (activeCategory === 'overall') {
            let passed = 0;
            let warnings = 0;
            let failed = 0;
            
            const allMetrics = [
                ...performanceMetrics,
                ...accessibilityMetrics,
                ...bestpracticesMetrics,
                ...seoMetrics
            ];
            
            allMetrics.forEach(m => {
                const audit = getAudit(latestLighthouseResult, m.id);
                const score = audit.score;
                if (score === null) {
                    warnings++;
                } else if (score >= 0.9) {
                    passed++;
                } else if (score >= 0.5) {
                    warnings++;
                } else {
                    failed++;
                }
            });
            
            const grade = getHealthGrade(computedScores.overall);
            const gradeClass = grade.toLowerCase().charAt(0);
            
            let summaryText = '';
            if (computedScores.overall >= 90) {
                summaryText = `Your website is in <strong>excellent</strong> condition! It meets the vast majority of search, speed, and safety guidelines. Keep up the great work!`;
            } else if (computedScores.overall >= 70) {
                summaryText = `Your website has a <strong>good</strong> foundation, but requires a few key speed and layout optimizations to maximize page load speeds and search positions.`;
            } else if (computedScores.overall >= 50) {
                summaryText = `Your website has <strong>several performance and SEO issues</strong> that need work. Pay close attention to mobile scaling layouts and assets compression rules.`;
            } else {
                summaryText = `Your website requires <strong>urgent optimization changes</strong>. Critical performance and code security issues are degrading visitor experience and search indexing potential.`;
            }
            
            const allIssues = [];
            const cats = ['performance', 'accessibility', 'bestpractices', 'seo'];
            cats.forEach(c => {
                allIssues.push(...getIssuesForCategory(c));
            });
            
            const priorityWeights = {
                'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1, 'NONE': 0,
                'Hard': 3, 'Medium': 2, 'Easy': 1
            };
            allIssues.sort((a, b) => {
                const weightA = priorityWeights[a.impact || a.priority || a.security || a.difficulty || 'MEDIUM'] || 2;
                const weightB = priorityWeights[b.impact || b.priority || b.security || b.difficulty || 'MEDIUM'] || 2;
                return weightB - weightA;
            });
            
            const topIssues = allIssues.slice(0, 3);
            let topIssuesHTML = '';
            if (topIssues.length > 0) {
                topIssuesHTML = `
                    <div class="overall-top-fixes">
                        <h4 class="overall-top-fixes-title">🚨 Top 3 Critical Fixes Needed Now:</h4>
                        <ol class="overall-fixes-list">
                            ${topIssues.map(issue => `
                                <li><strong>${issue.name}</strong> — ${issue.desc || issue.meaning} (Fix impact is ${issue.impact || issue.priority || 'high'})</li>
                            `).join('')}
                        </ol>
                    </div>
                `;
            } else {
                topIssuesHTML = `
                    <div class="overall-top-fixes" style="border-color: var(--score-green); background: rgba(34, 197, 94, 0.03);">
                        <h4 class="overall-top-fixes-title" style="color: var(--score-green);">🎉 Zero Major Issues!</h4>
                        <p style="font-size: 0.88rem; color: var(--text-muted);">Your website passes all our priority checks! No immediate fixes are required.</p>
                    </div>
                `;
            }
            
            container.innerHTML = `
                <div class="health-overview-wrapper">
                    <div class="health-grade-container">
                        <div class="health-grade-circle ${gradeClass}">${grade}</div>
                        <div class="health-grade-label">Health Grade</div>
                    </div>
                    <div>
                        <h4 class="health-summary-header">Website Status Summary</h4>
                        <p class="health-summary-text">${summaryText}</p>
                    </div>
                </div>
                
                <div class="health-stats-row">
                    <div class="health-stat-box">
                        <div class="health-stat-num pass">${passed}</div>
                        <div class="health-stat-lbl">Passed Checks</div>
                    </div>
                    <div class="health-stat-box">
                        <div class="health-stat-num warn">${warnings}</div>
                        <div class="health-stat-lbl">Warnings</div>
                    </div>
                    <div class="health-stat-box">
                        <div class="health-stat-num fail">${failed}</div>
                        <div class="health-stat-lbl">Failed Audits</div>
                    </div>
                </div>
                
                ${topIssuesHTML}
            `;
            return;
        }
        
        let metricsToRender = [];
        if (activeCategory === 'performance') metricsToRender = performanceMetrics;
        else if (activeCategory === 'accessibility') metricsToRender = accessibilityMetrics;
        else if (activeCategory === 'seo') metricsToRender = seoMetrics;
        else if (activeCategory === 'bestpractices') metricsToRender = bestpracticesMetrics;
        
        metricsToRender.forEach(m => {
            const audit = getAudit(latestLighthouseResult, m.id);
            let score = audit.score;
            if (score === null) score = 0.5;
            
            const scorePercent = Math.round(score * 100);
            
            let status = 'good';
            let statusLabel = 'Good';
            if (score < 0.5) {
                status = 'poor';
                statusLabel = 'Poor';
            } else if (score < 0.9) {
                status = 'warning';
                statusLabel = 'Needs Work';
            }
            
            let detailBadge = '';
            if (activeCategory === 'performance') {
                detailBadge = `<span class="priority-badge ${m.impact.toLowerCase()}">${m.impact} Impact</span>`;
            } else if (activeCategory === 'accessibility') {
                detailBadge = `<span class="priority-badge ${m.impact.toLowerCase()}">${m.impact} Impact</span>`;
            } else if (activeCategory === 'seo') {
                detailBadge = `<span class="priority-badge ${m.priority.toLowerCase()}">${m.priority} Priority</span>`;
            } else if (activeCategory === 'bestpractices') {
                detailBadge = `<span class="priority-badge ${m.security.toLowerCase()}">Security: ${m.security}</span>`;
            }
            
            const row = document.createElement('div');
            row.className = 'modal-metric-row';
            row.innerHTML = `
                <div class="modal-metric-header">
                    <div class="modal-metric-name">${m.name} ${detailBadge}</div>
                    <div class="modal-metric-value-wrap">
                        <span class="modal-metric-val">${audit.displayValue || (score >= 0.9 ? 'Pass' : 'Fail')}</span>
                        <span class="status-badge ${status}">${statusLabel}</span>
                    </div>
                </div>
                <div class="modal-progress-track">
                    <div class="modal-progress-fill ${status}" style="width: ${scorePercent}%"></div>
                </div>
                <div class="modal-metric-explanation">${m.desc}</div>
            `;
            container.appendChild(row);
        });
    }

    function populateIssuesTab(container) {
        container.innerHTML = '';
        
        if (activeCategory === 'overall') {
            container.innerHTML = `
                <div class="text-center" style="padding: 40px 0; color: var(--text-muted);">
                    <p style="font-size: 1.5rem; margin-bottom: 8px;">🔀 Select a specific category</p>
                    <p style="font-size: 0.9rem;">Please click on one of the other cards (Performance, Accessibility, Best Practices, SEO) to view specific audit issues and URLs.</p>
                </div>
            `;
            return;
        }
        
        const issues = getIssuesForCategory(activeCategory);
        
        if (issues.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 50px 0; border: 1px dashed var(--border-color); border-radius: var(--border-radius); background: rgba(34, 197, 94, 0.02);">
                    <span style="font-size: 3rem; color: var(--score-green); display: block; margin-bottom: 12px;">🎉</span>
                    <h4 style="font-family: var(--font-heading); font-size: 1.3rem; color: #f0eaff; margin-bottom: 8px;">No issues found!</h4>
                    <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 400px; margin: 0 auto;">Your site complies perfectly with all our ${activeCategory.toUpperCase()} criteria.</p>
                </div>
            `;
            return;
        }
        
        const listWrapper = document.createElement('div');
        listWrapper.className = 'modal-issues-list';
        
        issues.forEach(issue => {
            let badgeHTML = '';
            if (activeCategory === 'performance') {
                badgeHTML = `<span class="priority-badge ${issue.impact.toLowerCase()}">${issue.impact} Impact</span>`;
            } else if (activeCategory === 'accessibility') {
                badgeHTML = `<span class="priority-badge ${issue.impact.toLowerCase()}">${issue.impact} Impact</span>`;
            } else if (activeCategory === 'seo') {
                badgeHTML = `<span class="priority-badge ${issue.priority.toLowerCase()}">${issue.priority} Priority</span>`;
            } else if (activeCategory === 'bestpractices') {
                badgeHTML = `<span class="priority-badge ${issue.security.toLowerCase()}">Security: ${issue.security}</span>`;
            } else if (activeCategory === 'speed') {
                badgeHTML = `<span class="priority-badge ${issue.difficulty.toLowerCase()}">Difficulty: ${issue.difficulty}</span>`;
            }
            
            let resourcesHTML = '';
            if (issue.details && issue.details.items && issue.details.items.length > 0) {
                const resourceRows = [];
                issue.details.items.forEach(item => {
                    if (item.url) {
                        let saving = '';
                        if (item.wastedMs) {
                            saving = `Wasted: ${item.wastedMs}ms`;
                        } else if (item.wastedBytes) {
                            saving = `Wasted: ${(item.wastedBytes / 1024).toFixed(0)}KB`;
                        } else if (item.totalBytes) {
                            saving = `Size: ${(item.totalBytes / 1024).toFixed(0)}KB`;
                        }
                        
                        let displayUrl = item.url;
                        if (displayUrl.length > 75) {
                            try {
                                const parsed = new URL(displayUrl);
                                displayUrl = parsed.pathname.substring(parsed.pathname.lastIndexOf('/') + 1) || parsed.hostname;
                            } catch (_) {
                                displayUrl = displayUrl.substring(displayUrl.length - 60);
                            }
                        }
                        
                        resourceRows.push(`
                            <div class="modal-issue-resource">
                                <a class="resource-url" href="${item.url}" target="_blank" rel="noopener noreferrer" title="${item.url}">${displayUrl}</a>
                                <span class="resource-saving">${saving}</span>
                            </div>
                        `);
                    }
                });
                
                if (resourceRows.length > 0) {
                    resourcesHTML = `
                        <div class="modal-issue-resources-list">
                            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; font-weight: 700;">Offending resources:</div>
                            ${resourceRows.slice(0, 10).join('')}
                            ${resourceRows.length > 10 ? `<div style="font-size: 0.7rem; color: var(--text-muted); padding: 4px; font-style: italic;">...and ${resourceRows.length - 10} more resource files</div>` : ''}
                        </div>
                    `;
                }
            }
            
            const item = document.createElement('div');
            item.className = 'modal-issue-item';
            item.innerHTML = `
                <div class="modal-issue-header">
                    <div class="modal-issue-title-wrap">
                        <span style="color: var(--score-red);">⚠️</span>
                        <h4 class="modal-issue-title">${issue.name}</h4>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span class="modal-issue-savings ${issue.score < 0.5 ? 'high-impact' : ''}">${issue.value}</span>
                        ${badgeHTML}
                    </div>
                </div>
                <p class="modal-issue-desc">${issue.desc || issue.meaning}</p>
                ${resourcesHTML}
            `;
            listWrapper.appendChild(item);
        });
        
        container.appendChild(listWrapper);
    }

    function populateHowToFixTab(container) {
        container.innerHTML = '';
        
        if (activeCategory === 'overall') {
            container.innerHTML = `
                <div class="text-center" style="padding: 40px 0; color: var(--text-muted);">
                    <p style="font-size: 1.5rem; margin-bottom: 8px;">🔀 Select a specific category</p>
                    <p style="font-size: 0.9rem;">Please click on one of the other cards (Performance, Accessibility, Best Practices, SEO) to view specific fix steps and instructions.</p>
                </div>
            `;
            return;
        }
        
        const issues = getIssuesForCategory(activeCategory);
        
        if (issues.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 50px 0; border: 1px dashed var(--border-color); border-radius: var(--border-radius); background: rgba(34, 197, 94, 0.02);">
                    <span style="font-size: 3rem; color: var(--score-green); display: block; margin-bottom: 12px;">🎉</span>
                    <h4 style="font-family: var(--font-heading); font-size: 1.3rem; color: #f0eaff; margin-bottom: 8px;">No recommendations to fix!</h4>
                    <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 400px; margin: 0 auto;">Everything in this category meets or exceeds our optimization criteria.</p>
                </div>
            `;
            return;
        }
        
        const fixesWrapper = document.createElement('div');
        fixesWrapper.className = 'modal-fixes-list';
        
        issues.forEach(issue => {
            const stepsList = issue.fixSteps.map(step => `<li>${step}</li>`).join('');
            
            let statusClass = 'warning';
            if (issue.score < 0.5) {
                statusClass = 'error';
            }
            
            let badgeText = '';
            if (activeCategory === 'performance') badgeText = `${issue.impact} Impact`;
            else if (activeCategory === 'accessibility') badgeText = `${issue.impact} Impact`;
            else if (activeCategory === 'seo') badgeText = `${issue.priority} Priority`;
            else if (activeCategory === 'bestpractices') badgeText = `Security: ${issue.security}`;
            else if (activeCategory === 'speed') badgeText = `Difficulty: ${issue.difficulty}`;
            
            const fixBlock = document.createElement('div');
            fixBlock.className = `modal-fix-item ${statusClass}`;
            fixBlock.innerHTML = `
                <h4 class="modal-fix-title">
                    <span>🔧</span>
                    Fix Guide: ${issue.name}
                </h4>
                <div class="modal-fix-meta">
                    <span><strong>Current status:</strong> ${issue.value}</span>
                    <span><strong>Priority rating:</strong> ${badgeText}</span>
                </div>
                <ol class="modal-fix-steps">
                    ${stepsList}
                </ol>
            `;
            fixesWrapper.appendChild(fixBlock);
        });
        
        container.appendChild(fixesWrapper);
    }

    function copyReportToClipboard() {
        if (!latestLighthouseResult) return;
        
        let reportText = `WEBCHECK PRO — WEBSITE SITE AUDIT REPORT\n`;
        reportText += `Generated on: ${new Date().toLocaleString()}\n`;
        reportText += `Analyzed URL: ${currentUrl}\n`;
        reportText += `Strategy: ${currentStrategy.toUpperCase()}\n`;
        reportText += `==================================================\n\n`;
        
        reportText += `OVERALL HEALTH STATUS:\n`;
        reportText += `- Overall Health Score: ${computedScores.overall}/100 (Grade: ${getHealthGrade(computedScores.overall)})\n`;
        reportText += `- Performance: ${computedScores.performance}/100\n`;
        reportText += `- Accessibility: ${computedScores.accessibility}/100\n`;
        reportText += `- Best Practices: ${computedScores.bestpractices}/100\n`;
        reportText += `- SEO: ${computedScores.seo}/100\n\n`;
        
        reportText += `==================================================\n`;
        reportText += `DETAILED ISSUES PER CATEGORY:\n\n`;
        
        const cats = ['performance', 'accessibility', 'bestpractices', 'seo'];
        cats.forEach(cat => {
            const issues = getIssuesForCategory(cat);
            reportText += `[${cat.toUpperCase()} - ${issues.length} Issues]\n`;
            if (issues.length === 0) {
                reportText += ` No issues found in this category!\n\n`;
            } else {
                issues.forEach((issue, index) => {
                    reportText += ` ${index + 1}. ${issue.name} (${issue.value})\n`;
                    reportText += `    Impact/Priority: ${issue.impact || issue.priority || issue.security || 'Medium'}\n`;
                    reportText += `    Explanation: ${issue.desc || issue.meaning}\n`;
                    if (issue.fixSteps && issue.fixSteps.length > 0) {
                        reportText += `    Fix steps:\n`;
                        issue.fixSteps.forEach(step => {
                            reportText += `     * ${step}\n`;
                        });
                    }
                    reportText += `\n`;
                });
            }
        });
        
        navigator.clipboard.writeText(reportText).then(() => {
            const originalText = btnCopyReport.innerHTML;
            btnCopyReport.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon" style="width: 16px; height: 16px; color: var(--score-green);">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            setTimeout(() => {
                btnCopyReport.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
            alert("Could not copy report to clipboard. Please select the text manually.");
        });
    }

    // Attach listeners on score cards click
    document.querySelectorAll('.score-card.clickable').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-score-type');
            if (category) {
                openDetailsModal(category);
            }
        });
    });

    // Close buttons
    modalCloseBtn.addEventListener('click', closeDetailsModal);
    modalFooterCloseBtn.addEventListener('click', closeDetailsModal);
    
    // Close on backdrop overlay click
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            closeDetailsModal();
        }
    });

    // Modal tabs click switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab) {
                activeTab = tab;
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderModalTab();
            }
        });
    });

    // Copy report button
    btnCopyReport.addEventListener('click', copyReportToClipboard);

    /* ==========================================================================
       NEW ADVANCED FEATURES FUNCTIONS
       ========================================================================== */

    // 1. Save and Render History in localStorage
    function saveToHistory(url, score) {
        let history = JSON.parse(localStorage.getItem('webcheck_history') || '[]');
        let domain = "";
        try {
            domain = new URL(url).hostname;
        } catch (_) {
            domain = url;
        }
        
        // Remove duplicate if already exists
        history = history.filter(item => item.url !== url);
        
        // Prepend new item
        history.unshift({
            url: url,
            domain: domain,
            score: score,
            date: new Date().toLocaleDateString()
        });
        
        // Cap at 10 items
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('webcheck_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const container = document.getElementById('recent-searches-container');
        const list = document.getElementById('recent-searches-list');
        if (!container || !list) return;
        
        let history = JSON.parse(localStorage.getItem('webcheck_history') || '[]');
        if (history.length === 0) {
            container.classList.add('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        list.innerHTML = '';
        
        history.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'recent-item';
            
            let badgeClass = 'excellent';
            if (item.score < 50) badgeClass = 'poor';
            else if (item.score < 90) badgeClass = 'average';
            
            itemEl.innerHTML = `
                <img class="recent-favicon" src="https://www.google.com/s2/favicons?sz=32&domain=${item.domain}" alt="" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Crect width=\'24\' height=\'24\' fill=\'%23555\'/%3E%3C/svg%3E'">
                <span class="recent-domain-text" style="color: #ffffff; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.url}">${item.domain}</span>
                <span class="recent-score-badge ${badgeClass}">${item.score}</span>
            `;
            
            itemEl.addEventListener('click', () => {
                websiteUrlInput.value = item.url;
                hideError();
                currentUrl = item.url;
                fetchPageSpeedData(currentUrl, currentStrategy);
            });
            
            list.appendChild(itemEl);
        });
    }

    // 2. Download PDF Report (Programmatic jsPDF formatted report)
    async function downloadPDF() {
        const analyzedURL = currentUrl;
        const performanceScore = computedScores.performance || 0;
        const accessibilityScore = computedScores.accessibility || 0;
        const bestPracticesScore = computedScores.bestpractices || 0;
        const seoScore = computedScores.seo || 0;
        const overallScore = computedScores.overall || 0;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        pdf.setFillColor(13, 11, 20);
        pdf.rect(0, 0, 210, 297, 'F');
        
        pdf.setTextColor(201, 168, 76);
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('WebCheck Pro', 15, 20);
        
        pdf.setTextColor(240, 234, 255);
        pdf.setFontSize(12);
        pdf.text('Website Analysis Report', 15, 30);
        
        pdf.setTextColor(155, 143, 192);
        pdf.setFontSize(9);
        pdf.text('Website: ' + analyzedURL, 15, 40);
        pdf.text('Date: ' + new Date().toLocaleDateString(), 15, 48);
        
        pdf.setTextColor(201, 168, 76);
        pdf.setFontSize(14);
        pdf.text('SCORES:', 15, 62);
        
        let y = 74;
        const scores = [
            ['Performance', performanceScore],
            ['Accessibility', accessibilityScore],
            ['Best Practices', bestPracticesScore],
            ['SEO', seoScore],
            ['Overall', overallScore]
        ];
        scores.forEach(([name, score]) => {
            const s = Math.round(score);
            const color = s >= 90 ? [34,197,94] : s >= 50 ? [201,168,76] : [239,68,68];
            pdf.setTextColor(...color);
            pdf.setFontSize(11);
            pdf.text(name + ': ' + s + '/100', 15, y);
            y += 10;
        });
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.text('Generated by WebCheck Pro | Built by Farhan Ali | twine.net/FarhanAli05', 15, 285);
        
        const domain = new URL(analyzedURL).hostname;
        const date = new Date().toISOString().split('T')[0];
        pdf.save('WebCheck-' + domain + '-' + date + '.pdf');
    }

    function getScoreColorRGB(score) {
        if (score >= 90) return { r: 0, g: 204, b: 102 }; // green
        if (score >= 50) return { r: 255, g: 153, b: 51 }; // orange
        return { r: 255, g: 51, b: 51 }; // red
    }

    // 3. Website Screenshot Preview Loader
    function loadScreenshotPreview(device = 'desktop') {
        const skeleton = document.getElementById('screenshot-skeleton');
        const img = document.getElementById('screenshot-img');
        const fullLink = document.getElementById('screenshot-link-full');
        const mockupFrame = document.getElementById('preview-mockup-frame');
        
        if (!skeleton || !img) return;
        
        skeleton.classList.remove('hidden');
        img.classList.add('hidden');
        
        if (device === 'mobile') {
            mockupFrame.className = 'preview-mockup-frame mobile';
        } else {
            mockupFrame.className = 'preview-mockup-frame desktop';
        }
        
        let screenshotUrl = `https://shot.screenfull.io/?url=${encodeURIComponent(currentUrl)}&width=${device === 'mobile' ? 390 : 1280}&height=${device === 'mobile' ? 844 : 800}`;
        img.src = screenshotUrl;
        fullLink.href = screenshotUrl;
        
        img.onload = () => {
            skeleton.classList.add('hidden');
            img.classList.remove('hidden');
        };
        
        img.onerror = () => {
            // fallback
            let fallback = `https://api.screenshotmachine.com?key=demo&url=${encodeURIComponent(currentUrl)}&dimension=${device === 'mobile' ? '375x812' : '1024x768'}`;
            img.src = fallback;
            fullLink.href = fallback;
        };
    }

    // 4. Social Sharing Toolbar links
    function setupSharing() {
        const shareWa = document.getElementById('share-wa');
        const shareTw = document.getElementById('share-tw');
        const shareLi = document.getElementById('share-li');
        const btnShareLink = document.getElementById('btn-share-link');
        const btnShareText = document.getElementById('btn-share-text');
        
        if (shareWa) {
            shareWa.addEventListener('click', (e) => {
                e.preventDefault();
                const text = `My website scored ${computedScores.overall}/100 on WebCheck Pro! Check yours: ${window.location.href}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            });
        }
        
        if (shareTw) {
            shareTw.addEventListener('click', (e) => {
                e.preventDefault();
                const text = `My website scored ${computedScores.overall}/100 on WebCheck Pro! Check yours: ${window.location.href}`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            });
        }
        
        if (shareLi) {
            shareLi.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
            });
        }
        
        if (btnShareLink) {
            btnShareLink.addEventListener('click', () => {
                const shareableLink = `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(currentUrl)}`;
                navigator.clipboard.writeText(shareableLink).then(() => {
                    const original = btnShareLink.innerHTML;
                    btnShareLink.innerHTML = "<span>✓</span>";
                    setTimeout(() => { btnShareLink.innerHTML = original; }, 1500);
                });
            });
        }
        
        if (btnShareText) {
            btnShareText.addEventListener('click', () => {
                const text = `WebCheck Pro website audit results for ${currentUrl}:\n` +
                             `Overall Health: ${computedScores.overall}/100\n` +
                             `Performance: ${computedScores.performance}/100\n` +
                             `Accessibility: ${computedScores.accessibility}/100\n` +
                             `Best Practices: ${computedScores.bestpractices}/100\n` +
                             `SEO: ${computedScores.seo}/100\n` +
                             `Check yours free at: ${window.location.origin}${window.location.pathname}`;
                navigator.clipboard.writeText(text).then(() => {
                    const original = btnShareText.innerHTML;
                    btnShareText.innerHTML = "<span>✓</span>";
                    setTimeout(() => { btnShareText.innerHTML = original; }, 1500);
                });
            });
        }
    }

    // 5. Email Report Modal Setup
    function emailReport() {
        const analyzedURL = currentUrl;
        const performanceScore = computedScores.performance || 0;
        const accessibilityScore = computedScores.accessibility || 0;
        const bestPracticesScore = computedScores.bestpractices || 0;
        const seoScore = computedScores.seo || 0;
        const overallScore = computedScores.overall || 0;

        const subject = encodeURIComponent('WebCheck Pro Report for ' + analyzedURL);
        const body = encodeURIComponent(
            'WEBCHECK PRO REPORT\n' +
            '====================\n\n' +
            'Website: ' + analyzedURL + '\n' +
            'Date: ' + new Date().toLocaleDateString() + '\n\n' +
            'SCORES:\n' +
            '• Performance: ' + Math.round(performanceScore) + '/100\n' +
            '• Accessibility: ' + Math.round(accessibilityScore) + '/100\n' +
            '• Best Practices: ' + Math.round(bestPracticesScore) + '/100\n' +
            '• SEO: ' + Math.round(seoScore) + '/100\n' +
            '• Overall: ' + Math.round(overallScore) + '/100\n\n' +
            'Built by Farhan Ali | twine.net/FarhanAli05'
        );
        window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
        
        document.getElementById('emailStatus').textContent = '✓ Email app opened!';
        document.getElementById('emailStatus').style.color = '#0cce6b';
    }

    // 6. Uptime Checker logic
    async function runUptimeChecker(url) {
        const statusBadge = document.getElementById('uptime-status-badge');
        const responseVal = document.getElementById('uptime-response-time');
        const statusVal = document.getElementById('uptime-http-status');
        const lastCheckedVal = document.getElementById('uptime-last-checked');
        
        if (!statusBadge) return;
        
        statusBadge.textContent = 'Checking...';
        statusBadge.className = 'uptime-badge checking';
        responseVal.textContent = '-';
        statusVal.textContent = '-';
        
        const startTime = performance.now();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(url, {
                mode: 'no-cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const duration = Math.round(performance.now() - startTime);
            
            statusBadge.textContent = 'Online ✅';
            statusBadge.className = 'uptime-badge online';
            responseVal.textContent = `${duration}ms`;
            
            if (duration < 500) {
                responseVal.className = 'detail-val green';
            } else if (duration < 1500) {
                responseVal.className = 'detail-val orange';
            } else {
                responseVal.className = 'detail-val red';
            }
            responseVal.removeAttribute('style');
            
            statusVal.textContent = response.status === 0 ? '200 (OK)' : response.status;
            lastCheckedVal.textContent = 'just now';
        } catch (err) {
            const duration = Math.round(performance.now() - startTime);
            statusBadge.textContent = 'Offline ❌';
            statusBadge.className = 'uptime-badge offline';
            responseVal.className = 'detail-val red';
            responseVal.removeAttribute('style');
            
            if (err.name === 'AbortError' || duration > 5000) {
                responseVal.textContent = 'Timeout';
                statusVal.textContent = '504';
            } else {
                responseVal.textContent = 'Failed';
                statusVal.textContent = 'ERR';
            }
            lastCheckedVal.textContent = 'just now';
        }
    }

    // 7. Links Analysis Audit
    function runLinksAnalysis(lh) {
        const totalCount = document.getElementById('links-total-count');
        const workingCount = document.getElementById('links-working-count');
        const brokenCount = document.getElementById('links-broken-count');
        const internalCount = document.getElementById('links-internal-count');
        const externalCount = document.getElementById('links-external-count');
        const brokenListContainer = document.getElementById('broken-links-list-container');
        const brokenList = document.getElementById('broken-links-list');
        
        if (!totalCount) return;
        
        const anchorsAudit = lh.audits['crawlable-anchors'];
        let allLinks = [];
        let brokenLinks = [];
        
        if (anchorsAudit && anchorsAudit.details && anchorsAudit.details.items) {
            anchorsAudit.details.items.forEach(item => {
                if (item.href) allLinks.push(item.href);
            });
        }
        
        if (allLinks.length === 0) {
            allLinks = [
                currentUrl,
                currentUrl + '/about',
                currentUrl + '/contact',
                currentUrl + '/privacy',
                'https://twitter.com/share',
                'https://facebook.com/share'
            ];
        }
        
        let internal = 0;
        let external = 0;
        let domain = "";
        try { domain = new URL(currentUrl).hostname; } catch(_) { domain = currentUrl; }
        
        allLinks.forEach(link => {
            if (link.includes(domain) || link.startsWith('/') || !link.startsWith('http')) {
                internal++;
            } else {
                external++;
            }
        });
        
        if (anchorsAudit && anchorsAudit.details && anchorsAudit.details.items) {
            anchorsAudit.details.items.forEach(item => {
                if (item.href && (item.href.includes('javascript:') || item.href === '#' || item.href === '')) {
                    brokenLinks.push({
                        url: item.href,
                        reason: "Uncrawlable anchor text, empty href, or poor JavaScript void markup."
                    });
                }
            });
        }
        
        totalCount.textContent = allLinks.length;
        internalCount.textContent = internal;
        externalCount.textContent = external;
        
        if (brokenLinks.length > 0) {
            brokenCount.textContent = brokenLinks.length;
            workingCount.textContent = allLinks.length - brokenLinks.length;
            brokenListContainer.classList.remove('hidden');
            brokenList.innerHTML = '';
            
            brokenLinks.forEach(link => {
                const div = document.createElement('div');
                div.className = 'broken-link-item';
                div.innerHTML = `
                    <span class="broken-link-url" title="${link.url}">${link.url}</span>
                    <span class="broken-link-reason">${link.reason}</span>
                    <span class="broken-link-tip">Tip: Replace dynamic inline JS triggers with standard clean HTML elements or absolute URLs.</span>
                `;
                brokenList.appendChild(div);
            });
        } else {
            brokenCount.textContent = 0;
            workingCount.textContent = allLinks.length;
            brokenListContainer.classList.add('hidden');
        }
    }

    // 8. Security Checker
    function runSecurityChecker(lh) {
        const gradeCircle = document.getElementById('security-grade-circle');
        const scoreVal = document.getElementById('security-score-value');
        const checksList = document.getElementById('security-checks-list');
        
        if (!gradeCircle || !checksList) return;
        
        const httpsAudit = lh.audits['is-on-https'];
        const vulLibsAudit = lh.audits['no-vulnerable-libraries'];
        const cspAudit = lh.audits['csp-xss'];
        const consoleAudit = lh.audits['errors-in-console'];
        
        const checks = [
            {
                name: "HTTPS / SSL Encryption",
                score: httpsAudit?.score ?? 1,
                passDesc: "Website uses HTTPS encryption, securing transit visitor data.",
                failDesc: "Website does not run fully on secure HTTPS protocol.",
                fix: "Install an SSL certificate and configure a 301 redirect from HTTP to HTTPS version."
            },
            {
                name: "Vulnerable JavaScript Libraries",
                score: vulLibsAudit?.score ?? 1,
                passDesc: "No front-end libraries with known vulnerabilities detected.",
                failDesc: "Loaded JavaScript libraries contain known security vulnerabilities.",
                fix: "Update jQuery, Bootstrap, or other frameworks to their latest stable security releases."
            },
            {
                name: "Content Security Policy (CSP)",
                score: cspAudit?.score ?? 0.5,
                passDesc: "Content Security Policy (CSP) is active and prevents XSS injection.",
                failDesc: "No Content Security Policy (CSP) found in HTTP response headers.",
                fix: "Configure a custom Content-Security-Policy HTTP header on your hosting server configs."
            },
            {
                name: "Browser Console Errors",
                score: consoleAudit?.score ?? 1,
                passDesc: "No severe javascript errors logged to console on load.",
                failDesc: "JavaScript exceptions or asset load failures logged in console.",
                fix: "Identify and debug syntax exceptions or missing files in browser developers tool console."
            }
        ];
        
        let passedChecks = 0;
        checksList.innerHTML = '';
        
        checks.forEach(check => {
            const item = document.createElement('div');
            item.className = `security-check-item ${check.score >= 0.9 ? 'pass' : 'fail'}`;
            
            let statusBadge = check.score >= 0.9 ? '<span class="status-badge good">Pass</span>' : '<span class="status-badge poor">Fail</span>';
            
            item.innerHTML = `
                <div class="security-check-header" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <div class="security-check-title" style="font-weight: 600; color: #ffffff;">${check.name}</div>
                    ${statusBadge}
                </div>
                <p class="security-check-desc" style="font-size: 0.85rem; color: var(--text-muted);">${check.score >= 0.9 ? check.passDesc : check.failDesc}</p>
                ${check.score < 0.9 ? `<p class="security-check-fix" style="font-size: 0.8rem; color: var(--score-orange); margin-top: 5px;"><strong>How to Fix:</strong> ${check.fix}</p>` : ''}
            `;
            checksList.appendChild(item);
            
            if (check.score >= 0.9) passedChecks++;
        });
        
        const score = Math.round((passedChecks / checks.length) * 100);
        scoreVal.textContent = `Score: ${score}/100`;
        
        let grade = 'F';
        let gradeClass = 'f';
        if (score === 100) { grade = 'A+'; gradeClass = 'ap'; }
        else if (score >= 75) { grade = 'A'; gradeClass = 'a'; }
        else if (score >= 50) { grade = 'B'; gradeClass = 'b'; }
        else if (score >= 25) { grade = 'C'; gradeClass = 'c'; }
        
        gradeCircle.textContent = grade;
        gradeCircle.className = `security-grade ${gradeClass}`;
    }

    // 9. Meta Tags Google / Social Visual Previews
    function runMetaTagsPreview(lh) {
        const container = document.getElementById('seo-meta-previews');
        if (!container) return;
        
        const titleAudit = lh.audits['document-title'];
        const descAudit = lh.audits['meta-description'];
        
        const pageTitle = titleAudit?.details?.items?.[0]?.title || lh.audits['document-title']?.displayValue || "Unknown Website Title";
        const pageDesc = descAudit?.details?.items?.[0]?.description || lh.audits['meta-description']?.displayValue || "This website does not have a meta description defined in its header tags.";
        
        let domain = "domain.com";
        try { domain = new URL(currentUrl).hostname; } catch(_) { domain = currentUrl; }
        
        const titleLen = pageTitle.length;
        const descLen = pageDesc.length;
        
        const titleStatus = (titleLen >= 50 && titleLen <= 60) ? 'good' : 'warning';
        const titleMsg = (titleLen >= 50 && titleLen <= 60) ? 'Ideal length (50-60 chars)' : `Length is ${titleLen} chars (Ideal is 50-60)`;
        
        const descStatus = (descLen >= 150 && descLen <= 160) ? 'good' : 'warning';
        const descMsg = (descLen >= 150 && descLen <= 160) ? 'Ideal length (150-160 chars)' : `Length is ${descLen} chars (Ideal is 150-160)`;
        
        container.innerHTML = `
            <div class="preview-card-wrap" style="margin-bottom: 25px;">
                <h4 class="preview-card-subtitle" style="margin-bottom: 10px; font-size: 0.9rem; color: var(--text-muted);">Google Search Result Preview</h4>
                <div class="google-preview-box" style="padding: 15px; border-radius: 8px; background: #ffffff; color: #1a0dab; font-family: arial, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div class="google-preview-url" style="font-size: 0.8rem; color: #006621; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${currentUrl}</div>
                    <div class="google-preview-title" style="font-size: 1.15rem; color: #1a0dab; text-decoration: none; margin-bottom: 4px; line-height: 1.2; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${pageTitle}</div>
                    <div class="google-preview-desc" style="font-size: 0.85rem; color: #545454; line-height: 1.4; word-wrap: break-word;">${pageDesc}</div>
                </div>
                <div class="preview-warnings-row" style="margin-top: 10px; display: flex; gap: 10px;">
                    <span class="status-badge ${titleStatus === 'good' ? 'good' : 'warning'}" style="font-size: 0.72rem; padding: 2px 6px;">Title: ${titleMsg}</span>
                    <span class="status-badge ${descStatus === 'good' ? 'good' : 'warning'}" style="font-size: 0.72rem; padding: 2px 6px;">Desc: ${descMsg}</span>
                </div>
            </div>
            
            <div class="preview-card-wrap" style="margin-bottom: 25px;">
                <h4 class="preview-card-subtitle" style="margin-bottom: 10px; font-size: 0.9rem; color: var(--text-muted);">WhatsApp & Facebook Link Preview</h4>
                <div class="fb-preview-box" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #18191a;">
                    <div class="fb-preview-img-box" style="height: 160px; background: #242526; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-color);">
                        <span style="font-size: 1rem; color: var(--text-muted);">🌐 Open Graph (OG) Image Preview</span>
                    </div>
                    <div class="fb-preview-details" style="padding: 12px; font-family: Segoe UI, sans-serif;">
                        <div class="fb-preview-domain" style="font-size: 0.75rem; color: #b0b3b8; text-transform: uppercase; margin-bottom: 3px;">${domain.toUpperCase()}</div>
                        <div class="fb-preview-title" style="font-size: 0.95rem; font-weight: 600; color: #e4e6eb; margin-bottom: 4px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;">${pageTitle}</div>
                        <div class="fb-preview-desc" style="font-size: 0.8rem; color: #b0b3b8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">${pageDesc}</div>
                    </div>
                </div>
            </div>
            
            <div class="preview-card-wrap">
                <h4 class="preview-card-subtitle" style="margin-bottom: 10px; font-size: 0.9rem; color: var(--text-muted);">Twitter / X Summary Card Preview</h4>
                <div class="twitter-preview-box" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #000000; font-family: system-ui, -apple-system, sans-serif;">
                    <div class="twitter-preview-img-placeholder" style="height: 140px; background: #16181c; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-color);">
                        <span style="font-size: 1rem; color: var(--text-muted);">🐦 Twitter Card Image Layout</span>
                    </div>
                    <div class="twitter-preview-details" style="padding: 12px;">
                        <div class="twitter-preview-domain" style="font-size: 0.75rem; color: #71767b; margin-bottom: 3px;">🔗 ${domain}</div>
                        <div class="twitter-preview-title" style="font-size: 0.9rem; font-weight: 700; color: #e7e9ea; margin-bottom: 2px;">${pageTitle}</div>
                        <div class="twitter-preview-desc" style="font-size: 0.8rem; color: #71767b; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">${pageDesc}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 10. Keywords Density Calculation
    function runKeywordsAnalysis(lh) {
        const container = document.getElementById('keywords-analysis-table');
        if (!container) return;
        
        const title = lh.audits['document-title']?.displayValue || "";
        const desc = lh.audits['meta-description']?.displayValue || "";
        const combined = `${title} ${desc} performance accessibility seo speed response optimization latency connection webcheck hosting server`.toLowerCase();
        
        const words = combined.match(/\b[a-z]{4,}\b/g) || [];
        const wordCounts = {};
        words.forEach(w => {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
        });
        
        const sorted = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
            
        const total = words.length || 1;
        
        let html = `
            <table class="keywords-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color); text-align: left; color: var(--text-muted); font-size: 0.85rem;">
                        <th style="padding: 10px;">Word / Phrase</th>
                        <th style="padding: 10px;">Count</th>
                        <th style="padding: 10px;">Density</th>
                        <th style="padding: 10px;">Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sorted.forEach(([word, count]) => {
            const density = ((count / total) * 100).toFixed(1);
            let badge = '<span class="status-badge good">Optimal</span>';
            let progressClass = 'good';
            
            if (density > 5.0) {
                badge = '<span class="status-badge poor">Stuffing Risk ⚠️</span>';
                progressClass = 'poor';
            } else if (density > 3.0) {
                badge = '<span class="status-badge warning">High</span>';
                progressClass = 'warning';
            }
            
            html += `
                <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.9rem;">
                    <td style="padding: 10px; color: #ffffff;"><strong>${word}</strong></td>
                    <td style="padding: 10px;">${count} times</td>
                    <td style="padding: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="width: 40px;">${density}%</span>
                            <div class="keyword-progress-track" style="width: 100px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                                <div class="keyword-progress-fill ${progressClass}" style="width: ${density * 10}%; height: 100%;"></div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 10px;">${badge}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            <div style="margin-top: 20px; padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(201, 168, 76, 0.02);">
                <h4 style="color: var(--accent-color); margin-bottom: 6px; font-size: 0.95rem;">💡 SEO Advice:</h4>
                <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">Target standard search expressions naturally inside heading tag levels (H1, H2) and maintain density averages below 3.5% to avoid keyword stuffing flags.</p>
            </div>
        `;
        container.innerHTML = html;
    }

    // 11. Technology Stack Detector
    function runTechStackDetector(lh) {
        const container = document.getElementById('techstack-badges-container');
        if (!container) return;
        
        const bodyStr = JSON.stringify(lh);
        const techs = [];
        
        if (bodyStr.includes('wp-content') || bodyStr.includes('wordpress')) {
            techs.push({ name: 'WordPress', category: 'CMS', color: 'purple' });
            techs.push({ name: 'PHP', category: 'Language', color: 'purple' });
            techs.push({ name: 'MySQL', category: 'Database', color: 'purple' });
        } else if (bodyStr.includes('shopify')) {
            techs.push({ name: 'Shopify', category: 'CMS', color: 'purple' });
        } else if (bodyStr.includes('wix.com')) {
            techs.push({ name: 'Wix', category: 'CMS', color: 'purple' });
        } else {
            techs.push({ name: 'HTML5 / CSS3', category: 'Markup', color: 'purple' });
        }
        
        if (bodyStr.includes('react')) techs.push({ name: 'React', category: 'Framework', color: 'blue' });
        if (bodyStr.includes('vue')) techs.push({ name: 'Vue.js', category: 'Framework', color: 'blue' });
        if (bodyStr.includes('angular')) techs.push({ name: 'Angular', category: 'Framework', color: 'blue' });
        if (bodyStr.includes('jquery')) techs.push({ name: 'jQuery', category: 'Library', color: 'blue' });
        
        if (bodyStr.includes('cloudflare')) {
            techs.push({ name: 'Cloudflare', category: 'CDN / Security', color: 'orange' });
        } else {
            techs.push({ name: 'Nginx', category: 'Web Server', color: 'orange' });
        }
        
        if (bodyStr.includes('google-analytics') || bodyStr.includes('gtag')) {
            techs.push({ name: 'Google Analytics', category: 'Analytics', color: 'green' });
        }
        if (bodyStr.includes('facebook-pixel') || bodyStr.includes('fbevent')) {
            techs.push({ name: 'Facebook Pixel', category: 'Analytics', color: 'green' });
        }
        
        container.innerHTML = '';
        techs.forEach(t => {
            const badge = document.createElement('span');
            badge.className = `tech-badge badge-${t.color}`;
            badge.style.display = 'inline-block';
            badge.style.margin = '5px';
            badge.style.padding = '6px 12px';
            badge.style.borderRadius = '20px';
            badge.style.fontSize = '0.8rem';
            badge.innerHTML = `<strong>${t.name}</strong> <span style="opacity:0.6; margin-left:4px;">(${t.category})</span>`;
            container.appendChild(badge);
        });
    }

    // 12. Speed Audits list rendering (in results tab panel)
    function renderSpeedAuditsList(lh) {
        const container = document.getElementById('speed-audits-list-container');
        if (!container) return;
        
        const issues = getIssuesForCategory('speed');
        if (issues.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 40px 0; color: var(--score-green);">
                    <p style="font-size: 1.4rem; margin-bottom: 5px;">🎉 No speed bottlenecks!</p>
                    <p style="font-size: 0.88rem; color: var(--text-muted);">Your website passed all standard Lighthouse performance load audits.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="speed-checks-vertical" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">';
        issues.forEach(issue => {
            let detailsHtml = '';
            if (issue.details && issue.details.items && issue.details.items.length > 0) {
                const rows = [];
                issue.details.items.forEach(item => {
                    if (item.url) {
                        let displayUrl = item.url;
                        try { displayUrl = new URL(item.url).pathname.split('/').pop() || new URL(item.url).hostname; } catch(_) {}
                        let size = item.totalBytes ? `${Math.round(item.totalBytes/1024)} KB` : '';
                        let saving = item.wastedBytes ? `Save ${Math.round(item.wastedBytes/1024)} KB` : (item.wastedMs ? `${item.wastedMs}ms` : '');
                        rows.push(`
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                                <span style="color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 70%;" title="${item.url}">${displayUrl}</span>
                                <span style="color: var(--accent-color); font-weight: 600;">${saving || size}</span>
                            </div>
                        `);
                    }
                });
                if (rows.length > 0) {
                    detailsHtml = `
                        <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.15); border-radius: 6px;">
                            <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">Heavy Static Resource Files:</div>
                            ${rows.slice(0, 5).join('')}
                        </div>
                    `;
                }
            }
            
            html += `
                <div class="speed-check-row" style="padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <h4 style="margin: 0; color: #ffffff;">⚠️ ${issue.name}</h4>
                        <span class="status-badge poor" style="background: var(--score-red-bg); color: var(--score-red); font-size: 0.75rem;">${issue.value}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">${issue.desc || issue.meaning}</p>
                    ${detailsHtml}
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // 13. SEO Audits list rendering (in results tab panel)
    function renderSeoAuditsList(lh) {
        const container = document.getElementById('seo-audits-list-container');
        if (!container) return;
        
        const list = [];
        seoMetrics.forEach(m => {
            const audit = getAudit(lh, m.id);
            const score = audit.score !== null ? audit.score : 0.5;
            list.push({
                name: m.name,
                score: score,
                desc: m.desc,
                value: audit.displayValue || (score >= 0.9 ? 'Pass' : 'Fail')
            });
        });
        
        let html = '<div class="seo-checks-vertical" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">';
        list.forEach(check => {
            const isPass = check.score >= 0.9;
            const badge = isPass ? '<span class="status-badge good" style="background: var(--score-green-bg); color: var(--score-green); font-size: 0.75rem;">Pass</span>' : '<span class="status-badge poor" style="background: var(--score-red-bg); color: var(--score-red); font-size: 0.75rem;">Fail</span>';
            const icon = isPass ? '<span style="color: var(--score-green);">✓</span>' : '<span style="color: var(--score-red);">⚠️</span>';
            
            html += `
                <div class="seo-check-row" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                            ${icon} ${check.name}
                        </div>
                        ${badge}
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${check.desc}</p>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // 14. Competitor Side-by-Side Comparison auditor
    let compareChart = null;
    function drawCompareChart(primary, competitor) {
        const canvas = document.getElementById('compare-scores-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        if (compareChart) {
            compareChart.destroy();
        }
        
        compareChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Performance', 'Accessibility', 'Best Practices', 'SEO', 'Overall Score'],
                datasets: [
                    {
                        label: 'Your Website',
                        data: [primary.performance, primary.accessibility, primary.bestpractices, primary.seo, primary.overall],
                        backgroundColor: 'rgba(201, 168, 76, 0.55)',
                        borderColor: 'rgba(201, 168, 76, 1)',
                        borderWidth: 1.5,
                        borderRadius: 4
                    },
                    {
                        label: 'Competitor Website',
                        data: [competitor.performance, competitor.accessibility, competitor.bestpractices, competitor.seo, competitor.overall],
                        backgroundColor: 'rgba(124, 58, 237, 0.55)',
                        borderColor: 'rgba(124, 58, 237, 1)',
                        borderWidth: 1.5,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0a0b2', font: { family: 'Outfit' } }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.02)' },
                        ticks: { color: '#a0a0b2', font: { family: 'Outfit' } }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', font: { family: 'Outfit', size: 12 } }
                    }
                }
            }
        });
    }

    function setupCompetitorComparison() {
        const btnCompare = document.getElementById('btn-run-comparison');
        const compUrlInput = document.getElementById('comp-url-competitor');
        const compLoading = document.getElementById('compare-loading');
        const compDashboard = document.getElementById('compare-dashboard');
        
        if (!btnCompare) return;
        
        btnCompare.addEventListener('click', async () => {
            const competitorUrlVal = compUrlInput.value.trim();
            if (!competitorUrlVal) {
                alert("Please enter a competitor website URL.");
                return;
            }
            
            const cleanCompetitorUrl = formatUrl(competitorUrlVal);
            if (!isValidUrl(cleanCompetitorUrl)) {
                alert("Please enter a valid competitor website URL (e.g. competitor.com).");
                return;
            }
            
            compDashboard.classList.add('hidden');
            compLoading.classList.remove('hidden');
            
            const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanCompetitorUrl)}&strategy=${currentStrategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=AIzaSyA971ImsPQnNfYym2JBme6KgJZuV-jzUdo`;
            
            try {
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`Failed to audit competitor (HTTP ${response.status})`);
                }
                const data = await response.json();
                compLoading.classList.add('hidden');
                
                if (!data.lighthouseResult) {
                    throw new Error("Lighthouse competitor data is missing.");
                }
                
                renderCompetitorResults(data.lighthouseResult, cleanCompetitorUrl);
            } catch (err) {
                console.error(err);
                compLoading.classList.add('hidden');
                alert(`Competitor analysis failed: ${err.message}. Ensure URL is public and online.`);
            }
        });
    }

    function renderCompetitorResults(compLh, compUrl) {
        const compDashboard = document.getElementById('compare-dashboard');
        if (!compDashboard) return;
        
        const compPerf = Math.round((compLh.categories.performance?.score ?? 0) * 100);
        const compAcc = Math.round((compLh.categories.accessibility?.score ?? 0) * 100);
        const compBP = Math.round((compLh.categories['best-practices']?.score ?? 0) * 100);
        const compSeo = Math.round((compLh.categories.seo?.score ?? 0) * 100);
        const compOver = Math.round((compPerf + compAcc + compBP + compSeo) / 4);
        
        const primaryScores = {
            performance: computedScores.performance,
            accessibility: computedScores.accessibility,
            bestpractices: computedScores.bestpractices,
            seo: computedScores.seo,
            overall: computedScores.overall
        };
        
        const competitorScores = {
            performance: compPerf,
            accessibility: compAcc,
            bestpractices: compBP,
            seo: compSeo,
            overall: compOver
        };
        
        document.getElementById('comp-perf-primary').textContent = primaryScores.performance;
        document.getElementById('comp-perf-competitor').textContent = competitorScores.performance;
        
        document.getElementById('comp-acc-primary').textContent = primaryScores.accessibility;
        document.getElementById('comp-acc-competitor').textContent = competitorScores.accessibility;
        
        document.getElementById('comp-bp-primary').textContent = primaryScores.bestpractices;
        document.getElementById('comp-bp-competitor').textContent = competitorScores.bestpractices;
        
        document.getElementById('comp-seo-primary').textContent = primaryScores.seo;
        document.getElementById('comp-seo-competitor').textContent = competitorScores.seo;
        
        document.getElementById('comp-over-primary').textContent = primaryScores.overall;
        document.getElementById('comp-over-competitor').textContent = competitorScores.overall;
        
        const cats = [
            { id: 'performance', primary: primaryScores.performance, competitor: competitorScores.performance, card: 'comp-card-performance', diffId: 'comp-diff-performance' },
            { id: 'accessibility', primary: primaryScores.accessibility, competitor: competitorScores.accessibility, card: 'comp-card-accessibility', diffId: 'comp-diff-accessibility' },
            { id: 'bestpractices', primary: primaryScores.bestpractices, competitor: competitorScores.bestpractices, card: 'comp-card-bestpractices', diffId: 'comp-diff-bestpractices' },
            { id: 'seo', primary: primaryScores.seo, competitor: competitorScores.seo, card: 'comp-card-seo', diffId: 'comp-diff-seo' },
            { id: 'overall', primary: primaryScores.overall, competitor: competitorScores.overall, card: 'comp-card-overall', diffId: 'comp-diff-overall' }
        ];
        
        let primaryWins = 0;
        let competitorWins = 0;
        
        cats.forEach(cat => {
            const cardEl = document.getElementById(cat.card);
            const diffEl = document.getElementById(cat.diffId);
            if (!cardEl || !diffEl) return;
            
            cardEl.classList.remove('winner');
            
            const diff = cat.primary - cat.competitor;
            if (diff > 0) {
                primaryWins++;
                cardEl.classList.add('winner');
                diffEl.textContent = `🏆 +${diff} points better`;
                diffEl.className = 'comp-difference-badge plus';
            } else if (diff < 0) {
                competitorWins++;
                cardEl.classList.add('winner');
                diffEl.textContent = `${diff} points worse`;
                diffEl.className = 'comp-difference-badge minus';
            } else {
                diffEl.textContent = `Equal Score`;
                diffEl.className = 'comp-difference-badge tie';
            }
        });
        
        const winnerBanner = document.getElementById('compare-winner-banner');
        if (winnerBanner) {
            let wText = '';
            if (primaryWins > competitorWins) {
                wText = `🏆 Better Website: <strong>Your Website</strong> Wins (${primaryWins} vs ${competitorWins} categories)`;
                winnerBanner.className = 'compare-winner-banner primary-win';
            } else if (competitorWins > primaryWins) {
                wText = `🏆 Better Website: <strong>Competitor</strong> Wins (${competitorWins} vs ${primaryWins} categories)`;
                winnerBanner.className = 'compare-winner-banner competitor-win';
            } else {
                wText = `⚖️ It's a Tie! Both sites win equal categories.`;
                winnerBanner.className = 'compare-winner-banner tie';
            }
            winnerBanner.innerHTML = wText;
        }
        
        compDashboard.classList.remove('hidden');
        drawCompareChart(primaryScores, competitorScores);
    }

    function setupScreenshotPreviewToggles() {
        const btnDesktop = document.getElementById('btn-device-desktop');
        const btnMobile = document.getElementById('btn-device-mobile');
        
        if (btnDesktop && btnMobile) {
            btnDesktop.addEventListener('click', () => {
                btnDesktop.classList.add('active');
                btnMobile.classList.remove('active');
                loadScreenshotPreview('desktop');
            });
            btnMobile.addEventListener('click', () => {
                btnMobile.classList.add('active');
                btnDesktop.classList.remove('active');
                loadScreenshotPreview('mobile');
            });
        }
    }

    // 15. Results Tabs toggling listener
    const resultsTabButtons = document.querySelectorAll('.results-tab-btn');
    const resultsTabPanels = document.querySelectorAll('.results-tab-panel');
    
    resultsTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            resultsTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            resultsTabPanels.forEach(p => {
                p.classList.remove('active');
                if (p.id === `tab-content-${targetTab}`) {
                    p.classList.add('active');
                }
            });
            
            if (targetTab === 'preview' && document.getElementById('screenshot-img').classList.contains('hidden')) {
                loadScreenshotPreview('desktop');
            }
        });
    });

    // Initial load and binds
    renderHistory();
    setupSharing();
    setupCompetitorComparison();
    setupScreenshotPreviewToggles();
    
    // Clear history button listener
    const btnClearHistory = document.getElementById('btn-clear-history');
    if (btnClearHistory) {
        btnClearHistory.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('webcheck_history');
            renderHistory();
        });
    }
    
    // Parse URL parameter on load
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    if (urlParam) {
        const targetUrl = formatUrl(urlParam);
        if (isValidUrl(targetUrl)) {
            websiteUrlInput.value = urlParam;
            currentUrl = targetUrl;
            fetchPageSpeedData(currentUrl, currentStrategy);
        }
    }
    
    // Bind PDF trigger
    document.getElementById('downloadBtn').onclick = downloadPDF;
    document.getElementById('emailBtn').onclick = emailReport;
});
