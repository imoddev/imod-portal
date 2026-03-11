-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "department" TEXT DEFAULT 'content-it',
    "role" TEXT NOT NULL DEFAULT 'member',
    "jobTitle" TEXT,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "sheetRowId" INTEGER,
    "date" TEXT,
    "time" TEXT,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "summary" TEXT,
    "selectedBy" TEXT,
    "team" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "claimedBy" TEXT,
    "claimedAt" TIMESTAMP(3),
    "draftUrl" TEXT,
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "value" DOUBLE PRECISION,
    "notes" TEXT,
    "nextFollowUp" TIMESTAMP(3),
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "dueDate" TIMESTAMP(3),
    "driveLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "mentions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetTitle" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT,
    "authorId" TEXT,
    "authorName" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "discordId" TEXT,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "department" TEXT NOT NULL,
    "jobTitle" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "phone" TEXT,
    "lineId" TEXT,
    "profileImage" TEXT,
    "managerId" TEXT,
    "salary" DOUBLE PRECISION,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "workType" TEXT NOT NULL DEFAULT 'office',
    "location" TEXT,
    "totalHours" DOUBLE PRECISION,
    "otHours" DOUBLE PRECISION,
    "checkInLat" DOUBLE PRECISION,
    "checkInLng" DOUBLE PRECISION,
    "checkInAccuracy" DOUBLE PRECISION,
    "checkInIp" TEXT,
    "checkInDistance" DOUBLE PRECISION,
    "checkOutLat" DOUBLE PRECISION,
    "checkOutLng" DOUBLE PRECISION,
    "checkOutIp" TEXT,
    "locationStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "condition" TEXT NOT NULL DEFAULT 'good',
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "location" TEXT,
    "notes" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetBorrowing" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "borrowDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "purpose" TEXT,
    "projectName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'borrowed',
    "condition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetBorrowing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "category" TEXT,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "publishedDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "type" TEXT NOT NULL DEFAULT 'article',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "sourceUrl" TEXT,
    "draftUrl" TEXT,
    "publishedUrl" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2026,
    "sickLeaveQuota" INTEGER NOT NULL DEFAULT 30,
    "personalLeaveQuota" INTEGER NOT NULL DEFAULT 5,
    "annualLeaveQuota" INTEGER NOT NULL DEFAULT 6,
    "weddingLeaveQuota" INTEGER NOT NULL DEFAULT 3,
    "ordinationLeaveQuota" INTEGER NOT NULL DEFAULT 15,
    "childSickLeaveQuota" INTEGER NOT NULL DEFAULT 3,
    "sickLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "personalLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "annualLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "weddingLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "ordinationLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "childSickLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "hasUsedWeddingLeave" BOOLEAN NOT NULL DEFAULT false,
    "hasUsedOrdinationLeave" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "department" TEXT,
    "leaveType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "attachment" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "consecutiveDays" INTEGER NOT NULL DEFAULT 1,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approverName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "department" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "plannedHours" DOUBLE PRECISION NOT NULL,
    "actualHours" DOUBLE PRECISION,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "otType" TEXT NOT NULL DEFAULT 'normal',
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "projectName" TEXT,
    "isOffsite" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "preApproved" BOOLEAN NOT NULL DEFAULT false,
    "preApprovedBy" TEXT,
    "preApprovedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approverName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "adjustedHours" DOUBLE PRECISION,
    "adjustedNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowanceRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "department" TEXT,
    "locationType" TEXT NOT NULL DEFAULT 'local',
    "dailyRate" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "workDays" INTEGER NOT NULL,
    "travelDays" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "projectName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "description" TEXT,
    "requestOffDay" BOOLEAN NOT NULL DEFAULT false,
    "offDayStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approverName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LateRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL,
    "minutesLate" INTEGER NOT NULL,
    "warningIssued" BOOLEAN NOT NULL DEFAULT false,
    "warningIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LateRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LateSummary" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "lateCount" INTEGER NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "warningAt" TIMESTAMP(3),
    "warningTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LateSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "time" TEXT,
    "type" TEXT NOT NULL DEFAULT 'event',
    "location" TEXT,
    "attendees" TEXT[],
    "description" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NevBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "country" TEXT,
    "website" TEXT,
    "totalModels" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NevBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NevModel" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT,
    "slug" TEXT NOT NULL,
    "fullName" TEXT,
    "year" INTEGER,
    "bodyType" TEXT,
    "segment" TEXT,
    "seats" INTEGER,
    "powertrain" TEXT NOT NULL,
    "assembly" TEXT,
    "madeIn" TEXT,
    "imageUrl" TEXT,
    "galleryUrls" TEXT[],
    "youtubeId" TEXT,
    "overview" TEXT,
    "highlights" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isNewModel" BOOLEAN NOT NULL DEFAULT false,
    "launchDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NevModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NevVariant" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priceBaht" INTEGER,
    "priceNote" TEXT,
    "batteryKwh" DOUBLE PRECISION,
    "rangeKm" INTEGER,
    "rangeStandard" TEXT,
    "motorCount" INTEGER NOT NULL DEFAULT 1,
    "motorKw" DOUBLE PRECISION,
    "motorHp" INTEGER,
    "torqueNm" INTEGER,
    "topSpeedKmh" INTEGER,
    "accel0100" DOUBLE PRECISION,
    "drivetrain" TEXT,
    "dcChargeKw" DOUBLE PRECISION,
    "dcChargeMin" INTEGER,
    "acChargeKw" DOUBLE PRECISION,
    "chargePort" TEXT,
    "engineCc" INTEGER,
    "engineHp" INTEGER,
    "combinedHp" INTEGER,
    "fuelTankL" INTEGER,
    "fuelConsumption" DOUBLE PRECISION,
    "lengthMm" INTEGER,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "wheelbaseMm" INTEGER,
    "groundClearanceMm" INTEGER,
    "curbWeightKg" INTEGER,
    "grossWeightKg" INTEGER,
    "trunkLitres" INTEGER,
    "warrantyVehicle" TEXT,
    "warrantyBattery" TEXT,
    "features" TEXT,
    "hasV2l" BOOLEAN NOT NULL DEFAULT false,
    "v2lKw" DOUBLE PRECISION,
    "hasV2g" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "dataSource" TEXT,
    "lastVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NevVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NevDataVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "totalBrands" INTEGER NOT NULL DEFAULT 0,
    "totalModels" INTEGER NOT NULL DEFAULT 0,
    "totalVariants" INTEGER NOT NULL DEFAULT 0,
    "importedFrom" TEXT,
    "importedBy" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NevDataVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NevAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT,
    "changes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NevAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_date_idx" ON "Activity"("date");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_sheetRowId_key" ON "NewsItem"("sheetRowId");

-- CreateIndex
CREATE INDEX "NewsItem_status_idx" ON "NewsItem"("status");

-- CreateIndex
CREATE INDEX "NewsItem_date_idx" ON "NewsItem"("date");

-- CreateIndex
CREATE INDEX "NewsItem_team_idx" ON "NewsItem"("team");

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAssignment_projectId_userId_key" ON "ProjectAssignment"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Comment_targetType_targetId_idx" ON "Comment"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_idx" ON "AuditLog"("targetType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Template_type_idx" ON "Template"("type");

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_discordId_key" ON "Employee"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE INDEX "Employee_isActive_idx" ON "Employee"("isActive");

-- CreateIndex
CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Attendance_locationStatus_idx" ON "Attendance"("locationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "AssetBorrowing_assetId_idx" ON "AssetBorrowing"("assetId");

-- CreateIndex
CREATE INDEX "AssetBorrowing_borrowerId_idx" ON "AssetBorrowing"("borrowerId");

-- CreateIndex
CREATE INDEX "AssetBorrowing_status_idx" ON "AssetBorrowing"("status");

-- CreateIndex
CREATE INDEX "ContentPlan_site_idx" ON "ContentPlan"("site");

-- CreateIndex
CREATE INDEX "ContentPlan_plannedDate_idx" ON "ContentPlan"("plannedDate");

-- CreateIndex
CREATE INDEX "ContentPlan_status_idx" ON "ContentPlan"("status");

-- CreateIndex
CREATE INDEX "ContentPlan_assigneeId_idx" ON "ContentPlan"("assigneeId");

-- CreateIndex
CREATE INDEX "LeaveBalance_employeeId_idx" ON "LeaveBalance"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_year_key" ON "LeaveBalance"("employeeId", "year");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_startDate_idx" ON "LeaveRequest"("startDate");

-- CreateIndex
CREATE INDEX "OvertimeRequest_employeeId_idx" ON "OvertimeRequest"("employeeId");

-- CreateIndex
CREATE INDEX "OvertimeRequest_status_idx" ON "OvertimeRequest"("status");

-- CreateIndex
CREATE INDEX "OvertimeRequest_date_idx" ON "OvertimeRequest"("date");

-- CreateIndex
CREATE INDEX "AllowanceRequest_employeeId_idx" ON "AllowanceRequest"("employeeId");

-- CreateIndex
CREATE INDEX "AllowanceRequest_status_idx" ON "AllowanceRequest"("status");

-- CreateIndex
CREATE INDEX "AllowanceRequest_startDate_idx" ON "AllowanceRequest"("startDate");

-- CreateIndex
CREATE INDEX "LateRecord_employeeId_idx" ON "LateRecord"("employeeId");

-- CreateIndex
CREATE INDEX "LateRecord_date_idx" ON "LateRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "LateRecord_employeeId_date_key" ON "LateRecord"("employeeId", "date");

-- CreateIndex
CREATE INDEX "LateSummary_employeeId_idx" ON "LateSummary"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "LateSummary_employeeId_year_month_key" ON "LateSummary"("employeeId", "year", "month");

-- CreateIndex
CREATE INDEX "CalendarEvent_date_idx" ON "CalendarEvent"("date");

-- CreateIndex
CREATE INDEX "CalendarEvent_type_idx" ON "CalendarEvent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "NevBrand_name_key" ON "NevBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NevBrand_slug_key" ON "NevBrand"("slug");

-- CreateIndex
CREATE INDEX "NevBrand_isActive_idx" ON "NevBrand"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "NevModel_slug_key" ON "NevModel"("slug");

-- CreateIndex
CREATE INDEX "NevModel_brandId_idx" ON "NevModel"("brandId");

-- CreateIndex
CREATE INDEX "NevModel_powertrain_idx" ON "NevModel"("powertrain");

-- CreateIndex
CREATE INDEX "NevModel_isActive_idx" ON "NevModel"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "NevVariant_slug_key" ON "NevVariant"("slug");

-- CreateIndex
CREATE INDEX "NevVariant_modelId_idx" ON "NevVariant"("modelId");

-- CreateIndex
CREATE INDEX "NevVariant_priceBaht_idx" ON "NevVariant"("priceBaht");

-- CreateIndex
CREATE INDEX "NevVariant_rangeKm_idx" ON "NevVariant"("rangeKm");

-- CreateIndex
CREATE INDEX "NevVariant_isActive_idx" ON "NevVariant"("isActive");

-- CreateIndex
CREATE INDEX "NevDataVersion_version_idx" ON "NevDataVersion"("version");

-- CreateIndex
CREATE INDEX "NevAuditLog_targetType_targetId_idx" ON "NevAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "NevAuditLog_createdAt_idx" ON "NevAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBorrowing" ADD CONSTRAINT "AssetBorrowing_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NevModel" ADD CONSTRAINT "NevModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "NevBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NevVariant" ADD CONSTRAINT "NevVariant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "NevModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
