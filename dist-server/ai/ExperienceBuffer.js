import { Logger } from '../core/Logger.js';
export class ExperienceBuffer {
    static instance;
    logger = Logger.getInstance();
    config = {
        capacity: 200000,
        alpha: 0.6,
        beta: 0.4,
        betaIncrement: 0.001,
        epsilon: 1e-6,
        maxPriority: 1.0
    };
    buffer = [];
    position = 0;
    size = 0;
    priorityTree = [];
    criticalEventTags = new Set();
    constructor() {
        this.initializePriorityTree();
    }
    static getInstance() {
        if (!ExperienceBuffer.instance) {
            ExperienceBuffer.instance = new ExperienceBuffer();
        }
        return ExperienceBuffer.instance;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('Experience buffer config updated', this.config);
    }
    /**
     * Initialize priority tree for efficient sampling
     */
    initializePriorityTree() {
        // Binary tree for priority sampling - size needs to be power of 2
        const treeSize = 1;
        while (treeSize < this.config.capacity) {
            // Find next power of 2
        }
        this.priorityTree = new Array(2 * this.config.capacity).fill(0);
    }
    /**
     * Add experience to buffer with priority
     */
    addExperience(experience) {
        const id = this.generateExperienceId();
        const priority = this.config.maxPriority; // New experiences get max priority
        const tdError = 0; // Will be updated during training
        const fullExperience = {
            ...experience,
            id,
            priority,
            tdError
        };
        // Add to buffer (circular)
        this.buffer[this.position] = fullExperience;
        this.updatePriority(this.position, priority);
        this.position = (this.position + 1) % this.config.capacity;
        this.size = Math.min(this.size + 1, this.config.capacity);
        // Tag critical events
        this.tagCriticalEvents(fullExperience);
        this.logger.debug('Experience added to buffer', {
            id,
            symbol: experience.symbol,
            action: experience.action,
            reward: experience.reward.toFixed(4),
            bufferSize: this.size,
            priority: priority.toFixed(4)
        });
    }
    /**
     * Sample batch of experiences using prioritized sampling
     */
    sampleBatch(batchSize) {
        if (this.size < batchSize) {
            throw new Error(`Not enough experiences in buffer: ${this.size} < ${batchSize}`);
        }
        const experiences = [];
        const indices = [];
        const weights = [];
        const totalPriority = this.priorityTree[1]; // Root contains total priority
        const segment = totalPriority / batchSize;
        // Anneal beta
        this.config.beta = Math.min(1.0, this.config.beta + this.config.betaIncrement);
        for (let i = 0; i < batchSize; i++) {
            const a = segment * i;
            const b = segment * (i + 1);
            const value = Math.random() * (b - a) + a;
            const index = this.sampleFromTree(value);
            const priority = this.priorityTree[this.config.capacity + index];
            experiences.push(this.buffer[index]);
            indices.push(index);
            // Calculate importance sampling weight
            const probability = priority / totalPriority;
            const weight = Math.pow(this.size * probability, -this.config.beta);
            weights.push(weight);
        }
        // Normalize weights
        const maxWeight = Math.max(...weights);
        const normalizedWeights = weights.map(w => w / maxWeight);
        this.logger.debug('Batch sampled from experience buffer', {
            batchSize,
            totalPriority: totalPriority.toFixed(4),
            avgWeight: (normalizedWeights.reduce((sum, w) => sum + w, 0) / batchSize).toFixed(4),
            beta: this.config.beta.toFixed(4)
        });
        return {
            experiences,
            indices,
            weights: normalizedWeights
        };
    }
    /**
     * Update priorities based on TD errors
     */
    updatePriorities(indices, tdErrors) {
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const tdError = Math.abs(tdErrors[i]);
            const priority = Math.pow(tdError + this.config.epsilon, this.config.alpha);
            this.buffer[index].tdError = tdError;
            this.buffer[index].priority = priority;
            this.updatePriority(index, priority);
        }
        this.logger.debug('Priorities updated', {
            updatedCount: indices.length,
            avgTDError: (tdErrors.reduce((sum, e) => sum + Math.abs(e), 0) / tdErrors.length).toFixed(4)
        });
    }
    /**
     * Add experiences from real market data
     */
    addMarketDataExperiences(marketData, actions, rewards) {
        if (marketData.length !== actions.length || actions.length !== rewards.length) {
            throw new Error('Market data, actions, and rewards arrays must have same length');
        }
        for (let i = 0; i < marketData.length - 1; i++) {
            const currentData = marketData[i];
            const nextData = marketData[i + 1];
            // Extract features from market data
            const state = this.extractFeatures(currentData);
            const nextState = this.extractFeatures(nextData);
            // Calculate volatility for metadata
            const volatility = Math.abs(currentData.high - currentData.low) / currentData.close;
            const experience = {
                state,
                action: actions[i],
                reward: rewards[i],
                nextState,
                terminal: i === marketData.length - 2, // Last transition is terminal
                timestamp: currentData.timestamp,
                symbol: currentData.symbol,
                metadata: {
                    price: currentData.close,
                    volume: currentData.volume,
                    volatility,
                    confidence: 0.8 // Default confidence
                }
            };
            this.addExperience(experience);
        }
        this.logger.info('Market data experiences added', {
            symbol: marketData[0]?.symbol,
            experienceCount: marketData.length - 1,
            timeRange: [marketData[0]?.timestamp, marketData[marketData.length - 1]?.timestamp]
        });
    }
    /**
     * Tag critical market events for oversampling
     */
    tagCriticalEvents(experience) {
        const { metadata } = experience;
        // High volatility periods
        if (metadata.volatility > 0.05) { // 5% volatility threshold
            this.criticalEventTags.add(`${experience.symbol}_high_volatility_${experience.timestamp}`);
            experience.priority *= 2.0; // Double priority for high volatility
        }
        // Large volume spikes
        if (metadata.volume > 1000000) { // Volume threshold
            this.criticalEventTags.add(`${experience.symbol}_volume_spike_${experience.timestamp}`);
            experience.priority *= 1.5;
        }
        // Significant price movements
        const priceChange = Math.abs(experience.reward);
        if (priceChange > 0.03) { // 3% price change threshold
            this.criticalEventTags.add(`${experience.symbol}_price_movement_${experience.timestamp}`);
            experience.priority *= 1.8;
        }
    }
    /**
     * Extract features from market data
     */
    extractFeatures(data) {
        return [
            data.open,
            data.high,
            data.low,
            data.close,
            data.volume,
            (data.high - data.low) / data.close, // Volatility
            (data.close - data.open) / data.open, // Return
            data.volume / 1000000, // Normalized volume
        ];
    }
    /**
     * Update priority in tree structure
     */
    updatePriority(index, priority) {
        const treeIndex = index + this.config.capacity;
        this.priorityTree[treeIndex] = priority;
        // Update parent nodes
        let parent = Math.floor(treeIndex / 2);
        while (parent >= 1) {
            this.priorityTree[parent] = this.priorityTree[2 * parent] + this.priorityTree[2 * parent + 1];
            parent = Math.floor(parent / 2);
        }
    }
    /**
     * Sample index from priority tree
     */
    sampleFromTree(value) {
        let index = 1;
        while (index < this.config.capacity) {
            const leftChild = 2 * index;
            const rightChild = leftChild + 1;
            if (value <= this.priorityTree[leftChild]) {
                index = leftChild;
            }
            else {
                value -= this.priorityTree[leftChild];
                index = rightChild;
            }
        }
        return index - this.config.capacity;
    }
    /**
     * Generate unique experience ID
     */
    generateExperienceId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get buffer statistics
     */
    getStatistics() {
        if (this.size === 0) {
            return {
                size: 0,
                capacity: this.config.capacity,
                utilization: 0,
                criticalEventCount: 0,
                avgPriority: 0,
                priorityDistribution: { min: 0, max: 0, median: 0 }
            };
        }
        const priorities = this.buffer.slice(0, this.size).map(exp => exp.priority);
        const avgPriority = priorities.reduce((sum, p) => sum + p, 0) / priorities.length;
        const sortedPriorities = [...priorities].sort((a, b) => a - b);
        const median = sortedPriorities[Math.floor(sortedPriorities.length / 2)];
        return {
            size: this.size,
            capacity: this.config.capacity,
            utilization: this.size / this.config.capacity,
            criticalEventCount: this.criticalEventTags.size,
            avgPriority,
            priorityDistribution: {
                min: Math.min(...priorities),
                max: Math.max(...priorities),
                median
            }
        };
    }
    /**
     * Clear buffer
     */
    clear() {
        this.buffer = [];
        this.position = 0;
        this.size = 0;
        this.criticalEventTags.clear();
        this.initializePriorityTree();
        this.logger.info('Experience buffer cleared');
    }
}
