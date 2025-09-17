import { Logger } from '../core/Logger.js';
export class LearningRateScheduler {
    static instance;
    logger = Logger.getInstance();
    config = {
        initialLR: 0.001,
        warmupSteps: 1000,
        totalSteps: 100000,
        minLR: 1e-6,
        schedulerType: 'warmup_cosine',
        patience: 10,
        factor: 0.5,
        threshold: 1e-4,
        restartPeriod: 10000,
        restartMult: 2
    };
    constructor() { }
    static getInstance() {
        if (!LearningRateScheduler.instance) {
            LearningRateScheduler.instance = new LearningRateScheduler();
        }
        return LearningRateScheduler.instance;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('Learning rate scheduler config updated', this.config);
    }
    /**
     * Initialize scheduler state
     */
    initializeState() {
        const state = {
            currentStep: 0,
            currentLR: this.config.initialLR,
            bestMetric: Infinity,
            plateauCounter: 0,
            lastRestartStep: 0,
            restartCount: 0
        };
        this.logger.info('Learning rate scheduler state initialized', {
            schedulerType: this.config.schedulerType,
            initialLR: this.config.initialLR
        });
        return state;
    }
    /**
     * Update learning rate based on scheduler type
     */
    step(state, metric) {
        state.currentStep += 1;
        let newLR = state.currentLR;
        let wasReduced = false;
        let wasRestarted = false;
        let phase = 'training';
        let progress = 0;
        switch (this.config.schedulerType) {
            case 'warmup_cosine':
                const result = this.warmupCosineSchedule(state);
                newLR = result.lr;
                phase = result.phase;
                progress = result.progress;
                break;
            case 'cosine':
                newLR = this.cosineAnnealingSchedule(state);
                progress = state.currentStep / this.config.totalSteps;
                break;
            case 'plateau':
                if (metric !== undefined) {
                    const plateauResult = this.plateauSchedule(state, metric);
                    newLR = plateauResult.lr;
                    wasReduced = plateauResult.wasReduced;
                }
                break;
            case 'warm_restarts':
                const restartResult = this.warmRestartsSchedule(state);
                newLR = restartResult.lr;
                wasRestarted = restartResult.wasRestarted;
                progress = restartResult.progress;
                break;
        }
        // Ensure LR doesn't go below minimum
        newLR = Math.max(newLR, this.config.minLR);
        state.currentLR = newLR;
        const schedulerInfo = {
            phase,
            progress,
            wasReduced,
            wasRestarted
        };
        this.logger.debug('Learning rate updated', {
            step: state.currentStep,
            newLR: newLR.toExponential(3),
            schedulerType: this.config.schedulerType,
            ...schedulerInfo
        });
        return {
            updatedState: state,
            newLR,
            schedulerInfo
        };
    }
    warmupCosineSchedule(state) {
        if (state.currentStep <= this.config.warmupSteps) {
            // Warmup phase: linear increase
            const progress = state.currentStep / this.config.warmupSteps;
            const lr = this.config.initialLR * progress;
            return { lr, phase: 'warmup', progress };
        }
        else {
            // Cosine annealing phase
            const cosineSteps = state.currentStep - this.config.warmupSteps;
            const totalCosineSteps = this.config.totalSteps - this.config.warmupSteps;
            const progress = Math.min(cosineSteps / totalCosineSteps, 1.0);
            const lr = this.config.minLR + (this.config.initialLR - this.config.minLR) *
                0.5 * (1 + Math.cos(Math.PI * progress));
            return { lr, phase: 'cosine_annealing', progress };
        }
    }
    cosineAnnealingSchedule(state) {
        const progress = Math.min(state.currentStep / this.config.totalSteps, 1.0);
        return this.config.minLR + (this.config.initialLR - this.config.minLR) *
            0.5 * (1 + Math.cos(Math.PI * progress));
    }
    plateauSchedule(state, metric) {
        let wasReduced = false;
        // Check if metric improved
        if (metric < state.bestMetric - this.config.threshold) {
            state.bestMetric = metric;
            state.plateauCounter = 0;
        }
        else {
            state.plateauCounter += 1;
        }
        // Reduce LR if plateau detected
        if (state.plateauCounter >= this.config.patience) {
            const newLR = state.currentLR * this.config.factor;
            state.plateauCounter = 0;
            wasReduced = true;
            this.logger.info('Learning rate reduced due to plateau', {
                oldLR: state.currentLR.toExponential(3),
                newLR: newLR.toExponential(3),
                metric,
                bestMetric: state.bestMetric
            });
            return { lr: newLR, wasReduced };
        }
        return { lr: state.currentLR, wasReduced };
    }
    warmRestartsSchedule(state) {
        const stepsSinceRestart = state.currentStep - state.lastRestartStep;
        const currentPeriod = this.config.restartPeriod * Math.pow(this.config.restartMult, state.restartCount);
        let wasRestarted = false;
        // Check if restart is needed
        if (stepsSinceRestart >= currentPeriod) {
            state.lastRestartStep = state.currentStep;
            state.restartCount += 1;
            wasRestarted = true;
            this.logger.info('Warm restart triggered', {
                restartCount: state.restartCount,
                newPeriod: this.config.restartPeriod * Math.pow(this.config.restartMult, state.restartCount)
            });
        }
        // Cosine annealing within current period
        const progress = stepsSinceRestart / currentPeriod;
        const lr = this.config.minLR + (this.config.initialLR - this.config.minLR) *
            0.5 * (1 + Math.cos(Math.PI * progress));
        return { lr, wasRestarted, progress };
    }
    /**
     * Get current learning rate without stepping
     */
    getCurrentLR(state) {
        return state.currentLR;
    }
    /**
     * Test scheduler progression
     */
    testSchedulerProgression(steps = 1000) {
        const state = this.initializeState();
        const lrProgression = [];
        // Record initial state
        lrProgression.push({ step: 0, lr: state.currentLR });
        for (let i = 0; i < steps; i++) {
            const result = this.step(state, Math.random()); // Random metric for plateau testing
            // Record every 10th step or significant changes
            if (i % 10 === 0 || result.schedulerInfo.wasReduced || result.schedulerInfo.wasRestarted) {
                lrProgression.push({
                    step: state.currentStep,
                    lr: result.newLR,
                    phase: result.schedulerInfo.phase
                });
            }
        }
        this.logger.info('Scheduler progression test completed', {
            schedulerType: this.config.schedulerType,
            steps,
            finalLR: state.currentLR.toExponential(3)
        });
        return {
            schedulerType: this.config.schedulerType,
            lrProgression,
            finalLR: state.currentLR
        };
    }
}
