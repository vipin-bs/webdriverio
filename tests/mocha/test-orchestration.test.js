import { expect } from 'chai'
import { TestOrchestrationHandler } from '../../packages/wdio-browserstack-service/src/testorchestration/testorcherstrationhandler.ts'
import { applyOrchestrationIfEnabled } from '../../packages/wdio-browserstack-service/src/testorchestration/apply-orchestration.ts'

describe('TestOrchestration', () => {
    it('should reorder test files when orchestration is enabled', async () => {
        // Mock config
        const config = {
            testObservability: true,
            projectName: 'Test Project',
            buildName: 'Test Build',
            framework: 'mocha'
        }

        // Mock specs
        const specs = [
            '/path/to/test1.js',
            '/path/to/test2.js',
            '/path/to/test3.js'
        ]

        // Mock the TestOrchestrationHandler.reorderTestFiles method
        const originalReorderTestFiles = TestOrchestrationHandler.prototype.reorderTestFiles
        TestOrchestrationHandler.prototype.reorderTestFiles = async function() {
            return [
                '/path/to/test3.js', // Reordered
                '/path/to/test1.js',
                '/path/to/test2.js'
            ]
        }

        // Apply orchestration
        const orderedSpecs = await applyOrchestrationIfEnabled(specs, config)

        // Restore original method
        TestOrchestrationHandler.prototype.reorderTestFiles = originalReorderTestFiles

        // Assert
        expect(orderedSpecs).to.be.an('array')
        expect(orderedSpecs.length).to.equal(3)
        expect(orderedSpecs[0]).to.equal('/path/to/test3.js') // Ensure reordering happened
    })

    it('should not reorder test files when orchestration is disabled', async () => {
        // Mock config with orchestration disabled
        const config = {
            testObservability: false,
            projectName: 'Test Project',
            buildName: 'Test Build',
            framework: 'mocha'
        }

        // Mock specs
        const specs = [
            '/path/to/test1.js',
            '/path/to/test2.js',
            '/path/to/test3.js'
        ]

        // Apply orchestration
        const orderedSpecs = await applyOrchestrationIfEnabled(specs, config)

        // Assert that specs are unchanged
        expect(orderedSpecs).to.deep.equal(specs)
    })
})
