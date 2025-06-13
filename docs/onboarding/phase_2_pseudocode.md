# User Onboarding System - Pseudocode & Algorithms

## 1. Main Onboarding Flow Controller

```pseudocode
FUNCTION initializeOnboarding(userId):
    // Check if user has already completed onboarding
    user = getUserProfile(userId)
    
    IF user.onboarding_completed_at IS NOT NULL:
        REDIRECT to dashboard
        RETURN
    
    // Initialize or restore onboarding session
    session = getOnboardingSession(userId)
    
    IF session IS NULL:
        session = createOnboardingSession(userId)
        session.currentStep = 1
        session.completedSteps = []
        session.skippedSteps = []
        session.startedAt = NOW()
    
    // Load user's progress
    progress = calculateProgress(session)
    
    // Navigate to current step
    DISPLAY OnboardingWizard(session, progress)
END FUNCTION

FUNCTION calculateProgress(session):
    totalSteps = 5
    mandatorySteps = [1, 3] // Welcome and Privacy
    completedMandatory = COUNT(session.completedSteps INTERSECT mandatorySteps)
    completedOptional = COUNT(session.completedSteps) - completedMandatory
    
    progress = {
        percentage: (COUNT(session.completedSteps) / totalSteps) * 100,
        currentStep: session.currentStep,
        mandatoryComplete: completedMandatory == LENGTH(mandatorySteps),
        canFinish: progress.mandatoryComplete,
        stepsRemaining: totalSteps - COUNT(session.completedSteps)
    }
    
    RETURN progress
END FUNCTION
```

## 2. Step Navigation Logic

```pseudocode
FUNCTION navigateToStep(userId, targetStep, currentData):
    session = getOnboardingSession(userId)
    
    // Save current step data if moving forward
    IF targetStep > session.currentStep:
        saveStepData(userId, session.currentStep, currentData)
        
        // Validate mandatory fields
        IF NOT validateStep(session.currentStep, currentData):
            RETURN {success: false, errors: getValidationErrors()}
        
        // Mark step as completed
        ADD session.currentStep TO session.completedSteps
    
    // Handle skip action
    ELSE IF targetStep == SKIP_STEP:
        IF session.currentStep NOT IN mandatorySteps:
            ADD session.currentStep TO session.skippedSteps
            targetStep = getNextStep(session.currentStep)
        ELSE:
            RETURN {success: false, error: "Cannot skip mandatory step"}
    
    // Update session
    session.currentStep = targetStep
    saveOnboardingSession(session)
    
    // Load step data
    stepData = loadStepData(userId, targetStep)
    
    RETURN {
        success: true,
        step: targetStep,
        data: stepData,
        progress: calculateProgress(session)
    }
END FUNCTION

FUNCTION getNextStep(currentStep):
    steps = [1, 2, 3, 4, 5]
    currentIndex = INDEXOF(steps, currentStep)
    
    IF currentIndex < LENGTH(steps) - 1:
        RETURN steps[currentIndex + 1]
    ELSE:
        RETURN COMPLETION_STEP
END FUNCTION
```

## 3. Step-Specific Logic

### 3.1 Welcome & Basic Profile (Step 1)

```pseudocode
FUNCTION processWelcomeStep(userId, formData):
    // Validate required fields
    VALIDATE formData.name IS NOT EMPTY
    VALIDATE formData.title IS NOT EMPTY
    VALIDATE formData.location IS NOT EMPTY
    
    // Process profile photo if provided
    IF formData.profilePhoto:
        photoUrl = uploadProfilePhoto(userId, formData.profilePhoto)
        formData.photoUrl = photoUrl
    
    // Update user profile
    UPDATE members SET
        name = formData.name,
        title = formData.title,
        location = formData.location,
        image = formData.photoUrl,
        updated_at = NOW()
    WHERE user_id = userId
    
    // Log analytics event
    trackEvent('onboarding_step_completed', {
        userId: userId,
        step: 1,
        stepName: 'welcome_basic_profile'
    })
    
    RETURN {success: true}
END FUNCTION
```

### 3.2 Professional Information (Step 2)

```pseudocode
FUNCTION processProfessionalInfo(userId, formData):
    // Process bio with sanitization
    bio = sanitizeRichText(formData.bio)
    
    // Validate skills
    IF LENGTH(formData.skills) > 20:
        RETURN {success: false, error: "Maximum 20 skills allowed"}
    
    // Start transaction
    BEGIN TRANSACTION
        // Update member profile
        UPDATE members SET
            bio = bio,
            employment_status = formData.employmentStatus,
            years_experience = formData.yearsExperience,
            open_to_volunteering = formData.openToVolunteering,
            updated_at = NOW()
        WHERE user_id = userId
        
        // Update skills (replace existing)
        DELETE FROM member_skills WHERE member_id = userId
        
        FOR EACH skill IN formData.skills:
            INSERT INTO member_skills (member_id, skill_name, skill_level)
            VALUES (userId, skill.name, skill.level)
        
        // Update profile completion
        completion = calculateProfileCompletion(userId)
        UPDATE members SET 
            profile_completion_percentage = completion
        WHERE user_id = userId
    COMMIT TRANSACTION
    
    RETURN {success: true, completion: completion}
END FUNCTION
```

### 3.3 Privacy & Visibility Controls (Step 3)

```pseudocode
FUNCTION processPrivacySettings(userId, formData):
    // Define privacy schema
    privacySettings = {
        profileVisibility: formData.profileVisibility, // public|members_only|private
        showEmail: formData.showEmail,
        showPhone: formData.showPhone,
        allowMessages: formData.allowMessages,
        allowNetworkingRequests: formData.allowNetworkingRequests,
        emailNotifications: {
            newsletters: formData.newsletters,
            eventInvites: formData.eventInvites,
            messageAlerts: formData.messageAlerts,
            groupUpdates: formData.groupUpdates
        }
    }
    
    // Validate visibility settings
    IF privacySettings.profileVisibility == 'private':
        privacySettings.showEmail = false
        privacySettings.showPhone = false
        privacySettings.allowMessages = false
    
    // Update member privacy settings
    UPDATE members SET
        privacy_settings = privacySettings,
        updated_at = NOW()
    WHERE user_id = userId
    
    // Update notification preferences
    upsertNotificationPreferences(userId, privacySettings.emailNotifications)
    
    RETURN {success: true}
END FUNCTION
```

### 3.4 Company Association (Step 4)

```pseudocode
FUNCTION processCompanyAssociation(userId, formData):
    IF formData.action == 'join_existing':
        RETURN joinExistingCompany(userId, formData)
    ELSE IF formData.action == 'create_new':
        RETURN createNewCompany(userId, formData)
    ELSE IF formData.action == 'skip':
        RETURN {success: true, skipped: true}
    
END FUNCTION

FUNCTION joinExistingCompany(userId, formData):
    company = getCompanyById(formData.companyId)
    
    IF company IS NULL:
        RETURN {success: false, error: "Company not found"}
    
    // Check if already an employee
    existing = getCompanyEmployee(formData.companyId, userId)
    IF existing:
        RETURN {success: false, error: "Already associated with this company"}
    
    // Create employee association
    IF formData.verificationMethod == 'email_domain':
        userEmail = getUserEmail(userId)
        companyDomain = extractDomain(company.email)
        userDomain = extractDomain(userEmail)
        
        IF userDomain != companyDomain:
            // Send verification request
            sendCompanyVerificationRequest(company.id, userId, formData)
            RETURN {success: true, pending: true}
    
    // Direct association (if allowed)
    IF company.allow_direct_join:
        INSERT INTO company_employees (
            company_id, user_id, role, department, 
            start_date, is_verified, added_by
        ) VALUES (
            company.id, userId, formData.role, formData.department,
            NOW(), true, 'self_onboarding'
        )
        
        // Grant employee role
        grantRole(userId, 'company_employee')
        
        RETURN {success: true, joined: true}
    
    RETURN {success: false, error: "Company requires admin approval"}
END FUNCTION

FUNCTION createNewCompany(userId, formData):
    // Validate company data
    VALIDATE formData.companyName LENGTH >= 2
    VALIDATE formData.companyEmail IS VALID EMAIL
    VALIDATE formData.industry IS NOT EMPTY
    
    // Check for duplicates
    existing = findCompanyByNameOrEmail(formData.companyName, formData.companyEmail)
    IF existing:
        RETURN {success: false, error: "Company already exists", existingId: existing.id}
    
    BEGIN TRANSACTION
        // Create company
        company = INSERT INTO companies (
            name, email, website, industry, size,
            description, location, created_by, status
        ) VALUES (
            formData.companyName, formData.companyEmail,
            formData.website, formData.industry, formData.size,
            formData.description, formData.location,
            userId, 'pending_verification'
        ) RETURNING *
        
        // Process logo if provided
        IF formData.logo:
            logoUrl = uploadCompanyLogo(company.id, formData.logo)
            UPDATE companies SET logo = logoUrl WHERE id = company.id
        
        // Add creator as admin employee
        INSERT INTO company_employees (
            company_id, user_id, role, department,
            start_date, is_verified, is_admin
        ) VALUES (
            company.id, userId, 'Founder', 'Leadership',
            NOW(), true, true
        )
        
        // Grant company admin role
        grantRole(userId, 'company_admin')
        
        // Send verification email
        sendCompanyVerificationEmail(company, userId)
    COMMIT TRANSACTION
    
    RETURN {success: true, companyId: company.id}
END FUNCTION
```

### 3.5 Community Engagement (Step 5)

```pseudocode
FUNCTION processCommunityEngagement(userId, formData):
    BEGIN TRANSACTION
        // Update member interests
        DELETE FROM member_interests WHERE member_id = userId
        
        FOR EACH interest IN formData.interests:
            INSERT INTO member_interests (member_id, interest_name, interest_level)
            VALUES (userId, interest.name, interest.level)
        
        // Process group memberships
        FOR EACH groupId IN formData.joinGroups:
            joinGroup(userId, groupId)
        
        // Update member preferences
        UPDATE members SET
            mentorship_available_as = formData.mentorshipRole, // mentor|mentee|both|none
            networking_available = formData.networkingAvailable,
            volunteering_interests = formData.volunteeringInterests,
            updated_at = NOW()
        WHERE user_id = userId
        
        // Calculate matches and suggestions
        suggestedConnections = findSuggestedConnections(userId, formData.interests)
        suggestedGroups = findSuggestedGroups(userId, formData.interests)
        suggestedEvents = findUpcomingEvents(formData.interests)
        
        // Store suggestions for dashboard
        storeSuggestions(userId, {
            connections: suggestedConnections,
            groups: suggestedGroups,
            events: suggestedEvents
        })
    COMMIT TRANSACTION
    
    RETURN {
        success: true,
        suggestions: {
            connectionsCount: LENGTH(suggestedConnections),
            groupsCount: LENGTH(suggestedGroups),
            eventsCount: LENGTH(suggestedEvents)
        }
    }
END FUNCTION
```

## 4. Completion and Post-Onboarding

```pseudocode
FUNCTION completeOnboarding(userId):
    session = getOnboardingSession(userId)
    
    // Verify mandatory steps completed
    mandatorySteps = [1, 3]
    FOR EACH step IN mandatorySteps:
        IF step NOT IN session.completedSteps:
            RETURN {success: false, error: "Mandatory steps not completed"}
    
    // Calculate final profile completion
    completion = calculateProfileCompletion(userId)
    
    // Update member record
    UPDATE members SET
        onboarding_completed_at = NOW(),
        onboarding_current_step = NULL,
        profile_completion_percentage = completion,
        status = 'published' // Make profile visible
    WHERE user_id = userId
    
    // Grant roles based on completion
    IF completion >= 80:
        grantRole(userId, 'active_member')
    
    // Send welcome email
    sendWelcomeEmail(userId, {
        profileCompletion: completion,
        nextSteps: getRecommendedNextSteps(userId)
    })
    
    // Log completion analytics
    trackEvent('onboarding_completed', {
        userId: userId,
        completionTime: NOW() - session.startedAt,
        skippedSteps: session.skippedSteps,
        profileCompletion: completion
    })
    
    // Clean up session
    deleteOnboardingSession(userId)
    
    RETURN {
        success: true,
        redirectTo: '/dashboard/welcome',
        profileCompletion: completion
    }
END FUNCTION
```

## 5. Helper Functions

```pseudocode
FUNCTION calculateProfileCompletion(userId):
    weights = {
        basicInfo: 20,      // name, title, location, photo
        professional: 25,   // bio, skills, employment
        contact: 10,        // email, phone, social links
        interests: 15,      // interests, groups joined
        company: 15,        // company association
        engagement: 15      // volunteering, mentorship, networking
    }
    
    scores = {
        basicInfo: scoreBasicInfo(userId),
        professional: scoreProfessional(userId),
        contact: scoreContact(userId),
        interests: scoreInterests(userId),
        company: scoreCompany(userId),
        engagement: scoreEngagement(userId)
    }
    
    totalScore = 0
    FOR EACH category, weight IN weights:
        totalScore += scores[category] * weight / 100
    
    RETURN ROUND(totalScore)
END FUNCTION

FUNCTION validateStep(stepNumber, data):
    validators = {
        1: validateBasicProfile,
        2: validateProfessionalInfo,
        3: validatePrivacySettings,
        4: validateCompanyAssociation,
        5: validateCommunityEngagement
    }
    
    validator = validators[stepNumber]
    RETURN validator(data)
END FUNCTION

FUNCTION uploadProfilePhoto(userId, photoFile):
    // Validate file
    IF photoFile.size > 5MB:
        THROW "File too large"
    
    IF photoFile.type NOT IN ['image/jpeg', 'image/png', 'image/webp']:
        THROW "Invalid file type"
    
    // Process image
    processed = resizeAndOptimizeImage(photoFile, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85
    })
    
    // Generate unique filename
    filename = generateUniqueFilename(userId, 'profile', photoFile.extension)
    
    // Upload to storage
    url = uploadToStorage('profiles', filename, processed)
    
    RETURN url
END FUNCTION
```

## 6. Error Recovery & State Management

```pseudocode
FUNCTION autoSaveProgress(userId, stepNumber, formData):
    // Debounce to avoid too many saves
    DEBOUNCE 1000ms
    
    // Save to temporary storage
    key = `onboarding_${userId}_step_${stepNumber}`
    saveToCache(key, {
        data: formData,
        timestamp: NOW(),
        version: 1
    }, TTL = 24 hours)
    
    RETURN {saved: true}
END FUNCTION

FUNCTION recoverProgress(userId, stepNumber):
    key = `onboarding_${userId}_step_${stepNumber}`
    cached = getFromCache(key)
    
    IF cached AND cached.timestamp > (NOW() - 24 hours):
        RETURN cached.data
    
    // Fallback to database
    saved = getStepDataFromDB(userId, stepNumber)
    RETURN saved OR {}
END FUNCTION

FUNCTION handleOnboardingError(error, context):
    // Log error with context
    logError('onboarding_error', {
        error: error,
        userId: context.userId,
        step: context.step,
        timestamp: NOW()
    })
    
    // Determine error type and response
    IF error.type == 'VALIDATION':
        RETURN {
            retry: true,
            message: error.message,
            fields: error.fields
        }
    ELSE IF error.type == 'NETWORK':
        RETURN {
            retry: true,
            message: "Connection issue. Your progress has been saved.",
            autoRetry: true
        }
    ELSE:
        RETURN {
            retry: false,
            message: "An error occurred. Please contact support.",
            supportTicket: createSupportTicket(error, context)
        }
END FUNCTION
```

## 7. Testing Anchors (TDD)

```pseudocode
TEST SUITE "Onboarding Flow":
    TEST "Should initialize new user onboarding":
        // Given a new user
        // When initializeOnboarding is called
        // Then session should be created with step 1
        // And progress should show 0% complete
    
    TEST "Should validate mandatory steps":
        // Given user tries to skip step 1 or 3
        // Then should return error
        // And not allow progression
    
    TEST "Should calculate progress correctly":
        // Given various completion states
        // Then percentage should match expected values
        // And canFinish should be true only when mandatory steps complete
    
    TEST "Should handle company association":
        // Test join existing company flow
        // Test create new company flow
        // Test verification requirements
    
    TEST "Should complete onboarding successfully":
        // Given all mandatory steps completed
        // When completeOnboarding is called
        // Then user should be marked as onboarded
        // And appropriate roles should be granted
        // And welcome email should be sent
END TEST SUITE
```