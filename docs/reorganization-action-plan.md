# Code Reorganization Action Plan

## Executive Summary

The Nelson Tech codebase needs reorganization to improve maintainability, reduce technical debt, and enhance developer experience. This action plan provides a step-by-step approach to achieve a feature-based architecture.

## Current State Analysis

### Critical Issues (Must Fix)
1. **Legacy auth_template directory** - 47 files of outdated code
2. **Debug components in production** - 3 debug files
3. **Duplicate test files** - Multiple .js/.tsx duplicates
4. **Duplicate hooks** - useMarketplaceQueries vs useMarketplaceQueriesFixed

### Major Issues (Should Fix)
1. **No feature boundaries** - Code scattered across 15+ top-level directories
2. **Inconsistent test organization** - Tests in 5 different locations
3. **Mixed routing implementations** - router/ vs routes/
4. **Context organization** - context/ vs contexts/

### Quality Improvements (Nice to Have)
1. **Component organization** - 40+ components in flat structure
2. **Type organization** - Types scattered throughout codebase
3. **Import path consistency** - No clear import conventions

## Prioritized Action Plan

### Phase 1: Critical Cleanup (Day 1-2)
**Goal**: Remove technical debt and prepare for reorganization

#### Day 1: Backup and Initial Cleanup
- [ ] Create feature branch: `git checkout -b feature/code-reorganization`
- [ ] Run full test suite to establish baseline
- [ ] Document current test coverage percentage
- [ ] Remove auth_template directory
- [ ] Remove debug components:
  - `MarketplaceDebugDetailPage.tsx`
  - `MarketplaceDetailPage/DetailDebug.tsx`
  - `MarketplacePage/Debug.tsx`

#### Day 2: Consolidate Duplicates
- [ ] Replace useMarketplaceQueries with useMarketplaceQueriesFixed
- [ ] Remove duplicate .js test files where .tsx versions exist
- [ ] Merge context/ into contexts/
- [ ] Remove router/ in favor of routes/
- [ ] Run tests to ensure nothing broke

### Phase 2: Create New Structure (Day 3-4)
**Goal**: Set up the new directory structure

#### Day 3: Directory Setup
- [ ] Run the reorganization script to create directories
- [ ] Create shared structure directories
- [ ] Set up feature directories for all 9 features
- [ ] Create barrel export templates

#### Day 4: Documentation and Tooling
- [ ] Set up import update scripts
- [ ] Configure VS Code settings for the team
- [ ] Create feature template generator script
- [ ] Document new conventions

### Phase 3: Feature Migration (Week 2-3)
**Goal**: Migrate features one at a time with minimal disruption

#### Week 2: Core Features
**Day 5-6: Auth Feature**
- [ ] Move auth components, hooks, API, and store
- [ ] Update auth-related imports
- [ ] Test auth functionality
- [ ] Update auth page locations

**Day 7-8: Marketplace Feature**
- [ ] Move marketplace components, hooks, API, and store
- [ ] Update marketplace imports
- [ ] Test marketplace functionality
- [ ] Verify marketplace pages work

**Day 9-10: Companies Feature**
- [ ] Move companies components, hooks, API, and store
- [ ] Update companies imports
- [ ] Test companies functionality

#### Week 3: Remaining Features
**Day 11-12: Groups & Events**
- [ ] Migrate groups feature
- [ ] Migrate events feature
- [ ] Update imports and test

**Day 13-14: News & Resources**
- [ ] Migrate news feature
- [ ] Migrate resources feature
- [ ] Update imports and test

**Day 15: Directory & Opportunities**
- [ ] Migrate directory feature
- [ ] Migrate opportunities feature
- [ ] Final import updates

### Phase 4: Shared Components & Cleanup (Week 4)
**Goal**: Organize shared code and remove old structure

#### Day 16-17: Shared Components
- [ ] Move truly shared UI components
- [ ] Move layout components
- [ ] Move shared hooks and utilities
- [ ] Update all shared imports

#### Day 18-19: Final Cleanup
- [ ] Remove empty directories
- [ ] Update all remaining imports
- [ ] Fix any circular dependencies
- [ ] Update build configuration

#### Day 20: Testing & Documentation
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] Update documentation
- [ ] Create migration guide for team

### Phase 5: Quality Assurance (Week 5)
**Goal**: Ensure everything works perfectly

#### Day 21-22: Integration Testing
- [ ] Test all major user flows
- [ ] Verify build process
- [ ] Check bundle sizes
- [ ] Performance testing

#### Day 23-24: Team Review
- [ ] Code review with team
- [ ] Address feedback
- [ ] Update documentation
- [ ] Create training materials

#### Day 25: Deployment
- [ ] Merge to main branch
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production

## Success Metrics

### Quantitative
- [ ] 100% of tests passing
- [ ] No increase in bundle size
- [ ] No circular dependencies
- [ ] Build time ≤ current build time

### Qualitative
- [ ] Clear feature boundaries
- [ ] Consistent file organization
- [ ] Improved developer experience
- [ ] Easier onboarding for new developers

## Risk Mitigation

### High Risk Items
1. **Import path updates**
   - Mitigation: Use automated tools, comprehensive testing
   
2. **Merge conflicts**
   - Mitigation: Coordinate with team, frequent rebasing
   
3. **Breaking production**
   - Mitigation: Extensive testing, staged rollout

### Rollback Plan
1. Keep the feature branch until fully validated
2. Document all changes for easy reversal
3. Tag the commit before starting migration
4. Maintain the ability to revert individual features

## Team Communication Plan

### Week 1
- [ ] Team meeting to explain reorganization
- [ ] Share documentation and plans
- [ ] Assign code freeze for critical areas

### Week 2-3
- [ ] Daily standup updates on progress
- [ ] Slack channel for questions
- [ ] Pair programming for complex migrations

### Week 4-5
- [ ] Team training on new structure
- [ ] Documentation review sessions
- [ ] Celebration when complete! 🎉

## Long-term Benefits

1. **Faster feature development** - Everything in one place
2. **Easier testing** - Co-located tests
3. **Better code reuse** - Clear feature APIs
4. **Reduced bugs** - Less coupling between features
5. **Improved onboarding** - Consistent, logical structure

## Next Steps

1. Get team buy-in on this plan
2. Schedule the reorganization sprint
3. Set up tracking for progress
4. Begin Phase 1 cleanup

---

**Remember**: This is a marathon, not a sprint. Take time to do it right, and the benefits will last for years.