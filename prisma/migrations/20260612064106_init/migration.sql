-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('design', 'construction', 'design_construction');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GENERAL_MANAGER', 'HEADS', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "DesignProjectStatus" AS ENUM ('active', 'completed', 'pending');

-- CreateEnum
CREATE TYPE "DesignCommentStatus" AS ENUM ('Open', 'In_Progress', 'Addressed', 'Closed');

-- CreateEnum
CREATE TYPE "ConstructionStatus" AS ENUM ('Active', 'Pending', 'Completed');

-- CreateEnum
CREATE TYPE "SiteReportDepartment" AS ENUM ('Design', 'Construction');

-- CreateEnum
CREATE TYPE "SiteReportStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('Saved', 'Draft');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('project', 'report', 'letter', 'system', 'approval');

-- CreateEnum
CREATE TYPE "OnboardingFileType" AS ENUM ('PDF', 'DOCX', 'PPTX', 'VIDEO', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectAssignmentStatus" AS ENUM ('active', 'paused', 'completed', 'overdue');

-- CreateEnum
CREATE TYPE "ProjectUrgency" AS ENUM ('normal', 'urgent');

-- CreateEnum
CREATE TYPE "FavoriteType" AS ENUM ('design_project', 'construction_project', 'site_report', 'letter');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('New', 'Reviewed', 'Resolved');

-- CreateEnum
CREATE TYPE "GMFeedbackType" AS ENUM ('General', 'Mandatory', 'Scheduled');

-- CreateEnum
CREATE TYPE "GMFeedbackCategory" AS ENUM ('Work_Environment', 'Communication', 'Management', 'Compensation', 'Career_Growth', 'Resources', 'Team_Dynamics', 'Other');

-- CreateEnum
CREATE TYPE "DeletionRequestType" AS ENUM ('design', 'construction', 'site_report');

-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "tempPasswordHash" TEXT,
    "tempPasswordExpiresAt" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "department" TEXT,
    "legacyRole" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profilePhotoUrl" TEXT,
    "idDocumentUrl" TEXT,
    "licenseDocumentUrl" TEXT,
    "dateOfBirth" TEXT,
    "nationality" TEXT,
    "phoneNumber" TEXT,
    "homeAddress" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelationship" TEXT,
    "jobTitle" TEXT,
    "employmentType" TEXT,
    "startDate" TEXT,
    "nationalIdPassport" TEXT,
    "professionalLicenseNumber" TEXT,
    "tinNumber" TEXT,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProject" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "leadArchitectId" TEXT NOT NULL,
    "leadArchitectName" TEXT NOT NULL,
    "location" TEXT,
    "designStage" TEXT NOT NULL,
    "designType" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "status" "DesignProjectStatus" NOT NULL DEFAULT 'pending',
    "priority" TEXT,
    "progress" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "revisionNumber" TEXT NOT NULL,
    "description" TEXT,
    "lastReportedDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProjectAttachment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProjectPreviousVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "changes" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignProjectPreviousVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProjectReview" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewedByName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "decision" TEXT,
    "approvalDate" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignProjectReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProjectComment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "commentNo" INTEGER NOT NULL,
    "discipline" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "commentedById" TEXT NOT NULL,
    "commentedByName" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "actionRequired" TEXT NOT NULL,
    "response" TEXT NOT NULL DEFAULT '',
    "status" "DesignCommentStatus" NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignProjectComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionProject" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "status" "ConstructionStatus" NOT NULL DEFAULT 'Pending',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "weight" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectId" TEXT,
    "location" TEXT,
    "submittedById" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" "SiteReportDepartment" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SiteReportStatus" NOT NULL DEFAULT 'Pending',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReportImage" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteReportImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReportActivity" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteReportActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReportMaterial" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteReportMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReportIssue" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteReportIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReportCorrespondence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteReportCorrespondence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteReportChangeRequest" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteReportChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "LetterStatus" NOT NULL DEFAULT 'Draft',
    "createdById" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterShare" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetterShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT,
    "templateType" TEXT NOT NULL,
    "headerUrl" TEXT,
    "footerUrl" TEXT,
    "watermarkUrl" TEXT,
    "headerPosition" TEXT NOT NULL,
    "headerMargin" INTEGER NOT NULL DEFAULT 0,
    "footerHeight" INTEGER NOT NULL DEFAULT 40,
    "watermarkOpacity" INTEGER NOT NULL DEFAULT 12,
    "watermarkSize" INTEGER NOT NULL DEFAULT 100,
    "watermarkOffsetX" INTEGER NOT NULL DEFAULT 0,
    "watermarkOffsetY" INTEGER NOT NULL DEFAULT 0,
    "leftMargin" INTEGER NOT NULL DEFAULT 48,
    "rightMargin" INTEGER NOT NULL DEFAULT 48,
    "topMargin" INTEGER NOT NULL DEFAULT 24,
    "bottomMargin" INTEGER NOT NULL DEFAULT 24,
    "referenceCode" TEXT,
    "headerHtml" TEXT,
    "bodyHtml" TEXT,
    "footerHtml" TEXT,
    "watermarkHtml" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "fullDescription" TEXT,
    "image" TEXT,
    "video" TEXT,
    "author" TEXT,
    "category" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "category" "NotificationCategory" NOT NULL DEFAULT 'system',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingWorkflow" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileType" "OnboardingFileType" NOT NULL,
    "fileSize" TEXT,
    "fileName" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingContentItem" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "textType" TEXT,
    "listItems" TEXT[],
    "order" INTEGER NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ProjectAssignmentStatus" NOT NULL DEFAULT 'active',
    "urgency" "ProjectUrgency" NOT NULL DEFAULT 'normal',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3) NOT NULL,
    "pausedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectProgressHistory" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectProgressHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPriorityChangeLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectName" TEXT,
    "employeeId" TEXT NOT NULL,
    "oldPriority" TEXT NOT NULL,
    "newPriority" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPriorityChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FavoriteType" NOT NULL,
    "refId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'New',
    "attachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackNote" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GMFeedback" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "GMFeedbackType" NOT NULL,
    "category" "GMFeedbackCategory" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "anonymousId" TEXT,
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GMFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "DeletionRequestType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_companyId_email_key" ON "User"("companyId", "email");

-- CreateIndex
CREATE INDEX "DesignProject_companyId_idx" ON "DesignProject"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DesignProject_companyId_code_key" ON "DesignProject"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DesignProjectReview_projectId_key" ON "DesignProjectReview"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "DesignProjectComment_projectId_commentNo_key" ON "DesignProjectComment"("projectId", "commentNo");

-- CreateIndex
CREATE INDEX "ConstructionProject_companyId_idx" ON "ConstructionProject"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ConstructionProject_companyId_code_key" ON "ConstructionProject"("companyId", "code");

-- CreateIndex
CREATE INDEX "SiteReport_companyId_idx" ON "SiteReport"("companyId");

-- CreateIndex
CREATE INDEX "Letter_companyId_idx" ON "Letter"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Letter_companyId_referenceNo_key" ON "Letter"("companyId", "referenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "LetterShare_letterId_userId_key" ON "LetterShare"("letterId", "userId");

-- CreateIndex
CREATE INDEX "LetterTemplate_companyId_idx" ON "LetterTemplate"("companyId");

-- CreateIndex
CREATE INDEX "NewsItem_companyId_idx" ON "NewsItem"("companyId");

-- CreateIndex
CREATE INDEX "Notification_companyId_userId_idx" ON "Notification"("companyId", "userId");

-- CreateIndex
CREATE INDEX "OnboardingWorkflow_companyId_idx" ON "OnboardingWorkflow"("companyId");

-- CreateIndex
CREATE INDEX "OnboardingDocument_companyId_idx" ON "OnboardingDocument"("companyId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_companyId_idx" ON "ProjectAssignment"("companyId");

-- CreateIndex
CREATE INDEX "ProjectPriorityChangeLog_companyId_idx" ON "ProjectPriorityChangeLog"("companyId");

-- CreateIndex
CREATE INDEX "Favorite_companyId_idx" ON "Favorite"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_type_refId_key" ON "Favorite"("userId", "type", "refId");

-- CreateIndex
CREATE INDEX "Feedback_companyId_idx" ON "Feedback"("companyId");

-- CreateIndex
CREATE INDEX "FeedbackNote_companyId_idx" ON "FeedbackNote"("companyId");

-- CreateIndex
CREATE INDEX "GMFeedback_companyId_idx" ON "GMFeedback"("companyId");

-- CreateIndex
CREATE INDEX "DeletionRequest_companyId_idx" ON "DeletionRequest"("companyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_leadArchitectId_fkey" FOREIGN KEY ("leadArchitectId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectAttachment" ADD CONSTRAINT "DesignProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectPreviousVersion" ADD CONSTRAINT "DesignProjectPreviousVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectPreviousVersion" ADD CONSTRAINT "DesignProjectPreviousVersion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectReview" ADD CONSTRAINT "DesignProjectReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectReview" ADD CONSTRAINT "DesignProjectReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectComment" ADD CONSTRAINT "DesignProjectComment_commentedById_fkey" FOREIGN KEY ("commentedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProjectComment" ADD CONSTRAINT "DesignProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionProject" ADD CONSTRAINT "ConstructionProject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionMilestone" ADD CONSTRAINT "ConstructionMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReport" ADD CONSTRAINT "SiteReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReport" ADD CONSTRAINT "SiteReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReport" ADD CONSTRAINT "SiteReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportImage" ADD CONSTRAINT "SiteReportImage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportActivity" ADD CONSTRAINT "SiteReportActivity_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportMaterial" ADD CONSTRAINT "SiteReportMaterial_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportIssue" ADD CONSTRAINT "SiteReportIssue_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportCorrespondence" ADD CONSTRAINT "SiteReportCorrespondence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportChangeRequest" ADD CONSTRAINT "SiteReportChangeRequest_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteReportChangeRequest" ADD CONSTRAINT "SiteReportChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterShare" ADD CONSTRAINT "LetterShare_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterShare" ADD CONSTRAINT "LetterShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterTemplate" ADD CONSTRAINT "LetterTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterTemplate" ADD CONSTRAINT "LetterTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingWorkflow" ADD CONSTRAINT "OnboardingWorkflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingDocument" ADD CONSTRAINT "OnboardingDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingDocument" ADD CONSTRAINT "OnboardingDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingDocument" ADD CONSTRAINT "OnboardingDocument_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "OnboardingWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingContentItem" ADD CONSTRAINT "OnboardingContentItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OnboardingDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProgressHistory" ADD CONSTRAINT "ProjectProgressHistory_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ProjectAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPriorityChangeLog" ADD CONSTRAINT "ProjectPriorityChangeLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPriorityChangeLog" ADD CONSTRAINT "ProjectPriorityChangeLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPriorityChangeLog" ADD CONSTRAINT "ProjectPriorityChangeLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackNote" ADD CONSTRAINT "FeedbackNote_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackNote" ADD CONSTRAINT "FeedbackNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackNote" ADD CONSTRAINT "FeedbackNote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GMFeedback" ADD CONSTRAINT "GMFeedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GMFeedback" ADD CONSTRAINT "GMFeedback_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
