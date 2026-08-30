import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. USERS
  users: defineTable({
    name: v.string(),
    username: v.string(),
    email: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    fullAddress: v.optional(v.string()),
    localArea: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    pinCode: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    profileImage: v.optional(v.string()),
    role: v.union(v.literal("citizen"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_district", ["district"]),

  // 2. ISSUES (Ranked by community votes, no priority level)
  issues: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Pothole"),
      v.literal("Road Damage"),
      v.literal("Garbage"),
      v.literal("Broken Streetlight"),
      v.literal("Water / Drainage"),
      v.literal("Public Infrastructure"),
      v.literal("Other")
    ),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    localArea: v.string(),
    district: v.string(),
    state: v.string(),
    pinCode: v.string(),
    createdBy: v.id("users"),
    createdByName: v.string(),
    voteCount: v.number(),
    status: v.union(
      v.literal("Reported"),
      v.literal("Verified"),
      v.literal("In Progress"),
      v.literal("Resolved")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    resolutionReview: v.optional(v.string()),
    resolutionEvidenceStorageId: v.optional(v.id("_storage")),
    resolutionEvidenceUrl: v.optional(v.string()),
    resolutionNotes: v.optional(v.string()),
  })
    .index("by_voteCount", ["voteCount"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_district", ["district"])
    .index("by_state", ["state"])
    .index("by_createdBy", ["createdBy"])
    .index("by_createdAt", ["createdAt"]),

  // 3. ISSUE MEDIA / EVIDENCE (Convex Storage)
  evidence: defineTable({
    issueId: v.id("issues"),
    uploadedBy: v.id("users"),
    uploadedByName: v.string(),
    storageId: v.id("_storage"),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    fileName: v.string(),
    fileSize: v.number(),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  })
    .index("by_issueId", ["issueId"])
    .index("by_approvalStatus", ["approvalStatus"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // 4. ISSUE VOTES (1 vote per user per issue)
  issueVotes: defineTable({
    issueId: v.id("issues"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_issueId", ["issueId"])
    .index("by_userId", ["userId"])
    .index("by_issue_user", ["issueId", "userId"]),

  // 5. IDEAS FOR A BETTER NATION
  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Education"),
      v.literal("Healthcare"),
      v.literal("Environment"),
      v.literal("Transport"),
      v.literal("Technology"),
      v.literal("Governance"),
      v.literal("Infrastructure"),
      v.literal("Other")
    ),
    scope: v.union(
      v.literal("Local Area"),
      v.literal("District"),
      v.literal("State"),
      v.literal("National")
    ),
    localArea: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    createdBy: v.id("users"),
    createdByName: v.string(),
    voteCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_voteCount", ["voteCount"])
    .index("by_scope", ["scope"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"]),

  // 6. IDEA VOTES (1 vote per user per idea)
  ideaVotes: defineTable({
    ideaId: v.id("ideas"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_ideaId", ["ideaId"])
    .index("by_userId", ["userId"])
    .index("by_idea_user", ["ideaId", "userId"]),

  // 7. NOTIFICATIONS
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    relatedIssueId: v.optional(v.id("issues")),
    relatedIdeaId: v.optional(v.id("ideas")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),

  // 8. CONTACT MESSAGES
  contactMessages: defineTable({
    userId: v.string(),
    userName: v.string(),
    email: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }),

  // 9. CHAT MESSAGES
  chatMessages: defineTable({
    channel: v.string(),
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    replyTo: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_channel", ["channel"]),

  // 10. TYPING INDICATORS
  typingIndicators: defineTable({
    channel: v.string(),
    userId: v.string(),
    userName: v.string(),
    updatedAt: v.number(),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_user", ["channel", "userId"]),

  // 11. ONLINE USERS
  onlineUsers: defineTable({
    userId: v.string(),
    userName: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_userId", ["userId"]),

  // 12. THOUGHTS
  thoughts: defineTable({
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    category: v.string(),
    upvotes: v.number(),
    timestamp: v.number(),
  }),

  // 13. VISITORS
  visitors: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    userName: v.string(),
    page: v.string(),
    referrer: v.optional(v.string()),
    source: v.optional(v.string()),
    country: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
