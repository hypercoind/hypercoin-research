class InvestmentCalculator {
    constructor() {
        this.initializeEventListeners();
        this.chart = null;
        // Initialize input validation
        this.initializeInputValidation();
        // Validate allocations on page load
        setTimeout(() => this.validateAllocations(), 100);
    }

    initializeEventListeners() {
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculateAndDisplay());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefaults());
        
        const allocationInputs = ['btc-allocation', 'voo-allocation', 'treasury-allocation', 'strc-allocation', 'hysa-allocation'];
        allocationInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.validateAllocations());
        });
    }

    validateAllocations() {
        const btc = this.validateAndClampInput('btc-allocation', 0, 100, 20);
        const voo = this.validateAndClampInput('voo-allocation', 0, 100, 20);
        const treasury = this.validateAndClampInput('treasury-allocation', 0, 100, 20);
        const strc = this.validateAndClampInput('strc-allocation', 0, 100, 20);
        const hysa = this.validateAndClampInput('hysa-allocation', 0, 100, 20);
        
        const total = btc + voo + treasury + strc + hysa;
        const calculateBtn = document.getElementById('calculate-btn');
        
        if (Math.abs(total - 100) > 0.1) {
            calculateBtn.style.backgroundColor = '#db662d';
            calculateBtn.textContent = `Calculate (${total.toFixed(1)}% total - must equal 100%)`;
            calculateBtn.disabled = true;
        } else {
            calculateBtn.style.backgroundColor = '';  // Reset to CSS default
            calculateBtn.textContent = 'Calculate & Compare';
            calculateBtn.disabled = false;
        }
    }

    // Comprehensive input validation system
    initializeInputValidation() {
        const inputValidationRules = {
            'property-price': { min: 50000, max: 50000000, default: 435000, type: 'currency' },
            'down-payment': { min: 1000, max: 10000000, default: 87000, type: 'currency' },
            'interest-rate': { min: 0.1, max: 30, default: 6.7, type: 'percentage' },
            'rental-yield': { min: 0, max: 20, default: 0, type: 'percentage' },
            'property-appreciation': { min: -10, max: 20, default: 4, type: 'percentage' },
            'maintenance-costs': { min: 0, max: 10, default: 2, type: 'percentage' },
            'hoa-fee': { min: 0, max: 5000, default: 0, type: 'currency' },
            'initial-investment': { min: 1000, max: 10000000, default: 87000, type: 'currency' },
            'btc-allocation': { min: 0, max: 100, default: 20, type: 'percentage' },
            'voo-allocation': { min: 0, max: 100, default: 20, type: 'percentage' },
            'treasury-allocation': { min: 0, max: 100, default: 20, type: 'percentage' },
            'strc-allocation': { min: 0, max: 100, default: 20, type: 'percentage' },
            'hysa-allocation': { min: 0, max: 100, default: 20, type: 'percentage' },
            'current-rent': { min: 100, max: 20000, default: 2075, type: 'currency' },
            'rent-inflation': { min: 0, max: 15, default: 3.5, type: 'percentage' },
            'time-horizon': { min: 1, max: 50, default: 10, type: 'integer' }
        };

        // Add validation to all inputs
        Object.keys(inputValidationRules).forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                this.addInputValidation(element, inputValidationRules[inputId]);
            }
        });
    }

    addInputValidation(element, rules) {
        // Prevent non-numeric input
        element.addEventListener('keydown', (e) => {
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            const isNumberKey = (e.key >= '0' && e.key <= '9');
            const isDecimalKey = e.key === '.' && !element.value.includes('.');
            const isMinusKey = e.key === '-' && element.selectionStart === 0 && !element.value.includes('-');
            
            if (!allowedKeys.includes(e.key) && !isNumberKey && !isDecimalKey && !isMinusKey && !e.ctrlKey) {
                e.preventDefault();
            }
        });

        // Validate on input
        element.addEventListener('input', () => {
            this.validateInput(element, rules);
        });

        // Validate on blur (when user leaves the field)
        element.addEventListener('blur', () => {
            this.validateAndClampInput(element.id, rules.min, rules.max, rules.default);
        });
    }

    validateInput(element, rules) {
        const value = parseFloat(element.value);
        const isValid = !isNaN(value) && value >= rules.min && value <= rules.max;
        
        // Visual feedback
        if (element.value && !isValid) {
            element.style.borderColor = '#e74c3c';
            element.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        } else {
            element.style.borderColor = '';
            element.style.backgroundColor = '';
        }
        
        return isValid;
    }

    validateAndClampInput(inputId, min, max, defaultValue) {
        const element = document.getElementById(inputId);
        if (!element) return defaultValue;
        
        let value = parseFloat(element.value);
        
        // Handle invalid input
        if (isNaN(value) || value === null || value === undefined) {
            value = defaultValue;
            element.value = defaultValue;
        }
        
        // Clamp to valid range
        if (value < min) {
            value = min;
            element.value = min;
            this.showValidationMessage(element, `Minimum value is ${min}`);
        } else if (value > max) {
            value = max;
            element.value = max;
            this.showValidationMessage(element, `Maximum value is ${max}`);
        }
        
        // Reset visual feedback for valid inputs
        element.style.borderColor = '';
        element.style.backgroundColor = '';
        
        return value;
    }

    showValidationMessage(element, message) {
        // Create or update validation message
        let messageElement = element.parentNode.querySelector('.validation-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'validation-message';
            messageElement.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 4px; display: none;';
            element.parentNode.appendChild(messageElement);
        }
        
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    // Enhanced calculation methods with validation
    calculateRealEstateInvestment() {
        // Validate all inputs before calculation
        const propertyPrice = this.validateAndClampInput('property-price', 50000, 50000000, 435000);
        const downPayment = this.validateAndClampInput('down-payment', 1000, 10000000, 87000);
        const interestRate = this.validateAndClampInput('interest-rate', 0.1, 30, 6.7) / 100;
        const rentalYield = this.validateAndClampInput('rental-yield', 0, 20, 0) / 100;
        const appreciation = this.validateAndClampInput('property-appreciation', -10, 20, 4) / 100;
        const maintenanceCosts = this.validateAndClampInput('maintenance-costs', 0, 10, 2) / 100;
        const monthlyHOAFee = this.validateAndClampInput('hoa-fee', 0, 5000, 0);
        const timeHorizon = this.validateAndClampInput('time-horizon', 1, 50, 10);

        // Additional validation
        if (downPayment > propertyPrice) {
            document.getElementById('down-payment').value = propertyPrice * 0.2; // Set to 20%
            this.showValidationMessage(document.getElementById('down-payment'), 'Down payment cannot exceed property price');
            return this.calculateRealEstateInvestment(); // Recalculate with corrected values
        }

        const downPaymentPercent = (downPayment / propertyPrice) * 100;
        const loanAmount = propertyPrice - downPayment;
        const monthlyRate = interestRate / 12;
        const numPayments = 30 * 12; // Fixed 30-year mortgage term (360 payments)
        
        // Principal and Interest payment (standard mortgage formula)
        const principalAndInterest = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                    (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        // Additional monthly costs typically included in mortgage payments
        const annualPropertyTax = propertyPrice * 0.009; // 0.9% US national average effective property tax rate
        const monthlyPropertyTax = annualPropertyTax / 12;
        
        const annualHomeInsurance = propertyPrice * 0.0035; // ~0.35% average for home insurance
        const monthlyHomeInsurance = annualHomeInsurance / 12;
        
        // PMI if down payment is less than 20%
        const monthlyPMI = (downPaymentPercent < 20) ? (loanAmount * 0.005 / 12) : 0; // 0.5% annually if PMI required
        
        // Total monthly payment (PITI + PMI + HOA)
        const monthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyPMI + monthlyHOAFee;
        
        const totalMortgagePayments = principalAndInterest * numPayments;
        const totalInterest = totalMortgagePayments - loanAmount;
        const totalTaxesAndInsurance = (monthlyPropertyTax + monthlyHomeInsurance + monthlyPMI) * numPayments;
        const totalHOAFees = monthlyHOAFee * timeHorizon * 12;
        
        const finalPropertyValue = propertyPrice * Math.pow(1 + appreciation, timeHorizon);
        
        const annualRentalIncome = propertyPrice * rentalYield;
        const annualMaintenanceCosts = propertyPrice * maintenanceCosts;
        const netAnnualRentalIncome = annualRentalIncome - annualMaintenanceCosts;
        const totalRentalIncome = netAnnualRentalIncome * timeHorizon;
        
        const totalInvestment = downPayment + totalInterest + totalTaxesAndInsurance + totalHOAFees + (annualMaintenanceCosts * timeHorizon);
        const paymentsAfterTimeHorizon = timeHorizon * 12;
        const remainingLoanBalance = this.calculateRemainingBalance(loanAmount, monthlyRate, numPayments, paymentsAfterTimeHorizon);
        const propertyEquity = finalPropertyValue - remainingLoanBalance;
        const netWorth = propertyEquity + totalRentalIncome;
        
        const totalReturn = netWorth;
        const annualReturn = Math.pow(totalReturn / totalInvestment, 1 / timeHorizon) - 1;

        // Calculate monthly savings for occupant (mortgage vs inflating rent)
        const initialMonthlyRent = parseFloat(document.getElementById('current-rent').value);
        const monthlyRent = initialMonthlyRent; // Keep for reference/display
        const rentInflationRate = parseFloat(document.getElementById('rent-inflation').value) / 100;
        
        // Calculate total rent paid over time with 3% annual inflation
        let totalRentPaid = 0;
        for (let year = 1; year <= timeHorizon; year++) {
            const yearlyRent = initialMonthlyRent * Math.pow(1 + rentInflationRate, year - 1) * 12;
            totalRentPaid += yearlyRent;
        }
        
        // Calculate total mortgage payments over time
        const totalMortgagePaymentsOverTime = monthlyPayment * 12 * timeHorizon;
        
        // Total savings by renting = mortgage payments - rent payments (positive means renting is cheaper)
        const totalSavingsForOccupant = totalMortgagePaymentsOverTime - totalRentPaid;
        const monthlySavings = totalSavingsForOccupant / (12 * timeHorizon); // Average monthly savings by renting (positive means renting saves money)

        // Calculate real estate volatility (San Diego specific)
        const realEstateVolatility = this.calculateRealEstateVolatility(timeHorizon);

        return {
            totalInvestment,
            finalPropertyValue,
            totalRentalIncome,
            netWorth: totalReturn,
            annualReturn,
            monthlyPayment,
            principalAndInterest,
            monthlyPropertyTax,
            monthlyHomeInsurance,
            monthlyPMI,
            monthlyHOAFee,
            totalInterest,
            totalTaxesAndInsurance,
            totalHOAFees,
            monthlySavings,
            totalSavingsForOccupant,
            monthlyRent,
            volatility: realEstateVolatility
        };
    }

    calculateRemainingBalance(principal, monthlyRate, totalPayments, paymentsMade) {
        if (paymentsMade >= totalPayments) return 0;
        
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                              (Math.pow(1 + monthlyRate, totalPayments) - 1);
        
        return principal * Math.pow(1 + monthlyRate, paymentsMade) - 
               monthlyPayment * (Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate;
    }

    calculatePortfolioInvestment() {
        const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
        const timeHorizon = parseInt(document.getElementById('time-horizon').value);
        
        const btcAllocation = parseFloat(document.getElementById('btc-allocation').value) / 100;
        const vooAllocation = parseFloat(document.getElementById('voo-allocation').value) / 100;
        const treasuryAllocation = parseFloat(document.getElementById('treasury-allocation').value) / 100;
        const strcAllocation = parseFloat(document.getElementById('strc-allocation').value) / 100;
        const hysaAllocation = parseFloat(document.getElementById('hysa-allocation').value) / 100;
        
        // Use the user's actual allocation
        const userAllocation = {
            btc: btcAllocation,
            voo: vooAllocation,
            treasury: treasuryAllocation,
            strc: strcAllocation,
            hysa: hysaAllocation
        };
        
        // Calculate actual portfolio volatility based on user's allocation
        const volatilities = this.calculateDynamicVolatility(timeHorizon);
        const correlations = {
            btc_voo: 0.3,
            btc_treasury: -0.1,
            btc_strc: 0.7,     // High correlation since STRC is Bitcoin-focused
            btc_hysa: 0.0,
            voo_treasury: -0.2,
            voo_strc: 0.2,     // Moderate correlation with equity-like returns
            voo_hysa: 0.1,
            treasury_strc: -0.1, // Low negative correlation like other fixed income
            treasury_hysa: 0.0,
            strc_hysa: 0.0     // Low correlation between dividend stock and cash
        };
        
        const actualVolatility = this.calculatePortfolioVolatility(
            btcAllocation, vooAllocation, treasuryAllocation, strcAllocation, hysaAllocation, volatilities, correlations
        );
        
        // Keep optimization for reference but don't use it
        const targetVolatility = 0.10; // 10% target to match SD real estate
        const optimizedAllocation = this.optimizePortfolioForVolatility(
            btcAllocation, vooAllocation, treasuryAllocation, strcAllocation, hysaAllocation, targetVolatility
        );
        
        const expectedReturns = this.calculateDynamicReturns(timeHorizon);
        
        const portfolioReturn = (userAllocation.btc * expectedReturns.btc) + 
                               (userAllocation.voo * expectedReturns.voo) + 
                               (userAllocation.treasury * expectedReturns.treasury) + 
                               (userAllocation.strc * expectedReturns.strc) + 
                               (userAllocation.hysa * expectedReturns.hysa);
        
        const annualReturn = portfolioReturn;
        
        // Calculate final portfolio value with compound growth (no monthly contributions)
        const portfolioValue = initialInvestment * Math.pow(1 + annualReturn, timeHorizon);
        const totalInvestment = initialInvestment;
        
        const netGain = portfolioValue - totalInvestment;
        // Use the expected annual return directly since it's based on our model
        const actualAnnualReturn = annualReturn;

        return {
            totalInvestment,
            finalValue: portfolioValue,
            netGain,
            annualReturn: actualAnnualReturn,
            portfolioReturn,
            userAllocation,
            optimizedAllocation,
            actualVolatility,
            targetVolatility
        };
    }

    optimizePortfolioForVolatility(btcAlloc, vooAlloc, treasuryAlloc, strcAlloc, hysaAlloc, targetVol) {
        // Use dynamic volatilities based on time horizon
        const timeHorizon = parseInt(document.getElementById('time-horizon').value);
        const volatilities = this.calculateDynamicVolatility(timeHorizon);
        
        // Correlation matrix (simplified)
        const correlations = {
            btc_voo: 0.3,
            btc_treasury: -0.1,
            btc_strc: 0.7,
            btc_hysa: 0.0,
            voo_treasury: -0.2,
            voo_strc: 0.2,
            voo_hysa: 0.1,
            treasury_strc: -0.1,
            treasury_hysa: 0.0,
            strc_hysa: 0.0
        };
        
        // Calculate current portfolio volatility
        const currentVol = this.calculatePortfolioVolatility(
            btcAlloc, vooAlloc, treasuryAlloc, strcAlloc, hysaAlloc, volatilities, correlations
        );
        
        if (Math.abs(currentVol - targetVol) < 0.01) {
            return { btc: btcAlloc, voo: vooAlloc, treasury: treasuryAlloc, strc: strcAlloc, hysa: hysaAlloc };
        }
        
        // Simple optimization: adjust BTC allocation to match target volatility
        let adjustedBtc = btcAlloc;
        let step = currentVol > targetVol ? -0.01 : 0.01;
        
        for (let i = 0; i < 100; i++) {
            const testVol = this.calculatePortfolioVolatility(
                adjustedBtc, vooAlloc, treasuryAlloc, strcAlloc, hysaAlloc, volatilities, correlations
            );
            
            if (Math.abs(testVol - targetVol) < 0.005) break;
            
            if ((testVol > targetVol && step > 0) || (testVol < targetVol && step < 0)) {
                step *= -0.5;
            }
            
            adjustedBtc += step;
            adjustedBtc = Math.max(0, Math.min(1, adjustedBtc));
        }
        
        return { 
            btc: adjustedBtc, 
            voo: vooAlloc, 
            treasury: treasuryAlloc, 
            strc: strcAlloc,
            hysa: hysaAlloc 
        };
    }
    
    calculatePortfolioVolatility(btc, voo, treasury, strc, hysa, vols, corrs) {
        const variance = 
            Math.pow(btc * vols.btc, 2) +
            Math.pow(voo * vols.voo, 2) +
            Math.pow(treasury * vols.treasury, 2) +
            Math.pow(strc * vols.strc, 2) +
            Math.pow(hysa * vols.hysa, 2) +
            2 * btc * voo * vols.btc * vols.voo * corrs.btc_voo +
            2 * btc * treasury * vols.btc * vols.treasury * corrs.btc_treasury +
            2 * btc * strc * vols.btc * vols.strc * corrs.btc_strc +
            2 * btc * hysa * vols.btc * vols.hysa * corrs.btc_hysa +
            2 * voo * treasury * vols.voo * vols.treasury * corrs.voo_treasury +
            2 * voo * strc * vols.voo * vols.strc * corrs.voo_strc +
            2 * voo * hysa * vols.voo * vols.hysa * corrs.voo_hysa +
            2 * treasury * strc * vols.treasury * vols.strc * corrs.treasury_strc +
            2 * treasury * hysa * vols.treasury * vols.hysa * corrs.treasury_hysa +
            2 * strc * hysa * vols.strc * vols.hysa * corrs.strc_hysa;
        
        return Math.sqrt(variance);
    }

    calculateDynamicReturns(timeHorizon) {
        // Updated Saylor's model based on actual MicroStrategy projections (2025)
        // Bitcoin to $21M by 2046 (21 years), growing at 21% annually with volatility of 21%
        // This represents Saylor's latest forecast from BTC Prague 2025
        const yearsTo21M = 21; // Saylor's 21-year projection to $21M
        const currentBtcPrice = 100000; // Approximate current BTC price
        const targetPrice = 21000000; // $21M target
        
        // Calculate compound annual growth rate to reach $21M in 21 years
        const longTermCAGR = Math.pow(targetPrice / currentBtcPrice, 1 / yearsTo21M) - 1;
        
        // Saylor's model: higher returns in early years, moderating over time
        // Early years: 25-30% returns, tapering to ~21% long-term average
        let avgBtcReturn = 0;
        for (let year = 1; year <= timeHorizon; year++) {
            let yearlyReturn;
            if (year <= 5) {
                // Early adoption phase: higher volatility, higher returns
                yearlyReturn = 0.42 - (0.03 * (year - 1));
            } else if (year <= 15) {
                // Maturation phase: moderate returns
                yearlyReturn = 0.23 - (0.002 * (year - 5)); // 23% to 21%
            } else {
                // Mature phase: stable 21% as per Saylor's projection
                yearlyReturn = longTermCAGR;
            }
            avgBtcReturn += yearlyReturn;
        }
        avgBtcReturn /= timeHorizon;
        
        return {
            btc: avgBtcReturn,
            voo: 0.10,        // 10% annual return (historical S&P 500)
            treasury: 0.04,   // 4% annual return (current treasury rates)
            strc: 0.12,       // 12% annual return (STRC yield - bullish on Bitcoin)
            hysa: 0.045       // 4.5% annual return (current HYSA rates)
        };
    }

    calculateRealEstateVolatility(timeHorizon) {
        // US real estate volatility based on historical data
        // US residential real estate typically shows 8-12% annual volatility in property values
        // Higher in shorter terms due to market cycles, lower in longer terms due to smoothing
        
        if (timeHorizon <= 5) {
            return 0.12; // 12% volatility for short-term (market cycles more pronounced)
        } else if (timeHorizon <= 15) {
            return 0.10; // 10% volatility for medium-term
        } else {
            return 0.08; // 8% volatility for long-term (smoothing effect)
        }
    }

    calculateDynamicVolatility(timeHorizon) {
        // Updated Saylor's volatility model based on 2025 projections
        // "Volatility going to be 21" - Saylor's target volatility alignment with 21% returns
        // Current high volatility tapering to 21% as Bitcoin matures
        
        let avgBtcVolatility = 0;
        for (let year = 1; year <= timeHorizon; year++) {
            let yearlyVolatility;
            if (year <= 5) {
                // Early years: higher volatility (50-40%)
                yearlyVolatility = 0.50 - (0.02 * (year - 1));
            } else if (year <= 15) {
                // Maturation: tapering to Saylor's target 21%
                yearlyVolatility = 0.40 - (0.019 * (year - 5));
            } else {
                // Mature phase: Saylor's target 21% volatility
                yearlyVolatility = 0.21;
            }
            avgBtcVolatility += yearlyVolatility;
        }
        avgBtcVolatility /= timeHorizon;
        
        return {
            btc: avgBtcVolatility,
            voo: 0.16,        // S&P 500 ~16% volatility
            treasury: 0.05,   // Treasuries ~5% volatility
            strc: 0.02,       // STRC expected price maintained between 99-101
            hysa: 0.01        // HYSA ~1% volatility
        };
    }


    calculateAndDisplay() {
        this.validateAllocations();
        
        if (document.getElementById('calculate-btn').disabled) {
            return;
        }

        // Add loading state
        const calculateBtn = document.getElementById('calculate-btn');
        const resultsSection = document.getElementById('results');
        
        calculateBtn.textContent = 'Calculating...';
        calculateBtn.classList.add('calculating');
        
        // Hide previous results
        this.hideResults();
        
        // Fast calculation and display
        setTimeout(() => {
            const realEstateResults = this.calculateRealEstateInvestment();
            const portfolioResults = this.calculatePortfolioInvestment();
            const bitcoinSavingsResults = this.calculateBitcoinSavings(realEstateResults);

            // Show results section and mark as animating
            resultsSection.style.display = 'block';
            resultsSection.classList.add('animating');
            
            // Smooth scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Display results with fast animations
            setTimeout(() => {
                this.displayResultsAnimated(realEstateResults, portfolioResults, bitcoinSavingsResults);
            }, 100);
            
            // Set up chart and display comparison immediately
            setTimeout(() => {
                this.displayComparison(realEstateResults, portfolioResults, bitcoinSavingsResults);
                this.createAnimatedChart(realEstateResults, portfolioResults, bitcoinSavingsResults);
            }, 200);
            
            // Reset button state
            setTimeout(() => {
                calculateBtn.textContent = 'Calculate & Compare';
                calculateBtn.classList.remove('calculating');
                resultsSection.classList.remove('animating');
            }, 400);
            
        }, 300);
    }

    calculateBitcoinSavings(reResults) {
        const timeHorizon = parseInt(document.getElementById('time-horizon').value);
        const monthlyMortgagePayment = reResults.monthlyPayment;
        const initialMonthlyRent = parseFloat(document.getElementById('current-rent').value);
        const rentInflationRate = parseFloat(document.getElementById('rent-inflation').value) / 100;
        
        // Calculate monthly BTC investments - only when rent < mortgage
        let totalBtcInvestment = 0;
        let monthlyInvestments = []; // Track each month's investment
        
        for (let month = 1; month <= timeHorizon * 12; month++) {
            const year = Math.ceil(month / 12);
            const currentMonthlyRent = initialMonthlyRent * Math.pow(1 + rentInflationRate, year - 1);
            
            // Only invest in BTC when rent is less than mortgage (savings exist)
            const monthlySavings = currentMonthlyRent < monthlyMortgagePayment 
                ? monthlyMortgagePayment - currentMonthlyRent 
                : 0;
                
            totalBtcInvestment += monthlySavings;
            monthlyInvestments.push({
                month: month,
                year: year,
                rent: currentMonthlyRent,
                savings: monthlySavings
            });
        }
        
        if (totalBtcInvestment === 0) {
            return {
                monthlySavings: reResults.monthlySavings,
                monthlyBtcInvestment: 0,
                totalInvestment: 0,
                finalValue: 0,
                gain: 0,
                annualReturn: 0
            };
        }
        
        // Calculate Bitcoin returns using Saylor's updated model
        const expectedReturns = this.calculateDynamicReturns(timeHorizon);
        const btcAnnualReturn = expectedReturns.btc;
        
        // Calculate future value using actual monthly investments and timing
        let totalBtcValue = 0;
        
        // Get year-by-year returns
        const yearlyReturns = [];
        for (let year = 1; year <= timeHorizon; year++) {
            let yearlyReturn;
            if (year <= 5) {
                yearlyReturn = 0.42 - (0.03 * (year - 1));
            } else if (year <= 15) {
                yearlyReturn = 0.23 - (0.002 * (year - 5));
            } else {
                const longTermCAGR = Math.pow(21000000 / 100000, 1 / 21) - 1;
                yearlyReturn = longTermCAGR;
            }
            yearlyReturns.push(yearlyReturn);
        }
        
        // Calculate value for each month's investment based on when it was made
        monthlyInvestments.forEach(investment => {
            if (investment.savings > 0) {
                let investmentValue = investment.savings;
                const startYear = investment.year - 1; // 0-indexed
                
                // Apply returns for remaining years
                for (let yearIndex = startYear; yearIndex < timeHorizon; yearIndex++) {
                    const monthInYear = ((investment.month - 1) % 12) + 1;
                    const yearsToApply = (yearIndex === startYear) 
                        ? (12 - monthInYear + 1) / 12  // Partial year for investment year
                        : 1; // Full year for subsequent years
                    
                    if (yearsToApply > 0) {
                        investmentValue *= Math.pow(1 + yearlyReturns[yearIndex], yearsToApply);
                    }
                }
                totalBtcValue += investmentValue;
            }
        });
        
        const gain = totalBtcValue - totalBtcInvestment;
        // Calculate average monthly investment for display
        const avgMonthlyInvestment = totalBtcInvestment / (timeHorizon * 12);
        // Use the expected annual return directly
        const annualReturn = btcAnnualReturn;
        
        return {
            monthlySavings: reResults.monthlySavings, // Average monthly savings from real estate calc
            monthlyBtcInvestment: avgMonthlyInvestment, // Average monthly BTC investment
            totalInvestment: totalBtcInvestment,
            finalValue: totalBtcValue,
            gain,
            annualReturn
        };
    }

    displayResults(reResults, portfolioResults, bitcoinSavingsResults) {
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);

        const formatPercent = (rate) => (rate * 100).toFixed(2) + '%';

        // Real Estate Results
        document.getElementById('re-total-investment').textContent = formatCurrency(reResults.totalInvestment);
        document.getElementById('re-property-value').textContent = formatCurrency(reResults.finalPropertyValue);
        document.getElementById('re-rental-income').textContent = formatCurrency(reResults.totalRentalIncome);
        document.getElementById('re-net-worth').textContent = formatCurrency(reResults.netWorth);
        document.getElementById('re-annual-return').textContent = formatPercent(reResults.annualReturn);
        document.getElementById('re-monthly-payment').textContent = formatCurrency(reResults.monthlyPayment);
        document.getElementById('re-principal-interest').textContent = formatCurrency(reResults.principalAndInterest);
        document.getElementById('re-property-tax').textContent = formatCurrency(reResults.monthlyPropertyTax);
        document.getElementById('re-home-insurance').textContent = formatCurrency(reResults.monthlyHomeInsurance);
        document.getElementById('re-pmi').textContent = reResults.monthlyPMI > 0 ? formatCurrency(reResults.monthlyPMI) : "N/A";
        document.getElementById('re-hoa-fee').textContent = reResults.monthlyHOAFee > 0 ? formatCurrency(reResults.monthlyHOAFee) : "N/A";
        document.getElementById('re-volatility').textContent = formatPercent(reResults.volatility);

        // Portfolio Results
        document.getElementById('portfolio-total-investment').textContent = formatCurrency(portfolioResults.totalInvestment);
        document.getElementById('portfolio-value').textContent = formatCurrency(portfolioResults.finalValue);
        document.getElementById('portfolio-gain').textContent = formatCurrency(portfolioResults.netGain);
        document.getElementById('portfolio-annual-return').textContent = formatPercent(portfolioResults.annualReturn);
        document.getElementById('portfolio-volatility').textContent = formatPercent(portfolioResults.actualVolatility);
        document.getElementById('optimized-btc-allocation').textContent = formatPercent(portfolioResults.optimizedAllocation.btc);

        // Winner and Comparison Summary
        const winnerSummary = document.getElementById('winner-summary');
        const differenceSummary = document.getElementById('difference-summary');
        const savingsSummary = document.getElementById('savings-summary');
        
        if (reResults.netWorth > portfolioResults.finalValue) {
            winnerSummary.textContent = '🏠 Real Estate Strategy Wins!';
            winnerSummary.className = 'winner real-estate';
            const difference = reResults.netWorth - portfolioResults.finalValue;
            differenceSummary.textContent = `Real Estate outperforms by ${formatCurrency(difference)}`;
        } else {
            winnerSummary.textContent = '₿ Investment Portfolio Strategy Wins!';
            winnerSummary.className = 'winner portfolio';
            const difference = portfolioResults.finalValue - reResults.netWorth;
            differenceSummary.textContent = `Investment portfolio outperforms by ${formatCurrency(difference)}`;
        }

        // Bitcoin Savings Results
        document.getElementById('btc-monthly-savings').textContent = formatCurrency(bitcoinSavingsResults.monthlyBtcInvestment || bitcoinSavingsResults.monthlySavings);
        document.getElementById('btc-total-investment').textContent = formatCurrency(bitcoinSavingsResults.totalInvestment);
        document.getElementById('btc-final-value').textContent = formatCurrency(bitcoinSavingsResults.finalValue);
        document.getElementById('btc-gain').textContent = formatCurrency(bitcoinSavingsResults.gain);
        document.getElementById('btc-annual-return').textContent = formatPercent(bitcoinSavingsResults.annualReturn);

        // Display occupant savings summary
        const savingsStatus = reResults.monthlySavings > 0 ? 'saves by renting' : 'saves by buying';
        const savingsAmount = Math.abs(reResults.monthlySavings);
        const btcBenefit = bitcoinSavingsResults.finalValue > 0 ? 
            ` • Bitcoin strategy could yield ${formatCurrency(bitcoinSavingsResults.finalValue)} total` : '';
        savingsSummary.textContent = `Occupant ${savingsStatus} ${formatCurrency(savingsAmount)}/month on average${btcBenefit}`;
    }

    calculateYearlyValues(reResults, timeHorizon) {
        const propertyPrice = parseFloat(document.getElementById('property-price').value);
        const appreciation = parseFloat(document.getElementById('property-appreciation').value) / 100;
        const rentalYield = parseFloat(document.getElementById('rental-yield').value) / 100;
        const maintenanceCosts = parseFloat(document.getElementById('maintenance-costs').value) / 100;
        const monthlyHOAFee = parseFloat(document.getElementById('hoa-fee').value) || 0;
        const downPayment = parseFloat(document.getElementById('down-payment').value);
        const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
        const monthlyRate = interestRate / 12;
        const loanAmount = propertyPrice - downPayment;
        const mortgageTerm = 30 * 12; // Fixed 30-year mortgage term
        
        // Start with down payment as initial equity
        const values = [downPayment];
        
        // Calculate realistic year-by-year equity buildup
        for (let year = 1; year <= timeHorizon; year++) {
            // 1. Property value with appreciation
            const currentPropertyValue = propertyPrice * Math.pow(1 + appreciation, year);
            
            // 2. Remaining mortgage balance
            const remainingBalance = this.calculateRemainingBalance(
                loanAmount, 
                monthlyRate, 
                mortgageTerm, 
                year * 12
            );
            
            // 3. Accumulated net rental income
            const annualNetRental = propertyPrice * (rentalYield - maintenanceCosts);
            const accumulatedRentalIncome = annualNetRental * year;
            
            // 4. Calculate cumulative investment made so far (for matching display logic)
            const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, mortgageTerm)) / 
                                  (Math.pow(1 + monthlyRate, mortgageTerm) - 1);
            const paymentsToDate = year * 12;
            const interestPaidToDate = (monthlyPayment * paymentsToDate) - (loanAmount - remainingBalance);
            const maintenancePaidToDate = (propertyPrice * maintenanceCosts) * year;
            const hoaFeesPaidToDate = monthlyHOAFee * paymentsToDate;
            const totalInvestmentToDate = downPayment + interestPaidToDate + maintenancePaidToDate + hoaFeesPaidToDate;
            
            // 5. Total return (matches display calculation method)
            const propertyEquityForYear = currentPropertyValue - remainingBalance;
            const totalReturnForYear = propertyEquityForYear + accumulatedRentalIncome;
            
            values.push(totalReturnForYear);
        }
        
        return values;
    }

    calculatePortfolioYearlyValues(portfolioResults, timeHorizon) {
        const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
        
        // Use the same optimized allocation and return rate as the results display
        const portfolioReturn = portfolioResults.portfolioReturn;
        
        const values = [initialInvestment];
        
        for (let year = 1; year <= timeHorizon; year++) {
            const currentValue = initialInvestment * Math.pow(1 + portfolioReturn, year);
            values.push(currentValue);
        }
        
        return values;
    }

    calculateBitcoinSavingsYearlyValues(reResults, timeHorizon) {
        const monthlyMortgagePayment = reResults.monthlyPayment;
        const initialMonthlyRent = parseFloat(document.getElementById('current-rent').value);
        const rentInflationRate = parseFloat(document.getElementById('rent-inflation').value) / 100;
        
        // Calculate year-by-year returns
        const yearlyReturns = [];
        for (let year = 1; year <= timeHorizon; year++) {
            let yearlyReturn;
            if (year <= 5) {
                yearlyReturn = 0.42 - (0.03 * (year - 1));
            } else if (year <= 15) {
                yearlyReturn = 0.23 - (0.002 * (year - 5));
            } else {
                const longTermCAGR = Math.pow(21000000 / 100000, 1 / 21) - 1;
                yearlyReturn = longTermCAGR;
            }
            yearlyReturns.push(yearlyReturn);
        }
        
        const values = [0]; // Start at 0
        
        for (let targetYear = 1; targetYear <= timeHorizon; targetYear++) {
            let totalValue = 0;
            
            // Calculate value for each month up to target year
            for (let month = 1; month <= targetYear * 12; month++) {
                const investmentYear = Math.ceil(month / 12);
                const currentMonthlyRent = initialMonthlyRent * Math.pow(1 + rentInflationRate, investmentYear - 1);
                
                // Only invest when rent < mortgage
                const monthlySavings = currentMonthlyRent < monthlyMortgagePayment 
                    ? monthlyMortgagePayment - currentMonthlyRent 
                    : 0;
                
                if (monthlySavings > 0) {
                    let investmentValue = monthlySavings;
                    
                    // Apply returns from investment year to target year
                    for (let yearIndex = investmentYear - 1; yearIndex < targetYear; yearIndex++) {
                        const monthInYear = ((month - 1) % 12) + 1;
                        const yearsToApply = (yearIndex === investmentYear - 1) 
                            ? (12 - monthInYear + 1) / 12  // Partial year for investment year
                            : 1; // Full year for subsequent years
                        
                        if (yearsToApply > 0) {
                            investmentValue *= Math.pow(1 + yearlyReturns[yearIndex], yearsToApply);
                        }
                    }
                    
                    totalValue += investmentValue;
                }
            }
            
            values.push(totalValue);
        }
        
        return values;
    }


    // Animation helper functions
    hideResults() {
        const resultsSection = document.getElementById('results');
        const resultCards = document.querySelectorAll('.result-card');
        const comparisonSummary = document.querySelector('.comparison-summary');
        const chartContainer = document.querySelector('.chart-container');
        
        // Remove animation classes
        resultsSection.classList.remove('animating');
        
        resultCards.forEach(card => {
            card.classList.remove('animate-card', 'animate-fade-in');
        });
        
        if (comparisonSummary) {
            comparisonSummary.classList.remove('animate-fade-in');
        }
        
        if (chartContainer) {
            chartContainer.classList.remove('animate-in');
        }
    }

    displayResultsAnimated(realEstateResults, portfolioResults, bitcoinSavingsResults) {
        // First display the results data
        this.displayResults(realEstateResults, portfolioResults, bitcoinSavingsResults);
        
        // Only animate result cards - summary and chart will be scroll-triggered
        const resultCards = document.querySelectorAll('.result-card');
        
        // Make sure elements exist before animating
        if (resultCards.length === 0) {
            console.error('No result cards found!');
            return;
        }
        
        // Animate cards with fast, tight timing
        resultCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-card');
                this.animateCardValues(card);
            }, index * 150 + 50); // Much faster
        });
    }

    displayComparison(realEstateResults, portfolioResults, bitcoinSavingsResults) {
        const comparisonSummary = document.querySelector('.comparison-summary');
        
        if (comparisonSummary) {
            // Show comparison summary immediately with fast animation
            setTimeout(() => {
                comparisonSummary.classList.add('animate-fade-in');
            }, 50);
        }
        
        // Display the chart container immediately
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.classList.add('animate-in');
        }
    }

    animateCardValues(card) {
        const valueElements = card.querySelectorAll('.value');
        valueElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-value');
                this.animateNumber(element);
            }, index * 20 + 30); // Much faster timing
        });
    }

    animateNumber(element) {
        const text = element.textContent;
        const isNegative = text.includes('-');
        const numStr = text.replace(/[$,%\-\s]/g, '');
        const targetNum = parseFloat(numStr) || 0;
        
        if (targetNum === 0 || isNaN(targetNum)) return;
        
        const duration = 300; // Much faster number animation
        const startTime = performance.now();
        const isPercent = text.includes('%');
        const isCurrency = text.includes('$');
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smoother easing function (cubic-bezier equivalent)
            const easeOut = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            const currentNum = targetNum * easeOut;
            
            let formattedNum;
            if (isPercent) {
                formattedNum = currentNum.toFixed(2) + '%';
            } else if (isCurrency) {
                formattedNum = '$' + currentNum.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
            } else {
                formattedNum = currentNum.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
            }
            
            if (isNegative && currentNum > 0) {
                formattedNum = '-' + formattedNum;
            }
            
            element.textContent = formattedNum;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    createAnimatedChart(realEstateResults, portfolioResults, bitcoinSavingsResults) {
        const chartContainer = document.querySelector('.chart-container');
        
        // Make sure chart container exists
        if (!chartContainer) {
            console.error('Chart container not found!');
            return;
        }
        
        chartContainer.classList.add('animate-in');
        
        // Clear existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = document.getElementById('comparison-chart').getContext('2d');
        const timeHorizon = parseInt(document.getElementById('time-horizon').value);
        const years = Array.from({length: timeHorizon + 1}, (_, i) => i);

        // Get current theme colors
        const computedStyle = getComputedStyle(document.body);
        const textColor = computedStyle.getPropertyValue('--text-primary').trim();
        const borderColor = computedStyle.getPropertyValue('--border-color').trim();
        
        const realEstateValues = this.calculateYearlyValues(realEstateResults, timeHorizon);
        const portfolioValues = this.calculatePortfolioYearlyValues(portfolioResults, timeHorizon);
        const bitcoinSavingsValues = this.calculateBitcoinSavingsYearlyValues(realEstateResults, timeHorizon);

        // Create chart with animation disabled initially
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Real Estate Net Worth',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Investment Portfolio Value',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Bitcoin Savings Strategy',
                    data: [],
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Investment Growth Comparison Over Time',
                        color: textColor,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: textColor,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years',
                            color: textColor
                        },
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: borderColor
                        }
                    },
                    y: {
                        type: 'linear',
                        beginAtZero: true,
                        min: 0,
                        title: {
                            display: true,
                            text: 'Value ($)',
                            color: textColor
                        },
                        ticks: {
                            color: textColor,
                            stepSize: 100000,
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return '$' + (value / 1000).toFixed(0) + 'K';
                                } else {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        },
                        grid: {
                            color: borderColor
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });

        // Animate data points appearing
        this.animateChartData(realEstateValues, portfolioValues, bitcoinSavingsValues, timeHorizon);
    }

    animateChartData(realEstateValues, portfolioValues, bitcoinSavingsValues, timeHorizon) {
        let currentPoint = 0;
        const totalPoints = timeHorizon + 1;
        const animationDuration = 600; // Much faster - 600ms total
        const pointDelay = animationDuration / totalPoints;

        const animateNextPoint = () => {
            if (currentPoint < totalPoints) {
                // Add the next data point to each dataset
                this.chart.data.datasets[0].data.push(realEstateValues[currentPoint]);
                this.chart.data.datasets[1].data.push(portfolioValues[currentPoint]);
                this.chart.data.datasets[2].data.push(bitcoinSavingsValues[currentPoint]);
                
                // Update the chart
                this.chart.update('none');
                
                currentPoint++;
                setTimeout(animateNextPoint, pointDelay);
            }
        };

        setTimeout(animateNextPoint, 100); // Start quickly
    }

    updateChartColors() {
        if (!this.chart) return;
        
        // Get current theme colors
        const computedStyle = getComputedStyle(document.body);
        const textColor = computedStyle.getPropertyValue('--text-primary').trim();
        const borderColor = computedStyle.getPropertyValue('--border-color').trim();
        
        // Update chart colors
        this.chart.options.plugins.title.color = textColor;
        this.chart.options.plugins.legend.labels.color = textColor;
        this.chart.options.scales.x.title.color = textColor;
        this.chart.options.scales.x.ticks.color = textColor;
        this.chart.options.scales.x.grid.color = borderColor;
        this.chart.options.scales.y.title.color = textColor;
        this.chart.options.scales.y.ticks.color = textColor;
        this.chart.options.scales.y.grid.color = borderColor;
        
        // Update the chart
        this.chart.update('none'); // Use 'none' for instant update without animation
    }

    resetToDefaults() {
        const defaults = {
            'property-price': 435000,
            'down-payment': 87000,
            'interest-rate': 6.7,
            'rental-yield': 0,
            'property-appreciation': 4,
            'maintenance-costs': 2,
            'hoa-fee': 0,
            'initial-investment': 87000,
            'btc-allocation': 20,
            'voo-allocation': 20,
            'treasury-allocation': 20,
            'strc-allocation': 20,
            'hysa-allocation': 20,
            'current-rent': 2075,
            'rent-inflation': 3.5,
            'time-horizon': 10
        };

        Object.entries(defaults).forEach(([id, value]) => {
            document.getElementById(id).value = value;
        });

        document.getElementById('results').style.display = 'none';
        this.validateAllocations();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new InvestmentCalculator();
});