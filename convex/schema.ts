import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    username: v.string(),
    name: v.string(),
    password: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    createdAt: v.number(),
  })
    .index('by_username', ['username'])
    .index('by_email', ['email']),

  messages: defineTable({
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    category: v.string(),
    timestamp: v.number(),
    channel: v.string(),
  })
    .index('by_channel', ['channel', 'timestamp'])
    .index('by_user', ['userId', 'timestamp']),

  typingIndicators: defineTable({
    userId: v.string(),
    userName: v.string(),
    channel: v.string(),
    timestamp: v.number(),
  })
    .index('by_channel', ['channel']),

  issues: defineTable({
    title: v.string(),
    category: v.string(),
    location: v.string(),
    urgency: v.string(),
    upvotes: v.number(),
    comments: v.number(),
    views: v.number(),
    time: v.string(),
    status: v.string(),
    statusColor: v.string(),
    likes: v.number(),
    dislikes: v.number(),
    createdAt: v.number(),
    authorId: v.optional(v.string()),
    authorName: v.optional(v.string()),
  })
    .index('by_category', ['category'])
    .index('by_created', ['createdAt'])
    .index('by_author', ['authorId']),

  issueReactions: defineTable({
    issueId: v.id('issues'),
    userId: v.string(),
    type: v.union(v.literal('like'), v.literal('dislike')),
    createdAt: v.number(),
  })
    .index('by_issue_user', ['issueId', 'userId']),

  thoughts: defineTable({
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    category: v.string(),
    timestamp: v.number(),
    upvotes: v.number(),
    likes: v.number(),
    dislikes: v.number(),
    status: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_timestamp', ['timestamp'])
    .index('by_user', ['userId']),

  reforms: defineTable({
    title: v.string(),
    description: v.string(),
    author: v.string(),
    authorId: v.string(),
    avatar: v.string(),
    votes: v.number(),
    likes: v.number(),
    dislikes: v.number(),
    comments: v.number(),
    time: v.string(),
    status: v.string(),
    category: v.string(),
    createdAt: v.number(),
  })
    .index('by_category', ['category'])
    .index('by_status', ['status'])
    .index('by_created', ['createdAt']),

  reformReactions: defineTable({
    reformId: v.id('reforms'),
    userId: v.string(),
    type: v.union(v.literal('like'), v.literal('dislike'), v.literal('vote')),
    createdAt: v.number(),
  })
    .index('by_reform_user', ['reformId', 'userId']),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
    link: v.optional(v.string()),
  })
    .index('by_user', ['userId', 'createdAt']),

  onlineUsers: defineTable({
    userId: v.string(),
    userName: v.string(),
    channel: v.string(),
    lastPing: v.number(),
  })
    .index('by_channel', ['channel']),

  evidence: defineTable({
    userId: v.string(),
    userName: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('photo'), v.literal('video')),
    storageId: v.id('_storage'),
    category: v.string(),
    createdAt: v.number(),
    likes: v.number(),
    dislikes: v.number(),
    status: v.optional(v.union(v.literal('pending'), v.literal('approved'), v.literal('important'), v.literal('rejected'))),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
  })
    .index('by_category', ['category'])
    .index('by_user', ['userId'])
    .index('by_created', ['createdAt'])
    .index('by_status', ['status']),

  admins: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
  })
    .index('by_email', ['email']),

  contactMessages: defineTable({
    userId: v.string(),
    userName: v.string(),
    email: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    createdAt: v.number(),
    read: v.boolean(),
  })
    .index('by_created', ['createdAt'])
    .index('by_read', ['read']),
});
